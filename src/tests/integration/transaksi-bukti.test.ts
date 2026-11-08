import {
  existsSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

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
const JPEG = [0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4];
const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d, 1, 2, 3, 4];
type Db = typeof import("@/lib/db").db;
let dir: string;
let db: Db;
let route: typeof import("@/app/api/transaksi/[id]/bukti/route");
let Transaksi: typeof import("@/models/TransaksiPekerjaan");

const one = <T>(sql: string, ...params: unknown[]) =>
  db.prepare(sql).get(...params) as T;
const file = (bytes = PNG, name = "bukti.png", type = "image/png") =>
  new File([new Uint8Array(bytes)], name, { type });
const form = (berkas: File | null = file(), deskripsi = "Pekerjaan sudah selesai sesuai kriteria.") => {
  const f = new FormData();
  f.set("deskripsi", deskripsi);
  if (berkas) f.set("berkas", berkas);
  return f;
};

async function masuk(email: string) {
  const { buatSesi } = await import("@/lib/auth/session");
  const pengguna = one<{ id: string }>(
    "SELECT id_pengguna id FROM pengguna WHERE email = ?",
    email,
  );
  await buatSesi(pengguna.id);
}
const kirim = (id: string, formData: FormData) =>
  route.POST(
    new Request(`http://localhost/api/transaksi/${id}/bukti`, {
      method: "POST",
      body: formData,
    }),
    { params: Promise.resolve({ id }) },
  );
const code = async (response: Response) =>
  (await response.json()).error?.code;
