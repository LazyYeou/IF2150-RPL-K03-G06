import { createHash, randomUUID } from "node:crypto";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { AuthResponse } from "@/lib/validation/auth";
import { dbAplikasiSementara } from "../helpers/db";
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
let tutupDb: (() => void) | undefined;
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
  ({ db, tutup: tutupDb } = await dbAplikasiSementara());
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
  tutupDb?.();
});
afterEach(() => vi.useRealTimers());

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
    for (let i = 0; i < 5; i++)
      limiter.batasiPercobaan("login", ip, email, now);
    expect(() =>
      limiter.batasiPercobaan("login", ip, ` ${email.toUpperCase()} `, now),
    ).toThrow(expect.objectContaining({ status: 429 }));
    expect(() =>
      limiter.batasiPercobaan("login", ip + "2", email, now),
    ).not.toThrow();
    expect(() =>
      limiter.batasiPercobaan("login", ip, "lain@example.test", now),
    ).not.toThrow();
    expect(() =>
      limiter.batasiPercobaan("login", ip, email, now + 15 * 60 * 1000),
    ).not.toThrow();
  });
  it("login: hanya kegagalan yang dihitung; jatah login dan registrasi terpisah", async () => {
    const email = `${randomUUID()}@example.test`;
    expect((await register(request(input({ email })))).status).toBe(201);
    for (let i = 0; i < 6; i++)
      expect(
        (await login(request({ email, password: "Password123!" }))).status,
      ).toBe(200);
    for (let i = 0; i < 5; i++)
      expect((await login(request({ email, password: "salah" }))).status).toBe(
        401,
      );
    const r = await login(request({ email, password: "Password123!" }));
    expect(r.status).toBe(429);
    expect((await r.json()).error.code).toBe("TERLALU_BANYAK_PERCOBAAN");
    const lain = `${randomUUID()}@example.test`;
    for (let i = 0; i < 5; i++)
      await login(request({ email: lain, password: "salah" }));
    expect((await register(request(input({ email: lain })))).status).toBe(201);
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

describe("batas registrasi melalui API (#40)", () => {
  it.each([
    ["2009-11-07", "2026-11-05T17:00:00Z", 400],
    ["2009-11-06", "2026-11-05T17:00:00Z", 201],
    ["2008-02-29", "2025-02-28T05:00:00Z", 400],
    ["2008-02-29", "2025-03-01T05:00:00Z", 201],
  ])("lahir %s pada %s -> %i", async (tanggalLahir, sekarang, status) => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(sekarang));
    const data = input({ tanggalLahir });
    const r = await register(request(data));
    expect(r.status).toBe(status);
    const tersimpan = db
      .prepare("SELECT 1 FROM pengguna WHERE email = ?")
      .get(data.email);
    if (status === 400) {
      expect((await r.json()).error.fields).toHaveProperty("tanggalLahir");
      expect(tersimpan).toBeUndefined();
      expect(cookie.value).toBe("");
    } else {
      expect(tersimpan).toBeDefined();
      expect(cookie.value).toBeTruthy();
    }
  });
  it("persetujuan privasi yang tidak dikirim ditolak sebelum akun/sesi dibuat", async () => {
    const { persetujuanPrivasi: _privasi, ...data } = input();
    void _privasi;
    const r = await register(request(data));
    expect(r.status).toBe(400);
    expect((await r.json()).error.fields).toHaveProperty("persetujuanPrivasi");
    expect(
      db.prepare("SELECT 1 FROM pengguna WHERE email = ?").get(data.email),
    ).toBeUndefined();
    expect(cookie.value).toBe("");
  });
  it("cookie sesi kedaluwarsa ditolak endpoint yang memerlukan autentikasi", async () => {
    expect(
      (
        await login(
          request({ email: "pk1@kerjain.test", password: "Password123!" }),
        )
      ).status,
    ).toBe(200);
    const hash = createHash("sha256").update(cookie.value).digest("hex");
    db.prepare(
      "UPDATE sesi SET expires_at = datetime('now', '-1 minute') WHERE id_sesi = ?",
    ).run(hash);
    const r = await logout();
    expect(r.status).toBe(401);
    expect((await r.json()).error.code).toBe("UNAUTHENTICATED");
  });
});
