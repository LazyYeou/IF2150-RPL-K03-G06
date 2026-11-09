import { randomUUID } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";

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

let dompetRoute: typeof import("@/app/api/dompet/route");
let dompetController: typeof import("@/controllers/DompetController");
let sessionModule: typeof import("@/lib/auth/session");

describe("Integrasi Halaman Dompet & Riwayat Mutasi (Issue #33 / UC10 / I-20)", () => {
  let idPenggunaTK1: string;
  let idTK1: string;
  let idPenggunaPK: string;

  beforeAll(async () => {
    dir = mkdtempSync(path.join(tmpdir(), "kerjain-dompet-"));
    process.env.DATABASE_PATH = path.join(dir, "test.db");

    const { bukaDb } = await import("@/db/open");
    const { migrate } = await import("@/scripts/migrate");
    const { seed } = await import("@/db/seed");

    const awal = bukaDb();
    migrate(awal);
    await seed(awal);
    awal.close();

    ({ db } = await import("@/lib/db"));
    sessionModule = await import("@/lib/auth/session");
    dompetRoute = await import("@/app/api/dompet/route");
    dompetController = await import("@/controllers/DompetController");

    const tkRow = db
      .prepare(
        `SELECT tk.id_tenaga_kerja, tk.id_pengguna
         FROM tenaga_kerja tk
         JOIN pengguna p ON tk.id_pengguna = p.id_pengguna
         WHERE p.email = 'tk1@kerjain.test'`,
      )
      .get() as { id_tenaga_kerja: string; id_pengguna: string };
    idPenggunaTK1 = tkRow.id_pengguna;
    idTK1 = tkRow.id_tenaga_kerja;

    const pkRow = db
      .prepare(
        `SELECT id_pengguna FROM pengguna WHERE email = 'pk1@kerjain.test'`,
      )
      .get() as { id_pengguna: string };
    idPenggunaPK = pkRow.id_pengguna;
  });

  async function loginSebagai(idPengguna: string) {
    jar.clear();
    await sessionModule.buatSesi(idPengguna);
  }

  function logout() {
    jar.clear();
  }

  it("GET /api/dompet tanpa autentikasi mengembalikan 401 UNAUTHENTICATED", async () => {
    logout();
    const res = await dompetRoute.GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error?.code).toBe("UNAUTHENTICATED");
  });

  it("GET /api/dompet dengan peran bukan TK (misal PK) mengembalikan 403 FORBIDDEN", async () => {
    await loginSebagai(idPenggunaPK);
    const res = await dompetRoute.GET();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error?.code).toBe("FORBIDDEN");
  });

  it("GET /api/dompet oleh TK mengembalikan data dompet lengkap & valid", async () => {
    await loginSebagai(idPenggunaTK1);
    const res = await dompetRoute.GET();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("saldo");
    expect(data).toHaveProperty("saldoTersedia");
    expect(data).toHaveProperty("mutasi");
    expect(data).toHaveProperty("pencairan");

    expect(typeof data.saldo).toBe("number");
    expect(typeof data.saldoTersedia).toBe("number");
    expect(Array.isArray(data.mutasi)).toBe(true);
    expect(Array.isArray(data.pencairan)).toBe(true);
  });

  it("Kriteria penerimaan: Angka saldo konsisten dengan ledger mutasi_saldo", async () => {
    await loginSebagai(idPenggunaTK1);

    const ledger = db
      .prepare(
        `SELECT COALESCE(SUM(nominal), 0) AS total FROM mutasi_saldo WHERE id_tenaga_kerja = ?`,
      )
      .get(idTK1) as { total: number };

    const res = await dompetRoute.GET();
    const data = await res.json();
    expect(data.saldo).toBe(ledger.total);

    const nominalBaru = 125000;
    const kunciBaru = `upah:${randomUUID()}`;
    db.prepare(
      `INSERT INTO mutasi_saldo (kunci_operasi, id_tenaga_kerja, nominal, created_at)
       VALUES (?, ?, ?, datetime('now'))`,
    ).run(kunciBaru, idTK1, nominalBaru);

    const resSetelah = await dompetRoute.GET();
    const dataSetelah = await resSetelah.json();
    expect(dataSetelah.saldo).toBe(ledger.total + nominalBaru);

    const mutasiDitemukan = dataSetelah.mutasi.find(
      (m: { kunciOperasi: string }) => m.kunciOperasi === kunciBaru,
    );
    expect(mutasiDitemukan).toBeDefined();
    expect(mutasiDitemukan.nominal).toBe(nominalBaru);
  });

  it("Perhitungan saldo tersedia memotong pencairan aktif (Q-104)", async () => {
    await loginSebagai(idPenggunaTK1);

    const resAwal = await dompetRoute.GET();
    const dataAwal = await resAwal.json();
    const saldoSekarang = dataAwal.saldo;

    const idPencairan1 = randomUUID();
    const nominalPencairan1 = 50000;
    db.prepare(
      `INSERT INTO pencairan_dana (id_pencairan, id_tenaga_kerja, nominal, rekening_tujuan, status_pencairan, waktu_pengajuan)
       VALUES (?, ?, ?, 'BCA:1234567890', 'DIPROSES', datetime('now'))`,
    ).run(idPencairan1, idTK1, nominalPencairan1);

    const idPencairanGagal = randomUUID();
    db.prepare(
      `INSERT INTO pencairan_dana (id_pencairan, id_tenaga_kerja, nominal, rekening_tujuan, status_pencairan, waktu_pengajuan)
       VALUES (?, ?, ?, 'BCA:9876543210', 'GAGAL', datetime('now'))`,
    ).run(idPencairanGagal, idTK1, 30000);

    const resSetelahPencairan = await dompetRoute.GET();
    const dataSetelahPencairan = await resSetelahPencairan.json();

    expect(dataSetelahPencairan.saldo).toBe(saldoSekarang);
    expect(dataSetelahPencairan.saldoTersedia).toBe(
      saldoSekarang - nominalPencairan1,
    );

    const pencairanDitemukan = dataSetelahPencairan.pencairan.find(
      (p: { id: string }) => p.id === idPencairan1,
    );
    expect(pencairanDitemukan).toBeDefined();
    expect(pencairanDitemukan.rekeningMasked).toBe("****7890");
    expect(pencairanDitemukan.status).toBe("DIPROSES");
  });

  it("Controller helper ambilRingkasanSaldoTK mengembalikan angka yang konsisten untuk dashboard TK", async () => {
    const ringkasan = await dompetController.ambilRingkasanSaldoTK(idPenggunaTK1);
    expect(ringkasan).toHaveProperty("saldo");
    expect(ringkasan).toHaveProperty("saldoTersedia");
    expect(typeof ringkasan.saldo).toBe("number");
    expect(typeof ringkasan.saldoTersedia).toBe("number");
    expect(ringkasan.saldoTersedia).toBeLessThanOrEqual(ringkasan.saldo);
  });
});
