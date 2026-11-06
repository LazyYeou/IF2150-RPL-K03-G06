import { createHash, randomUUID } from "node:crypto";
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
import { validasiBatasUsia, AuthResponse } from "@/lib/validation/auth";
import authFixture from "@/views/__fixtures__/auth.json";

const cookie = vi.hoisted(() => ({
  value: "",
  options: {} as Record<string, unknown>,
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => (cookie.value ? { value: cookie.value } : undefined),
    set: (_: string, value: string, options: Record<string, unknown>) => {
      cookie.value = value;
      cookie.options = options;
    },
    delete: () => {
      cookie.value = "";
    },
  }),
}));

let db: typeof import("@/lib/db").db;
let dir: string;
let register: typeof import("@/app/api/auth/register/route").POST;
let login: typeof import("@/app/api/auth/login/route").POST;
let logout: typeof import("@/app/api/auth/logout/route").POST;
let controller: typeof import("@/controllers/PenggunaController");
let limiter: typeof import("@/lib/auth/rate-limit");
const input = (extra = {}) => ({
  nama: "Akun Uji",
  email: `${randomUUID()}@example.test`,
  password: "Password123!",
  peran: "TK",
  tanggalLahir: "2000-01-01",
  persetujuanPrivasi: true,
  ...extra,
});
const request = (body: unknown) =>
  new Request("http://localhost:3000/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "kerjain-auth-flow-"));
  process.env.DATABASE_PATH = path.join(dir, "test.db");
  const { bukaDb } = await import("@/db/open");
  const { migrate } = await import("@/scripts/migrate");
  const { seed } = await import("@/db/seed");
  const awal = bukaDb();
  migrate(awal);
  await seed(awal);
  awal.close();
  ({ db } = await import("@/lib/db"));
  ({ POST: register } = await import("@/app/api/auth/register/route"));
  ({ POST: login } = await import("@/app/api/auth/login/route"));
  ({ POST: logout } = await import("@/app/api/auth/logout/route"));
  controller = await import("@/controllers/PenggunaController");
  limiter = await import("@/lib/auth/rate-limit");
});
beforeEach(() => {
  cookie.value = "";
});
afterAll(() => {
  db?.close();
  if (dir) rmSync(dir, { recursive: true, force: true });
});

