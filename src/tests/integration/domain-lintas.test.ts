import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
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

// Issue #41: kasus lintas-domain yang belum tercakup suite per-fitur.
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
let dir: string;
let dbFile: string;
let db: Db;
let masuk: (email: string) => Promise<void>;

const one = <T>(sql: string, ...p: unknown[]) => db.prepare(sql).get(...p) as T;
const idPengguna = (email: string) =>
  one<{ id: string }>(
    "SELECT id_pengguna id FROM pengguna WHERE email = ?",
    email,
  ).id;
const idProfil = (tabel: "tenaga_kerja" | "penyedia_kerja", email: string) =>
  one<{ id: string }>(
    `SELECT t.id_${tabel} id FROM ${tabel} t JOIN pengguna u USING (id_pengguna) WHERE u.email = ?`,
    email,
  ).id;

function buatLowongan(kuota: number) {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO lowongan_pekerjaan (id_lowongan, id_penyedia_kerja, judul, deskripsi, ruang_lingkup, kriteria_hasil,
       kategori, lokasi, tanggal_pekerjaan, estimasi_durasi, upah, satuan_upah, kuota)
     VALUES (?, ?, 'Lowongan uji lintas domain', 'Deskripsi lowongan untuk uji lintas domain', 'a', 'b',
       'Kebersihan', 'Coblong, Bandung', '2026-12-01', '2 jam', 200000, 'PER_TUGAS', ?)`,
  ).run(id, idProfil("penyedia_kerja", "pk1@kerjain.test"), kuota);
  return id;
}
function buatPenawaran(idLowongan: string, emailTK: string) {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO pengajuan_penawaran (id_penawaran, id_lowongan, id_tenaga_kerja, harga_penawaran, ketersediaan, status_penawaran)
     VALUES (?, ?, ?, 250000, 'Kamis pagi', 'MENUNGGU')`,
  ).run(id, idLowongan, idProfil("tenaga_kerja", emailTK));
  return id;
}

/** Satu proses Node baru = satu koneksi SQLite sendiri, menunggu titik waktu yang sama. */
function jalankanTerima(mulai: number, idPenawaran: string, idPK: string) {
  return new Promise<{ ok: boolean; alasan?: string }>((resolve, reject) => {
    execFile(
      process.execPath,
      [
        "--conditions=react-server",
        "--import",
        "tsx",
        "tests/helpers/terima-proses.ts",
        String(mulai),
        idPenawaran,
        idPK,
      ],
      {
        cwd: process.cwd(),
        env: { ...process.env, DATABASE_PATH: dbFile },
        windowsHide: true,
      },
      (error, stdout, stderr) =>
        error
          ? reject(new Error(`${error.message}\n${stderr}`))
          : resolve(JSON.parse(stdout.trim().split("\n").at(-1)!)),
    );
  });
}

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "kerjain-lintas-"));
  dbFile = path.join(dir, "test.db");
  process.env.DATABASE_PATH = dbFile;
  process.env.STORAGE_DIR = path.join(dir, "storage");
  const { bukaDb } = await import("@/db/open");
  const { migrate } = await import("@/scripts/migrate");
  const { seed } = await import("@/db/seed");
  const awal = bukaDb();
  migrate(awal);
  await seed(awal);
  awal.close();
  ({ db } = await import("@/lib/db"));
  const { buatSesi } = await import("@/lib/auth/session");
  masuk = (email) => buatSesi(idPengguna(email));
});
afterAll(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
beforeEach(() => jar.clear());

describe("KNF07: kuota terakhir dari dua koneksi DB terpisah", () => {
  it("dua proses menerima penawaran berbeda serentak: tepat satu sukses", async () => {
    const l = buatLowongan(1);
    const a = buatPenawaran(l, "tk1@kerjain.test");
    const b = buatPenawaran(l, "tk2@kerjain.test");
    const pk = idProfil("penyedia_kerja", "pk1@kerjain.test"); // terima() memakai id profil PK
    const mulai = Date.now() + 1500; // waktu start proses tsx
    const hasil = await Promise.all([
      jalankanTerima(mulai, a, pk),
      jalankanTerima(mulai, b, pk),
    ]);
    expect(hasil.filter((h) => h.ok)).toHaveLength(1);
    expect(hasil.find((h) => !h.ok)?.alasan).toBe("KUOTA_PENUH");
    expect(
      one<{ n: number; d: number }>(
        `SELECT (SELECT COUNT(*) FROM transaksi_pekerjaan WHERE id_lowongan = ?) n,
                (SELECT jumlah_diterima FROM lowongan_pekerjaan WHERE id_lowongan = ?) d`,
        l,
        l,
      ),
    ).toEqual({ n: 1, d: 1 });
  }, 30_000);
});

describe("KF06: TK belum terverifikasi ditolak 403 NOT_VERIFIED pada bukti pekerjaan", () => {
  it("tk2 (BELUM_TERVERIFIKASI) yang memegang transaksi IN_PROGRESS tidak bisa mengunggah bukti", async () => {
    const route = await import("@/app/api/transaksi/[id]/bukti/route");
    const l = buatLowongan(1);
    const p = buatPenawaran(l, "tk2@kerjain.test");
    const trx = randomUUID();
    db.prepare(
      `INSERT INTO transaksi_pekerjaan (id_transaksi, id_lowongan, id_penawaran, id_tenaga_kerja, id_penyedia_kerja, nominal_upah, status_pekerjaan)
       VALUES (?, ?, ?, ?, ?, 250000, 'IN_PROGRESS')`,
    ).run(
      trx,
      l,
      p,
      idProfil("tenaga_kerja", "tk2@kerjain.test"),
      idProfil("penyedia_kerja", "pk1@kerjain.test"),
    );
    await masuk("tk2@kerjain.test");
    const f = new FormData();
    f.set("deskripsi", "Pekerjaan sudah selesai dikerjakan.");
    f.set(
      "berkas",
      new File(
        [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1])],
        "b.png",
        {
          type: "image/png",
        },
      ),
    );
    const r = await route.POST(
      new Request(`http://localhost/api/transaksi/${trx}/bukti`, {
        method: "POST",
        body: f,
      }),
      { params: Promise.resolve({ id: trx }) },
    );
    expect(r.status).toBe(403);
    expect((await r.json()).error.code).toBe("NOT_VERIFIED");
    expect(
      one<{ s: string }>(
        "SELECT status_pekerjaan s FROM transaksi_pekerjaan WHERE id_transaksi = ?",
        trx,
      ).s,
    ).toBe("IN_PROGRESS");
  });
});

