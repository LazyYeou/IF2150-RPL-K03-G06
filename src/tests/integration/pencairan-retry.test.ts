import { randomUUID } from "node:crypto";
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

const jar = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      jar.has(name) ? { value: jar.get(name) } : undefined,
    set: (name: string, value: string) => jar.set(name, value),
  }),
}));

let fixture: Awaited<ReturnType<typeof dbAplikasiSementara>>;
let model: typeof import("@/models/PencairanDana");
let wallet: typeof import("@/models/Dompet");
let mock: typeof import("@/lib/payment/mock");
let session: typeof import("@/lib/auth/session");
let route: typeof import("@/app/api/pencairan/route");
let retry: typeof import("@/app/api/pencairan/[id]/ulang/route");
let webhook: typeof import("@/controllers/PaymentGatewayController");
let tk: string;
let user: string;
const nominal = 10000;
const rekening = "BANK:1234567890";
const saldo = () => wallet.hitungSaldoRingkas(tk);
const records = () =>
  (
    fixture.db.prepare("SELECT COUNT(*) n FROM pencairan_dana").get() as {
      n: number;
    }
  ).n;
const submit = (key: string | null, amount = nominal) =>
  route.POST(
    new Request("http://localhost/api/pencairan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { "Idempotency-Key": key } : {}),
      },
      body: JSON.stringify({ nominal: amount, rekeningTujuan: rekening }),
    }),
  );
const ulang = (id: string) =>
  retry.POST(
    new Request("http://localhost/api/pencairan/" + id + "/ulang", {
      method: "POST",
    }),
    { params: Promise.resolve({ id }) },
  );
async function callback(id: string, status = "BERHASIL") {
  const signed = mock.tandaTanganiWebhook({
    jenis: "PENCAIRAN",
    referensiId: id,
    status,
    nominal,
  });
  return webhook.prosesNotifikasiWebhook(signed.rawBody, signed.signature);
}

