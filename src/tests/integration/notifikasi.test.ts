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
  DaftarNotifikasiResponse,
  tautanNotifikasi,
} from "@/lib/validation/notifikasi";
import fixture from "@/views/__fixtures__/notifikasi.json";
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
let sesi: typeof import("@/lib/auth/session");
let controller: typeof import("@/controllers/NotifikasiController");
let daftar: typeof import("@/app/api/notifikasi/route").GET;
let baca: typeof import("@/app/api/notifikasi/[id]/baca/route").POST;
let dir: string;
const user = (email: string) =>
  (
    db
      .prepare("SELECT id_pengguna AS id FROM pengguna WHERE email = ?")
      .get(email) as { id: string }
  ).id;
const list = (query = "") =>
  daftar(new Request(`http://localhost:3000/api/notifikasi${query}`));
const read = (id: string) =>
  baca(
    new Request(`http://localhost:3000/api/notifikasi/${id}/baca`, {
      method: "POST",
    }),
    { params: Promise.resolve({ id }) },
  );
async function masuk(email = "tk1@kerjain.test") {
  await sesi.buatSesi(user(email));
}
async function kirim(email: string, pesan = "Kabar baru", tautan?: string) {
  await controller.kirimNotifikasi(user(email), pesan, tautan);
  return (
    db
      .prepare(
        "SELECT id_notifikasi AS id FROM notifikasi ORDER BY rowid DESC LIMIT 1",
      )
      .get() as { id: string }
  ).id;
}
beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "kerjain-notifikasi-"));
  process.env.DATABASE_PATH = path.join(dir, "test.db");
  const { bukaDb } = await import("@/db/open");
  const { migrate } = await import("@/scripts/migrate");
  const { seed } = await import("@/db/seed");
  const awal = bukaDb();
  migrate(awal);
  await seed(awal);
  awal.close();
  ({ db } = await import("@/lib/db"));
  sesi = await import("@/lib/auth/session");
  controller = await import("@/controllers/NotifikasiController");
  ({ GET: daftar } = await import("@/app/api/notifikasi/route"));
  ({ POST: baca } = await import("@/app/api/notifikasi/[id]/baca/route"));
});
beforeEach(() => {
  jar.token = "";
  db.exec("DELETE FROM notifikasi");
});
afterAll(() => {
  db?.close();
  if (dir) rmSync(dir, { recursive: true, force: true });
});
describe("notifikasi (#28)", () => {
  it("fixture UI mengikuti kontrak respons", () => {
    expect(() => DaftarNotifikasiResponse.parse(fixture)).not.toThrow();
  });
  it("GET dan POST tanpa sesi menghasilkan 401", async () => {
    expect((await list()).status).toBe(401);
    expect((await read(randomUUID())).status).toBe(401);
  });
  it.each(["tk1", "pk1", "cs1"])(
    "daftar %s hanya berisi notifikasi sendiri",
    async (akun) => {
      const email = `${akun}@kerjain.test`;
      const id = await kirim(email, "Punya saya", "/profil");
      await kirim("tk2@kerjain.test", "Rahasia orang lain");
      await masuk(email);
      const r = await list();
      expect(r.status).toBe(200);
      expect(r.headers.get("cache-control")).toBe("no-store");
      const hasil = DaftarNotifikasiResponse.parse(await r.json());
      expect(hasil).toMatchObject({
        jumlahBelumDibaca: 1,
        items: [{ id, pesan: "Punya saya", tautan: "/profil", dibaca: false }],
      });
      expect(hasil.items).toHaveLength(1);
      expect(hasil.items[0].waktuKirim).toMatch(/Z$/);
    },
  );
  it("maksimal 20 terbaru, hitungan mencakup seluruh notifikasi belum dibaca", async () => {
    const ids: string[] = [];
    for (let i = 0; i < 25; i++)
      ids.push(await kirim("tk1@kerjain.test", `Kabar ${i}`));
    db.exec("UPDATE notifikasi SET waktu_kirim = '2026-11-07 03:00:00'");
    await masuk();
    const hasil = DaftarNotifikasiResponse.parse(await (await list()).json());
    expect(hasil.items.map((item) => item.id)).toEqual(
      ids.reverse().slice(0, 20),
    );
    expect(hasil.jumlahBelumDibaca).toBe(25);
  });
  it("tandai milik sendiri idempoten 204 dan filter belum dibaca", async () => {
    const id = await kirim("tk1@kerjain.test");
    const id2 = await kirim("tk1@kerjain.test", "Masih baru");
    await masuk();
    const r = await read(id);
    expect(r.status).toBe(204);
    expect(await r.text()).toBe("");
    expect((await read(id)).status).toBe(204);
    expect(await (await list("?belumDibaca=true")).json()).toMatchObject({
      jumlahBelumDibaca: 1,
      items: [{ id: id2, dibaca: false }],
    });
    expect((await (await list()).json()).items).toHaveLength(2);
  });
  it("menandai milik orang lain menghasilkan 404 dan tidak mengubah data", async () => {
    const id = await kirim("pk1@kerjain.test", "Milik PK");
    await masuk();
    const r = await read(id);
    expect(r.status).toBe(404);
    expect((await r.json()).error.code).toBe("NOT_FOUND");
    expect(
      db
        .prepare("SELECT status_baca FROM notifikasi WHERE id_notifikasi = ?")
        .get(id),
    ).toEqual({ status_baca: 0 });
    expect((await read(randomUUID())).status).toBe(404);
    expect((await read("bukan-uuid")).status).toBe(404);
  });
  it("query tidak valid ditolak, daftar kosong memiliki hitungan nol", async () => {
    await masuk();
    expect(await (await list()).json()).toEqual({
      items: [],
      jumlahBelumDibaca: 0,
    });
    for (const q of ["?belumDibaca=false", "?idPengguna=korban", "?page=2"])
      expect((await list(q)).status).toBe(400);
  });
  it("signature kirimNotifikasi tetap mendukung tautan opsional dan FK pengguna", async () => {
    const id = await kirim("tk1@kerjain.test");
    expect(
      db
        .prepare("SELECT tautan FROM notifikasi WHERE id_notifikasi = ?")
        .get(id),
    ).toEqual({ tautan: null });
    await expect(
      controller.kirimNotifikasi(randomUUID(), "Tidak ada penerima"),
    ).rejects.toThrow(/FOREIGN KEY/);
  });
});
describe("tautan notifikasi aman", () => {
  it("menerima route internal dan menolak navigasi eksternal/protokol berbahaya", () => {
    expect(tautanNotifikasi("/tk/pekerjaan?status=baru#hasil")).toBe(
      "/tk/pekerjaan?status=baru#hasil",
    );
    for (const value of [
      null,
      "",
      "javascript:alert(1)",
      "https://example.com",
      "//example.com",
      "/\\example.com",
      "/\n/example.com",
    ])
      expect(tautanNotifikasi(value)).toBeNull();
  });
});
