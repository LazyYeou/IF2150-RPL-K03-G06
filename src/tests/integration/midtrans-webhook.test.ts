import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { dbAplikasiSementara } from "../helpers/db";
import { tambahFixtureTransaksi } from "../helpers/transaksi";

const jar = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      jar.has(name) ? { value: jar.get(name) } : undefined,
    set: (name: string, value: string) => jar.set(name, value),
  }),
}));
let fixture: Awaited<ReturnType<typeof dbAplikasiSementara>>;
let route: typeof import("@/app/api/webhooks/payment/route");
let session: typeof import("@/lib/auth/session");
let refundController: typeof import("@/controllers/TagihanPembayaranController");
let ids: string[];
let trx: string, invoice: string, tk: string, tkUser: string, cs: string;
const key = "SB-Mid-server-integration-only";
const reply = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status });
const one = <T>(sql: string, ...params: unknown[]) =>
  fixture.db.prepare(sql).get(...params) as T;
const snapshot = () =>
  one<{ status: string }>(
    "SELECT status_pembayaran status FROM tagihan_pembayaran WHERE id_tagihan=?",
    invoice,
  ).status;
function payload(extra: object = {}) {
  const p = {
    order_id: invoice,
    status_code: "200",
    gross_amount: "105000.00",
    transaction_status: "settlement",
    ...extra,
  };
  return {
    ...p,
    signature_key: createHash("sha512")
      .update(p.order_id + p.status_code + p.gross_amount + key)
      .digest("hex"),
  };
}
const send = (body: unknown) =>
  route.POST(
    new Request("http://localhost/api/webhooks/payment", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );
beforeAll(async () => {
  fixture = await dbAplikasiSementara();
  tambahFixtureTransaksi(fixture.db);
  ids = (
    fixture.db
      .prepare(
        "SELECT id_transaksi id FROM transaksi_pekerjaan WHERE created_at='2030-01-01 00:00:00'",
      )
      .all() as { id: string }[]
  ).map((r) => r.id);
  ({ id: tk } = one<{ id: string }>(
    "SELECT id_tenaga_kerja id FROM tenaga_kerja JOIN pengguna USING(id_pengguna) WHERE email='tk1@kerjain.test'",
  ));
  ({ id: tkUser } = one<{ id: string }>(
    "SELECT id_pengguna id FROM pengguna WHERE email='tk1@kerjain.test'",
  ));
  ({ id: cs } = one<{ id: string }>(
    "SELECT id_pengguna id FROM pengguna WHERE peran='CS'",
  ));
  route = await import("@/app/api/webhooks/payment/route");
  session = await import("@/lib/auth/session");
  refundController = await import("@/controllers/TagihanPembayaranController");
});
beforeEach(() => {
  vi.stubEnv("PAYMENT_PROVIDER", "midtrans");
  vi.stubEnv("MIDTRANS_SERVER_KEY", key);
  vi.stubEnv("MIDTRANS_IRIS_API_KEY", "iris-integration-only");
  vi.stubEnv("MIDTRANS_IS_PRODUCTION", "false");
  trx = ids.pop()!;
  invoice = randomUUID();
  fixture.db
    .prepare(
      "UPDATE transaksi_pekerjaan SET status_pekerjaan='MENUNGGU_PEMBAYARAN' WHERE id_transaksi=?",
    )
    .run(trx);
  fixture.db
    .prepare(
      "INSERT INTO tagihan_pembayaran(id_tagihan,id_transaksi,nominal_upah,commission_fee,total_bayar,expiry_timestamp,status_pembayaran) VALUES (?,?,100000,5000,105000,datetime('now','+1 day'),'DIPROSES')",
    )
    .run(invoice, trx);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  jar.clear();
});
afterAll(() => fixture?.tutup());

describe("Endpoint webhook Midtrans: payload native dan status gateway", () => {
  it("signature di body tanpa header diterima; settlement memulai pekerjaan sekali", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation(async () =>
          reply(payload({ fraud_status: "accept" })),
        ),
    );
    expect((await send(payload())).status).toBe(200);
    expect(snapshot()).toBe("BERHASIL");
    expect(
      one<{ status: string }>(
        "SELECT status_pekerjaan status FROM transaksi_pekerjaan WHERE id_transaksi=?",
        trx,
      ).status,
    ).toBe("IN_PROGRESS");
    expect(await (await send(payload())).json()).toMatchObject({
      duplicate: true,
    });
  });
  it("signature salah ditolak 401 tanpa memanggil gateway/mengubah DB", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect(
      (await send({ ...payload(), signature_key: "f".repeat(128) })).status,
    ).toBe(401);
    expect(snapshot()).toBe("DIPROSES");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("HMAC simulator tidak dapat menggantikan signature native", async () => {
    expect(
      (
        await send({
          referensiId: invoice,
          status: "BERHASIL",
          nominal: 105000,
        })
      ).status,
    ).toBe(401);
    expect(snapshot()).toBe("DIPROSES");
  });
  it.each(["challenge", "deny"])(
    "fraud_status %s tidak dianggap sukses meskipun callback mengaku settlement",
    async (fraud) => {
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValue(
            reply(
              payload({ transaction_status: "capture", fraud_status: fraud }),
            ),
          ),
      );
      expect((await send(payload({ fraud_status: "accept" }))).status).toBe(
        200,
      );
      expect(snapshot()).toBe(fraud === "deny" ? "GAGAL" : "DIPROSES");
    },
  );
  it.each([
    ["expire", "KEDALUWARSA"],
    ["deny", "GAGAL"],
    ["pending", "DIPROSES"],
  ])("memetakan status %s menjadi %s", async (status, expected) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(reply(payload({ transaction_status: status }))),
    );
    expect((await send(payload())).status).toBe(200);
    expect(snapshot()).toBe(expected);
  });
  it("nominal salah dan error gateway tidak memperbarui invoice", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(reply(payload({ gross_amount: "99999.00" })))
      .mockResolvedValueOnce(reply({ status_code: "500" }, 500));
    vi.stubGlobal("fetch", fetch);
    expect((await send(payload())).status).toBe(502);
    expect((await send(payload())).status).toBe(502);
    expect(snapshot()).toBe("DIPROSES");
  });
  it("nominal native harus IDR bulat positif, bukan NaN/pecahan/overflow", async () => {
    for (const gross_amount of ["105000.01", "NaN", "9007199254740993.00"]) {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(reply(payload({ gross_amount }))),
      );
      expect((await send(payload({ gross_amount }))).status).toBe(502);
    }
    expect(snapshot()).toBe("DIPROSES");
  });
  it("callback Iris hanya finalisasi berdasarkan GET terautentikasi, debit sekali", async () => {
    const id = randomUUID(),
      ref = `iris-${id}`;
    fixture.db
      .prepare(
        "INSERT INTO pencairan_dana(id_pencairan,id_tenaga_kerja,nominal,rekening_tujuan,status_pencairan) VALUES (?,?,10000,'BANK:bca:1234567890','DIPROSES')",
      )
      .run(id, tk);
    fixture.db
      .prepare(
        "INSERT INTO operasi_midtrans(jenis,kunci,referensi_id,sidik,status,referensi_provider) VALUES ('DISBURSEMENT',?,?,?,'BERHASIL',?)",
      )
      .run(id, id, "test-fingerprint", ref);
    const fetch = vi.fn().mockImplementation(async () =>
      reply({
        reference_no: ref,
        status: "completed",
        amount: "10000.00",
        beneficiary_bank: "bca",
        beneficiary_account: "1234567890",
      }),
    );
    vi.stubGlobal("fetch", fetch);
    for (let i = 0; i < 2; i++)
      expect(
        (await send({ reference_no: ref, status: "failed", amount: "1" }))
          .status,
      ).toBe(200);
    expect(
      one<{ n: number }>(
        "SELECT count(*) n FROM mutasi_saldo WHERE kunci_operasi=?",
        `cair:${id}`,
      ).n,
    ).toBe(1);
    expect(
      one<{ status: string }>(
        "SELECT status_pencairan status FROM pencairan_dana WHERE id_pencairan=?",
        id,
      ).status,
    ).toBe("BERHASIL");
    expect((await send({ reference_no: "unknown" })).status).toBe(404);
  });
  it("refund pending tidak menutup sengketa; retry rekonsiliasi finalisasi sekali", async () => {
    const ticket = randomUUID();
    fixture.db
      .prepare(
        "UPDATE transaksi_pekerjaan SET status_pekerjaan='DISENGKETAKAN',status_sebelum_sengketa='SUBMITTED' WHERE id_transaksi=?",
      )
      .run(trx);
    fixture.db
      .prepare(
        "UPDATE tagihan_pembayaran SET status_pembayaran='BERHASIL' WHERE id_tagihan=?",
      )
      .run(invoice);
    fixture.db
      .prepare(
        "INSERT INTO tiket_sengketa(id_tiket,nomor_tiket,id_transaksi,id_pelapor,kategori_masalah,deskripsi_komplain) VALUES (?,?,?,?,'Pembayaran','Refund Midtrans integration')",
      )
      .run(ticket, `KIN-${ticket}`, trx, tkUser);
    await session.buatSesi(cs);
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(reply(payload()))
      .mockResolvedValueOnce(
        reply({ status_code: "202", transaction_status: "pending" }),
      );
    vi.stubGlobal("fetch", fetch);
    const run = () =>
      refundController.prosesRefundTagihan(
        trx,
        ticket,
        "Refund setelah pemeriksaan sengketa",
      );
    await expect(run()).rejects.toMatchObject({ status: 502 });
    expect(snapshot()).toBe("BERHASIL");
    expect(
      one<{ status: string }>(
        "SELECT status_tiket status FROM tiket_sengketa WHERE id_tiket=?",
        ticket,
      ).status,
    ).toBe("DIPROSES");
    fetch.mockResolvedValueOnce(
      reply(
        payload({
          transaction_status: "refund",
          refunds: [
            { refund_key: `refund:${ticket}`, refund_amount: "105000.00" },
          ],
        }),
      ),
    );
    expect(await run()).toMatchObject({ ok: true });
    expect(snapshot()).toBe("DIKEMBALIKAN");
    expect(await run()).toMatchObject({ ok: true });
    expect(
      fetch.mock.calls.filter((call) => call[1]?.method === "POST"),
    ).toHaveLength(1);
  });
  it("tujuan bank ambigu / key Iris kosong ditolak sebelum reservasi saldo", async () => {
    const model = await import("@/models/PencairanDana");
    const count = () =>
      one<{ n: number }>("SELECT count(*) n FROM pencairan_dana").n;
    const before = count();
    await expect(
      model.ajukanPencairanDana(tk, 10000, "BANK:1234567890"),
    ).rejects.toMatchObject({ status: 400 });
    vi.stubEnv("MIDTRANS_IRIS_API_KEY", "");
    await expect(
      model.ajukanPencairanDana(tk, 10000, "BANK:bca:1234567890"),
    ).rejects.toMatchObject({ status: 503 });
    expect(count()).toBe(before);
  });
  it("rekonsiliasi reference_no hilang memverifikasi notes, rekening dan nominal tanpa POST", async () => {
    const id = randomUUID(),
      ref = `reconcile-${id}`;
    fixture.db
      .prepare(
        "INSERT INTO pencairan_dana(id_pencairan,id_tenaga_kerja,nominal,rekening_tujuan,status_pencairan) VALUES (?,?,10000,'BANK:bca:1234567890','DIPROSES')",
      )
      .run(id, tk);
    fixture.db
      .prepare(
        "INSERT INTO operasi_midtrans(jenis,kunci,referensi_id,sidik,status) VALUES ('DISBURSEMENT',?,?,?,'BELUM_PASTI')",
      )
      .run(id, id, "test-fingerprint");
    const { rekonsiliasiPayout } = await import("@/scripts/reconcile-midtrans");
    const detail = {
      reference_no: ref,
      status: "queued",
      amount: "10000.00",
      beneficiary_bank: "bca",
      beneficiary_account: "1234567890",
      notes: `kerjain:${id}`,
    };
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(reply({ ...detail, notes: "other" }))
      .mockResolvedValueOnce(reply(detail));
    vi.stubGlobal("fetch", fetch);
    await expect(rekonsiliasiPayout(id, ref)).rejects.toMatchObject({
      status: 409,
    });
    expect(
      one<{ ref: string | null }>(
        "SELECT referensi_provider ref FROM operasi_midtrans WHERE kunci=?",
        id,
      ).ref,
    ).toBeNull();
    await rekonsiliasiPayout(id, ref);
    expect(
      one<{ ref: string | null }>(
        "SELECT referensi_provider ref FROM operasi_midtrans WHERE kunci=?",
        id,
      ).ref,
    ).toBe(ref);
    expect(
      fetch.mock.calls.every(
        (call) => !call[1]?.method || call[1].method === "GET",
      ),
    ).toBe(true);
  });
  it("CLI rekonsiliasi membuka DB dari env dan berjalan tanpa kunci/jaringan nyata", () => {
    const id = randomUUID(),
      ref = `cli-${id}`;
    fixture.db
      .prepare(
        "INSERT INTO pencairan_dana(id_pencairan,id_tenaga_kerja,nominal,rekening_tujuan,status_pencairan) VALUES (?,?,10000,'BANK:bca:1234567890','DIPROSES')",
      )
      .run(id, tk);
    fixture.db
      .prepare(
        "INSERT INTO operasi_midtrans(jenis,kunci,referensi_id,sidik,status) VALUES ('DISBURSEMENT',?,?,?,'BELUM_PASTI')",
      )
      .run(id, id, "cli-test");
    const preload = path.join(path.dirname(fixture.file), "midtrans-fetch.mjs");
    const detail = {
      reference_no: ref,
      status: "queued",
      amount: "10000.00",
      beneficiary_bank: "bca",
      beneficiary_account: "1234567890",
      notes: `kerjain:${id}`,
    };
    writeFileSync(
      preload,
      `globalThis.fetch = async (url, init) => { if (init?.method && init.method !== 'GET') throw new Error('POST forbidden'); return new Response(JSON.stringify(${JSON.stringify(detail)})); };`,
    );
    const output = execFileSync(
      process.execPath,
      [
        "--conditions=react-server",
        "--import",
        "tsx",
        "--import",
        pathToFileURL(preload).href,
        "scripts/reconcile-midtrans-cli.ts",
        id,
        ref,
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: {
          ...process.env,
          DATABASE_PATH: fixture.file,
          MIDTRANS_IRIS_API_KEY: "cli-dummy-key",
        },
        windowsHide: true,
      },
    );
    expect(output).toContain("Referensi terverifikasi");
    expect(output).not.toContain("1234567890");
    expect(
      one<{ ref: string }>(
        "SELECT referensi_provider ref FROM operasi_midtrans WHERE kunci=?",
        id,
      ).ref,
    ).toBe(ref);
  });
});
