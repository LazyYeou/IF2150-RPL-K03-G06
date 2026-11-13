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
import {
  DaftarLowonganResponse,
  LowonganDetail,
  LowonganSayaResponse,
} from "@/lib/validation/lowongan";

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

type Db = typeof import("@/lib/db").db;
let dir: string;
let db: Db;
let masuk: (email: string) => Promise<void>;
let route: typeof import("@/app/api/lowongan/route");
let saya: typeof import("@/app/api/lowongan/saya/route");
let rute: typeof import("@/app/api/lowongan/[id]/route");

const BASE = "http://localhost/api/lowongan";
const valid = {
  judul: "Bersih rumah pindahan",
  deskripsi: "Membersihkan rumah dua lantai setelah pindahan.",
  ruangLingkup: "Lantai 1 dan 2",
  kriteriaHasil: "Bersih dan kering",
  kategori: "Kebersihan",
  lokasi: "Coblong, Bandung",
  tanggalPekerjaan: "2026-11-12",
  estimasiDurasi: "4 jam",
  upah: 350000,
  satuanUpah: "PER_TUGAS",
  kuota: 2,
  pernyataanRisiko: false,
};
const post = (body: unknown) =>
  route.POST(new Request(BASE, { method: "POST", body: JSON.stringify(body) }));
const cari = (qs = "") => route.GET(new Request(`${BASE}${qs}`));
const detail = (id: string) =>
  rute.GET(new Request(`${BASE}/${id}`), { params: Promise.resolve({ id }) });
const one = <T>(sql: string, ...p: unknown[]) => db.prepare(sql).get(...p) as T;

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "kerjain-lowongan-"));
  process.env.DATABASE_PATH = path.join(dir, "test.db");
  const { bukaDb } = await import("@/db/open");
  const { migrate } = await import("@/scripts/migrate");
  const { seed } = await import("@/db/seed");
  const awal = bukaDb();
  migrate(awal);
  await seed(awal);
  awal.close();

  ({ db } = await import("@/lib/db"));
  const { buatSesi } = await import("@/lib/auth/session");
  route = await import("@/app/api/lowongan/route");
  saya = await import("@/app/api/lowongan/saya/route");
  rute = await import("@/app/api/lowongan/[id]/route");
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

describe("POST /api/lowongan (KF07, KF08, KNF09)", () => {
  it("PK: 201, status OPEN, jumlahDiterima 0, sesuai skema, muncul di lowongan saya", async () => {
    await masuk("pk1@kerjain.test");
    const r = await post(valid);
    expect(r.status).toBe(201);
    const l = LowonganDetail.parse(await r.json());
    expect(l).toMatchObject({
      status: "OPEN",
      jumlahDiterima: 0,
      kuota: 2,
      judul: valid.judul,
    });
    const daftar = LowonganSayaResponse.parse(
      await (await saya.GET(new Request(`${BASE}/saya`))).json(),
    );
    expect(daftar.items.some((i) => i.id === l.id)).toBe(true);
  });
  it("field tidak valid -> 400 dengan daftar field", async () => {
    await masuk("pk1@kerjain.test");
    const r = await post({ ...valid, judul: "pendek", upah: 10, lokasi: "" });
    expect(r.status).toBe(400);
    const { error } = await r.json();
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(Object.keys(error.fields)).toEqual(
      expect.arrayContaining(["judul", "upah", "lokasi"]),
    );
  });
  it("kategori berisiko tanpa pernyataan risiko -> 400 di field pernyataanRisiko", async () => {
    await masuk("pk1@kerjain.test");
    const r = await post({ ...valid, kategori: "Kelistrikan" });
    expect(r.status).toBe(400);
    expect((await r.json()).error.fields).toHaveProperty("pernyataanRisiko");
    expect(
      (
        await post({
          ...valid,
          kategori: "Kelistrikan",
          pernyataanRisiko: true,
        })
      ).status,
    ).toBe(201);
  });
  it("id pelaku dari body ditolak; JSON rusak -> 400", async () => {
    await masuk("pk1@kerjain.test");
    expect((await post({ ...valid, idPenyediaKerja: "x" })).status).toBe(400);
    const r = await route.POST(
      new Request(BASE, { method: "POST", body: "{bukan json" }),
    );
    expect(r.status).toBe(400);
  });
  it("TK/CS -> 403, tanpa sesi -> 401", async () => {
    for (const email of ["tk1@kerjain.test", "cs1@kerjain.test"]) {
      jar.clear();
      await masuk(email);
      expect((await post(valid)).status, email).toBe(403);
    }
    jar.clear();
    expect((await post(valid)).status).toBe(401);
  });
});

