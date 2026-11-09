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
let webhookRoute: typeof import("@/app/api/webhooks/payment/route");
let mockTriggerRoute: typeof import("@/app/api/mock-gateway/trigger/route");
let sessionModule: typeof import("@/lib/auth/session");
let paymentMock: typeof import("@/lib/payment/mock");

const one = <T>(sql: string, ...params: unknown[]) =>
  db.prepare(sql).get(...params) as T;

describe("Integrasi Pembayaran, Mock Gateway & Webhook HMAC (Issue #25 / UC07 / I-34)", () => {
  let idPkLain: string;
  let idPenggunaPkLain: string;
  const SECRET_KEY = "kunci-rahasia-test-123";

  beforeAll(async () => {
    dir = mkdtempSync(path.join(tmpdir(), "kerjain-pembayaran-webhook-"));
    process.env.DATABASE_PATH = path.join(dir, "test.db");
    process.env.PAYMENT_PROVIDER = "mock";
    process.env.PAYMENT_WEBHOOK_SECRET = SECRET_KEY;
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
    webhookRoute = await import("@/app/api/webhooks/payment/route");
    mockTriggerRoute = await import("@/app/api/mock-gateway/trigger/route");

    // Siapkan PK lain
    idPenggunaPkLain = randomUUID();
    idPkLain = randomUUID();
    db.prepare(
      `INSERT INTO pengguna (id_pengguna, nama, email, password_hash, peran, tanggal_lahir, persetujuan_privasi_at)
       VALUES (?, 'PK Lain', 'pk-lain-webhook@test.com', 'hash', 'PK', '1990-01-01', datetime('now'))`,
    ).run(idPenggunaPkLain);
    db.prepare(
      "INSERT INTO penyedia_kerja (id_penyedia_kerja, id_pengguna) VALUES (?, ?)",
    ).run(idPkLain, idPenggunaPkLain);
  });

  afterAll(() => {
    jar.clear();
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("POST /api/tagihan/:id/bayar: berhasil memproses bayar, mengubah status ke DIPROSES dan mengembalikan redirectUrl", async () => {
    // Siapkan transaksi MENUNGGU_PEMBAYARAN dan tagihan barunya
    const trx = one<{ id_transaksi: string; id_pengguna: string; nominal_upah: number }>(
      `SELECT t.id_transaksi, pk.id_pengguna, t.nominal_upah
       FROM transaksi_pekerjaan t
       JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = t.id_penyedia_kerja
       WHERE t.status_pekerjaan = 'MENUNGGU_PEMBAYARAN'
       LIMIT 1`,
    );

    // Buat tagihan
    const idTagihan = randomUUID();
    const upah = trx.nominal_upah;
    const fee = Math.round(0.05 * upah);
    const total = upah + fee;

    db.prepare("DELETE FROM tagihan_pembayaran WHERE id_transaksi = ?").run(trx.id_transaksi);
    db.prepare(
      `INSERT INTO tagihan_pembayaran (
         id_tagihan, id_transaksi, nominal_upah, commission_fee,
         total_bayar, expiry_timestamp, status_pembayaran
       ) VALUES (?, ?, ?, ?, ?, datetime('now', '+24 hours'), 'MENUNGGU_PEMBAYARAN')`,
    ).run(idTagihan, trx.id_transaksi, upah, fee, total);

    await sessionModule.buatSesi(trx.id_pengguna);

    const res = await bayarRoute.POST(
      new Request(`http://localhost/api/tagihan/${idTagihan}/bayar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metode: "VA_BCA" }),
      }),
      { params: Promise.resolve({ id: idTagihan }) },
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("DIPROSES");
    expect(data.redirectUrl).toBe(`/mock-gateway/${idTagihan}`);

    // Pastikan di database tagihan berstatus DIPROSES dan metode tersimpan
    const row = one<{ status_pembayaran: string; metode: string }>(
      "SELECT status_pembayaran, metode FROM tagihan_pembayaran WHERE id_tagihan = ?",
      idTagihan,
    );
    expect(row.status_pembayaran).toBe("DIPROSES");
    expect(row.metode).toBe("VA_BCA");
  });

  it("POST /api/tagihan/:id/bayar: PK lain ditolak 403 FORBIDDEN", async () => {
    const tagihan = one<{ id_tagihan: string }>(
      "SELECT id_tagihan FROM tagihan_pembayaran WHERE status_pembayaran = 'DIPROSES' LIMIT 1",
    );

    await sessionModule.buatSesi(idPenggunaPkLain);

    const res = await bayarRoute.POST(
      new Request(`http://localhost/api/tagihan/${tagihan.id_tagihan}/bayar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metode: "QRIS" }),
      }),
      { params: Promise.resolve({ id: tagihan.id_tagihan }) },
    );

    expect(res.status).toBe(403);
  });

  it("POST /api/webhooks/payment: signature salah ditolak 401 dan data di DB TIDAK BERUBAH", async () => {
    const tagihan = one<{ id_tagihan: string; id_transaksi: string; total_bayar: number }>(
      `SELECT id_tagihan, id_transaksi, total_bayar
       FROM tagihan_pembayaran
       WHERE status_pembayaran = 'DIPROSES'
       LIMIT 1`,
    );

    const payload = {
      idTagihan: tagihan.id_tagihan,
      nominal: tagihan.total_bayar,
      status: "BERHASIL",
    };
    const rawBody = JSON.stringify(payload);
    const signatureSalah = "signature-palsu-dan-salah-1234567890abcdef";

    const res = await webhookRoute.POST(
      new Request("http://localhost/api/webhooks/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-callback-signature": signatureSalah,
        },
        body: rawBody,
      }),
    );

    expect(res.status).toBe(401);

    // Kriteria penerimaan: data di DB SAMA SEKALI TIDAK BERUBAH
    const tagihanDb = one<{ status_pembayaran: string }>(
      "SELECT status_pembayaran FROM tagihan_pembayaran WHERE id_tagihan = ?",
      tagihan.id_tagihan,
    );
    expect(tagihanDb.status_pembayaran).toBe("DIPROSES");

    const trxDb = one<{ status_pekerjaan: string }>(
      "SELECT status_pekerjaan FROM transaksi_pekerjaan WHERE id_transaksi = ?",
      tagihan.id_transaksi,
    );
    expect(trxDb.status_pekerjaan).toBe("MENUNGGU_PEMBAYARAN");
  });

  it("POST /api/webhooks/payment: webhook terverifikasi mengubah tagihan BERHASIL dan pekerjaan IN_PROGRESS", async () => {
    const tagihan = one<{
      id_tagihan: string;
      id_transaksi: string;
      total_bayar: number;
      id_pengguna_tk: string;
    }>(
      `SELECT tp.id_tagihan, tp.id_transaksi, tp.total_bayar, tk.id_pengguna AS id_pengguna_tk
       FROM tagihan_pembayaran tp
       JOIN transaksi_pekerjaan t ON t.id_transaksi = tp.id_transaksi
       JOIN tenaga_kerja tk ON tk.id_tenaga_kerja = t.id_tenaga_kerja
       WHERE tp.status_pembayaran = 'DIPROSES'
       LIMIT 1`,
    );

    const payload = {
      idTagihan: tagihan.id_tagihan,
      nominal: tagihan.total_bayar,
      status: "BERHASIL",
      idempotencyKey: tagihan.id_tagihan,
    };

    const { rawBody, signature } = paymentMock.tandaTanganiWebhook(payload, SECRET_KEY);

    const res = await webhookRoute.POST(
      new Request("http://localhost/api/webhooks/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-callback-signature": signature,
        },
        body: rawBody,
      }),
    );

    expect(res.status).toBe(200);

    // Verifikasi tagihan BERHASIL
    const tagihanDb = one<{ status_pembayaran: string }>(
      "SELECT status_pembayaran FROM tagihan_pembayaran WHERE id_tagihan = ?",
      tagihan.id_tagihan,
    );
    expect(tagihanDb.status_pembayaran).toBe("BERHASIL");

    // Verifikasi status pekerjaan HANYA berubah lewat webhook terverifikasi -> IN_PROGRESS
    const trxDb = one<{ status_pekerjaan: string }>(
      "SELECT status_pekerjaan FROM transaksi_pekerjaan WHERE id_transaksi = ?",
      tagihan.id_transaksi,
    );
    expect(trxDb.status_pekerjaan).toBe("IN_PROGRESS");

    // Verifikasi notifikasi ke TK: "pekerjaan siap dimulai"
    const notif = one<{ pesan_notifikasi: string }>(
      `SELECT pesan_notifikasi
       FROM notifikasi
       WHERE id_penerima = ?
       ORDER BY waktu_kirim DESC LIMIT 1`,
      tagihan.id_pengguna_tk,
    );
    expect(notif).toBeDefined();
    expect(notif.pesan_notifikasi).toContain("pekerjaan siap dimulai");
  });

  it("POST /api/webhooks/payment: callback duplikat menghasilkan no-op 200", async () => {
    const tagihan = one<{ id_tagihan: string; total_bayar: number }>(
      "SELECT id_tagihan, total_bayar FROM tagihan_pembayaran WHERE status_pembayaran = 'BERHASIL' LIMIT 1",
    );

    const payload = {
      idTagihan: tagihan.id_tagihan,
      nominal: tagihan.total_bayar,
      status: "BERHASIL",
    };
    const { rawBody, signature } = paymentMock.tandaTanganiWebhook(payload, SECRET_KEY);

    const res = await webhookRoute.POST(
      new Request("http://localhost/api/webhooks/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-callback-signature": signature,
        },
        body: rawBody,
      }),
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.duplicate).toBe(true);
  });

  it("POST /api/webhooks/payment: callback bertentangan dengan status final dicatat saja dan tidak merusak data", async () => {
    const tagihan = one<{ id_tagihan: string; id_transaksi: string; total_bayar: number }>(
      "SELECT id_tagihan, id_transaksi, total_bayar FROM tagihan_pembayaran WHERE status_pembayaran = 'BERHASIL' LIMIT 1",
    );

    // Kirim callback status GAGAL untuk tagihan yang sudah BERHASIL
    const payload = {
      idTagihan: tagihan.id_tagihan,
      nominal: tagihan.total_bayar,
      status: "GAGAL",
    };
    const { rawBody, signature } = paymentMock.tandaTanganiWebhook(payload, SECRET_KEY);

    const res = await webhookRoute.POST(
      new Request("http://localhost/api/webhooks/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-callback-signature": signature,
        },
        body: rawBody,
      }),
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ignored).toBe(true);

    // Status di database harus tetap BERHASIL dan IN_PROGRESS
    const tagihanDb = one<{ status_pembayaran: string }>(
      "SELECT status_pembayaran FROM tagihan_pembayaran WHERE id_tagihan = ?",
      tagihan.id_tagihan,
    );
    expect(tagihanDb.status_pembayaran).toBe("BERHASIL");

    const trxDb = one<{ status_pekerjaan: string }>(
      "SELECT status_pekerjaan FROM transaksi_pekerjaan WHERE id_transaksi = ?",
      tagihan.id_transaksi,
    );
    expect(trxDb.status_pekerjaan).toBe("IN_PROGRESS");
  });

  it("POST /api/webhooks/payment: nominal tidak sesuai ditolak 400", async () => {
    const tagihan = one<{ id_tagihan: string; total_bayar: number }>(
      "SELECT id_tagihan, total_bayar FROM tagihan_pembayaran LIMIT 1",
    );

    const payload = {
      idTagihan: tagihan.id_tagihan,
      nominal: tagihan.total_bayar + 50000, // Nominal sengaja disalahkan
      status: "BERHASIL",
    };
    const { rawBody, signature } = paymentMock.tandaTanganiWebhook(payload, SECRET_KEY);

    const res = await webhookRoute.POST(
      new Request("http://localhost/api/webhooks/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-callback-signature": signature,
        },
        body: rawBody,
      }),
    );

    expect(res.status).toBe(400);
  });

  it("POST /api/mock-gateway/trigger: simulator berhasil menandatangani webhook dan mengembalikan redirectUrl", async () => {
    // Siapkan tagihan MENUNGGU_PEMBAYARAN baru untuk simulasi gagal
    const trx = one<{ id_transaksi: string; nominal_upah: number }>(
      `SELECT t.id_transaksi, t.nominal_upah
       FROM transaksi_pekerjaan t
       LIMIT 1`,
    );

    const idTagihanBaru = randomUUID();
    db.prepare("DELETE FROM tagihan_pembayaran WHERE id_transaksi = ?").run(trx.id_transaksi);
    db.prepare(
      `INSERT INTO tagihan_pembayaran (
         id_tagihan, id_transaksi, nominal_upah, commission_fee,
         total_bayar, expiry_timestamp, status_pembayaran
       ) VALUES (?, ?, ?, 5000, ?, datetime('now', '+24 hours'), 'DIPROSES')`,
    ).run(idTagihanBaru, trx.id_transaksi, trx.nominal_upah, trx.nominal_upah + 5000);

    const res = await mockTriggerRoute.POST(
      new Request("http://localhost/api/mock-gateway/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idTagihan: idTagihanBaru, status: "GAGAL" }),
      }),
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe("GAGAL");

    // Status tagihan di database terupdate menjadi GAGAL
    const row = one<{ status_pembayaran: string }>(
      "SELECT status_pembayaran FROM tagihan_pembayaran WHERE id_tagihan = ?",
      idTagihanBaru,
    );
    expect(row.status_pembayaran).toBe("GAGAL");
  });
});
