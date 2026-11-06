import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
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
import {
  PengajuanVerifikasiResponse,
  VerifikasiStatusResponse,
} from "@/lib/validation/verifikasi";

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

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4];
type Db = typeof import("@/lib/db").db;
let dir: string;
let db: Db;
let masuk: (email: string) => Promise<void>;
let ajukan: typeof import("@/app/api/verifikasi/route");
let status: typeof import("@/app/api/verifikasi/status/route");

const one = <T>(sql: string, ...p: unknown[]) => db.prepare(sql).get(...p) as T;
const form = (o: { persetujuan?: string; berkas?: File | null } = {}) => {
  const f = new FormData();
  if (o.persetujuan !== undefined) f.set("persetujuan", o.persetujuan);
  if (o.berkas !== null)
    f.set(
      "berkas",
      o.berkas ??
        new File([new Uint8Array(PNG)], "ktp.png", { type: "image/png" }),
    );
  return f;
};
const kirim = (f: FormData) =>
  ajukan.POST(
    new Request("http://localhost/api/verifikasi", { method: "POST", body: f }),
  );
const tk = (email: string) =>
  one<{ status: string; path: string | null; alasan: string | null }>(
    `SELECT status_verifikasi status, dokumen_identitas_path path, alasan_penolakan alasan FROM tenaga_kerja t
     JOIN pengguna u USING (id_pengguna) WHERE u.email = ?`,
    email,
  );
const kode = async (r: Response) => (await r.json()).error?.code;

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "kerjain-verif-"));
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
  ajukan = await import("@/app/api/verifikasi/route");
  status = await import("@/app/api/verifikasi/status/route");
  masuk = (email) =>
    buatSesi(
      one<{ id: string }>(
        "SELECT id_pengguna id FROM pengguna WHERE email = ?",
        email,
      ).id,
    );
});
afterAll(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
beforeEach(() => jar.clear());

describe("POST /api/verifikasi (KF04)", () => {
  it("TK belum terverifikasi: 201, status menunggu, berkas tersimpan terenkripsi", async () => {
    await masuk("tk2@kerjain.test");
    const r = await kirim(form({ persetujuan: "true" }));
    expect(r.status).toBe(201);
    expect(PengajuanVerifikasiResponse.parse(await r.json()).status).toBe(
      "MENUNGGU_VERIFIKASI",
    );

    const t = tk("tk2@kerjain.test");
    expect(t.status).toBe("MENUNGGU_VERIFIKASI");
    expect(t.path).toMatch(/^identitas\/.+\.png\.enc$/);
    const disk = readFileSync(path.join(process.env.STORAGE_DIR!, t.path!));
    expect(disk.subarray(28, 36)).not.toEqual(Buffer.from(PNG.slice(0, 8))); // bukan PNG mentah
  });
  it("GET /status mengembalikan status terkini", async () => {
    await masuk("tk2@kerjain.test");
    const s = VerifikasiStatusResponse.parse(await (await status.GET()).json());
    expect(s).toMatchObject({
      status: "MENUNGGU_VERIFIKASI",
      alasanPenolakan: null,
    });
    expect(s.waktuPengajuan).not.toBeNull();
  });
  it("mengajukan saat MENUNGGU atau sudah TERVERIFIKASI -> 409", async () => {
    await masuk("tk2@kerjain.test");
    const r = await kirim(form({ persetujuan: "true" }));
    expect(r.status).toBe(409);
    expect(await kode(r)).toBe("STATUS_TIDAK_VALID");
    jar.clear();
    await masuk("tk1@kerjain.test"); // terverifikasi
    expect((await kirim(form({ persetujuan: "true" }))).status).toBe(409);
  });
  it("unggah ulang setelah DITOLAK: berhasil, alasan dihapus, berkas lama dibersihkan", async () => {
    const lama = tk("tk2@kerjain.test").path!;
    db.prepare(
      "UPDATE tenaga_kerja SET status_verifikasi = 'DITOLAK', alasan_penolakan = 'Foto buram' WHERE dokumen_identitas_path = ?",
    ).run(lama);
    await masuk("tk2@kerjain.test");
    expect(
      VerifikasiStatusResponse.parse(await (await status.GET()).json()),
    ).toMatchObject({ status: "DITOLAK", alasanPenolakan: "Foto buram" });
    expect((await kirim(form({ persetujuan: "true" }))).status).toBe(201);
    const t = tk("tk2@kerjain.test");
    expect(t).toMatchObject({ status: "MENUNGGU_VERIFIKASI", alasan: null });
    expect(t.path).not.toBe(lama);
    expect(existsSync(path.join(process.env.STORAGE_DIR!, lama))).toBe(false);
  });
  it("tanpa persetujuan -> 400 di field persetujuan", async () => {
    db.prepare(
      "UPDATE tenaga_kerja SET status_verifikasi = 'DITOLAK' WHERE status_verifikasi = 'MENUNGGU_VERIFIKASI'",
    ).run();
    await masuk("tk2@kerjain.test");
    for (const f of [form(), form({ persetujuan: "false" })]) {
      const r = await kirim(f);
      expect(r.status).toBe(400);
      expect((await r.json()).error.fields).toHaveProperty("persetujuan");
    }
  });
  it("berkas salah -> 400 BERKAS_TIDAK_VALID; status tidak berubah", async () => {
    await masuk("tk2@kerjain.test");
    const exe = new File(
      [new Uint8Array([0x4d, 0x5a, 0, 0, 1, 2])],
      "foto.jpg",
      { type: "image/jpeg" },
    );
    const besar = new File(
      [new Uint8Array([...PNG, ...new Uint8Array(5 * 1024 * 1024)])],
      "besar.png",
      { type: "image/png" },
    );
    for (const berkas of [exe, besar, null]) {
      const r = await kirim(form({ persetujuan: "true", berkas }));
      expect(r.status).toBe(400);
      expect(await kode(r)).toBe("BERKAS_TIDAK_VALID");
    }
    expect(tk("tk2@kerjain.test").status).toBe("DITOLAK");
  });
  it("PK -> 403, tanpa sesi -> 401, body bukan multipart -> 400", async () => {
    await masuk("pk1@kerjain.test");
    expect((await kirim(form({ persetujuan: "true" }))).status).toBe(403);
    jar.clear();
    expect((await kirim(form({ persetujuan: "true" }))).status).toBe(401);
    await masuk("tk2@kerjain.test");
    const r = await ajukan.POST(
      new Request("http://localhost/api/verifikasi", {
        method: "POST",
        body: "{}",
      }),
    );
    expect(r.status).toBe(400);
  });
});
