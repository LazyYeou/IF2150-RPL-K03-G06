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
import { Penawaran, PenawaranSayaResponse } from "@/lib/validation/penawaran";

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
let ajukan: typeof import("@/app/api/penawaran/route");
let saya: typeof import("@/app/api/penawaran/saya/route");
let tarik: typeof import("@/app/api/penawaran/[id]/tarik/route");
let LOWONGAN: string;

const BASE = "http://localhost/api/penawaran";
const one = <T>(sql: string, ...p: unknown[]) => db.prepare(sql).get(...p) as T;
const body = (o: object = {}) => ({
  idLowongan: LOWONGAN,
  hargaPenawaran: 300000,
  ketersediaan: "Kamis pagi",
  ...o,
});
const kirim = (b: unknown) =>
  ajukan.POST(new Request(BASE, { method: "POST", body: JSON.stringify(b) }));
const lamaran = (qs = "") => saya.GET(new Request(`${BASE}/saya${qs}`));
const tariklah = (id: string) =>
  tarik.POST(new Request(`${BASE}/${id}/tarik`, { method: "POST" }), {
    params: Promise.resolve({ id }),
  });
const kode = async (r: Response) => (await r.json()).error?.code;
const notifPK = () =>
  db
    .prepare(
      "SELECT pesan_notifikasi p, tautan t FROM notifikasi n JOIN pengguna u ON u.id_pengguna = n.id_penerima WHERE u.email = 'pk1@kerjain.test'",
    )
    .all() as { p: string; t: string }[];

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "kerjain-penawaran-"));
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
  ajukan = await import("@/app/api/penawaran/route");
  saya = await import("@/app/api/penawaran/saya/route");
  tarik = await import("@/app/api/penawaran/[id]/tarik/route");
  masuk = (email) =>
    buatSesi(
      one<{ id: string }>(
        "SELECT id_pengguna id FROM pengguna WHERE email = ?",
        email,
      ).id,
    );
  LOWONGAN = one<{ id: string }>(
    "SELECT id_lowongan id FROM lowongan_pekerjaan WHERE status_lowongan = 'OPEN' LIMIT 1",
  ).id;
});
afterAll(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
beforeEach(() => jar.clear());

describe("POST /api/penawaran (KF10, KF11)", () => {
  it("TK terverifikasi: 201, status MENUNGGU, sesuai skema, PK dapat notifikasi", async () => {
    await masuk("tk1@kerjain.test");
    const r = await kirim(body({ pesan: "Siap membawa alat" }));
    expect(r.status).toBe(201);
    const p = Penawaran.parse(await r.json());
    expect(p).toMatchObject({
      status: "MENUNGGU",
      hargaPenawaran: 300000,
      pesan: "Siap membawa alat",
    });
    expect(p.lowongan.id).toBe(LOWONGAN);
    expect(
      notifPK().some((n) => n.t === `/pk/lowongan/${LOWONGAN}/pelamar`),
    ).toBe(true);
  });
  it("penawaran kedua yang masih aktif -> 409 PENAWARAN_GANDA", async () => {
    await masuk("tk1@kerjain.test");
    const r = await kirim(body());
    expect(r.status).toBe(409);
    expect(await kode(r)).toBe("PENAWARAN_GANDA");
  });
  it("TK belum terverifikasi -> 403 NOT_VERIFIED; PK/CS -> 403; tanpa sesi -> 401", async () => {
    await masuk("tk2@kerjain.test");
    const r = await kirim(body());
    expect(r.status).toBe(403);
    expect(await kode(r)).toBe("NOT_VERIFIED");
    for (const email of ["pk1@kerjain.test", "cs1@kerjain.test"]) {
      jar.clear();
      await masuk(email);
      expect((await kirim(body())).status, email).toBe(403);
    }
    jar.clear();
    expect((await kirim(body())).status).toBe(401);
  });
  it("input tidak valid -> 400; id pelaku dari body ditolak; lowongan tak ada -> 404", async () => {
    await masuk("tk1@kerjain.test");
    expect((await kirim(body({ hargaPenawaran: 999 }))).status).toBe(400);
    expect((await kirim(body({ ketersediaan: "" }))).status).toBe(400);
    expect((await kirim(body({ idTenagaKerja: "x" }))).status).toBe(400);
    expect((await kirim(body({ idLowongan: randomUUID() }))).status).toBe(404);
  });
  it("lowongan penuh/ditutup -> 409 KUOTA_PENUH", async () => {
    const penuh = one<{ id: string }>(
      "SELECT id_lowongan id FROM lowongan_pekerjaan WHERE status_lowongan = 'OPEN' AND id_lowongan <> ? LIMIT 1",
      LOWONGAN,
    ).id;
    db.prepare(
      "UPDATE lowongan_pekerjaan SET status_lowongan = 'CLOSED_FULL', jumlah_diterima = kuota WHERE id_lowongan = ?",
    ).run(penuh);
    await masuk("tk1@kerjain.test");
    const r = await kirim(body({ idLowongan: penuh }));
    expect(r.status).toBe(409);
    expect(await kode(r)).toBe("KUOTA_PENUH");
  });
});

describe("GET /api/penawaran/saya", () => {
  it("TK melihat lamarannya sesuai skema, filter status, PK 403", async () => {
    await masuk("tk1@kerjain.test");
    const semua = PenawaranSayaResponse.parse(await (await lamaran()).json());
    expect(
      semua.items.some(
        (i) => i.lowongan.id === LOWONGAN && i.status === "MENUNGGU",
      ),
    ).toBe(true);
    const ditarik = PenawaranSayaResponse.parse(
      await (await lamaran("?status=DITARIK")).json(),
    );
    expect(ditarik.items.every((i) => i.status === "DITARIK")).toBe(true);
    expect((await lamaran("?status=ACAK")).status).toBe(400);
    jar.clear();
    await masuk("pk1@kerjain.test");
    expect((await lamaran()).status).toBe(403);
  });
});

describe("POST /api/penawaran/:id/tarik", () => {
  const idMenunggu = () =>
    one<{ id: string }>(
      "SELECT id_penawaran id FROM pengajuan_penawaran WHERE id_lowongan = ? AND status_penawaran = 'MENUNGGU'",
      LOWONGAN,
    ).id;

  it("bukan pemilik -> 403; id tak ada / bukan UUID -> 404", async () => {
    db.prepare(
      "UPDATE tenaga_kerja SET status_verifikasi = 'TERVERIFIKASI' WHERE status_verifikasi = 'BELUM_TERVERIFIKASI'",
    ).run();
    await masuk("tk2@kerjain.test"); // TK lain
    expect((await tariklah(idMenunggu())).status).toBe(403);
    expect((await tariklah(randomUUID())).status).toBe(404);
    expect((await tariklah("bukan-uuid")).status).toBe(404);
  });
  it("pemilik menarik: DITARIK; kedua kali -> 409; boleh mengajukan ulang", async () => {
    await masuk("tk1@kerjain.test");
    const id = idMenunggu();
    const r = await tariklah(id);
    expect(r.status).toBe(200);
    expect(Penawaran.parse(await r.json()).status).toBe("DITARIK");
    const lagi = await tariklah(id);
    expect(lagi.status).toBe(409);
    expect(await kode(lagi)).toBe("STATUS_TIDAK_VALID");
    expect((await kirim(body())).status).toBe(201); // aktif lagi setelah ditarik
  });
  it("penawaran yang sudah DITERIMA tidak bisa ditarik", async () => {
    const id = idMenunggu();
    db.prepare(
      "UPDATE pengajuan_penawaran SET status_penawaran = 'DITERIMA' WHERE id_penawaran = ?",
    ).run(id);
    await masuk("tk1@kerjain.test");
    expect((await tariklah(id)).status).toBe(409);
  });
});