describe("registrasi/login/logout (#8)", () => {
  it("fixture frontend sesuai kontrak respons autentikasi", () => {
    expect(() => AuthResponse.parse(authFixture)).not.toThrow();
  });
  it.each(["TK", "PK"])(
    "mendaftarkan %s beserta profil dan cookie sesi",
    async (peran) => {
      const data = input({ peran });
      const response = await register(request(data));
      expect(response.status).toBe(201);
      const hasil = AuthResponse.parse(await response.json());
      expect(hasil.redirectTo).toBe(`/${peran.toLowerCase()}`);
      expect(hasil.pengguna.email).toBe(data.email);
      if (peran === "TK")
        expect(hasil.pengguna.statusVerifikasi).toBe("BELUM_TERVERIFIKASI");
      const table = peran === "TK" ? "tenaga_kerja" : "penyedia_kerja";
      expect(
        db
          .prepare(`SELECT 1 FROM ${table} WHERE id_pengguna = ?`)
          .get(hasil.pengguna.id),
      ).toBeDefined();
      const akun = db
        .prepare(
          "SELECT password_hash, persetujuan_privasi_at FROM pengguna WHERE id_pengguna = ?",
        )
        .get(hasil.pengguna.id) as {
        password_hash: string;
        persetujuan_privasi_at: string;
      };
      expect(akun.password_hash).toMatch(/^\$argon2id\$/);
      expect(akun.persetujuan_privasi_at).toBeTruthy();
      expect(cookie.options).toMatchObject({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      expect(
        db.prepare("SELECT 1 FROM sesi WHERE id_sesi = ?").get(cookie.value),
      ).toBeUndefined();
      expect(
        db
          .prepare("SELECT 1 FROM sesi WHERE id_sesi = ?")
          .get(createHash("sha256").update(cookie.value).digest("hex")),
      ).toBeDefined();
      expect(JSON.stringify(hasil)).not.toContain("password");
    },
  );
  it("tanpa persetujuan -> 400 dengan error field, usia kurang ditolak, peran CS/field asing ditolak", async () => {
    for (const extra of [
      { persetujuanPrivasi: false },
      { tanggalLahir: "2020-01-01" },
      { peran: "CS" },
      { admin: true },
    ]) {
      const r = await register(request(input(extra)));
      expect(r.status).toBe(400);
      expect((await r.json()).error.code).toBe("VALIDATION_ERROR");
    }
    const r = await register(request(input({ persetujuanPrivasi: false })));
    expect((await r.json()).error.fields).toHaveProperty("persetujuanPrivasi");
  });
  it("email dinormalisasi dan duplikat menghasilkan 409 dengan saran masuk", async () => {
    const email = `${randomUUID()}@example.test`;
    expect(
      (await register(request(input({ email: ` ${email.toUpperCase()} ` }))))
        .status,
    ).toBe(201);
    const r = await register(request(input({ email })));
    expect(r.status).toBe(409);
    expect((await r.json()).error).toMatchObject({
      code: "EMAIL_TERDAFTAR",
      message: expect.stringMatching(/masuk/),
    });
  });
  it("gagal membuat profil me-rollback pengguna", async () => {
    const data = input();
    db.exec(
      "CREATE TRIGGER test_profil_gagal BEFORE INSERT ON tenaga_kerja BEGIN SELECT RAISE(ABORT, 'test rollback'); END",
    );
    try {
      await expect(controller.registrasi(data, "rollback")).rejects.toThrow(
        "test rollback",
      );
    } finally {
      db.exec("DROP TRIGGER test_profil_gagal");
    }
    expect(
      db.prepare("SELECT 1 FROM pengguna WHERE email = ?").get(data.email),
    ).toBeUndefined();
  });
  it.each([
    ["tk1", "/tk"],
    ["pk1", "/pk"],
    ["cs1", "/cs"],
  ])(
    "login %s redirect sesuai peran dan logout membatalkan sesi",
    async (akun, tujuan) => {
      const data = { email: `${akun}@kerjain.test`, password: "Password123!" };
      const r = await login(request(data));
      expect(r.status).toBe(200);
      expect(AuthResponse.parse(await r.json()).redirectTo).toBe(tujuan);
      const token = cookie.value;
      expect((await login(request(data))).status).toBe(200);
      expect(cookie.value).not.toBe(token);
      const sha = createHash("sha256").update(cookie.value).digest("hex");
      const keluar = await logout();
      expect(keluar.status).toBe(204);
      expect(await keluar.text()).toBe("");
      expect(cookie.value).toBe("");
      expect(
        db.prepare("SELECT 1 FROM sesi WHERE id_sesi = ?").get(sha),
      ).toBeUndefined();
      expect((await logout()).status).toBe(401);
    },
  );
  it("email tak dikenal dan password salah menghasilkan pesan generik yang sama", async () => {
    for (const email of ["tk2@kerjain.test", "tidak-ada@example.test"]) {
      const r = await login(request({ email, password: "salah" }));
      expect(r.status).toBe(401);
      expect((await r.json()).error).toMatchObject({
        code: "KREDENSIAL_SALAH",
        message: "Email atau kata sandi tidak valid",
      });
    }
  });
  it("percobaan keenam diblokir dan IP/email lain independen; jendela berakhir setelah 15 menit", () => {
    const ip = randomUUID();
    const email = "limit@example.test";
    const now = Date.now();
    for (let i = 0; i < 5; i++) limiter.batasiPercobaan(ip, email, now);
    expect(() =>
      limiter.batasiPercobaan(ip, ` ${email.toUpperCase()} `, now),
    ).toThrow(expect.objectContaining({ status: 429 }));
    expect(() => limiter.batasiPercobaan(ip + "2", email, now)).not.toThrow();
    expect(() =>
      limiter.batasiPercobaan(ip, "lain@example.test", now),
    ).not.toThrow();
    expect(() =>
      limiter.batasiPercobaan(ip, email, now + 15 * 60 * 1000),
    ).not.toThrow();
  });
  it("endpoint login/registrasi berbagi jatah lima percobaan", async () => {
    const email = `${randomUUID()}@example.test`;
    for (let i = 0; i < 5; i++)
      expect((await login(request({ email, password: "salah" }))).status).toBe(
        401,
      );
    const r = await register(request(input({ email })));
    expect(r.status).toBe(429);
    expect((await r.json()).error.code).toBe("TERLALU_BANYAK_PERCOBAAN");
  });
  it("JSON rusak -> 400", async () => {
    expect(
      (
        await login(
          new Request("http://localhost/api/auth/login", {
            method: "POST",
            body: "{",
          }),
        )
      ).status,
    ).toBe(400);
  });
});

describe("batas usia kalender WIB", () => {
  it("sehari sebelum 17 ditolak, tepat 17 diterima, tanggal mustahil ditolak", () => {
    const sekarang = new Date("2026-11-05T17:00:00Z"); // 6 November WIB
    expect(validasiBatasUsia("2009-11-07", sekarang)).toBe(false);
    expect(validasiBatasUsia("2009-11-06", sekarang)).toBe(true);
    expect(validasiBatasUsia("2009-11-05", sekarang)).toBe(true);
    expect(validasiBatasUsia("2000-02-30", sekarang)).toBe(false);
    expect(validasiBatasUsia("2009-02-29", sekarang)).toBe(false);
    expect(validasiBatasUsia("invalid", sekarang)).toBe(false);
    expect(validasiBatasUsia("2027-01-01", sekarang)).toBe(false);
  });
});