describe("GET /api/lowongan (KF09)", () => {
  it("publik, paginasi 12, sesuai skema", async () => {
    const r = DaftarLowonganResponse.parse(await (await cari()).json());
    expect(r.pageSize).toBe(12);
    expect(r.items).toHaveLength(12);
    expect(r.total).toBeGreaterThan(12);
    const hal2 = DaftarLowonganResponse.parse(
      await (await cari("?page=2")).json(),
    );
    expect(hal2.items[0].id).not.toBe(r.items[0].id);
  });
  it("hanya OPEN: CLOSED_FULL tidak muncul", async () => {
    const id = one<{ id: string }>(
      "SELECT id_lowongan id FROM lowongan_pekerjaan WHERE status_lowongan = 'OPEN' LIMIT 1",
    ).id;
    db.prepare(
      "UPDATE lowongan_pekerjaan SET status_lowongan = 'CLOSED_FULL', jumlah_diterima = kuota WHERE id_lowongan = ?",
    ).run(id);
    const { items, total } = await (await cari("?page=1")).json();
    expect(items.some((i: { id: string }) => i.id === id)).toBe(false);
    const semua = one<{ c: number }>(
      "SELECT count(*) c FROM lowongan_pekerjaan WHERE status_lowongan = 'OPEN'",
    ).c;
    expect(total).toBe(semua);
  });
  it("filter kata kunci, kategori, upah minimum, dan urutan", async () => {
    const kat = DaftarLowonganResponse.parse(
      await (await cari("?kategori=Kelistrikan")).json(),
    );
    expect(kat.items.length).toBeGreaterThan(0);
    expect(kat.items.every((i) => i.kategori === "Kelistrikan")).toBe(true);

    const q = DaftarLowonganResponse.parse(
      await (await cari("?q=lampu")).json(),
    );
    expect(
      q.items
        .map((i) => i.judul.toLowerCase())
        .every((j) => j.includes("lampu")),
    ).toBe(true);

    const upah = DaftarLowonganResponse.parse(
      await (await cari("?upahMin=250000")).json(),
    );
    expect(upah.items.every((i) => i.upah >= 250000)).toBe(true);

    const urut = DaftarLowonganResponse.parse(
      await (await cari("?urut=upah_tertinggi")).json(),
    );
    const u = urut.items.map((i) => i.upah);
    expect(u).toEqual([...u].sort((a, b) => b - a));
  });
  it("karakter LIKE dari pengguna dicari apa adanya; tanpa hasil = daftar kosong", async () => {
    const r = await (await cari("?q=%25")).json(); // "%"
    expect(r.items).toEqual([]);
    expect(r.total).toBe(0);
  });
  it("query tak dikenal / page 0 -> 400", async () => {
    expect((await cari("?foo=1")).status).toBe(400);
    expect((await cari("?page=0")).status).toBe(400);
  });
});

describe("GET /api/lowongan/:id dan /saya", () => {
  it("detail publik sesuai skema; id tak ada atau bukan UUID -> 404", async () => {
    const id = one<{ id: string }>(
      "SELECT id_lowongan id FROM lowongan_pekerjaan LIMIT 1",
    ).id;
    const r = await detail(id);
    expect(r.status).toBe(200);
    const l = LowonganDetail.parse(await r.json());
    expect(l.penawaranSaya).toBeUndefined();
    expect((await detail(randomUUID())).status).toBe(404);
    expect((await detail("bukan-uuid")).status).toBe(404);
  });
  it("TK yang sudah menawar melihat penawaranSaya", async () => {
    const t = one<{ id: string; tk: string }>(
      `SELECT l.id_lowongan id, tk.id_tenaga_kerja tk FROM lowongan_pekerjaan l, tenaga_kerja tk
       JOIN pengguna u ON u.id_pengguna = tk.id_pengguna
       WHERE l.status_lowongan = 'OPEN' AND u.email = 'tk1@kerjain.test' LIMIT 1`,
    );
    const idPenawaran = randomUUID();
    db.prepare(
      "INSERT INTO pengajuan_penawaran (id_penawaran, id_lowongan, id_tenaga_kerja, harga_penawaran, ketersediaan) VALUES (?, ?, ?, 100000, 'Kapan saja')",
    ).run(idPenawaran, t.id, t.tk);
    await masuk("tk1@kerjain.test");
    const l = LowonganDetail.parse(await (await detail(t.id)).json());
    expect(l.penawaranSaya).toEqual({ id: idPenawaran, status: "MENUNGGU" });
  });
  it("/saya: PK hanya melihat miliknya; TK 403", async () => {
    await masuk("pk1@kerjain.test");
    const r = LowonganSayaResponse.parse(
      await (await saya.GET(new Request(`${BASE}/saya`))).json(),
    );
    expect(r.items.length).toBeGreaterThan(0);
    jar.clear();
    await masuk("tk1@kerjain.test");
    expect((await saya.GET(new Request(`${BASE}/saya`))).status).toBe(403);
  });
});
