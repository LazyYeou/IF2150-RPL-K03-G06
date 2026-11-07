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
import { ProfilResponse } from "@/lib/validation/profil";
import fixture from "@/views/__fixtures__/profil.json";
const jar = vi.hoisted(() => ({ token: "" }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => (jar.token ? { value: jar.token } : undefined),
    set: (_: string, token: string) => {
      jar.token = token;
    },
    delete: () => {
      jar.token = "";
    },
  }),
}));
let db: typeof import("@/lib/db").db;
let session: typeof import("@/lib/auth/session");
let routes: typeof import("@/app/api/profil/route");
let dir: string;
const req = (data: unknown) =>
  new Request("http://localhost:3000/api/profil", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
const cari = (email: string) =>
  db
    .prepare("SELECT id_pengguna AS id FROM pengguna WHERE email = ?")
    .get(email) as { id: string };
async function masuk(email = "tk1@kerjain.test") {
  await session.buatSesi(cari(email).id);
}
beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "kerjain-profil-"));
  process.env.DATABASE_PATH = path.join(dir, "test.db");
  const { bukaDb } = await import("@/db/open");
  const { migrate } = await import("@/scripts/migrate");
  const { seed } = await import("@/db/seed");
  const awal = bukaDb();
  migrate(awal);
  await seed(awal);
  awal.close();
  ({ db } = await import("@/lib/db"));
  session = await import("@/lib/auth/session");
  routes = await import("@/app/api/profil/route");
});
beforeEach(() => {
  jar.token = "";
});
afterAll(() => {
  db?.close();
  if (dir) rmSync(dir, { recursive: true, force: true });
});

describe("profil saya (#27)", () => {
  it("fixture frontend mengikuti skema respons", () => {
    expect(() => ProfilResponse.parse(fixture)).not.toThrow();
  });
  it("GET/PATCH tanpa sesi ditolak 401", async () => {
    expect((await routes.GET()).status).toBe(401);
    expect((await routes.PATCH(req({ nama: "Baru" }))).status).toBe(401);
  });
  it.each(["tk1", "pk1", "cs1"])(
    "GET profil %s hanya memuat data aman dari sesi",
    async (akun) => {
      await masuk(`${akun}@kerjain.test`);
      const r = await routes.GET();
      expect(r.status).toBe(200);
      expect(r.headers.get("cache-control")).toBe("no-store");
      const profil = ProfilResponse.parse(await r.json());
      expect(profil.email).toBe(`${akun}@kerjain.test`);
      if (akun === "tk1") expect(profil.statusVerifikasi).toBe("TERVERIFIKASI");
      else expect(profil.statusVerifikasi).toBeUndefined();
      expect(JSON.stringify(profil)).not.toMatch(
        /password|token|dokumen|tanggal_lahir/,
      );
    },
  );
  it("PATCH menyimpan milik sendiri, tidak mengubah akun lain, dan nama sesi terbaca terbaru", async () => {
    await masuk();
    const id = cari("tk1@kerjain.test").id;
    const orangLain = db
      .prepare("SELECT * FROM pengguna WHERE email = ?")
      .get("pk1@kerjain.test");
    const r = await routes.PATCH(
      req({
        nama: " Nama Baru ",
        areaLayanan: " Bandung ",
        bio: "Pengalaman kerja harian",
      }),
    );
    expect(r.status).toBe(200);
    expect(ProfilResponse.parse(await r.json())).toMatchObject({
      id,
      nama: "Nama Baru",
      areaLayanan: "Bandung",
      bio: "Pengalaman kerja harian",
    });
    expect(
      db
        .prepare("SELECT * FROM pengguna WHERE email = ?")
        .get("pk1@kerjain.test"),
    ).toEqual(orangLain);
    expect(await session.bacaSesi()).toMatchObject({ nama: "Nama Baru" });
  });
  it("batas 80/150/1000 diterima, batas lebih dan nama kosong ditolak tanpa menyimpan", async () => {
    await masuk();
    expect(
      (
        await routes.PATCH(
          req({
            nama: "a".repeat(80),
            areaLayanan: "b".repeat(150),
            bio: "c".repeat(1000),
          }),
        )
      ).status,
    ).toBe(200);
    const sebelum = await (await routes.GET()).json();
    for (const data of [
      { nama: "a".repeat(81) },
      { nama: " " },
      { areaLayanan: "b".repeat(151) },
      { bio: "c".repeat(1001) },
      {},
    ]) {
      const r = await routes.PATCH(req(data));
      expect(r.status).toBe(400);
      expect((await r.json()).error.code).toBe("VALIDATION_ERROR");
    }
    expect(await (await routes.GET()).json()).toEqual(sebelum);
  });
  it("field di luar kontrak ditolak termasuk ID korban, peran, rating, email, status", async () => {
    await masuk();
    for (const data of [
      { id: cari("pk1@kerjain.test").id },
      { peran: "CS" },
      { email: "lain@kerjain.test" },
      { akumulasiRating: 5 },
      { jumlahUlasan: 99 },
      { statusVerifikasi: "TERVERIFIKASI" },
    ])
      expect(
        (await routes.PATCH(req({ nama: "Tidak Tersimpan", ...data }))).status,
      ).toBe(400);
  });
  it("PATCH parsial mempertahankan field lain dan string kosong mengosongkan area/bio", async () => {
    await masuk();
    await routes.PATCH(
      req({ nama: "Nama Tetap", areaLayanan: "Cimahi", bio: "Bio awal" }),
    );
    const r = await routes.PATCH(req({ bio: "Bio baru" }));
    expect(await r.json()).toMatchObject({
      nama: "Nama Tetap",
      areaLayanan: "Cimahi",
      bio: "Bio baru",
    });
    expect(
      await (await routes.PATCH(req({ areaLayanan: "", bio: " " }))).json(),
    ).toMatchObject({ areaLayanan: null, bio: null });
  });
  it("rating/verifikasi tetap setelah profil disimpan", async () => {
    await masuk();
    const id = cari("tk1@kerjain.test").id;
    db.prepare(
      "UPDATE pengguna SET akumulasi_rating = 4.5, jumlah_ulasan = 2 WHERE id_pengguna = ?",
    ).run(id);
    expect(
      await (await routes.PATCH(req({ nama: "Nama Rating" }))).json(),
    ).toMatchObject({
      akumulasiRating: 4.5,
      jumlahUlasan: 2,
      statusVerifikasi: "TERVERIFIKASI",
    });
  });
  it("JSON rusak dan tipe field salah menghasilkan 400", async () => {
    await masuk();
    expect(
      (
        await routes.PATCH(
          new Request("http://localhost/api/profil", {
            method: "PATCH",
            body: "{",
          }),
        )
      ).status,
    ).toBe(400);
    expect((await routes.PATCH(req({ bio: null }))).status).toBe(400);
  });
});
