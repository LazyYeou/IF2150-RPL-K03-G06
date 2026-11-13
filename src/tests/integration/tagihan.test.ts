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
let controller: typeof import("@/controllers/TagihanPembayaranController");
let sessionModule: typeof import("@/lib/auth/session");

const one = <T>(sql: string, ...params: unknown[]) =>
  db.prepare(sql).get(...params) as T;

describe("Integrasi Tagihan Pembayaran & Invoice (Issue #16 / UC07 / I-33)", () => {
  let idPkLain: string;
  let idPenggunaPkLain: string;

  beforeAll(async () => {
    dir = mkdtempSync(path.join(tmpdir(), "kerjain-tagihan-"));
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
    controller = await import("@/controllers/TagihanPembayaranController");

    idPenggunaPkLain = randomUUID();
    idPkLain = randomUUID();
    db.prepare(
      `INSERT INTO pengguna (id_pengguna, nama, email, password_hash, peran, tanggal_lahir, persetujuan_privasi_at)
       VALUES (?, 'PK Lain', 'pk-lain-tagihan@test.com', 'hash', 'PK', '1990-01-01', datetime('now'))`,
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

  it("POST /api/transaksi/:id/tagihan: berhasil membuat tagihan baru (201) dengan rumus komisi yang benar", async () => {
    const trx = one<{
      id_transaksi: string;
      nominal_upah: number;
      id_pengguna: string;
    }>(
      `SELECT t.id_transaksi, t.nominal_upah, pk.id_pengguna
       FROM transaksi_pekerjaan t
       JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = t.id_penyedia_kerja
       WHERE t.status_pekerjaan = 'MENUNGGU_PEMBAYARAN'
       LIMIT 1`,
    );

    expect(trx).toBeDefined();

    db.prepare("DELETE FROM tagihan_pembayaran WHERE id_transaksi = ?").run(
      trx.id_transaksi,
    );

    await sessionModule.buatSesi(trx.id_pengguna);

    const res = await buatTagihanRoute.POST(
      new Request(`http://localhost/api/transaksi/${trx.id_transaksi}/tagihan`, {
        method: "POST",
      }),
      { params: Promise.resolve({ id: trx.id_transaksi }) },
    );

    expect(res.status).toBe(201);
    const body = await res.json();

    const expectedFee = Math.round(0.05 * trx.nominal_upah);
    const expectedTotal = trx.nominal_upah + expectedFee;

    expect(body.idTransaksi).toBe(trx.id_transaksi);
    expect(body.nominalUpah).toBe(trx.nominal_upah);
    expect(body.commissionFee).toBe(expectedFee);
    expect(body.totalBayar).toBe(expectedTotal);
    expect(body.totalBayar).toBe(body.nominalUpah + body.commissionFee);
    expect(body.status).toBe("MENUNGGU_PEMBAYARAN");
    expect(body.expiry).toBeDefined();
  });

  it("POST /api/transaksi/:id/tagihan: jika tagihan aktif sudah ada, kembalikan tagihan yang sama (idempotent, 200)", async () => {
    const trx = one<{
      id_transaksi: string;
      id_pengguna: string;
    }>(
      `SELECT t.id_transaksi, pk.id_pengguna
       FROM transaksi_pekerjaan t
       JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = t.id_penyedia_kerja
       WHERE t.status_pekerjaan = 'MENUNGGU_PEMBAYARAN'
       LIMIT 1`,
    );

    await sessionModule.buatSesi(trx.id_pengguna);

    const res = await buatTagihanRoute.POST(
      new Request(`http://localhost/api/transaksi/${trx.id_transaksi}/tagihan`, {
        method: "POST",
      }),
      { params: Promise.resolve({ id: trx.id_transaksi }) },
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.idTransaksi).toBe(trx.id_transaksi);
  });

  it("POST /api/transaksi/:id/tagihan: PK lain ditolak 403 FORBIDDEN", async () => {
    const trx = one<{ id_transaksi: string }>(
      `SELECT t.id_transaksi
       FROM transaksi_pekerjaan t
       WHERE t.status_pekerjaan = 'MENUNGGU_PEMBAYARAN'
       LIMIT 1`,
    );

    await sessionModule.buatSesi(idPenggunaPkLain);

    const res = await buatTagihanRoute.POST(
      new Request(`http://localhost/api/transaksi/${trx.id_transaksi}/tagihan`, {
        method: "POST",
      }),
      { params: Promise.resolve({ id: trx.id_transaksi }) },
    );

    expect(res.status).toBe(403);
  });

  it("POST /api/transaksi/:id/tagihan: ditolak jika status transaksi bukan MENUNGGU_PEMBAYARAN (409)", async () => {
    const trx = one<{ id_transaksi: string; id_pengguna: string }>(
      `SELECT t.id_transaksi, pk.id_pengguna
       FROM transaksi_pekerjaan t
       JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = t.id_penyedia_kerja
       WHERE t.status_pekerjaan = 'MENUNGGU_PEMBAYARAN'
       LIMIT 1`,
    );

    db.prepare(
      "UPDATE transaksi_pekerjaan SET status_pekerjaan = 'IN_PROGRESS' WHERE id_transaksi = ?",
    ).run(trx.id_transaksi);

    await sessionModule.buatSesi(trx.id_pengguna);

    const res = await buatTagihanRoute.POST(
      new Request(`http://localhost/api/transaksi/${trx.id_transaksi}/tagihan`, {
        method: "POST",
      }),
      { params: Promise.resolve({ id: trx.id_transaksi }) },
    );

    expect(res.status).toBe(409);

    db.prepare(
      "UPDATE transaksi_pekerjaan SET status_pekerjaan = 'MENUNGGU_PEMBAYARAN' WHERE id_transaksi = ?",
    ).run(trx.id_transaksi);
  });

  it("GET /api/tagihan/:id: pemilik dapat mengambil detail tagihan", async () => {
    const row = one<{
      id_tagihan: string;
      id_transaksi: string;
      id_pengguna: string;
    }>(
      `SELECT tp.id_tagihan, tp.id_transaksi, pk.id_pengguna
       FROM tagihan_pembayaran tp
       JOIN transaksi_pekerjaan t ON t.id_transaksi = tp.id_transaksi
       JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = t.id_penyedia_kerja
       LIMIT 1`,
    );

    await sessionModule.buatSesi(row.id_pengguna);

    const res = await detailTagihanRoute.GET(
      new Request(`http://localhost/api/tagihan/${row.id_tagihan}`),
      { params: Promise.resolve({ id: row.id_tagihan }) },
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(row.id_tagihan);
    expect(body.idTransaksi).toBe(row.id_transaksi);
  });

  it("GET /api/tagihan/:id: pengguna PK lain ditolak 403", async () => {
    const row = one<{ id_tagihan: string }>(
      "SELECT id_tagihan FROM tagihan_pembayaran LIMIT 1",
    );

    await sessionModule.buatSesi(idPenggunaPkLain);

    const res = await detailTagihanRoute.GET(
      new Request(`http://localhost/api/tagihan/${row.id_tagihan}`),
      { params: Promise.resolve({ id: row.id_tagihan }) },
    );

    expect(res.status).toBe(403);
  });

  it("GET /api/tagihan/:id: otomatis lazy-update ke KEDALUWARSA jika telah melewati expiry_timestamp", async () => {
    const row = one<{ id_tagihan: string; id_pengguna: string }>(
      `SELECT tp.id_tagihan, pk.id_pengguna
       FROM tagihan_pembayaran tp
       JOIN transaksi_pekerjaan t ON t.id_transaksi = tp.id_transaksi
       JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = t.id_penyedia_kerja
       WHERE tp.status_pembayaran = 'MENUNGGU_PEMBAYARAN'
       LIMIT 1`,
    );

    db.prepare(
      "UPDATE tagihan_pembayaran SET expiry_timestamp = datetime('now', '-2 hours') WHERE id_tagihan = ?",
    ).run(row.id_tagihan);

    await sessionModule.buatSesi(row.id_pengguna);

    const res = await detailTagihanRoute.GET(
      new Request(`http://localhost/api/tagihan/${row.id_tagihan}`),
      { params: Promise.resolve({ id: row.id_tagihan }) },
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("KEDALUWARSA");

    const dbRow = one<{ status_pembayaran: string }>(
      "SELECT status_pembayaran FROM tagihan_pembayaran WHERE id_tagihan = ?",
      row.id_tagihan,
    );
    expect(dbRow.status_pembayaran).toBe("KEDALUWARSA");
  });

  it("ambilDataHalamanBayar: mengambil data halaman pembayaran untuk pemilik transaksi", async () => {
    const trx = one<{
      id_transaksi: string;
      id_pengguna: string;
      nominal_upah: number;
    }>(
      `SELECT t.id_transaksi, pk.id_pengguna, t.nominal_upah
       FROM transaksi_pekerjaan t
       JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = t.id_penyedia_kerja
       WHERE t.status_pekerjaan = 'MENUNGGU_PEMBAYARAN'
       LIMIT 1`,
    );

    await sessionModule.buatSesi(trx.id_pengguna);

    const data = await controller.ambilDataHalamanBayar(trx.id_transaksi);
    expect(data.transaksi.id).toBe(trx.id_transaksi);
    expect(data.tagihan.nominalUpah).toBe(trx.nominal_upah);
    expect(data.tagihan.totalBayar).toBe(
      data.tagihan.nominalUpah + data.tagihan.commissionFee,
    );
  });
});
