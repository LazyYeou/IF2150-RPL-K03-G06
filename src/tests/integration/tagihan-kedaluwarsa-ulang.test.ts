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

let buatTagihanRoute: typeof import("@/app/api/transaksi/[id]/tagihan/route");
let detailTagihanRoute: typeof import("@/app/api/tagihan/[id]/route");
let bayarRoute: typeof import("@/app/api/tagihan/[id]/bayar/route");
let sessionModule: typeof import("@/lib/auth/session");

const one = <T>(sql: string, ...params: unknown[]) =>
  db.prepare(sql).get(...params) as T;

describe("Integrasi Tagihan Kedaluwarsa & Bayar Ulang (Issue #32 / UC07 alt1/alt2)", () => {
  beforeAll(async () => {
    dir = mkdtempSync(path.join(tmpdir(), "kerjain-kedaluwarsa-ulang-"));
    process.env.DATABASE_PATH = path.join(dir, "test.db");
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
    buatTagihanRoute = await import("@/app/api/transaksi/[id]/tagihan/route");
    detailTagihanRoute = await import("@/app/api/tagihan/[id]/route");
    bayarRoute = await import("@/app/api/tagihan/[id]/bayar/route");
  });

  afterAll(() => {
    jar.clear();
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("Cek kedaluwarsa lazy saat dibaca: status MENUNGGU_PEMBAYARAN yang expiry < now otomatis menjadi KEDALUWARSA", async () => {
    const trx = one<{ id_transaksi: string; id_pengguna: string; nominal_upah: number }>(
      `SELECT t.id_transaksi, pk.id_pengguna, t.nominal_upah
       FROM transaksi_pekerjaan t
       JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = t.id_penyedia_kerja
       WHERE t.status_pekerjaan = 'MENUNGGU_PEMBAYARAN'
       LIMIT 1`,
    );

    const idTagihan = randomUUID();
    db.prepare("DELETE FROM tagihan_pembayaran WHERE id_transaksi = ?").run(trx.id_transaksi);
    db.prepare(
      `INSERT INTO tagihan_pembayaran (
         id_tagihan, id_transaksi, nominal_upah, commission_fee,
         total_bayar, expiry_timestamp, status_pembayaran
       ) VALUES (?, ?, ?, 5000, ?, datetime('now', '-1 hours'), 'MENUNGGU_PEMBAYARAN')`,
    ).run(idTagihan, trx.id_transaksi, trx.nominal_upah, trx.nominal_upah + 5000);

    await sessionModule.buatSesi(trx.id_pengguna);

    const res = await detailTagihanRoute.GET(
      new Request(`http://localhost/api/tagihan/${idTagihan}`),
      { params: Promise.resolve({ id: idTagihan }) },
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("KEDALUWARSA");

    const row = one<{ status_pembayaran: string }>(
      "SELECT status_pembayaran FROM tagihan_pembayaran WHERE id_tagihan = ?",
      idTagihan,
    );
    expect(row.status_pembayaran).toBe("KEDALUWARSA");
  });

  it("Cek kedaluwarsa lazy saat dibayar: tagihan yang expiry < now ditolak 409 dan statusnya menjadi KEDALUWARSA", async () => {
    const trx = one<{ id_transaksi: string; id_pengguna: string; nominal_upah: number }>(
      `SELECT t.id_transaksi, pk.id_pengguna, t.nominal_upah
       FROM transaksi_pekerjaan t
       JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = t.id_penyedia_kerja
       WHERE t.status_pekerjaan = 'MENUNGGU_PEMBAYARAN'
       LIMIT 1`,
    );

    const idTagihan = randomUUID();
    db.prepare("DELETE FROM tagihan_pembayaran WHERE id_transaksi = ?").run(trx.id_transaksi);
    db.prepare(
      `INSERT INTO tagihan_pembayaran (
         id_tagihan, id_transaksi, nominal_upah, commission_fee,
         total_bayar, expiry_timestamp, status_pembayaran
       ) VALUES (?, ?, ?, 5000, ?, datetime('now', '-30 minutes'), 'MENUNGGU_PEMBAYARAN')`,
    ).run(idTagihan, trx.id_transaksi, trx.nominal_upah, trx.nominal_upah + 5000);

    await sessionModule.buatSesi(trx.id_pengguna);

    const res = await bayarRoute.POST(
      new Request(`http://localhost/api/tagihan/${idTagihan}/bayar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metode: "VA_BCA" }),
      }),
      { params: Promise.resolve({ id: idTagihan }) },
    );

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error.message).toContain("kedaluwarsa");

    const row = one<{ status_pembayaran: string }>(
      "SELECT status_pembayaran FROM tagihan_pembayaran WHERE id_tagihan = ?",
      idTagihan,
    );
    expect(row.status_pembayaran).toBe("KEDALUWARSA");
  });

  it("Setelah KEDALUWARSA: PK bisa membuat tagihan baru (201 Created) dan tidak ada dua tagihan aktif", async () => {
    const trx = one<{ id_transaksi: string; id_pengguna: string; nominal_upah: number }>(
      `SELECT t.id_transaksi, pk.id_pengguna, t.nominal_upah
       FROM transaksi_pekerjaan t
       JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = t.id_penyedia_kerja
       WHERE t.status_pekerjaan = 'MENUNGGU_PEMBAYARAN'
       LIMIT 1`,
    );

    const idTagihanLama = randomUUID();
    db.prepare("DELETE FROM tagihan_pembayaran WHERE id_transaksi = ?").run(trx.id_transaksi);
    db.prepare(
      `INSERT INTO tagihan_pembayaran (
         id_tagihan, id_transaksi, nominal_upah, commission_fee,
         total_bayar, expiry_timestamp, status_pembayaran
       ) VALUES (?, ?, ?, 5000, ?, datetime('now', '-2 hours'), 'KEDALUWARSA')`,
    ).run(idTagihanLama, trx.id_transaksi, trx.nominal_upah, trx.nominal_upah + 5000);

    await sessionModule.buatSesi(trx.id_pengguna);

    const res = await buatTagihanRoute.POST(
      new Request(`http://localhost/api/transaksi/${trx.id_transaksi}/tagihan`, {
        method: "POST",
      }),
      { params: Promise.resolve({ id: trx.id_transaksi }) },
    );

    expect(res.status).toBe(201);
    const tagihanBaru = await res.json();

    expect(tagihanBaru.id).not.toBe(idTagihanLama);
    expect(tagihanBaru.status).toBe("MENUNGGU_PEMBAYARAN");

    const tagihanAktif = db
      .prepare(
        `SELECT id_tagihan, status_pembayaran
         FROM tagihan_pembayaran
         WHERE id_transaksi = ?
           AND status_pembayaran IN ('MENUNGGU_PEMBAYARAN', 'DIPROSES', 'BERHASIL')`,
      )
      .all(trx.id_transaksi) as Array<{ id_tagihan: string; status_pembayaran: string }>;

    expect(tagihanAktif.length).toBe(1);
    expect(tagihanAktif[0].id_tagihan).toBe(tagihanBaru.id);

    const rowLama = one<{ status_pembayaran: string }>(
      "SELECT status_pembayaran FROM tagihan_pembayaran WHERE id_tagihan = ?",
      idTagihanLama,
    );
    expect(rowLama.status_pembayaran).toBe("KEDALUWARSA");
  });

  it("Setelah GAGAL: PK bisa membuat tagihan baru (201 Created) dan tidak ada dua tagihan aktif", async () => {
    const trx = one<{ id_transaksi: string; id_pengguna: string; nominal_upah: number }>(
      `SELECT t.id_transaksi, pk.id_pengguna, t.nominal_upah
       FROM transaksi_pekerjaan t
       JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = t.id_penyedia_kerja
       WHERE t.status_pekerjaan = 'MENUNGGU_PEMBAYARAN'
       LIMIT 1`,
    );

    const idTagihanGagal = randomUUID();
    db.prepare("DELETE FROM tagihan_pembayaran WHERE id_transaksi = ?").run(trx.id_transaksi);
    db.prepare(
      `INSERT INTO tagihan_pembayaran (
         id_tagihan, id_transaksi, nominal_upah, commission_fee,
         total_bayar, expiry_timestamp, status_pembayaran
       ) VALUES (?, ?, ?, 5000, ?, datetime('now', '+12 hours'), 'GAGAL')`,
    ).run(idTagihanGagal, trx.id_transaksi, trx.nominal_upah, trx.nominal_upah + 5000);

    await sessionModule.buatSesi(trx.id_pengguna);

    const res = await buatTagihanRoute.POST(
      new Request(`http://localhost/api/transaksi/${trx.id_transaksi}/tagihan`, {
        method: "POST",
      }),
      { params: Promise.resolve({ id: trx.id_transaksi }) },
    );

    expect(res.status).toBe(201);
    const tagihanBaru = await res.json();

    expect(tagihanBaru.id).not.toBe(idTagihanGagal);
    expect(tagihanBaru.status).toBe("MENUNGGU_PEMBAYARAN");

    const tagihanAktif = db
      .prepare(
        `SELECT id_tagihan, status_pembayaran
         FROM tagihan_pembayaran
         WHERE id_transaksi = ?
           AND status_pembayaran IN ('MENUNGGU_PEMBAYARAN', 'DIPROSES', 'BERHASIL')`,
      )
      .all(trx.id_transaksi) as Array<{ id_tagihan: string; status_pembayaran: string }>;

    expect(tagihanAktif.length).toBe(1);
    expect(tagihanAktif[0].id_tagihan).toBe(tagihanBaru.id);

    // Tagihan lama tetap tercatat GAGAL
    const rowGagal = one<{ status_pembayaran: string }>(
      "SELECT status_pembayaran FROM tagihan_pembayaran WHERE id_tagihan = ?",
      idTagihanGagal,
    );
    expect(rowGagal.status_pembayaran).toBe("GAGAL");
  });

  it("Pembayaran langsung ditolak 409 jika tagihan berstatus GAGAL", async () => {
    const trx = one<{ id_transaksi: string; id_pengguna: string; nominal_upah: number }>(
      `SELECT t.id_transaksi, pk.id_pengguna, t.nominal_upah
       FROM transaksi_pekerjaan t
       JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = t.id_penyedia_kerja
       WHERE t.status_pekerjaan = 'MENUNGGU_PEMBAYARAN'
       LIMIT 1`,
    );

    const idTagihanGagal = randomUUID();
    db.prepare("DELETE FROM tagihan_pembayaran WHERE id_transaksi = ?").run(trx.id_transaksi);
    db.prepare(
      `INSERT INTO tagihan_pembayaran (
         id_tagihan, id_transaksi, nominal_upah, commission_fee,
         total_bayar, expiry_timestamp, status_pembayaran
       ) VALUES (?, ?, ?, 5000, ?, datetime('now', '+12 hours'), 'GAGAL')`,
    ).run(idTagihanGagal, trx.id_transaksi, trx.nominal_upah, trx.nominal_upah + 5000);

    await sessionModule.buatSesi(trx.id_pengguna);

    const res = await bayarRoute.POST(
      new Request(`http://localhost/api/tagihan/${idTagihanGagal}/bayar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metode: "QRIS" }),
      }),
      { params: Promise.resolve({ id: idTagihanGagal }) },
    );

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error.message).toContain("gagal");
  });
});
