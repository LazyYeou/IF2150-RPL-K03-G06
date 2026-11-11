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
import { DaftarLowonganResponse } from "@/lib/validation/lowongan";
import { DaftarTKResponse } from "@/lib/validation/tenagaKerja";

// #51 lowongan tersimpan dan #52 daftar/detail TK publik + undangan.
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
type Ctx = { params: Promise<{ id: string }> };
type Rute = {
  GET?: (r: Request, c: Ctx) => Promise<Response>;
  POST?: (r: Request, c: Ctx) => Promise<Response>;
};
let dir: string;
let db: Db;
let masuk: (email: string) => Promise<void>;
let daftarSimpan: Rute;
let simpanRute: Rute;
let hapusRute: Rute;
let daftarTK: Rute;
let detailTK: Rute;
let undangRute: Rute;

const one = <T>(sql: string, ...p: unknown[]) => db.prepare(sql).get(...p) as T;
const idPengguna = (email: string) =>
  one<{ id: string }>(
    "SELECT id_pengguna id FROM pengguna WHERE email = ?",
    email,
  ).id;
const ctx = (id: string): Ctx => ({ params: Promise.resolve({ id }) });
const post = (rute: Rute, id: string, body?: unknown) =>
  rute.POST!(
    new Request(`http://localhost/api/x/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    ctx(id),
  );
const get = (rute: Rute, url: string, id?: string) =>
  rute.GET!(new Request(`http://localhost${url}`), ctx(id ?? ""));
const kode = async (r: Response) => (await r.json()).error?.code;

function buatLowongan(status = "OPEN", pemilik = "pk1@kerjain.test") {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO lowongan_pekerjaan (id_lowongan, id_penyedia_kerja, judul, deskripsi, ruang_lingkup, kriteria_hasil,
       kategori, lokasi, tanggal_pekerjaan, estimasi_durasi, upah, satuan_upah, kuota, jumlah_diterima, status_lowongan)
     VALUES (?, (SELECT pk.id_penyedia_kerja FROM penyedia_kerja pk JOIN pengguna u USING (id_pengguna) WHERE u.email = ?),
       'Lowongan uji simpan dan undang', 'Deskripsi lowongan untuk uji simpan dan undang', 'a', 'b',
       'Kebersihan', 'Coblong, Bandung', '2026-12-01', '2 jam', 200000, 'PER_TUGAS', 1, ?, ?)`,
  ).run(id, pemilik, status === "OPEN" ? 0 : 1, status);
  return id;
}

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "kerjain-tersimpan-"));
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
  masuk = (email) => buatSesi(idPengguna(email));
  daftarSimpan = await import("@/app/api/lowongan-tersimpan/route");
  simpanRute = await import("@/app/api/lowongan/[id]/simpan/route");
  hapusRute = await import("@/app/api/lowongan/[id]/hapus-simpan/route");
  daftarTK = await import("@/app/api/tenaga-kerja/route");
  detailTK = await import("@/app/api/tenaga-kerja/[id]/route");
  undangRute = await import("@/app/api/tenaga-kerja/[id]/undang/route");
});
afterAll(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
beforeEach(() => jar.clear());

describe("#51 lowongan tersimpan", () => {
  it("simpan idempoten, muncul di daftar sesuai skema, hapus idempoten", async () => {
    const l = buatLowongan();
    await masuk("tk1@kerjain.test");
    expect(await (await post(simpanRute, l)).json()).toEqual({
      tersimpan: true,
    });
    expect((await post(simpanRute, l)).status).toBe(200); // ganda tidak error
    const r = await get(daftarSimpan, "/api/lowongan-tersimpan");
    const d = DaftarLowonganResponse.parse(await r.json());
    expect(d.items.map((i) => i.id)).toEqual([l]);
    expect(d.total).toBe(1);
    expect(await (await post(hapusRute, l)).json()).toEqual({
      tersimpan: false,
    });
    expect((await post(hapusRute, l)).status).toBe(200);
    expect(
      (await (await get(daftarSimpan, "/api/lowongan-tersimpan")).json()).total,
    ).toBe(0);
  });
  it("lowongan tidak ada atau tidak OPEN -> 404; id tidak valid -> 404", async () => {
    await masuk("tk1@kerjain.test");
    expect((await post(simpanRute, randomUUID())).status).toBe(404);
    expect((await post(simpanRute, buatLowongan("CLOSED_FULL"))).status).toBe(
      404,
    );
    expect((await post(simpanRute, "bukan-uuid")).status).toBe(404);
  });
  it("daftar milik pengguna sendiri saja; yang kemudian penuh tetap tampil dengan statusnya", async () => {
    const l = buatLowongan();
    await masuk("tk1@kerjain.test");
    await post(simpanRute, l);
    db.prepare(
      "UPDATE lowongan_pekerjaan SET status_lowongan='CLOSED_FULL', jumlah_diterima=1 WHERE id_lowongan=?",
    ).run(l);
    jar.clear();
    await masuk("tk2@kerjain.test");
    expect(
      (await (await get(daftarSimpan, "/api/lowongan-tersimpan")).json()).total,
    ).toBe(0);
    jar.clear();
    await masuk("tk1@kerjain.test");
    const d = await (await get(daftarSimpan, "/api/lowongan-tersimpan")).json();
    expect(d.items.find((i: { id: string }) => i.id === l)?.status).toBe(
      "CLOSED_FULL",
    );
  });
  it("tanpa sesi 401; PK dan CS 403", async () => {
    const l = buatLowongan();
    expect((await post(simpanRute, l)).status).toBe(401);
    expect((await get(daftarSimpan, "/api/lowongan-tersimpan")).status).toBe(
      401,
    );
    for (const email of ["pk1@kerjain.test", "cs1@kerjain.test"]) {
      jar.clear();
      await masuk(email);
      expect((await post(simpanRute, l)).status).toBe(403);
      expect((await post(hapusRute, l)).status).toBe(403);
      expect((await get(daftarSimpan, "/api/lowongan-tersimpan")).status).toBe(
        403,
      );
    }
  });
});

describe("#52 daftar dan detail tenaga kerja publik", () => {
  it("publik: hanya TK terverifikasi, tanpa email/saldo/rekening/dokumen", async () => {
    const r = await get(daftarTK, "/api/tenaga-kerja");
    expect(r.status).toBe(200);
    const raw = await r.json();
    const d = DaftarTKResponse.parse(raw);
    const verif = one<{ n: number }>(
      "SELECT COUNT(*) n FROM tenaga_kerja WHERE status_verifikasi = 'TERVERIFIKASI'",
    ).n;
    expect(d.total).toBe(verif);
    const json = JSON.stringify(raw);
    for (const rahasia of [
      "email",
      "saldo",
      "rekening",
      "dokumen",
      "@kerjain.test",
    ])
      expect(json).not.toContain(rahasia);
    expect(d.items.map((i) => i.id)).not.toContain(
      idPengguna("tk2@kerjain.test"),
    );
  });
  it("pencarian nama, karakter LIKE literal, dan validasi query", async () => {
    const nama = one<{ nama: string }>(
      "SELECT nama FROM pengguna WHERE email = 'tk1@kerjain.test'",
    ).nama;
    const d = await (
      await get(
        daftarTK,
        `/api/tenaga-kerja?q=${encodeURIComponent(nama.slice(0, 4).toUpperCase())}`,
      )
    ).json();
    expect(d.items.map((i: { nama: string }) => i.nama)).toContain(nama);
    expect(
      (await (await get(daftarTK, "/api/tenaga-kerja?q=%25")).json()).total,
    ).toBe(0);
    expect((await get(daftarTK, "/api/tenaga-kerja?page=0")).status).toBe(400);
    expect((await get(daftarTK, "/api/tenaga-kerja?x=1")).status).toBe(400);
  });
  it("detail: TK terverifikasi 200 dengan ulasan; belum terverifikasi, PK, dan id buruk 404", async () => {
    const ok = await get(detailTK, "/x", idPengguna("tk1@kerjain.test"));
    expect(ok.status).toBe(200);
    expect(Array.isArray((await ok.json()).ulasan)).toBe(true);
    expect(
      (await get(detailTK, "/x", idPengguna("tk2@kerjain.test"))).status,
    ).toBe(404);
    expect(
      (await get(detailTK, "/x", idPengguna("pk1@kerjain.test"))).status,
    ).toBe(404);
    expect((await get(detailTK, "/x", "bukan-uuid")).status).toBe(404);
    expect((await get(detailTK, "/x", randomUUID())).status).toBe(404);
  });
});

describe("#52 undangan", () => {
  const notif = (email: string) =>
    one<{ n: number }>(
      "SELECT COUNT(*) n FROM notifikasi WHERE id_penerima = (SELECT id_pengguna FROM pengguna WHERE email = ?)",
      email,
    ).n;
  it("PK pemilik mengundang: 201, notifikasi ke TK dengan tautan lowongan; undangan kedua 409", async () => {
    const l = buatLowongan();
    const tk = idPengguna("tk1@kerjain.test");
    const n = notif("tk1@kerjain.test");
    await masuk("pk1@kerjain.test");
    const r = await post(undangRute, tk, { idLowongan: l });
    expect(r.status).toBe(201);
    expect(notif("tk1@kerjain.test")).toBe(n + 1);
    expect(
      one<{ tautan: string }>(
        "SELECT tautan FROM notifikasi WHERE id_penerima = ? ORDER BY waktu_kirim DESC, rowid DESC LIMIT 1",
        tk,
      ).tautan,
    ).toBe(`/lowongan/${l}`);
    const lagi = await post(undangRute, tk, { idLowongan: l });
    expect(lagi.status).toBe(409);
    expect(await kode(lagi)).toBe("SUDAH_DIUNDANG");
    expect(notif("tk1@kerjain.test")).toBe(n + 1);
  });
  it("bukan pemilik 403; lowongan tidak OPEN 409; tidak ada 404; TK belum terverifikasi/PK 404", async () => {
    const milikLain = buatLowongan("OPEN", "pk1@kerjain.test");
    const penuh = buatLowongan("CLOSED_FULL");
    const tk = idPengguna("tk1@kerjain.test");
    const pk2 = randomUUID();
    db.prepare(
      `INSERT INTO pengguna (id_pengguna, nama, email, password_hash, peran, tanggal_lahir, persetujuan_privasi_at)
       VALUES (?, 'PK Lain', 'pk9@kerjain.test', 'x', 'PK', '1990-01-01', datetime('now'))`,
    ).run(pk2);
    db.prepare(
      "INSERT INTO penyedia_kerja (id_penyedia_kerja, id_pengguna) VALUES (?, ?)",
    ).run(randomUUID(), pk2);
    await masuk("pk9@kerjain.test");
    expect((await post(undangRute, tk, { idLowongan: milikLain })).status).toBe(
      403,
    );
    jar.clear();
    await masuk("pk1@kerjain.test");
    expect((await post(undangRute, tk, { idLowongan: penuh })).status).toBe(
      409,
    );
    expect(
      (await post(undangRute, tk, { idLowongan: randomUUID() })).status,
    ).toBe(404);
    expect(
      (
        await post(undangRute, idPengguna("tk2@kerjain.test"), {
          idLowongan: milikLain,
        })
      ).status,
    ).toBe(404);
    expect(
      (
        await post(undangRute, idPengguna("pk1@kerjain.test"), {
          idLowongan: milikLain,
        })
      ).status,
    ).toBe(404);
    expect((await post(undangRute, tk, { idLowongan: "x" })).status).toBe(400);
    expect(
      (await post(undangRute, tk, { idLowongan: milikLain, lain: 1 })).status,
    ).toBe(400);
  });
  it("tanpa sesi 401; TK dan CS 403", async () => {
    const l = buatLowongan();
    const tk = idPengguna("tk1@kerjain.test");
    expect((await post(undangRute, tk, { idLowongan: l })).status).toBe(401);
    for (const email of ["tk1@kerjain.test", "cs1@kerjain.test"]) {
      jar.clear();
      await masuk(email);
      expect((await post(undangRute, tk, { idLowongan: l })).status).toBe(403);
    }
  });
});