beforeAll(async () => {
  process.env.PAYMENT_PROVIDER = "mock";
  process.env.PAYMENT_WEBHOOK_SECRET = "retry-test-secret";
  fixture = await dbAplikasiSementara();
  model = await import("@/models/PencairanDana");
  wallet = await import("@/models/Dompet");
  mock = await import("@/lib/payment/mock");
  session = await import("@/lib/auth/session");
  route = await import("@/app/api/pencairan/route");
  retry = await import("@/app/api/pencairan/[id]/ulang/route");
  webhook = await import("@/controllers/PaymentGatewayController");
  const row = fixture.db
    .prepare(
      `SELECT tk.id_tenaga_kerja tk, p.id_pengguna id FROM tenaga_kerja tk
    JOIN pengguna p USING(id_pengguna) WHERE p.email = 'tk1@kerjain.test'`,
    )
    .get() as { tk: string; id: string };
  tk = row.tk;
  user = row.id;
  fixture.db
    .prepare(
      "INSERT INTO mutasi_saldo (kunci_operasi, id_tenaga_kerja, nominal) VALUES (?, ?, ?)",
    )
    .run(randomUUID(), tk, 1000000);
});
beforeEach(async () => {
  fixture.db.prepare("DELETE FROM pengiriman_pencairan").run();
  fixture.db.prepare("DELETE FROM pencairan_dana").run();
  jar.clear();
  await session.buatSesi(user);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
afterAll(() => fixture?.tutup());

describe("Pencairan: kegagalan dan retry idempoten", () => {
  it("GAGAL definitif membebaskan reservasi tanpa debit; replay tidak mengirim lagi", async () => {
    const gateway = vi
      .spyOn(mock.MockPaymentGateway.prototype, "disburse")
      .mockResolvedValue({ status: "GAGAL" });
    const awal = saldo();
    const key = randomUUID();
    expect(await (await submit(key)).json()).toMatchObject({
      id: key,
      status: "GAGAL",
      bisaCobaUlang: false,
    });
    expect(saldo()).toEqual(awal);
    await submit(key);
    await ulang(key);
    expect(records()).toBe(1);
    expect(gateway).toHaveBeenCalledTimes(1);
  });
  it("exception tidak melepas reservasi; retry memakai ID, rekening, dan nominal yang sama", async () => {
    const gateway = vi
      .spyOn(mock.MockPaymentGateway.prototype, "disburse")
      .mockRejectedValueOnce(new Error("connection lost"))
      .mockResolvedValue({ status: "DITERIMA" });
    const awal = saldo();
    const key = randomUUID();
    const res = await submit(key);
    expect(res.status).toBe(202);
    expect(await res.json()).toMatchObject({
      id: key,
      status: "DIPROSES",
      bisaCobaUlang: true,
    });
    expect(saldo()).toEqual({
      saldo: awal.saldo,
      saldoTersedia: awal.saldoTersedia - nominal,
    });
    expect(wallet.bacaDataDompet(tk).pencairan[0].bisaCobaUlang).toBe(true);
    expect(await (await ulang(key)).json()).toMatchObject({
      id: key,
      bisaCobaUlang: false,
    });
    expect(gateway.mock.calls.map(([params]) => params)).toEqual([
      { idPencairan: key, rekening, nominal },
      { idPencairan: key, rekening, nominal },
    ]);
    expect(records()).toBe(1);
    expect(saldo().saldoTersedia).toBe(awal.saldoTersedia - nominal);
  });
  it("timeout nyata dibatasi, tetap tertahan, dan balasan terlambat tidak menimpa hasil callback", async () => {
    vi.useFakeTimers();
    let selesai!: (result: { status: "GAGAL" }) => void;
    vi.spyOn(mock.MockPaymentGateway.prototype, "disburse").mockImplementation(
      () =>
        new Promise((resolve) => {
          selesai = resolve;
        }),
    );
    const awal = saldo();
    const id = randomUUID();
    const pending = model.ajukanPencairanDana(tk, nominal, rekening, id);
    await vi.advanceTimersByTimeAsync(model.BATAS_GATEWAY_MS);
    expect(await pending).toMatchObject({ bisaCobaUlang: true });
    expect(saldo().saldoTersedia).toBe(awal.saldoTersedia - nominal);
    await callback(id);
    selesai({ status: "GAGAL" });
    await Promise.resolve();
    expect(model.cariPencairanBerdasarkanId(id)?.status).toBe("BERHASIL");
  });
  it("pengajuan bersamaan dengan key sama hanya satu instruksi dan satu reservasi", async () => {
    let selesai!: (result: { status: "DITERIMA" }) => void;
    const gateway = vi
      .spyOn(mock.MockPaymentGateway.prototype, "disburse")
      .mockImplementation(
        () =>
          new Promise((resolve) => {
            selesai = resolve;
          }),
      );
    const key = randomUUID();
    const awal = saldo();
    const first = model.ajukanPencairanDana(tk, nominal, rekening, key);
    await model.ajukanPencairanDana(tk, nominal, rekening, key);
    await model.ulangPencairanDana(tk, key);
    expect(gateway).toHaveBeenCalledTimes(1);
    expect(records()).toBe(1);
    expect(saldo().saldoTersedia).toBe(awal.saldoTersedia - nominal);
    selesai({ status: "DITERIMA" });
    await first;
  });
  it("replay setelah DITERIMA tidak mengirim ulang", async () => {
    const gateway = vi.spyOn(mock.MockPaymentGateway.prototype, "disburse");
    const key = randomUUID();
    await submit(key);
    await submit(key);
    await ulang(key);
    expect(gateway).toHaveBeenCalledTimes(1);
    expect(records()).toBe(1);
  });
  it("key sama dengan payload berbeda ditolak 409 tanpa perubahan reservasi", async () => {
    const key = randomUUID();
    await submit(key);
    const awal = saldo();
    expect((await submit(key, 20000)).status).toBe(409);
    await expect(
      model.ajukanPencairanDana(tk, nominal, "BANK:9876543210", key),
    ).rejects.toMatchObject({ status: 409 });
    expect(records()).toBe(1);
    expect(saldo()).toEqual(awal);
  });
  it("callback sukses berulang setelah timeout mendebit saldo tepat sekali", async () => {
    vi.spyOn(mock.MockPaymentGateway.prototype, "disburse").mockRejectedValue(
      new Error("timeout"),
    );
    const key = randomUUID();
    const awal = saldo();
    await submit(key);
    await callback(key);
    await callback(key);
    await ulang(key);
    expect(saldo()).toEqual({
      saldo: awal.saldo - nominal,
      saldoTersedia: awal.saldoTersedia - nominal,
    });
    expect(
      fixture.db
        .prepare("SELECT COUNT(*) n FROM mutasi_saldo WHERE kunci_operasi = ?")
        .get(`cair:${key}`),
    ).toEqual({ n: 1 });
  });
  it("callback GAGAL setelah timeout membebaskan saldo tanpa debit", async () => {
    vi.spyOn(mock.MockPaymentGateway.prototype, "disburse").mockRejectedValue(
      new Error("timeout"),
    );
    const key = randomUUID();
    const awal = saldo();
    await submit(key);
    await callback(key, "GAGAL");
    await callback(key, "GAGAL");
    expect(saldo()).toEqual(awal);
    expect((await (await ulang(key)).json()).status).toBe("GAGAL");
  });
  it("callback sukses selama pengiriman tidak diturunkan oleh jawaban GAGAL", async () => {
    vi.spyOn(mock.MockPaymentGateway.prototype, "disburse").mockImplementation(
      async ({ idPencairan }) => {
        await callback(idPencairan);
        return { status: "GAGAL" };
      },
    );
    expect((await (await submit(randomUUID())).json()).status).toBe("BERHASIL");
  });
  it("klaim kedaluwarsa setelah restart dapat diambil ulang tanpa reservasi baru", async () => {
    vi.spyOn(mock.MockPaymentGateway.prototype, "disburse")
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue({ status: "DITERIMA" });
    const key = randomUUID();
    await submit(key);
    const awal = saldo();
    fixture.db
      .prepare(
        "UPDATE pengiriman_pencairan SET status = 'MENGIRIM', klaim = 'server-lama', batas_klaim = ? WHERE id_pencairan = ?",
      )
      .run(Date.now() - 1, key);
    expect((await (await ulang(key)).json()).bisaCobaUlang).toBe(false);
    expect(records()).toBe(1);
    expect(saldo()).toEqual(awal);
  });
  it("mock gateway menahan instruksi ganda sekalipun server kehilangan balasan pertama", async () => {
    const original = mock.MockPaymentGateway.prototype.disburse;
    vi.spyOn(
      mock.MockPaymentGateway.prototype,
      "disburse",
    ).mockImplementationOnce(async (params) => {
      await original.call(new mock.MockPaymentGateway(), params);
      throw new Error("response lost");
    });
    const key = randomUUID();
    await submit(key);
    await ulang(key);
    expect(
      fixture.db
        .prepare(
          "SELECT COUNT(*) n FROM log_gateway WHERE jenis = 'DISBURSEMENT' AND referensi_id = ?",
        )
        .get(key),
    ).toEqual({ n: 1 });
  });
  it("key baru tetap ditolak jika saldo sudah direservasi", async () => {
    vi.spyOn(mock.MockPaymentGateway.prototype, "disburse").mockRejectedValue(
      new Error("offline"),
    );
    const amount = saldo().saldoTersedia;
    expect((await submit(randomUUID(), amount)).status).toBe(202);
    expect((await submit(randomUUID())).status).toBe(422);
    expect(records()).toBe(1);
  });
  it("header hilang atau bukan UUID ditolak sebelum membuat pengajuan", async () => {
    expect((await submit(null)).status).toBe(400);
    expect((await submit("invalid")).status).toBe(400);
    expect(records()).toBe(0);
  });
  it("retry hanya milik sendiri; key milik orang lain juga ditolak", async () => {
    const key = randomUUID();
    await submit(key);
    const awal = saldo();
    const other = fixture.db
      .prepare(
        "SELECT id_tenaga_kerja id FROM tenaga_kerja WHERE id_tenaga_kerja != ? LIMIT 1",
      )
      .get(tk) as { id: string };
    fixture.db
      .prepare(
        "UPDATE pencairan_dana SET id_tenaga_kerja = ? WHERE id_pencairan = ?",
      )
      .run(other.id, key);
    expect((await ulang(key)).status).toBe(403);
    expect((await submit(key)).status).toBe(403);
    expect(records()).toBe(1);
    expect(saldo().saldo).toBe(awal.saldo);
  });
  it("retry tanpa sesi ditolak 401, ID tidak ditemukan 404", async () => {
    expect((await ulang(randomUUID())).status).toBe(404);
    jar.clear();
    expect((await ulang(randomUUID())).status).toBe(401);
  });
  it("migrasi pengajuan lama mempertahankan saldo dan memungkinkan retry dengan ID lama", async () => {
    const key = randomUUID();
    fixture.db
      .prepare(
        `INSERT INTO pencairan_dana
      (id_pencairan, id_tenaga_kerja, nominal, rekening_tujuan, status_pencairan)
      VALUES (?, ?, ?, ?, 'DIPROSES')`,
      )
      .run(key, tk, nominal, rekening);
    const awal = saldo();
    fixture.db.exec("DROP TABLE pengiriman_pencairan");
    fixture.db
      .prepare(
        "DELETE FROM _migrasi WHERE nama = '0003_pengiriman_pencairan.sql'",
      )
      .run();
    const { migrate } = await import("@/scripts/migrate");
    expect(migrate(fixture.db)).toEqual(["0003_pengiriman_pencairan.sql"]);
    expect(migrate(fixture.db)).toEqual([]);
    expect(model.bisaUlangPencairan(key, "DIPROSES")).toBe(true);
    await ulang(key);
    expect(records()).toBe(1);
    expect(saldo()).toEqual(awal);
  });
  it("konfigurasi adapter gagal tidak membuat reservasi", async () => {
    const awal = saldo();
    process.env.PAYMENT_PROVIDER = "unsupported";
    try {
      await expect(
        model.ajukanPencairanDana(tk, nominal, rekening),
      ).rejects.toThrow();
      expect(records()).toBe(0);
      expect(saldo()).toEqual(awal);
    } finally {
      process.env.PAYMENT_PROVIDER = "mock";
    }
  });
  it("retry ditolak untuk PK dan TK belum terverifikasi", async () => {
    const key = randomUUID();
    await submit(key);
    for (const email of ["pk1@kerjain.test", "tk2@kerjain.test"]) {
      const other = fixture.db
        .prepare("SELECT id_pengguna id FROM pengguna WHERE email = ?")
        .get(email) as { id: string };
      jar.clear();
      await session.buatSesi(other.id);
      expect((await ulang(key)).status).toBe(403);
    }
  });
});