describe("KNF19: semua /api/cs/* hanya untuk CS", () => {
  const U = randomUUID();
  const rute = [
    ["@/app/api/cs/tiket/route", "GET", "/api/cs/tiket", false],
    ["@/app/api/cs/tiket/[id]/route", "GET", `/api/cs/tiket/${U}`, true],
    [
      "@/app/api/cs/tiket/[id]/putuskan/route",
      "POST",
      `/api/cs/tiket/${U}/putuskan`,
      true,
    ],
    [
      "@/app/api/cs/tiket/[id]/minta-bukti/route",
      "POST",
      `/api/cs/tiket/${U}/minta-bukti`,
      true,
    ],
    [
      "@/app/api/cs/tiket/[id]/tolak/route",
      "POST",
      `/api/cs/tiket/${U}/tolak`,
      true,
    ],
    ["@/app/api/cs/verifikasi/route", "GET", "/api/cs/verifikasi", false],
    [
      "@/app/api/cs/verifikasi/[idTK]/dokumen/route",
      "GET",
      `/api/cs/verifikasi/${U}/dokumen`,
      "idTK",
    ],
    [
      "@/app/api/cs/verifikasi/[idTK]/setujui/route",
      "POST",
      `/api/cs/verifikasi/${U}/setujui`,
      "idTK",
    ],
    [
      "@/app/api/cs/verifikasi/[idTK]/tolak/route",
      "POST",
      `/api/cs/verifikasi/${U}/tolak`,
      "idTK",
    ],
  ] as const;

  async function panggil([
    modul,
    metode,
    url,
    param,
  ]: (typeof rute)[number]): Promise<number> {
    const m = (await import(/* @vite-ignore */ modul)) as Record<
      string,
      (r: Request, c?: unknown) => Promise<Response>
    >;
    const req = new Request(`http://localhost${url}`, {
      method: metode,
      headers: { "content-type": "application/json" },
      body: metode === "POST" ? "{}" : undefined,
    });
    const ctx = param
      ? { params: Promise.resolve({ [param === true ? "id" : param]: U }) }
      : undefined;
    return (await m[metode](req, ctx)).status;
  }

  it("tanpa sesi 401; TK, PK 403 pada setiap endpoint", async () => {
    for (const r of rute)
      expect(await panggil(r), `${r[1]} ${r[2]} anon`).toBe(401);
    for (const email of ["tk1@kerjain.test", "pk1@kerjain.test"]) {
      jar.clear();
      await masuk(email);
      for (const r of rute)
        expect(await panggil(r), `${r[1]} ${r[2]} ${email}`).toBe(403);
    }
  });
  it("jumlah rute CS di tes ini sama dengan yang ada di app/api/cs (tidak ada yang terlewat)", async () => {
    const ada = readdirSync("app/api/cs", { recursive: true }).filter((f) =>
      String(f).endsWith("route.ts"),
    );
    expect(ada).toHaveLength(rute.length);
  });
});
