import { createHash, randomUUID } from "node:crypto";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { dbAplikasiSementara } from "@/tests/helpers/db";

let fixture: Awaited<ReturnType<typeof dbAplikasiSementara>>;
let Gateway: typeof import("@/lib/payment/midtrans").MidtransPaymentGateway;
const serverKey = "SB-Mid-server-test-only";
const irisKey = "iris-test-key-only";
const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
const refund = () => ({
  idTagihan: randomUUID(),
  idempotencyKey: `refund:${randomUUID()}`,
  nominal: 30000,
});
const payout = () => ({
  idPencairan: randomUUID(),
  rekening: "BANK:bca:1234567890",
  nominal: 50000,
});
const paymentStatus = (id: string, extra: object = {}) => ({
  order_id: id,
  status_code: "200",
  transaction_status: "settlement",
  gross_amount: "50000.00",
  ...extra,
});
beforeAll(async () => {
  fixture = await dbAplikasiSementara({ seed: false });
  ({ MidtransPaymentGateway: Gateway } =
    await import("@/lib/payment/midtrans"));
});
afterAll(() => fixture?.tutup());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
function gateway() {
  vi.stubEnv("MIDTRANS_SERVER_KEY", serverKey);
  vi.stubEnv("MIDTRANS_IRIS_API_KEY", irisKey);
  vi.stubEnv("MIDTRANS_IS_PRODUCTION", "false");
  return new Gateway();
}
function refundSuccess(p: ReturnType<typeof refund>) {
  return {
    order_id: p.idTagihan,
    status_code: "200",
    transaction_status: "partial_refund",
    refund_key: p.idempotencyKey,
    refund_amount: String(p.nominal),
  };
}
describe("Midtrans: permintaan jaringan dan idempotensi durable", () => {
  it("factory tetap memilih provider dari env; konfigurasi key wajib", async () => {
    const { getPaymentAdapter } = await import("@/lib/payment/adapter");
    gateway();
    vi.stubEnv("PAYMENT_PROVIDER", "midtrans");
    expect(getPaymentAdapter()).toBeInstanceOf(Gateway);
    vi.stubEnv("MIDTRANS_SERVER_KEY", "");
    expect(() => getPaymentAdapter()).toThrow(/MIDTRANS_SERVER_KEY/);
  });
  it("charge mengirim ke Snap dengan auth dan redirect resmi", async () => {
    const g = gateway();
    const fetch = vi.fn().mockResolvedValue(
      response(
        {
          redirect_url: "https://app.sandbox.midtrans.com/snap/v2/vtweb/test",
        },
        201,
      ),
    );
    vi.stubGlobal("fetch", fetch);
    expect(
      await g.charge({ idTagihan: "charge-1", total: 50000, metode: "gopay" }),
    ).toHaveProperty("redirectUrl");
    expect(fetch.mock.calls[0][0]).toContain("/snap/v1/transactions");
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe(
      `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
    );
  });
  it("refund benar-benar memanggil Core API, replay setelah instance baru tidak mengirim lagi", async () => {
    const g = gateway(),
      p = refund();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(paymentStatus(p.idTagihan)))
      .mockResolvedValueOnce(response(refundSuccess(p)));
    vi.stubGlobal("fetch", fetch);
    expect(await g.refund(p)).toEqual({ status: "BERHASIL" });
    expect(await new Gateway().refund(p)).toEqual({ status: "BERHASIL" });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toMatchObject({
      refund_key: p.idempotencyKey,
      amount: p.nominal,
    });
    expect(
      fixture.db
        .prepare(
          "SELECT count(*) n FROM log_gateway WHERE jenis='REFUND' AND referensi_id=?",
        )
        .get(p.idTagihan),
    ).toEqual({ n: 1 });
    await expect(
      g.refund({ ...p, nominal: p.nominal + 1 }),
    ).rejects.toMatchObject({ status: 409 });
  });
  it.each([202, 400, 500])(
    "HTTP 200 dengan status_code %s tidak menjadi refund sukses",
    async (code) => {
      const g = gateway(),
        p = refund();
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValueOnce(response(paymentStatus(p.idTagihan)))
          .mockResolvedValueOnce(
            response({ ...refundSuccess(p), status_code: String(code) }),
          ),
      );
      await expect(g.refund(p)).rejects.toMatchObject({
        code: "GATEWAY_UNCERTAIN",
      });
      expect(
        fixture.db
          .prepare("SELECT status FROM operasi_midtrans WHERE kunci=?")
          .get(p.idempotencyKey),
      ).toEqual({ status: "BELUM_PASTI" });
    },
  );
  it("timeout refund dipulihkan melalui GET refunds dengan kunci dan nominal yang sama", async () => {
    const g = gateway(),
      p = refund();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(paymentStatus(p.idTagihan)))
      .mockRejectedValueOnce(new Error("timeout"));
    vi.stubGlobal("fetch", fetch);
    await expect(g.refund(p)).rejects.toThrow("timeout");
    fetch.mockResolvedValueOnce(
      response(
        paymentStatus(p.idTagihan, {
          transaction_status: "partial_refund",
          refunds: [
            { refund_key: p.idempotencyKey, refund_amount: String(p.nominal) },
          ],
        }),
      ),
    );
    expect(await new Gateway().refund(p)).toEqual({ status: "BERHASIL" });
    expect(
      fetch.mock.calls.filter((call) => call[1]?.method === "POST"),
    ).toHaveLength(1);
  });
  it("refund dengan nominal/kunci tidak cocok tidak ditandai sukses", async () => {
    const g = gateway(),
      p = refund();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(response(paymentStatus(p.idTagihan)))
        .mockResolvedValueOnce(
          response({ ...refundSuccess(p), refund_key: "other" }),
        ),
    );
    await expect(g.refund(p)).rejects.toMatchObject({ status: 502 });
  });
  it("Iris memakai key terpisah, validasi nama bank dan menyimpan reference_no", async () => {
    const g = gateway(),
      p = payout();
    const fetch = vi
      .fn()
      .mockImplementation(async (_url: string, init: RequestInit) => {
        expect(fixture.db.inTransaction).toBe(false);
        expect(new Headers(init.headers).get("Authorization")).toBe(
          `Basic ${Buffer.from(`${irisKey}:`).toString("base64")}`,
        );
        return init.method === "POST"
          ? response(
              {
                payouts: [
                  { reference_no: "iris-accepted-1", status: "queued" },
                ],
              },
              201,
            )
          : response({
              account_no: "1234567890",
              account_name: "Pemilik Rekening",
            });
      });
    vi.stubGlobal("fetch", fetch);
    expect(await g.disburse(p)).toEqual({ status: "DITERIMA" });
    expect(await new Gateway().disburse(p)).toEqual({ status: "DITERIMA" });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(
      JSON.parse(fetch.mock.calls[1][1].body as string).payouts[0],
    ).toMatchObject({
      beneficiary_bank: "bca",
      beneficiary_name: "Pemilik Rekening",
      amount: "50000",
    });
    const log = JSON.stringify(
      fixture.db
        .prepare("SELECT payload FROM log_gateway WHERE referensi_id=?")
        .get(p.idPencairan),
    );
    expect(log).not.toContain("1234567890");
    await expect(g.disburse({ ...p, nominal: 60000 })).rejects.toMatchObject({
      status: 409,
    });
  });
  it("payout timeout tidak dikirim ulang secara buta ketika reference_no hilang", async () => {
    const g = gateway(),
      p = payout();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        response({ account_no: "1234567890", account_name: "Pemilik" }),
      )
      .mockRejectedValueOnce(new Error("timeout"));
    vi.stubGlobal("fetch", fetch);
    await expect(g.disburse(p)).rejects.toThrow("timeout");
    await expect(new Gateway().disburse(p)).rejects.toMatchObject({
      status: 502,
    });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(
      fixture.db
        .prepare("SELECT status FROM operasi_midtrans WHERE kunci=?")
        .get(p.idPencairan),
    ).toEqual({ status: "BELUM_PASTI" });
  });
  it("timeout GET validasi rekening masih dapat dicoba ulang tanpa menggandakan payout", async () => {
    const g = gateway(),
      p = payout();
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("validation timeout"))
      .mockResolvedValueOnce(
        response({ account_no: "1234567890", account_name: "Pemilik" }),
      )
      .mockResolvedValueOnce(
        response(
          {
            payouts: [
              { reference_no: "iris-validation-retry", status: "queued" },
            ],
          },
          201,
        ),
      );
    vi.stubGlobal("fetch", fetch);
    await expect(g.disburse(p)).rejects.toThrow("validation timeout");
    expect(await new Gateway().disburse(p)).toEqual({ status: "DITERIMA" });
    expect(
      fetch.mock.calls.filter((call) => call[1]?.method === "POST"),
    ).toHaveLength(1);
  });
  it("rekening ambigu, e-wallet dan key Iris kosong ditolak sebelum fetch", async () => {
    const g = gateway(),
      fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    for (const rekening of ["BANK:1234567890", "EWALLET:081234567890"])
      await expect(g.disburse({ ...payout(), rekening })).rejects.toMatchObject(
        { status: 400 },
      );
    vi.stubEnv("MIDTRANS_IRIS_API_KEY", "");
    await expect(g.disburse(payout())).rejects.toMatchObject({ status: 503 });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("bank menolak validasi rekening: tidak membuat payout", async () => {
    const g = gateway(),
      fetch = vi
        .fn()
        .mockResolvedValue(response({ errors: ["invalid account"] }, 422));
    vi.stubGlobal("fetch", fetch);
    expect(await g.disburse(payout())).toEqual({ status: "GAGAL" });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("respons create payout tidak valid tidak menjadi DITERIMA", async () => {
    const g = gateway(),
      p = payout();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        response({ account_no: "1234567890", account_name: "Pemilik" }),
      )
      .mockResolvedValueOnce(response({ status: "error" }));
    vi.stubGlobal("fetch", fetch);
    await expect(g.disburse(p)).rejects.toMatchObject({ status: 502 });
    expect(
      fixture.db
        .prepare("SELECT status FROM operasi_midtrans WHERE kunci=?")
        .get(p.idPencairan),
    ).toEqual({ status: "BELUM_PASTI" });
  });
  it("klaim durable menolak permintaan bersamaan, hanya satu POST refund", async () => {
    const g = gateway(),
      p = refund();
    let release!: (value: Response) => void;
    const fetch = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            release = resolve;
          }),
      )
      .mockResolvedValueOnce(response(refundSuccess(p)));
    vi.stubGlobal("fetch", fetch);
    const first = g.refund(p);
    await expect(new Gateway().refund(p)).rejects.toMatchObject({
      status: 502,
    });
    release(response(paymentStatus(p.idTagihan)));
    expect(await first).toEqual({ status: "BERHASIL" });
    expect(
      fetch.mock.calls.filter((call) => call[1]?.method === "POST"),
    ).toHaveLength(1);
  });
  it("signature hanya SHA512 Midtrans; HMAC simulator tidak diterima", () => {
    const g = gateway(),
      p = paymentStatus("signed");
    const signature = createHash("sha512")
      .update(p.order_id + p.status_code + p.gross_amount + serverKey)
      .digest("hex");
    expect(g.verifikasiWebhook(JSON.stringify(p), signature)).toBe(true);
    expect(g.verifikasiWebhook(JSON.stringify(p), "a".repeat(128))).toBe(false);
    expect(g.verifikasiWebhook(JSON.stringify(p), "a".repeat(64))).toBe(false);
    expect(g.verifikasiWebhook("not json", signature)).toBe(false);
  });
});
