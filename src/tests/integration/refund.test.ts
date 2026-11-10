import { randomUUID } from "node:crypto";
import {
  beforeAll,
  beforeEach,
  afterAll,
  afterEach,
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
let controller: typeof import("@/controllers/TagihanPembayaranController");
let sesi: typeof import("@/lib/auth/session");
let mock: typeof import("@/lib/payment/mock");
let tiketModel: typeof import("@/models/TiketSengketa");
let ids: string[];
let cs: string;
let tkUser: string;
let trx: string;
let tiket: string;
let invoice: string;
const one = <T>(sql: string, ...params: string[]) =>
  fixture.db.prepare(sql).get(...params) as T;
const jalankan = (id = tiket, transaction = trx) =>
  controller.prosesRefundTagihan(
    transaction,
    id,
    "Pengembalian dana disetujui setelah pemeriksaan CS",
  );
const state = () => ({
  transaksi: one<{ status: string }>(
    "SELECT status_pekerjaan status FROM transaksi_pekerjaan WHERE id_transaksi = ?",
    trx,
  ).status,
  tagihan: one<{ status: string }>(
    "SELECT status_pembayaran status FROM tagihan_pembayaran WHERE id_tagihan = ?",
    invoice,
  ).status,
  tiket: one<{ status: string; keputusan: string | null }>(
    "SELECT status_tiket status, keputusan FROM tiket_sengketa WHERE id_tiket = ?",
    tiket,
  ),
});
const logs = () =>
  one<{ n: number }>(
    "SELECT COUNT(*) n FROM log_gateway WHERE referensi_id = ? AND jenis = 'REFUND'",
    invoice,
  ).n;
beforeAll(async () => {
  fixture = await dbAplikasiSementara();
  tambahFixtureTransaksi(fixture.db);
  ids = (
    fixture.db
      .prepare(
        "SELECT id_transaksi id FROM transaksi_pekerjaan WHERE created_at = '2030-01-01 00:00:00'",
      )
      .all() as { id: string }[]
  ).map((x) => x.id);
  cs = one<{ id: string }>(
    "SELECT id_pengguna id FROM pengguna WHERE peran = 'CS'",
  ).id;
  tkUser = one<{ id: string }>(
    "SELECT id_pengguna id FROM pengguna WHERE email = 'tk1@kerjain.test'",
  ).id;
  controller = await import("@/controllers/TagihanPembayaranController");
  sesi = await import("@/lib/auth/session");
  mock = await import("@/lib/payment/mock");
  tiketModel = await import("@/models/TiketSengketa");
  process.env.PAYMENT_PROVIDER = "mock";
});
beforeEach(async () => {
  trx = ids.pop()!;
  tiket = randomUUID();
  invoice = randomUUID();
  fixture.db
    .prepare(
      "UPDATE transaksi_pekerjaan SET status_pekerjaan = 'DISENGKETAKAN', status_sebelum_sengketa = 'SUBMITTED' WHERE id_transaksi = ?",
    )
    .run(trx);
  fixture.db
    .prepare(
      `INSERT INTO tiket_sengketa (id_tiket,nomor_tiket,id_transaksi,id_pelapor,kategori_masalah,deskripsi_komplain)
    VALUES (?,?,?,?,'Pembayaran','Pemeriksaan pengembalian dana sengketa')`,
    )
    .run(tiket, `KIN-${randomUUID()}`, trx, tkUser);
  fixture.db
    .prepare(
      `INSERT INTO tagihan_pembayaran (id_tagihan,id_transaksi,nominal_upah,commission_fee,total_bayar,expiry_timestamp,status_pembayaran)
    VALUES (?,?,100000,5000,105000,datetime('now','+1 day'),'BERHASIL')`,
    )
    .run(invoice, trx);
  jar.clear();
  await sesi.buatSesi(cs);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
afterAll(() => fixture?.tutup());

describe("Refund sengketa: prasyarat, konflik, dan idempotensi", () => {
  it("menolak tanpa sesi atau selain CS sebelum gateway", async () => {
    const gateway = vi.spyOn(mock.MockPaymentGateway.prototype, "refund");
    jar.clear();
    await expect(jalankan()).rejects.toMatchObject({ status: 401 });
    await sesi.buatSesi(tkUser);
    await expect(jalankan()).rejects.toMatchObject({ status: 403 });
    expect(gateway).not.toHaveBeenCalled();
    expect(state().tagihan).toBe("BERHASIL");
  });
  it("menolak ID tiket palsu atau transaksi tidak ada sebelum gateway", async () => {
    const gateway = vi.spyOn(mock.MockPaymentGateway.prototype, "refund");
    await expect(jalankan(randomUUID())).rejects.toMatchObject({ status: 404 });
    await expect(jalankan(tiket, randomUUID())).rejects.toMatchObject({
      status: 404,
    });
    expect(gateway).not.toHaveBeenCalled();
  });
  it("tiket yang tidak sesuai transaksi ditolak", async () => {
    fixture.db
      .prepare(
        "UPDATE tiket_sengketa SET id_transaksi = NULL WHERE id_tiket = ?",
      )
      .run(tiket);
    await expect(jalankan()).rejects.toMatchObject({ status: 409 });
    expect(logs()).toBe(0);
  });
  it("tiket final tidak memanggil gateway", async () => {
    fixture.db
      .prepare(
        "UPDATE tiket_sengketa SET status_tiket = 'DIBATALKAN' WHERE id_tiket = ?",
      )
      .run(tiket);
    await expect(jalankan()).rejects.toMatchObject({ status: 409 });
    expect(logs()).toBe(0);
  });
  it("pekerjaan COMPLETED tidak boleh direfund", async () => {
    fixture.db
      .prepare(
        "UPDATE transaksi_pekerjaan SET status_pekerjaan = 'COMPLETED' WHERE id_transaksi = ?",
      )
      .run(trx);
    await expect(jalankan()).rejects.toMatchObject({ status: 409 });
    expect(logs()).toBe(0);
  });
  it("ledger upah sudah dikredit tetap ditolak walau status diubah DISENGKETAKAN", async () => {
    const idTK = one<{ id: string }>(
      "SELECT id_tenaga_kerja id FROM transaksi_pekerjaan WHERE id_transaksi = ?",
      trx,
    ).id;
    fixture.db
      .prepare(
        "INSERT INTO mutasi_saldo (kunci_operasi,id_tenaga_kerja,nominal) VALUES (?,?,100000)",
      )
      .run(`upah:${trx}`, idTK);
    await expect(jalankan()).rejects.toMatchObject({ status: 409 });
    expect(logs()).toBe(0);
  });
  it("tagihan belum dibayar ditolak sebelum gateway", async () => {
    fixture.db
      .prepare(
        "UPDATE tagihan_pembayaran SET status_pembayaran = 'MENUNGGU_PEMBAYARAN' WHERE id_tagihan = ?",
      )
      .run(invoice);
    await expect(jalankan()).rejects.toMatchObject({ status: 409 });
    expect(logs()).toBe(0);
  });
  it("refund sukses menyelesaikan tagihan, transaksi, tiket, riwayat dan notifikasi tepat sekali", async () => {
    const gateway = vi.spyOn(mock.MockPaymentGateway.prototype, "refund");
    expect(await jalankan()).toMatchObject({
      ok: true,
      status: "DIKEMBALIKAN",
      idTagihan: invoice,
      nominal: 105000,
    });
    expect(state()).toEqual({
      transaksi: "DIBATALKAN",
      tagihan: "DIKEMBALIKAN",
      tiket: { status: "DITUTUP", keputusan: "REFUND" },
    });
    expect(await jalankan()).toMatchObject({ idempotent: true, ok: true });
    expect(gateway).toHaveBeenCalledTimes(1);
    expect(logs()).toBe(1);
    expect(
      one<{ n: number }>(
        "SELECT COUNT(*) n FROM riwayat_sengketa WHERE id_tiket = ?",
        tiket,
      ).n,
    ).toBe(3);
    expect(
      one<{ n: number }>(
        "SELECT COUNT(*) n FROM notifikasi WHERE tautan = ?",
        `/tiket/${tiket}`,
      ).n,
    ).toBe(2);
    await expect(jalankan(randomUUID())).rejects.toMatchObject({ status: 404 });
  });
  it("GAGAL tidak membuat status sukses palsu; retry memakai kunci sama", async () => {
    const gateway = vi
      .spyOn(mock.MockPaymentGateway.prototype, "refund")
      .mockResolvedValueOnce({ status: "GAGAL" })
      .mockResolvedValue({ status: "BERHASIL" });
    await expect(jalankan()).rejects.toMatchObject({ status: 502 });
    expect(state()).toEqual({
      transaksi: "DISENGKETAKAN",
      tagihan: "BERHASIL",
      tiket: { status: "DIPROSES", keputusan: "REFUND" },
    });
    expect(await jalankan()).toMatchObject({ ok: true });
    expect(gateway.mock.calls[0]).toEqual(gateway.mock.calls[1]);
  });
  it("timeout tetap mengunci tiket dan retry tidak membuat refund gateway ganda", async () => {
    const original = mock.MockPaymentGateway.prototype.refund;
    vi.spyOn(
      mock.MockPaymentGateway.prototype,
      "refund",
    ).mockImplementationOnce(async (params) => {
      await original.call(new mock.MockPaymentGateway(), params);
      throw new Error("response lost");
    });
    await expect(jalankan()).rejects.toMatchObject({ status: 502 });
    expect(logs()).toBe(1);
    expect(state().transaksi).toBe("DISENGKETAKAN");
    expect(await jalankan()).toMatchObject({ ok: true });
    expect(logs()).toBe(1);
  });
  it("pembatalan dan keputusan berbeda ditolak ketika gateway sedang dipanggil", async () => {
    vi.spyOn(mock.MockPaymentGateway.prototype, "refund").mockImplementation(
      async () => {
        expect(tiketModel.batal(tiket, tkUser)).toMatchObject({ ok: false });
        expect(() =>
          fixture.db
            .prepare(
              "UPDATE tiket_sengketa SET keputusan = 'PENCAIRAN' WHERE id_tiket = ?",
            )
            .run(tiket),
        ).toThrow(/refund/);
        expect(() =>
          fixture.db
            .prepare(
              "UPDATE transaksi_pekerjaan SET status_pekerjaan = 'SUBMITTED' WHERE id_transaksi = ?",
            )
            .run(trx),
        ).toThrow(/refund/);
        const idTK = one<{ id: string }>(
          "SELECT id_tenaga_kerja id FROM transaksi_pekerjaan WHERE id_transaksi = ?",
          trx,
        ).id;
        expect(() =>
          fixture.db
            .prepare(
              "INSERT INTO mutasi_saldo (kunci_operasi,id_tenaga_kerja,nominal) VALUES (?,?,100000)",
            )
            .run(`upah:${trx}`, idTK),
        ).toThrow(/refund/);
        return { status: "BERHASIL" };
      },
    );
    expect(await jalankan()).toMatchObject({ ok: true });
  });
  it("permintaan bersamaan hanya mengirim satu instruksi", async () => {
    let resolve!: (result: { status: "BERHASIL" }) => void;
    const gateway = vi
      .spyOn(mock.MockPaymentGateway.prototype, "refund")
      .mockImplementation(
        () =>
          new Promise((r) => {
            resolve = r;
          }),
      );
    const first = jalankan();
    // requireCS async: beri kesempatan panggilan pertama mengklaim operasi.
    await vi.waitFor(() => expect(gateway).toHaveBeenCalledTimes(1));
    expect(await jalankan()).toMatchObject({ ok: false, status: "DIPROSES" });
    expect(gateway).toHaveBeenCalledTimes(1);
    resolve({ status: "BERHASIL" });
    expect(await first).toMatchObject({ ok: true });
  });
  it("klaim kedaluwarsa setelah proses berhenti dapat dipulihkan", async () => {
    vi.spyOn(mock.MockPaymentGateway.prototype, "refund")
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue({ status: "BERHASIL" });
    await expect(jalankan()).rejects.toMatchObject({ status: 502 });
    fixture.db
      .prepare(
        "UPDATE operasi_refund SET status = 'MENGIRIM', batas_klaim = 0 WHERE id_tagihan = ?",
      )
      .run(invoice);
    expect(await jalankan()).toMatchObject({ ok: true });
  });
  it("batas tunggu 10 detik mempertahankan status dan lease dapat dicoba ulang", async () => {
    vi.useFakeTimers();
    vi.spyOn(mock.MockPaymentGateway.prototype, "refund").mockImplementation(
      () => new Promise(() => {}),
    );
    const pending = jalankan();
    const result = expect(pending).rejects.toMatchObject({ status: 502 });
    await vi.advanceTimersByTimeAsync(10001);
    await result;
    expect(state().tiket.status).toBe("DIPROSES");
    expect(state().tagihan).toBe("BERHASIL");
  });
  it("gagal finalisasi DB tidak menyisakan sukses parsial; retry merekonsiliasi instruksi sama", async () => {
    fixture.db
      .exec(`CREATE TRIGGER uji_gagal_refund BEFORE UPDATE ON tagihan_pembayaran
      WHEN NEW.status_pembayaran = 'DIKEMBALIKAN' BEGIN SELECT RAISE(ABORT,'uji finalisasi gagal'); END`);
    try {
      await expect(jalankan()).rejects.toThrow(/finalisasi/);
    } finally {
      fixture.db.exec("DROP TRIGGER uji_gagal_refund");
    }
    expect(state().tagihan).toBe("BERHASIL");
    expect(state().tiket.status).toBe("DIPROSES");
    fixture.db
      .prepare("UPDATE operasi_refund SET batas_klaim = 0 WHERE id_tagihan = ?")
      .run(invoice);
    expect(await jalankan()).toMatchObject({ ok: true });
    expect(logs()).toBe(1);
  });
  it("instruksi refund berbeda untuk tagihan sama ditolak mock adapter", async () => {
    const adapter = new mock.MockPaymentGateway();
    await adapter.refund({
      idTagihan: invoice,
      idempotencyKey: `refund:${tiket}`,
      nominal: 105000,
    });
    await expect(
      adapter.refund({
        idTagihan: invoice,
        idempotencyKey: randomUUID(),
        nominal: 105000,
      }),
    ).rejects.toMatchObject({ status: 409 });
    await expect(
      adapter.refund({
        idTagihan: invoice,
        idempotencyKey: `refund:${tiket}`,
        nominal: 100000,
      }),
    ).rejects.toMatchObject({ status: 409 });
    expect(logs()).toBe(1);
  });
});
