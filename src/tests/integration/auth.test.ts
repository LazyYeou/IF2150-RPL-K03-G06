import { createHash } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { ZodError, z } from "zod";
import { AppError, toResponse } from "@/lib/errors";
import { originValid } from "@/lib/auth/origin";
import { middleware } from "@/middleware";

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
let sesi: typeof import("@/lib/auth/session");
let guards: typeof import("@/lib/auth/guards");
let password: typeof import("@/lib/auth/password");

const idPengguna = (email: string) =>
  (
    db
      .prepare("SELECT id_pengguna id FROM pengguna WHERE email = ?")
      .get(email) as { id: string }
  ).id;
const cekError = async (p: Promise<unknown>, code: string, status: number) =>
  expect(await p.catch((e) => e)).toMatchObject({ code, status });

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "kerjain-auth-"));
  process.env.DATABASE_PATH = path.join(dir, "test.db");
  // lib/db membuka koneksi saat diimpor, jadi DATABASE_PATH harus sudah diset (impor dinamis)
  const { bukaDb } = await import("@/db/open");
  const { migrate } = await import("@/scripts/migrate");
  const { seed } = await import("@/db/seed");
  const awal = bukaDb();
  migrate(awal);
  await seed(awal);
  awal.close();
  ({ db } = await import("@/lib/db"));
  sesi = await import("@/lib/auth/session");
  guards = await import("@/lib/auth/guards");
  password = await import("@/lib/auth/password");
});
afterAll(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
beforeEach(() => jar.clear());

describe("password (KNF01)", () => {
  it("hash Argon2id, verifikasi benar/salah, hash rusak = false", async () => {
    const h = await password.hashPassword("rahasia-123");
    expect(h).toMatch(/^\$argon2id\$/);
    expect(await password.verifyPassword(h, "rahasia-123")).toBe(true);
    expect(await password.verifyPassword(h, "salah")).toBe(false);
    expect(await password.verifyPassword("bukan-hash", "x")).toBe(false);
  });
});

describe("sesi", () => {
  it("DB menyimpan SHA-256 token, bukan token mentah; cookie HttpOnly diset", async () => {
    await sesi.buatSesi(idPengguna("tk1@kerjain.test"));
    const token = jar.get(sesi.NAMA_COOKIE)!;
    const sha = createHash("sha256").update(token).digest("hex");
    expect(
      db.prepare("SELECT 1 FROM sesi WHERE id_sesi = ?").get(token),
    ).toBeUndefined();
    expect(
      db.prepare("SELECT 1 FROM sesi WHERE id_sesi = ?").get(sha),
    ).toBeDefined();
    expect(await sesi.bacaSesi()).toMatchObject({
      email: "tk1@kerjain.test",
      peran: "TK",
    });
  });
  it("token baru setiap login", async () => {
    const id = idPengguna("tk1@kerjain.test");
    await sesi.buatSesi(id);
    const a = jar.get(sesi.NAMA_COOKIE);
    await sesi.buatSesi(id);
    expect(jar.get(sesi.NAMA_COOKIE)).not.toBe(a);
  });
  it("sesi kedaluwarsa ditolak; tanpa cookie = null", async () => {
    expect(await sesi.bacaSesi()).toBeNull();
    await sesi.buatSesi(idPengguna("pk1@kerjain.test"));
    db.exec("UPDATE sesi SET expires_at = datetime('now', '-1 minute')");
    expect(await sesi.bacaSesi()).toBeNull();
  });
  it("logout menghapus sesi; hapusSemuaSesi (reset sandi) mematikan sesi lain", async () => {
    const id = idPengguna("cs1@kerjain.test");
    await sesi.buatSesi(id);
    await sesi.hapusSesi();
    expect(jar.has(sesi.NAMA_COOKIE)).toBe(false);
    expect(
      db.prepare("SELECT count(*) c FROM sesi WHERE id_pengguna = ?").get(id),
    ).toMatchObject({ c: 0 });
    await sesi.buatSesi(id);
    sesi.hapusSemuaSesi(id);
    expect(await sesi.bacaSesi()).toBeNull();
  });
  it("memperpanjang sesi yang hampir habis", async () => {
    db.exec("DELETE FROM sesi"); // sisa sesi dari test lain akan mengaburkan hasil
    await sesi.buatSesi(idPengguna("tk1@kerjain.test"));
    db.exec("UPDATE sesi SET expires_at = datetime('now', '+1 day')");
    await sesi.bacaSesi();
    const { dalam } = db
      .prepare(
        "SELECT expires_at > datetime('now', '+6 days') AS dalam FROM sesi",
      )
      .get() as { dalam: number };
    expect(dalam).toBe(1);
  });
});

describe("guard (401/403 konsisten)", () => {
  const masuk = (email: string) => sesi.buatSesi(idPengguna(email));
  it("requireUser tanpa sesi -> 401 UNAUTHENTICATED", async () => {
    await cekError(guards.requireUser(), "UNAUTHENTICATED", 401);
  });
  it("requireRole salah peran -> 403 FORBIDDEN", async () => {
    await masuk("tk1@kerjain.test");
    await cekError(guards.requireRole("PK"), "FORBIDDEN", 403);
    await cekError(guards.requireCS(), "FORBIDDEN", 403);
    expect(await guards.requireRole("TK", "PK")).toMatchObject({ peran: "TK" });
  });
  it("requireCS menerima CS", async () => {
    await masuk("cs1@kerjain.test");
    expect(await guards.requireCS()).toMatchObject({ peran: "CS" });
  });
  it("requireVerifiedTK: belum/menunggu verifikasi -> 403 NOT_VERIFIED, terverifikasi lolos (KF06)", async () => {
    await masuk("tk2@kerjain.test");
    await cekError(guards.requireVerifiedTK(), "NOT_VERIFIED", 403);
    await masuk("tk3@kerjain.test");
    await cekError(guards.requireVerifiedTK(), "NOT_VERIFIED", 403);
    await masuk("tk1@kerjain.test");
    expect(await guards.requireVerifiedTK()).toHaveProperty("idTenagaKerja");
    await masuk("pk1@kerjain.test");
    await cekError(guards.requireVerifiedTK(), "FORBIDDEN", 403);
  });
  it("requireOwner menolak bukan pemilik", () => {
    expect(() => guards.requireOwner("a", "b")).toThrow(AppError);
    expect(() => guards.requireOwner("a", "a")).not.toThrow();
  });
});

describe("errors", () => {
  it("AppError -> { error: { code, message, fields } } dengan status-nya", async () => {
    const r = toResponse(new AppError("KUOTA_PENUH", 409, "Kuota penuh"));
    expect(r.status).toBe(409);
    expect(await r.json()).toEqual({
      error: { code: "KUOTA_PENUH", message: "Kuota penuh" },
    });
  });
  it("ZodError -> 400 VALIDATION_ERROR dengan fields per field", async () => {
    const err = z.object({ judul: z.string().min(8) }).safeParse({ judul: "a" })
      .error as ZodError;
    const r = toResponse(err);
    expect(r.status).toBe(400);
    expect((await r.json()).error).toMatchObject({
      code: "VALIDATION_ERROR",
      fields: { judul: expect.any(String) },
    });
  });
  it("error tak dikenal -> 500 tanpa membocorkan detail", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = toResponse(new Error("rahasia internal"));
    expect(r.status).toBe(500);
    expect(JSON.stringify(await r.json())).not.toContain("rahasia");
    spy.mockRestore();
  });
});

