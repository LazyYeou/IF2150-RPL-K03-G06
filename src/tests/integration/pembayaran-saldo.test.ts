import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const jar = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (n: string) =>
      jar.has(n) ? { name: n, value: jar.get(n) } : undefined,
    set: (n: string, v: string) => void jar.set(n, v),
    delete: (n: string) => void jar.delete(n),
  }),
}));

type Db = typeof import("@/lib/db").db;
let db: Db;
let dir: string;

let bayarRoute: typeof import("@/app/api/tagihan/[id]/bayar/route");
let buatTagihanRoute: typeof import("@/app/api/transaksi/[id]/tagihan/route");
let webhookRoute: typeof import("@/app/api/webhooks/payment/route");
let pencairanRoute: typeof import("@/app/api/pencairan/route");
let dompetRoute: typeof import("@/app/api/dompet/route");
let sessionModule: typeof import("@/lib/auth/session");
let paymentMock: typeof import("@/lib/payment/mock");

const WEBHOOK_SECRET = "secret-integrasi-saldo-test-key";

describe("Integrasi Pembayaran dan Saldo (Issue #42 / D2 / D4)", () => {
  let idPenggunaPK: string;
  let idPenggunaTK: string;
  let idTK: string;

  beforeAll(async () => {
    dir = mkdtempSync(path.join(tmpdir(), "kerjain-pembayaran-saldo-"));
    process.env.DATABASE_PATH = path.join(dir, "test.db");
    process.env.PAYMENT_PROVIDER = "mock";
    process.env.PAYMENT_WEBHOOK_SECRET = WEBHOOK_SECRET;
    process.env.COMMISSION_RATE = "0.05";
    process.env.PAYMENT_EXPIRY_HOURS = "24";

    const { bukaDb } = await import("@/db/open");
    const { migrate } = await import("@/scripts/migrate");
    const { seed } = await import("@/db/seed");

    const awal = bukaDb();
    migrate(awal);
    await seed(awal);
    awal.close();

    ({ db } = await import("@/lib/db"));
    sessionModule = await import("@/lib/auth/session");
    paymentMock = await import("@/lib/payment/mock");
    bayarRoute = await import("@/app/api/tagihan/[id]/bayar/route");
    buatTagihanRoute = await import("@/app/api/transaksi/[id]/tagihan/route");
    webhookRoute = await import("@/app/api/webhooks/payment/route");
    pencairanRoute = await import("@/app/api/pencairan/route");
    dompetRoute = await import("@/app/api/dompet/route");

    // Ambil akun PK1 dan TK1 dari seed
    const pkRow = db
      .prepare(
        `SELECT id_pengguna FROM pengguna WHERE email = 'pk1@kerjain.test'`,
      )
      .get() as { id_pengguna: string };
    idPenggunaPK = pkRow.id_pengguna;

    const tkRow = db
      .prepare(
        `SELECT tk.id_tenaga_kerja, tk.id_pengguna
         FROM tenaga_kerja tk
         JOIN pengguna p ON tk.id_pengguna = p.id_pengguna
         WHERE p.email = 'tk1@kerjain.test'`,
      )
      .get() as { id_tenaga_kerja: string; id_pengguna: string };
    idPenggunaTK = tkRow.id_pengguna;
    idTK = tkRow.id_tenaga_kerja;
  });

  afterAll(() => {
    jar.clear();
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  async function loginSebagai(idPengguna: string) {
    jar.clear();
    await sessionModule.buatSesi(idPengguna);
  }

  function buatTransaksiFixture(nominalUpah = 200000, statusPekerjaan = "MENUNGGU_PEMBAYARAN") {
    const pk = db
      .prepare(`SELECT id_penyedia_kerja FROM penyedia_kerja LIMIT 1`)
      .get() as { id_penyedia_kerja: string };
    const tk = db
      .prepare(`SELECT id_tenaga_kerja FROM tenaga_kerja LIMIT 1`)
      .get() as { id_tenaga_kerja: string };
    const lowonganAsal = db
      .prepare(`SELECT * FROM lowongan_pekerjaan LIMIT 1`)
      .get() as {
        deskripsi: string;
        ruang_lingkup: string;
        kriteria_hasil: string;
        kategori: string;
        lokasi: string;
      };

    const idLowongan = randomUUID();
    const idPenawaran = randomUUID();
    const idTransaksi = randomUUID();

    db.prepare(
      `INSERT INTO lowongan_pekerjaan
       (id_lowongan, id_penyedia_kerja, judul, deskripsi, ruang_lingkup, kriteria_hasil, kategori,
        lokasi, tanggal_pekerjaan, estimasi_durasi, upah, satuan_upah, kuota, jumlah_diterima, status_lowongan)
       VALUES (?, ?, 'Lowongan Fixture Uji Integrasi', ?, ?, ?, ?,
        ?, '2026-11-20', '3 jam', ?, 'PER_TUGAS', 1, 1, 'CLOSED_FULL')`,
    ).run(
      idLowongan,
      pk.id_penyedia_kerja,
      lowonganAsal.deskripsi,
      lowonganAsal.ruang_lingkup,
      lowonganAsal.kriteria_hasil,
      lowonganAsal.kategori,
      lowonganAsal.lokasi,
      nominalUpah,
    );

    db.prepare(
      `INSERT INTO pengajuan_penawaran (id_penawaran, id_lowongan, id_tenaga_kerja, harga_penawaran, ketersediaan, status_penawaran)
       VALUES (?, ?, ?, ?, 'Kapan saja', 'DITERIMA')`,
    ).run(idPenawaran, idLowongan, tk.id_tenaga_kerja, nominalUpah);

    db.prepare(
      `INSERT INTO transaksi_pekerjaan (id_transaksi, id_lowongan, id_penawaran, id_tenaga_kerja, id_penyedia_kerja, nominal_upah, status_pekerjaan)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(idTransaksi, idLowongan, idPenawaran, tk.id_tenaga_kerja, pk.id_penyedia_kerja, nominalUpah, statusPekerjaan);

    return { idTransaksi, nominalUpah };
  }

  // =========================================================================
  // 1. KNF11: bayar dua kali → tidak ada tagihan aktif ganda
  // =========================================================================
  describe("KNF11: Bayar dua kali → tidak ada tagihan aktif ganda", () => {
    it("memanggil bayarTagihan / buatTagihan berulang kali tidak pernah menghasilkan dua tagihan aktif", async () => {
      await loginSebagai(idPenggunaPK);

      const { idTransaksi, nominalUpah } = buatTransaksiFixture(200000, "MENUNGGU_PEMBAYARAN");

      // Buat tagihan pertama lewat API
      const resBuat1 = await buatTagihanRoute.POST(
        new Request(`http://localhost/api/transaksi/${idTransaksi}/tagihan`, {
          method: "POST",
        }),
        { params: Promise.resolve({ id: idTransaksi }) },
      );
      expect(resBuat1.status).toBe(201);
      const tagihan1 = await resBuat1.json();
      expect(tagihan1.status).toBe("MENUNGGU_PEMBAYARAN");

      // Panggilan kedua buatTagihan untuk transaksi yang sama mengembalikan tagihan yang sama (baru: false, 200)
      const resBuat2 = await buatTagihanRoute.POST(
        new Request(`http://localhost/api/transaksi/${idTransaksi}/tagihan`, {
          method: "POST",
        }),
        { params: Promise.resolve({ id: idTransaksi }) },
      );
      expect(resBuat2.status).toBe(200);
      const tagihan2 = await resBuat2.json();
      expect(tagihan2.id).toBe(tagihan1.id);

      // Lakukan pembayaran pertama kali
      const resBayar1 = await bayarRoute.POST(
        new Request(`http://localhost/api/tagihan/${tagihan1.id}/bayar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metode: "VA_BCA" }),
        }),
        { params: Promise.resolve({ id: tagihan1.id }) },
      );
      expect(resBayar1.status).toBe(200);
      const dataBayar1 = await resBayar1.json();
      expect(dataBayar1.status).toBe("DIPROSES");

      // Lakukan pembayaran kedua kali (misal double-click atau retry saat status DIPROSES)
      const resBayar2 = await bayarRoute.POST(
        new Request(`http://localhost/api/tagihan/${tagihan1.id}/bayar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metode: "VA_BCA" }),
        }),
        { params: Promise.resolve({ id: tagihan1.id }) },
      );
      expect(resBayar2.status).toBe(200);
      const dataBayar2 = await resBayar2.json();
      expect(dataBayar2.status).toBe("DIPROSES");

      // Kirim webhook BERHASIL agar tagihan berstatus BERHASIL
      const payloadWebhook = {
        idTagihan: tagihan1.id,
        nominal: tagihan1.totalBayar,
        status: "BERHASIL",
      };
      const { rawBody, signature } = paymentMock.tandaTanganiWebhook(
        payloadWebhook,
        WEBHOOK_SECRET,
      );
      await webhookRoute.POST(
        new Request("http://localhost/api/webhooks/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-callback-signature": signature,
          },
          body: rawBody,
        }),
      );

      // Coba bayar lagi setelah status BERHASIL (harus tetap idempoten, mengembalikan 200 dan tidak membuat tagihan baru)
      const resBayar3 = await bayarRoute.POST(
        new Request(`http://localhost/api/tagihan/${tagihan1.id}/bayar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metode: "VA_BCA" }),
        }),
        { params: Promise.resolve({ id: tagihan1.id }) },
      );
      expect(resBayar3.status).toBe(200);
      const dataBayar3 = await resBayar3.json();
      expect(dataBayar3.status).toBe("BERHASIL");

      // Verifikasi di database: hanya ada tepat 1 tagihan untuk transaksi ini
      const countTagihan = db
        .prepare(
          `SELECT COUNT(*) as jumlah FROM tagihan_pembayaran WHERE id_transaksi = ?`,
        )
        .get(idTransaksi) as { jumlah: number };
      expect(countTagihan.jumlah).toBe(1);

      // Verifikasi integritas constraint database: upaya membuat tagihan aktif kedua secara langsung ditolak UNIQUE constraint
      expect(() => {
        db.prepare(
          `INSERT INTO tagihan_pembayaran (
             id_tagihan, id_transaksi, nominal_upah, commission_fee,
             total_bayar, expiry_timestamp, status_pembayaran
           ) VALUES (?, ?, ?, 5000, ?, datetime('now', '+24 hours'), 'MENUNGGU_PEMBAYARAN')`,
        ).run(randomUUID(), idTransaksi, nominalUpah, nominalUpah + 5000);
      }).toThrow(/UNIQUE constraint failed/);
    });
  });

  // =========================================================================
  // 2. Webhook signature salah → 401; webhook duplikat → no-op
  // =========================================================================
  describe("Webhook Signature & Idempotensi Callback", () => {
    it("Webhook signature salah → 401; dan data DB sama sekali tidak berubah", async () => {
      const { idTransaksi, nominalUpah } = buatTransaksiFixture(150000, "MENUNGGU_PEMBAYARAN");

      const idTagihanUji = randomUUID();
      const fee = Math.round(0.05 * nominalUpah);
      const total = nominalUpah + fee;

      db.prepare(
        `INSERT INTO tagihan_pembayaran (
           id_tagihan, id_transaksi, nominal_upah, commission_fee,
           total_bayar, expiry_timestamp, status_pembayaran
         ) VALUES (?, ?, ?, ?, ?, datetime('now', '+24 hours'), 'DIPROSES')`,
      ).run(idTagihanUji, idTransaksi, nominalUpah, fee, total);

      const payload = {
        idTagihan: idTagihanUji,
        nominal: total,
        status: "BERHASIL",
      };
      const rawBody = JSON.stringify(payload);
      const signaturePalsu = "signature-palsu-invalid-hex-000011112222";

      const res = await webhookRoute.POST(
        new Request("http://localhost/api/webhooks/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-callback-signature": signaturePalsu,
          },
          body: rawBody,
        }),
      );

      expect(res.status).toBe(401);

      // Verifikasi status DB tidak berubah
      const tagihanDb = db
        .prepare(`SELECT status_pembayaran FROM tagihan_pembayaran WHERE id_tagihan = ?`)
        .get(idTagihanUji) as { status_pembayaran: string };
      expect(tagihanDb.status_pembayaran).toBe("DIPROSES");

      const trxDb = db
        .prepare(`SELECT status_pekerjaan FROM transaksi_pekerjaan WHERE id_transaksi = ?`)
        .get(idTransaksi) as { status_pekerjaan: string };
      expect(trxDb.status_pekerjaan).toBe("MENUNGGU_PEMBAYARAN");
    });

    it("Webhook valid diproses (200), dan webhook duplikat menjadi no-op 200 (duplicate: true)", async () => {
      const { idTransaksi, nominalUpah } = buatTransaksiFixture(180000, "MENUNGGU_PEMBAYARAN");

      const idTagihanUji = randomUUID();
      const fee = Math.round(0.05 * nominalUpah);
      const total = nominalUpah + fee;

      db.prepare(
        `INSERT INTO tagihan_pembayaran (
           id_tagihan, id_transaksi, nominal_upah, commission_fee,
           total_bayar, expiry_timestamp, status_pembayaran
         ) VALUES (?, ?, ?, ?, ?, datetime('now', '+24 hours'), 'DIPROSES')`,
      ).run(idTagihanUji, idTransaksi, nominalUpah, fee, total);

      const payload = {
        idTagihan: idTagihanUji,
        nominal: total,
        status: "BERHASIL",
      };
      const { rawBody, signature } = paymentMock.tandaTanganiWebhook(payload, WEBHOOK_SECRET);

      // Panggilan pertama: berhasil diproses
      const res1 = await webhookRoute.POST(
        new Request("http://localhost/api/webhooks/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-callback-signature": signature,
          },
          body: rawBody,
        }),
      );
      expect(res1.status).toBe(200);

      // Cek status berubah jadi BERHASIL dan pekerjaan jadi IN_PROGRESS
      const tagihanDb1 = db
        .prepare(`SELECT status_pembayaran FROM tagihan_pembayaran WHERE id_tagihan = ?`)
        .get(idTagihanUji) as { status_pembayaran: string };
      expect(tagihanDb1.status_pembayaran).toBe("BERHASIL");

      const trxDb1 = db
        .prepare(`SELECT status_pekerjaan FROM transaksi_pekerjaan WHERE id_transaksi = ?`)
        .get(idTransaksi) as { status_pekerjaan: string };
      expect(trxDb1.status_pekerjaan).toBe("IN_PROGRESS");

      // Panggilan kedua (duplikat): no-op
      const res2 = await webhookRoute.POST(
        new Request("http://localhost/api/webhooks/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-callback-signature": signature,
          },
          body: rawBody,
        }),
      );
      expect(res2.status).toBe(200);
      const data2 = await res2.json();
      expect(data2.duplicate).toBe(true);
    });
  });

  // =========================================================================
  // 3. KNF16: webhook disbursement dikirim ulang → debit sekali
  // =========================================================================
  describe("KNF16: Webhook disbursement dikirim ulang → debit tepat sekali", () => {
    it("webhook BERHASIL mendebit saldo, dan retry webhook BERHASIL tidak mendebit ulang saldo", async () => {
      await loginSebagai(idPenggunaTK);

      // Ambil saldo awal TK
      const tkAwal = db
        .prepare(`SELECT saldo_pendapatan FROM tenaga_kerja WHERE id_tenaga_kerja = ?`)
        .get(idTK) as { saldo_pendapatan: number };
      const saldoAwal = tkAwal.saldo_pendapatan;

      const nominalTarik = 80000;
      const resPencairan = await pencairanRoute.POST(
        new Request("http://localhost/api/pencairan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nominal: nominalTarik,
            rekeningTujuan: "BANK:1234567890",
          }),
        }),
      );
      expect(resPencairan.status).toBe(201);
      const { id: idPencairan } = await resPencairan.json();

      // Saldo belum terdebit sebelum webhook BERHASIL datang
      const tkSaatDiproses = db
        .prepare(`SELECT saldo_pendapatan FROM tenaga_kerja WHERE id_tenaga_kerja = ?`)
        .get(idTK) as { saldo_pendapatan: number };
      expect(tkSaatDiproses.saldo_pendapatan).toBe(saldoAwal);

      // Webhook callback BERHASIL pertama
      const payload = {
        jenis: "PENCAIRAN",
        idPencairan,
        referensiId: idPencairan,
        nominal: nominalTarik,
        status: "BERHASIL",
      };
      const { rawBody, signature } = paymentMock.tandaTanganiWebhook(payload, WEBHOOK_SECRET);

      const resWebhook1 = await webhookRoute.POST(
        new Request("http://localhost/api/webhooks/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-callback-signature": signature,
          },
          body: rawBody,
        }),
      );
      expect(resWebhook1.status).toBe(200);

      // Saldo sekarang berkurang tepat nominalTarik
      const tkSetelah1 = db
        .prepare(`SELECT saldo_pendapatan FROM tenaga_kerja WHERE id_tenaga_kerja = ?`)
        .get(idTK) as { saldo_pendapatan: number };
      expect(tkSetelah1.saldo_pendapatan).toBe(saldoAwal - nominalTarik);

      // Ledger mutasi_saldo memiliki tepat 1 entri cair:<idPencairan>
      const mutasiRows1 = db
        .prepare(`SELECT * FROM mutasi_saldo WHERE kunci_operasi = ?`)
        .all(`cair:${idPencairan}`);
      expect(mutasiRows1).toHaveLength(1);

      // Webhook callback BERHASIL dikirim ulang (at-least-once delivery / retry)
      const resWebhook2 = await webhookRoute.POST(
        new Request("http://localhost/api/webhooks/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-callback-signature": signature,
          },
          body: rawBody,
        }),
      );
      expect(resWebhook2.status).toBe(200);
      const dataWebhook2 = await resWebhook2.json();
      expect(dataWebhook2.duplicate || dataWebhook2.ignored).toBe(true);

      // Kriteria penerimaan KNF16: Saldo TIDAK didebit dua kali
      const tkSetelah2 = db
        .prepare(`SELECT saldo_pendapatan FROM tenaga_kerja WHERE id_tenaga_kerja = ?`)
        .get(idTK) as { saldo_pendapatan: number };
      expect(tkSetelah2.saldo_pendapatan).toBe(saldoAwal - nominalTarik);

      // Ledger mutasi_saldo tetap hanya memiliki 1 baris
      const mutasiRows2 = db
        .prepare(`SELECT * FROM mutasi_saldo WHERE kunci_operasi = ?`)
        .all(`cair:${idPencairan}`);
      expect(mutasiRows2).toHaveLength(1);
    });
  });

  // =========================================================================
  // 4. Pencairan melebihi saldo tersedia → 422
  // =========================================================================
  describe("Validasi Saldo Pencairan Dana", () => {
    it("Pencairan melebihi total saldo → ditolak 422 SALDO_TIDAK_CUKUP", async () => {
      await loginSebagai(idPenggunaTK);

      const dompetRes = await dompetRoute.GET();
      const dompet = await dompetRes.json();
      const saldoSaatIni = dompet.saldo;

      const res = await pencairanRoute.POST(
        new Request("http://localhost/api/pencairan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nominal: saldoSaatIni + 100000,
            rekeningTujuan: "BANK:1234567890",
          }),
        }),
      );

      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.error?.code).toBe("SALDO_TIDAK_CUKUP");
    });

    it("Pencairan melebihi saldo tersedia (karena ada pencairan lain yang sedang DIPROSES) → ditolak 422 SALDO_TIDAK_CUKUP", async () => {
      await loginSebagai(idPenggunaTK);

      const dompetAwal = await (await dompetRoute.GET()).json();
      const saldoTersediaAwal = dompetAwal.saldoTersedia;

      // Ajukan pencairan pertama Rp 50.000 (status DIPROSES)
      const resPencairan1 = await pencairanRoute.POST(
        new Request("http://localhost/api/pencairan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nominal: 50000,
            rekeningTujuan: "BANK:1234567890",
          }),
        }),
      );
      expect(resPencairan1.status).toBe(201);

      // Saldo tersedia sekarang berkurang Rp 50.000
      const dompetSetelah1 = await (await dompetRoute.GET()).json();
      expect(dompetSetelah1.saldoTersedia).toBe(saldoTersediaAwal - 50000);

      // Coba ajukan pencairan kedua dengan nominal > saldoTersedia saat ini
      // (misal saldoTersedia + 10.000)
      const resPencairan2 = await pencairanRoute.POST(
        new Request("http://localhost/api/pencairan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nominal: dompetSetelah1.saldoTersedia + 10000,
            rekeningTujuan: "BANK:1234567890",
          }),
        }),
      );

      expect(resPencairan2.status).toBe(422);
      const body2 = await resPencairan2.json();
      expect(body2.error?.code).toBe("SALDO_TIDAK_CUKUP");
    });
  });

  // =========================================================================
  // 5. Tagihan kedaluwarsa tidak bisa dibayar
  // =========================================================================
  describe("Tagihan Kedaluwarsa", () => {
    it("Tagihan yang expiry < now tidak bisa dibayar, ditolak 409 STATUS_TIDAK_VALID, dan statusnya otomatis menjadi KEDALUWARSA", async () => {
      await loginSebagai(idPenggunaPK);

      const { idTransaksi, nominalUpah } = buatTransaksiFixture(250000, "MENUNGGU_PEMBAYARAN");

      const idTagihanExpired = randomUUID();
      db.prepare(
        `INSERT INTO tagihan_pembayaran (
           id_tagihan, id_transaksi, nominal_upah, commission_fee,
           total_bayar, expiry_timestamp, status_pembayaran
         ) VALUES (?, ?, ?, 5000, ?, datetime('now', '-2 hours'), 'MENUNGGU_PEMBAYARAN')`,
      ).run(idTagihanExpired, idTransaksi, nominalUpah, nominalUpah + 5000);

      // Upaya pembayaran oleh PK
      const resBayar = await bayarRoute.POST(
        new Request(`http://localhost/api/tagihan/${idTagihanExpired}/bayar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metode: "QRIS" }),
        }),
        { params: Promise.resolve({ id: idTagihanExpired }) },
      );

      // Ditolak dengan 409 STATUS_TIDAK_VALID
      expect(resBayar.status).toBe(409);
      const body = await resBayar.json();
      expect(body.error?.code).toBe("STATUS_TIDAK_VALID");
      expect(body.error?.message).toContain("kedaluwarsa");

      // Status tagihan di DB otomatis terupdate menjadi KEDALUWARSA (lazy evaluation)
      const tagihanDb = db
        .prepare(`SELECT status_pembayaran FROM tagihan_pembayaran WHERE id_tagihan = ?`)
        .get(idTagihanExpired) as { status_pembayaran: string };
      expect(tagihanDb.status_pembayaran).toBe("KEDALUWARSA");

      // Status pekerjaan transaksi tetap MENUNGGU_PEMBAYARAN
      const trxDb = db
        .prepare(`SELECT status_pekerjaan FROM transaksi_pekerjaan WHERE id_transaksi = ?`)
        .get(idTransaksi) as { status_pekerjaan: string };
      expect(trxDb.status_pekerjaan).toBe("MENUNGGU_PEMBAYARAN");
    });
  });
});
