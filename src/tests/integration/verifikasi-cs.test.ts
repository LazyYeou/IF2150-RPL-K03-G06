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
  AntreanVerifikasiResponse,
  HasilVerifikasiResponse,
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

const PNG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 9, 8, 7,
]);
type Db = typeof import("@/lib/db").db;
let dir: string;
let db: Db;
let masuk: (email: string) => Promise<void>;
let antrean: typeof import("@/app/api/cs/verifikasi/route");
let dokumen: typeof import("@/app/api/cs/verifikasi/[idTK]/dokumen/route");
let setujui: typeof import("@/app/api/cs/verifikasi/[idTK]/setujui/route");
let tolak: typeof import("@/app/api/cs/verifikasi/[idTK]/tolak/route");
let guards: typeof import("@/lib/auth/guards");
let TK3: string;
let TK2: string;

const one = <T>(sql: string, ...p: unknown[]) => db.prepare(sql).get(...p) as T;
const idTK = (email: string) =>
  one<{ id: string }>(
    "SELECT id_tenaga_kerja id FROM tenaga_kerja t JOIN pengguna u USING (id_pengguna) WHERE u.email = ?",
    email,
  ).id;
const ctx = (id: string) => ({ params: Promise.resolve({ idTK: id }) });
const URL_ = "http://localhost/api/cs/verifikasi";
const putus = (id: string, body?: unknown) =>
  tolak.POST(
    new Request(`${URL_}/${id}/tolak`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
    ctx(id),
  );
const setuju = (id: string) =>
  setujui.POST(
    new Request(`${URL_}/${id}/setujui`, { method: "POST" }),
    ctx(id),
  );
const statusTK = (id: string) =>
  one<{ s: string; a: string | null }>(
    "SELECT status_verifikasi s, alasan_penolakan a FROM tenaga_kerja WHERE id_tenaga_kerja = ?",
    id,
  );
const notif = (email: string) =>
  db
    .prepare(
      "SELECT pesan_notifikasi p FROM notifikasi n JOIN pengguna u ON u.id_pengguna = n.id_penerima WHERE u.email = ?",
    )
    .all(email) as { p: string }[];

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "kerjain-vcs-"));
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
  guards = await import("@/lib/auth/guards");
  antrean = await import("@/app/api/cs/verifikasi/route");
  dokumen = await import("@/app/api/cs/verifikasi/[idTK]/dokumen/route");
  setujui = await import("@/app/api/cs/verifikasi/[idTK]/setujui/route");
  tolak = await import("@/app/api/cs/verifikasi/[idTK]/tolak/route");
  masuk = (email) =>
    buatSesi(
      one<{ id: string }>(
        "SELECT id_pengguna id FROM pengguna WHERE email = ?",
        email,
      ).id,
    );
  TK3 = idTK("tk3@kerjain.test"); // MENUNGGU_VERIFIKASI dari seed
  TK2 = idTK("tk2@kerjain.test");
});
afterAll(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
beforeEach(() => jar.clear());

describe("GET /api/cs/verifikasi (KF05, KNF19)", () => {
  it("CS melihat antrean MENUNGGU sesuai skema", async () => {
    await masuk("cs1@kerjain.test");
    const r = AntreanVerifikasiResponse.parse(
      await (await antrean.GET()).json(),
    );
    expect(r.items.map((i) => i.idTenagaKerja)).toEqual([TK3]);
  });
  it("non-CS -> 403, tanpa sesi -> 401", async () => {
    for (const email of ["tk1@kerjain.test", "pk1@kerjain.test"]) {
      jar.clear();
      await masuk(email);
      expect((await antrean.GET()).status, email).toBe(403);
    }
    jar.clear();
    expect((await antrean.GET()).status).toBe(401);
  });
});

describe("GET /api/cs/verifikasi/:idTK/dokumen (KNF02)", () => {
  it("tanpa dokumen -> 404; id bukan UUID -> 404", async () => {
    await masuk("cs1@kerjain.test");
    expect((await dokumen.GET(new Request(URL_), ctx(TK3))).status).toBe(404);
    expect(
      (await dokumen.GET(new Request(URL_), ctx("bukan-uuid"))).status,
    ).toBe(404);
    expect(
      (await dokumen.GET(new Request(URL_), ctx(randomUUID()))).status,
    ).toBe(404);
  });
  it("CS menerima isi terdekripsi tanpa cache; TK ditolak 403", async () => {
    const { simpanBerkas } = await import("@/lib/storage");
    const { path: p } = await simpanBerkas(
      "identitas",
      new File([PNG], "ktp.png", { type: "image/png" }),
      { enkripsi: true },
    );
    db.prepare(
      "UPDATE tenaga_kerja SET dokumen_identitas_path = ? WHERE id_tenaga_kerja = ?",
    ).run(p, TK3);

    await masuk("cs1@kerjain.test");
    const r = await dokumen.GET(new Request(URL_), ctx(TK3));
    expect(r.status).toBe(200);
    expect(r.headers.get("Cache-Control")).toBe("no-store");
    expect(r.headers.get("Content-Type")).toBe("image/png");
    expect(new Uint8Array(await r.arrayBuffer())).toEqual(PNG);

    jar.clear();
    await masuk("tk3@kerjain.test"); // pemilik pun tidak boleh lewat endpoint CS
    expect((await dokumen.GET(new Request(URL_), ctx(TK3))).status).toBe(403);
  });
});

describe("setujui / tolak (KF05, KF06)", () => {
  it("non-CS tidak bisa memutus; TK belum terverifikasi terkena gate NOT_VERIFIED", async () => {
    await masuk("tk1@kerjain.test");
    expect((await setuju(TK3)).status).toBe(403);
    jar.clear();
    await masuk("tk3@kerjain.test");
    await expect(guards.requireVerifiedTK()).rejects.toMatchObject({
      code: "NOT_VERIFIED",
      status: 403,
    });
  });
  it("setujui: TERVERIFIKASI, notifikasi terkirim, gate KF06 terbuka; kedua kali -> 409", async () => {
    await masuk("cs1@kerjain.test");
    const r = await setuju(TK3);
    expect(r.status).toBe(200);
    expect(HasilVerifikasiResponse.parse(await r.json()).status).toBe(
      "TERVERIFIKASI",
    );
    expect(statusTK(TK3).s).toBe("TERVERIFIKASI");
    expect(
      notif("tk3@kerjain.test").some((n) => /terverifikasi/i.test(n.p)),
    ).toBe(true);

    expect((await setuju(TK3)).status).toBe(409);
    expect((await putus(TK3, { alasan: "tidak jelas" })).status).toBe(409);
    expect((await setuju(randomUUID())).status).toBe(404);

    jar.clear();
    await masuk("tk3@kerjain.test");
    await expect(guards.requireVerifiedTK()).resolves.toHaveProperty(
      "idTenagaKerja",
      TK3,
    );
  });
  it("tolak: alasan wajib (400), lalu DITOLAK dengan alasan dan notifikasi; kedua kali -> 409", async () => {
    db.prepare(
      "UPDATE tenaga_kerja SET status_verifikasi = 'MENUNGGU_VERIFIKASI', waktu_pengajuan_verifikasi = datetime('now') WHERE id_tenaga_kerja = ?",
    ).run(TK2);
    await masuk("cs1@kerjain.test");
    for (const body of [
      undefined,
      {},
      { alasan: "abcd" },
      { alasan: "x".repeat(501) },
    ]) {
      const r = await putus(TK2, body);
      expect(r.status).toBe(400);
    }
    expect(statusTK(TK2).s).toBe("MENUNGGU_VERIFIKASI");

    const r = await putus(TK2, { alasan: "Foto KTP buram" });
    expect(HasilVerifikasiResponse.parse(await r.json()).status).toBe(
      "DITOLAK",
    );
    expect(statusTK(TK2)).toEqual({ s: "DITOLAK", a: "Foto KTP buram" });
    expect(
      notif("tk2@kerjain.test").some((n) => n.p.includes("Foto KTP buram")),
    ).toBe(true);
    expect((await putus(TK2, { alasan: "Foto KTP buram" })).status).toBe(409);
  });
});
