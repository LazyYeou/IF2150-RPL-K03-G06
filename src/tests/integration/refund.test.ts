import { randomUUID } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

type Db = typeof import("@/lib/db").db;
let db: Db;
let dir: string;

let controller: typeof import("@/controllers/TagihanPembayaranController");
let adapterModule: typeof import("@/lib/payment/adapter");
let logGatewayModule: typeof import("@/models/LogGateway");

describe("Integrasi Refund Keputusan Sengketa (Issue #38 / UC12)", () => {
  let idTransaksiSengketa: string;
  let idTagihanSengketa: string;
  let idTiketSengketa: string;
  let idPenggunaPKSengketa: string;
  let nominalTotalSengketa: number;

  beforeAll(async () => {
    dir = mkdtempSync(path.join(tmpdir(), "kerjain-refund-"));
    process.env.DATABASE_PATH = path.join(dir, "test.db");
    process.env.PAYMENT_PROVIDER = "mock";
    process.env.COMMISSION_RATE = "0.05";

    const { bukaDb } = await import("@/db/open");
    const { migrate } = await import("@/scripts/migrate");
    const { seed } = await import("@/db/seed");

    const awal = bukaDb();
    migrate(awal);
    await seed(awal);
    awal.close();

    ({ db } = await import("@/lib/db"));
    controller = await import("@/controllers/TagihanPembayaranController");
    adapterModule = await import("@/lib/payment/adapter");
    logGatewayModule = await import("@/models/LogGateway");

    // Ambil transaksi DISENGKETAKAN yang sudah di-seed
    const trx = db
      .prepare(
        `SELECT t.id_transaksi, t.nominal_upah, pk.id_pengguna
         FROM transaksi_pekerjaan t
         JOIN penyedia_kerja pk ON t.id_penyedia_kerja = pk.id_penyedia_kerja
         WHERE t.status_pekerjaan = 'DISENGKETAKAN'
         LIMIT 1`,
      )
      .get() as {
      id_transaksi: string;
      nominal_upah: number;
      id_pengguna: string;
    };

    idTransaksiSengketa = trx.id_transaksi;
    idPenggunaPKSengketa = trx.id_pengguna;

    // Ambil tagihan BERHASIL untuk transaksi ini
    const tagihan = db
      .prepare(
        `SELECT id_tagihan, total_bayar, status_pembayaran
         FROM tagihan_pembayaran
         WHERE id_transaksi = ?
         LIMIT 1`,
      )
      .get(idTransaksiSengketa) as {
      id_tagihan: string;
      total_bayar: number;
      status_pembayaran: string;
    };

    idTagihanSengketa = tagihan.id_tagihan;
    nominalTotalSengketa = tagihan.total_bayar;
    expect(tagihan.status_pembayaran).toBe("BERHASIL");

    idTiketSengketa = randomUUID();
  });

  it("Mock payment adapter refund(): mencatat log jenis REFUND dengan idempotencyKey", async () => {
    const adapter = adapterModule.getPaymentAdapter();
    const idTagihanTest = `tagihan-uji-${randomUUID()}`;
    const idTiketTest = `tiket-uji-${randomUUID()}`;
    const idempotencyKey = `refund:${idTiketTest}`;

    const res = await adapter.refund({
      idempotencyKey,
      idTagihan: idTagihanTest,
      nominal: 75000,
    });

    expect(res.status).toBe("BERHASIL");

    // Periksa log di tabel log_gateway
    const logs = logGatewayModule.ambilLog(idTagihanTest);
    expect(logs).toHaveLength(1);
    expect(logs[0].jenis).toBe("REFUND");
    expect(logs[0].payload).toMatchObject({
      idTagihan: idTagihanTest,
      nominal: 75000,
      idempotencyKey,
    });

    // Panggilan kedua dengan idempotencyKey yang sama tidak mencatat log ganda
    const res2 = await adapter.refund({
      idempotencyKey,
      idTagihan: idTagihanTest,
      nominal: 75000,
    });
    expect(res2.status).toBe("BERHASIL");
    const logsSetelah = logGatewayModule.ambilLog(idTagihanTest);
    expect(logsSetelah).toHaveLength(1);
  });

  it("prosesRefundTagihan(): mengubah status tagihan BERHASIL -> DIKEMBALIKAN & DISENGKETAKAN -> DIBATALKAN", async () => {
    const hasil = await controller.prosesRefundTagihan(
      idTransaksiSengketa,
      idTiketSengketa,
    );

    expect(hasil.ok).toBe(true);
    expect(hasil.status).toBe("DIKEMBALIKAN");
    expect(hasil.idTagihan).toBe(idTagihanSengketa);
    expect(hasil.nominal).toBe(nominalTotalSengketa);

    // Periksa status tagihan di database
    const tagihanDB = db
      .prepare(
        `SELECT status_pembayaran FROM tagihan_pembayaran WHERE id_tagihan = ?`,
      )
      .get(idTagihanSengketa) as { status_pembayaran: string };
    expect(tagihanDB.status_pembayaran).toBe("DIKEMBALIKAN");

    // Periksa status transaksi pekerjaan di database berubah menjadi DIBATALKAN
    const trxDB = db
      .prepare(
        `SELECT status_pekerjaan FROM transaksi_pekerjaan WHERE id_transaksi = ?`,
      )
      .get(idTransaksiSengketa) as { status_pekerjaan: string };
    expect(trxDB.status_pekerjaan).toBe("DIBATALKAN");

    // Periksa log gateway refund tercatat
    const logs = logGatewayModule.ambilLog(idTagihanSengketa);
    const refundLog = logs.find((l) => l.jenis === "REFUND");
    expect(refundLog).toBeDefined();
    expect(refundLog?.payload).toMatchObject({
      idTagihan: idTagihanSengketa,
      idempotencyKey: `refund:${idTiketSengketa}`,
    });

    // Periksa notifikasi terkirim ke PK
    const notif = db
      .prepare(
        `SELECT pesan_notifikasi FROM notifikasi WHERE id_penerima = ? AND pesan_notifikasi LIKE '%Pengembalian dana (refund)%'`,
      )
      .get(idPenggunaPKSengketa) as { pesan_notifikasi: string } | undefined;
    expect(notif).toBeDefined();
    expect(notif?.pesan_notifikasi).toContain("Pengembalian dana (refund)");
  });

  it("Kriteria penerimaan: Refund dipanggil dua kali tidak mengubah apa pun pada panggilan kedua", async () => {
    // Ambil snapshot kondisi sebelum panggilan kedua
    const tagihanSebelum = db
      .prepare(
        `SELECT status_pembayaran, total_bayar
         FROM tagihan_pembayaran WHERE id_tagihan = ?`,
      )
      .get(idTagihanSengketa) as {
      status_pembayaran: string;
      total_bayar: number;
    };
    expect(tagihanSebelum.status_pembayaran).toBe("DIKEMBALIKAN");

    const totalLogSebelum = logGatewayModule.ambilLog(idTagihanSengketa).length;

    // Panggilan kedua
    const hasilKedua = await controller.prosesRefundTagihan(
      idTransaksiSengketa,
      idTiketSengketa,
    );

    expect(hasilKedua.ok).toBe(true);
    expect(hasilKedua.status).toBe("DIKEMBALIKAN");
    expect(hasilKedua.idempotent).toBe(true);

    // Kondisi DB tidak berubah sama sekali
    const tagihanSetelah = db
      .prepare(
        `SELECT status_pembayaran, total_bayar
         FROM tagihan_pembayaran WHERE id_tagihan = ?`,
      )
      .get(idTagihanSengketa) as {
      status_pembayaran: string;
      total_bayar: number;
    };
    expect(tagihanSetelah.status_pembayaran).toBe("DIKEMBALIKAN");
    expect(tagihanSetelah.total_bayar).toBe(tagihanSebelum.total_bayar);

    // Tidak ada penambahan log refund baru ke gateway
    const totalLogSetelah = logGatewayModule.ambilLog(idTagihanSengketa).length;
    expect(totalLogSetelah).toBe(totalLogSebelum);
  });

  it("prosesRefundTagihan() melempar 404 jika idTransaksi tidak ada", async () => {
    const idTransaksiPalsu = randomUUID();
    await expect(
      controller.prosesRefundTagihan(idTransaksiPalsu, "tiket-dummy"),
    ).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
    });
  });

  it("prosesRefundTagihan() melempar 409 jika status tagihan bukan BERHASIL / DIKEMBALIKAN (misal MENUNGGU_PEMBAYARAN)", async () => {
    // Ambil transaksi yang statusnya MENUNGGU_PEMBAYARAN
    const trxMenunggu = db
      .prepare(
        `SELECT id_transaksi FROM transaksi_pekerjaan WHERE status_pekerjaan = 'MENUNGGU_PEMBAYARAN' LIMIT 1`,
      )
      .get() as { id_transaksi: string };

    // Sisipkan tagihan dengan status MENUNGGU_PEMBAYARAN
    const idTagihanMenunggu = randomUUID();
    db.prepare(
      `INSERT INTO tagihan_pembayaran (id_tagihan, id_transaksi, nominal_upah, commission_fee, total_bayar, expiry_timestamp, status_pembayaran)
       VALUES (?, ?, 200000, 10000, 210000, datetime('now', '+1 day'), 'MENUNGGU_PEMBAYARAN')`,
    ).run(idTagihanMenunggu, trxMenunggu.id_transaksi);

    await expect(
      controller.prosesRefundTagihan(trxMenunggu.id_transaksi, "tiket-dummy"),
    ).rejects.toMatchObject({
      status: 409,
      code: "STATUS_TIDAK_VALID",
    });
  });
});