const jumlahBerkas = (folder: string): number => {
  if (!existsSync(folder)) return 0;
  return readdirSync(folder).reduce((jumlah, nama) => {
    const target = path.join(folder, nama);
    return jumlah + (statSync(target).isDirectory()
      ? jumlahBerkas(target)
      : 1);
  }, 0);
};

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "kerjain-bukti-"));
  process.env.DATABASE_PATH = path.join(dir, "test.db");
  process.env.STORAGE_DIR = path.join(dir, "storage");
  const { bukaDb } = await import("@/db/open");
  const { migrate } = await import("@/scripts/migrate");
  const { seed } = await import("@/db/seed");
  const awal = bukaDb();
  migrate(awal);
  await seed(awal);
  awal.close();
  ({ db } = await import("@/lib/db"));
  Transaksi = await import("@/models/TransaksiPekerjaan");
  route = await import("@/app/api/transaksi/[id]/bukti/route");
});
afterAll(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
beforeEach(() => {
  jar.clear();
  db.prepare(
    `UPDATE tenaga_kerja SET status_verifikasi = 'TERVERIFIKASI'
     WHERE id_pengguna = (SELECT id_pengguna FROM pengguna WHERE email = 'tk1@kerjain.test')`,
  ).run();
  db.prepare(
    `UPDATE tenaga_kerja SET status_verifikasi = 'BELUM_TERVERIFIKASI'
     WHERE id_pengguna = (SELECT id_pengguna FROM pengguna WHERE email = 'tk2@kerjain.test')`,
  ).run();
  db.prepare("DELETE FROM notifikasi").run();
  const targets = db
    .prepare(
      `SELECT id_transaksi AS id FROM transaksi_pekerjaan t
       JOIN tenaga_kerja tk ON tk.id_tenaga_kerja = t.id_tenaga_kerja
       JOIN pengguna p ON p.id_pengguna = tk.id_pengguna
       WHERE p.email = 'tk1@kerjain.test'
         AND t.status_pekerjaan IN ('IN_PROGRESS', 'SUBMITTED')
       ORDER BY t.id_transaksi LIMIT 1`,
    )
    .all() as Array<{ id: string }>;
  for (const target of targets) {
    db.prepare("DELETE FROM bukti_penyerahan WHERE id_transaksi = ?").run(target.id);
    db.prepare(
      "UPDATE transaksi_pekerjaan SET status_pekerjaan = 'IN_PROGRESS' WHERE id_transaksi = ?",
    ).run(target.id);
  }
});

describe("POST /api/transaksi/:id/bukti", () => {
  const transaksiInProgress = () =>
    one<{ id: string }>(
      `SELECT id_transaksi id FROM transaksi_pekerjaan
       WHERE status_pekerjaan = 'IN_PROGRESS' LIMIT 1`,
    ).id;

  it("TK terverifikasi yang ditugaskan dapat mengirim bukti", async () => {
    await masuk("tk1@kerjain.test");
    const id = transaksiInProgress();
    const response = await kirim(id, form());
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      idTransaksi: id,
      status: "SUBMITTED",
    });

    const bukti = one<{ path: string }>(
      "SELECT file_path AS path FROM bukti_penyerahan WHERE id_transaksi = ?",
      id,
    );
    expect(existsSync(path.join(process.env.STORAGE_DIR!, bukti.path))).toBe(true);
    expect(
      db.prepare(
        `SELECT status_pekerjaan AS status FROM transaksi_pekerjaan
         WHERE id_transaksi = ?`,
      ).get(id),
    ).toMatchObject({ status: "SUBMITTED" });
    const notif = one<{ email: string }>(
      `SELECT p.email AS email FROM notifikasi n
       JOIN pengguna p ON p.id_pengguna = n.id_penerima
       WHERE n.pesan_notifikasi LIKE '%bukti penyelesaian%'
         AND n.tautan = ?`,
      `/pk/transaksi/${id}`,
    );
    expect(notif.email).toBe("pk1@kerjain.test");
  });

  it("menerima PNG, JPEG, dan PDF dengan tipe yang sesuai", async () => {
    await masuk("tk1@kerjain.test");
    const id = transaksiInProgress();
    const berkasValid = [
      file(PNG, "bukti.png", "image/png"),
      file(JPEG, "bukti.jpg", "image/jpeg"),
      file(PDF, "bukti.pdf", "application/pdf"),
    ];

    for (const berkas of berkasValid) {
      db.prepare("DELETE FROM bukti_penyerahan WHERE id_transaksi = ?").run(id);
      db.prepare(
        "UPDATE transaksi_pekerjaan SET status_pekerjaan = 'IN_PROGRESS' WHERE id_transaksi = ?",
      ).run(id);
      const response = await kirim(id, form(berkas));
      expect(response.status).toBe(201);
    }
  });

  it("berkas kosong atau format salah ditolak dan tidak ada file tersimpan", async () => {
    await masuk("tk1@kerjain.test");
    const id = transaksiInProgress();
    const kosong = file([], "kosong.png");
    const invalid = file([0x4d, 0x5a, 0, 1], "salah.png", "image/png");
    for (const berkas of [kosong, invalid]) {
      db.prepare(
        "UPDATE transaksi_pekerjaan SET status_pekerjaan = 'IN_PROGRESS' WHERE id_transaksi = ?",
      ).run(id);
      const response = await kirim(id, form(berkas));
      expect(response.status).toBe(400);
      expect(await code(response)).toBe("BERKAS_TIDAK_VALID");
    }
  });

  it("berkas >10 MB ditolak", async () => {
    await masuk("tk1@kerjain.test");
    const besar = file([...PNG, ...new Array(10 * 1024 * 1024).fill(0)], "besar.png");
    expect((await kirim(transaksiInProgress(), form(besar))).status).toBe(400);
  });

  it("status selain IN_PROGRESS ditolak 409", async () => {
    await masuk("tk1@kerjain.test");
    const id = transaksiInProgress();
    db.prepare(
      "UPDATE transaksi_pekerjaan SET status_pekerjaan = 'SUBMITTED' WHERE id_transaksi = ?",
    ).run(id);
    const response = await kirim(id, form());
    expect(response.status).toBe(409);
    expect(await code(response)).toBe("STATUS_TIDAK_VALID");
  });

  it("TK lain atau TK belum terverifikasi tidak dapat mengirim bukti", async () => {
    const id = transaksiInProgress();
    await masuk("tk2@kerjain.test");
    expect((await kirim(id, form())).status).toBe(403);

    await masuk("tk1@kerjain.test");
    db.prepare(
      `UPDATE tenaga_kerja SET status_verifikasi = 'BELUM_TERVERIFIKASI'
       WHERE id_pengguna = (SELECT id_pengguna FROM pengguna WHERE email = 'tk1@kerjain.test')`,
    ).run();
    expect((await kirim(id, form())).status).toBe(403);

    await masuk("pk1@kerjain.test");
    expect((await kirim(id, form())).status).toBe(403);
  });

  it("menghapus berkas jika transaksi database gagal", async () => {
    await masuk("tk1@kerjain.test");
    const id = transaksiInProgress();
    const root = path.join(process.env.STORAGE_DIR!, "bukti");
    const awal = jumlahBerkas(root);
    const spy = vi
      .spyOn(Transaksi, "submitBukti")
      .mockImplementationOnce(() => {
        throw new Error("database gagal");
      });

    const response = await kirim(id, form());
    expect(response.status).toBe(500);
    expect(jumlahBerkas(root)).toBe(awal);
    spy.mockRestore();
  });

  it("tanpa sesi ditolak 401 dan deskripsi terlalu pendek ditolak 400", async () => {
    const id = transaksiInProgress();
    expect((await kirim(id, form())).status).toBe(401);
    await masuk("tk1@kerjain.test");
    const response = await kirim(id, form(file(), "pendek"));
    expect(response.status).toBe(400);
  });
});
