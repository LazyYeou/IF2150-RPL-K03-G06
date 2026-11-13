import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

// Cookie palsu: tiruan `cookies()` dari next/headers
const jar = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (n: string) =>
      jar.has(n) ? { name: n, value: jar.get(n) } : undefined,
    set: (n: string, v: string) => void jar.set(n, v),
    delete: (n: string) => void jar.delete(n),
  }),
}));

const PNG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3,
]);

type Db = typeof import("@/lib/db").db;
let dir: string;
let db: Db;
let masuk: (email: string) => Promise<void>;
let ids: { bukti: string; sengketa: string; umum: string; hilang: string };
let GETbukti: typeof import("@/app/api/berkas/bukti/[id]/route").GET;
let GETsengketa: typeof import("@/app/api/berkas/sengketa/[id]/route").GET;

const ambil = (GET: typeof GETbukti, id: string) =>
  GET(new Request("http://localhost/x"), { params: Promise.resolve({ id }) });
const one = <T>(sql: string, ...p: unknown[]) => db.prepare(sql).get(...p) as T;

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "kerjain-berkas-"));
  process.env.DATABASE_PATH = path.join(dir, "test.db");
  process.env.STORAGE_DIR = path.join(dir, "storage");
  process.env.FILE_ENCRYPTION_KEY = "ab".repeat(32);
  const { bukaDb } = await import("@/db/open");
  const { migrate } = await import("@/scripts/migrate");
  const { seed } = await import("@/db/seed");
  const awal = bukaDb();
  migrate(awal);
  await seed(awal);
  awal.close();

  ({ db } = await import("@/lib/db"));
  const { buatSesi } = await import("@/lib/auth/session");
  const { simpanBerkas } = await import("@/lib/storage");
  ({ GET: GETbukti } = await import("@/app/api/berkas/bukti/[id]/route"));
  ({ GET: GETsengketa } = await import("@/app/api/berkas/sengketa/[id]/route"));
  masuk = (email) =>
    buatSesi(
      one<{ id: string }>(
        "SELECT id_pengguna id FROM pengguna WHERE email = ?",
        email,
      ).id,
    );

  const berkas = () => new File([PNG], "x.png", { type: "image/png" });
  // bukti penyerahan transaksi SUBMITTED (tk1 + pk1) dengan berkas sungguhan
  const bukti = one<{ id: string }>(
    `SELECT id_penyerahan id FROM bukti_penyerahan b JOIN transaksi_pekerjaan t USING (id_transaksi)
     WHERE t.status_pekerjaan = 'SUBMITTED'`,
  ).id;
  db.prepare(
    "UPDATE bukti_penyerahan SET file_path = ? WHERE id_penyerahan = ?",
  ).run((await simpanBerkas("bukti", berkas())).path, bukti);
  // bukti sengketa: satu pada tiket transaksi, satu pada tiket bantuan umum
  const pk = one<{ id: string }>(
    "SELECT id_pengguna id FROM pengguna WHERE email = 'pk1@kerjain.test'",
  ).id;
  const tiket = one<{ id: string }>(
    "SELECT id_tiket id FROM tiket_sengketa",
  ).id;
  const umum = randomUUID();
  db.prepare(
    `INSERT INTO tiket_sengketa (id_tiket, nomor_tiket, id_pelapor, kategori_masalah, deskripsi_komplain)
     VALUES (?, 'KIN-000002', ?, 'Lainnya', 'Pertanyaan umum tentang cara kerja pembayaran.')`,
  ).run(umum, pk);
  const buktiSengketa = async (idTiket: string) => {
    const id = randomUUID();
    db.prepare(
      "INSERT INTO bukti_sengketa (id_bukti, id_tiket, id_pengunggah, file_path) VALUES (?, ?, ?, ?)",
    ).run(id, idTiket, pk, (await simpanBerkas("sengketa", berkas())).path);
    return id;
  };
  ids = {
    bukti,
    sengketa: await buktiSengketa(tiket),
    umum: await buktiSengketa(umum),
    hilang: one<{ id: string }>(
      `SELECT id_penyerahan id FROM bukti_penyerahan b JOIN transaksi_pekerjaan t USING (id_transaksi)
       WHERE t.status_pekerjaan = 'COMPLETED'`, // path seed tidak punya berkas fisik
    ).id,
  };
});
afterAll(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
beforeEach(() => jar.clear());

const kode = async (r: Response) => (await r.json()).error?.code;

describe("GET /api/berkas/bukti/:id", () => {
  it("peserta (TK dan PK) dan CS boleh mengunduh, tanpa cache", async () => {
    for (const email of [
      "tk1@kerjain.test",
      "pk1@kerjain.test",
      "cs1@kerjain.test",
    ]) {
      await masuk(email);
      const r = await ambil(GETbukti, ids.bukti);
      expect(r.status, email).toBe(200);
      expect(r.headers.get("Content-Type")).toBe("image/png");
      expect(r.headers.get("Cache-Control")).toBe("no-store");
      expect(new Uint8Array(await r.arrayBuffer())).toEqual(PNG);
    }
  });
  it("bukan peserta -> 403 (KNF06); tanpa sesi -> 401", async () => {
    await masuk("tk2@kerjain.test");
    const r = await ambil(GETbukti, ids.bukti);
    expect(r.status).toBe(403);
    expect(await kode(r)).toBe("FORBIDDEN");
    jar.clear();
    expect((await ambil(GETbukti, ids.bukti)).status).toBe(401);
  });
  it("id tidak ada / bukan UUID / berkas fisik hilang -> 404", async () => {
    await masuk("cs1@kerjain.test");
    expect((await ambil(GETbukti, randomUUID())).status).toBe(404);
    expect((await ambil(GETbukti, "../../etc/passwd")).status).toBe(404);
    expect((await ambil(GETbukti, ids.hilang)).status).toBe(404);
  });
});

describe("GET /api/berkas/sengketa/:id", () => {
  it("tiket transaksi: pelapor, TK peserta, dan CS boleh; TK non-peserta 403", async () => {
    for (const email of [
      "pk1@kerjain.test",
      "tk1@kerjain.test",
      "cs1@kerjain.test",
    ]) {
      jar.clear();
      await masuk(email);
      expect((await ambil(GETsengketa, ids.sengketa)).status, email).toBe(200);
    }
    jar.clear();
    await masuk("tk2@kerjain.test");
    expect((await ambil(GETsengketa, ids.sengketa)).status).toBe(403);
  });
  it("tiket bantuan umum: hanya pelapor dan CS", async () => {
    await masuk("tk1@kerjain.test"); // peserta transaksi lain, bukan pelapor tiket umum
    expect((await ambil(GETsengketa, ids.umum)).status).toBe(403);
    jar.clear();
    await masuk("pk1@kerjain.test");
    expect((await ambil(GETsengketa, ids.umum)).status).toBe(200);
  });
});