describe("middleware & CSRF", () => {
  it("/tk /pk /cs tanpa cookie -> redirect /masuk?next=", () => {
    const r = middleware(
      new NextRequest("http://localhost:3000/pk/lowongan?x=1"),
    );
    expect(r.status).toBe(307);
    expect(r.headers.get("location")).toBe(
      "http://localhost:3000/masuk?next=%2Fpk%2Flowongan%3Fx%3D1",
    );
  });
  it("dengan cookie -> lanjut", () => {
    const r = middleware(
      new NextRequest("http://localhost:3000/tk", {
        headers: { cookie: "kerjain_sesi=abc" },
      }),
    );
    expect(r.headers.get("location")).toBeNull();
  });
  it("POST /api dengan Origin asing -> 403; Origin sendiri/kosong lolos; webhook dikecualikan", async () => {
    const post = (url: string, origin?: string) =>
      middleware(
        new NextRequest(url, {
          method: "POST",
          headers: origin ? { origin } : {},
        }),
      );
    const r = post(
      "http://localhost:3000/api/lowongan",
      "https://jahat.example",
    );
    expect(r.status).toBe(403);
    expect((await r.json()).error.code).toBe("ORIGIN_TIDAK_VALID");
    expect(
      post("http://localhost:3000/api/lowongan", "http://localhost:3000")
        .status,
    ).toBe(200);
    expect(post("http://localhost:3000/api/lowongan").status).toBe(200);
    expect(
      post(
        "http://localhost:3000/api/webhooks/payment",
        "https://gateway.example",
      ).status,
    ).toBe(200);
  });
  it("originValid", () => {
    expect(originValid("http://localhost:3000", "http://localhost:3000")).toBe(
      true,
    );
    expect(originValid("http://localhost:3001", "http://localhost:3000")).toBe(
      false,
    );
    expect(originValid("bukan-url", "http://localhost:3000")).toBe(false);
  });
});
