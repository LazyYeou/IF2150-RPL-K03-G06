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
let auth: typeof import("@/controllers/PenggunaController");
let session: typeof import("@/lib/auth/session");
let lupa: typeof import("@/app/api/auth/lupa-sandi/route").POST;
let reset: typeof import("@/app/api/auth/reset-sandi/route").POST;
let dir: string;
const log = vi.spyOn(console, "info").mockImplementation(() => {});
const req = (body: unknown) =>
  new Request("http://localhost:3000/api/auth", {
    method: "POST",
    body: JSON.stringify(body),
  });
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "kerjain-reset-"));
  process.env.DATABASE_PATH = path.join(dir, "test.db");
  const { bukaDb } = await import("@/db/open");
  const { migrate } = await import("@/scripts/migrate");
  const awal = bukaDb();
  migrate(awal);
  awal.close();
  ({ db } = await import("@/lib/db"));
  auth = await import("@/controllers/PenggunaController");
  session = await import("@/lib/auth/session");
  ({ POST: lupa } = await import("@/app/api/auth/lupa-sandi/route"));
  ({ POST: reset } = await import("@/app/api/auth/reset-sandi/route"));
});
beforeEach(() => {
  jar.token = "";
  log.mockClear();
});
afterAll(() => {
  log.mockRestore();
  db?.close();
  if (dir) rmSync(dir, { recursive: true, force: true });
});
async function akunBaru() {
  const email = `${randomUUID()}@kerjain.test`;
  const { pengguna } = await auth.registrasi(
    {
      nama: "Reset Uji",
      email,
      password: "Password123!",
      peran: "TK",
      tanggalLahir: "2000-01-01",
      persetujuanPrivasi: true,
    },
    "test",
  );
  return { email, id: pengguna.id };
}
async function tautan(email: string) {
  expect((await lupa(req({ email }))).status).toBe(200);
  const line = String(log.mock.calls.at(-1)?.[0]);
  const url = new URL(line.replace("[Reset sandi] ", ""));
  return url.searchParams.get("token")!;
}
const payload = (token: string) => ({
  token,
  passwordBaru: "PasswordBaru123!",
});

describe("lupa/reset sandi (#9)", () => {
  it("respons email terdaftar dan tidak terdaftar identik, token tidak bocor ke respons", async () => {
    const akun = await akunBaru();
    const ada = await lupa(req({ email: akun.email }));
    const tidak = await lupa(req({ email: "tidak-ada@kerjain.test" }));
    expect(ada.status).toBe(tidak.status);
    expect(await ada.json()).toEqual(await tidak.json());
    expect(log).toHaveBeenCalledTimes(1);
  });
  it("token acak 32 byte hanya tersimpan sebagai SHA-256 dan berlaku 30 menit", async () => {
    const akun = await akunBaru();
    const token = await tautan(akun.email.toUpperCase());
    expect(Buffer.from(token, "base64url")).toHaveLength(32);
    expect(
      db.prepare("SELECT 1 FROM reset_sandi WHERE token_hash = ?").get(token),
    ).toBeUndefined();
    const row = db
      .prepare(
        "SELECT id_pengguna, dipakai, (julianday(expires_at) - julianday('now')) * 86400 AS detik FROM reset_sandi WHERE token_hash = ?",
      )
      .get(sha(token)) as {
      id_pengguna: string;
      dipakai: number;
      detik: number;
    };
    expect(row.id_pengguna).toBe(akun.id);
    expect(row.dipakai).toBe(0);
    expect(row.detik).toBeGreaterThan(1795);
    expect(row.detik).toBeLessThanOrEqual(1800);
  });
  it("reset mengganti sandi, mencabut semua sesi dan tautan lain, token tidak bisa dipakai ulang", async () => {
    const akun = await akunBaru();
    const sesiLama = jar.token;
    await session.buatSesi(akun.id);
    const lain = await tautan(akun.email);
    const token = await tautan(akun.email);
    expect(lain).not.toBe(token);
    const r = await reset(req(payload(token)));
    expect(r.status).toBe(204);
    expect(await r.text()).toBe("");
    expect(
      db
        .prepare("SELECT count(*) c FROM sesi WHERE id_pengguna = ?")
        .get(akun.id),
    ).toEqual({ c: 0 });
    jar.token = sesiLama;
    expect(await session.bacaSesi()).toBeNull();
    expect((await reset(req(payload(token)))).status).toBe(400);
    expect((await reset(req(payload(lain)))).status).toBe(400);
    await expect(
      auth.prosesLogin(
        { email: akun.email, password: "Password123!" },
        "login-old",
      ),
    ).rejects.toMatchObject({ status: 401 });
    expect(
      await auth.prosesLogin(
        { email: akun.email, password: "PasswordBaru123!" },
        "login-new",
      ),
    ).toMatchObject({ pengguna: { id: akun.id } });
  });
  it("token kedaluwarsa dan token asing ditolak tanpa mengubah password", async () => {
    const akun = await akunBaru();
    const token = await tautan(akun.email);
    db.prepare(
      "UPDATE reset_sandi SET expires_at = datetime('now', '-1 second') WHERE token_hash = ?",
    ).run(sha(token));
    for (const t of [token, "a".repeat(43)]) {
      const r = await reset(req(payload(t)));
      expect(r.status).toBe(400);
      expect((await r.json()).error.fields).toHaveProperty("token");
    }
    expect(
      await auth.prosesLogin(
        { email: akun.email, password: "Password123!" },
        "expiry",
      ),
    ).toMatchObject({ pengguna: { id: akun.id } });
  });
  it("dua reset bersamaan: hanya satu berhasil", async () => {
    const akun = await akunBaru();
    const token = await tautan(akun.email);
    const results = await Promise.all([
      reset(req(payload(token))),
      reset(req(payload(token))),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([204, 400]);
  });
  it("gagal mencabut sesi me-rollback password dan penggunaan token", async () => {
    const akun = await akunBaru();
    const token = await tautan(akun.email);
    db.exec(
      "CREATE TRIGGER reset_test_gagal BEFORE DELETE ON sesi BEGIN SELECT RAISE(ABORT, 'rollback reset'); END",
    );
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect((await reset(req(payload(token)))).status).toBe(500);
    } finally {
      db.exec("DROP TRIGGER reset_test_gagal");
      spy.mockRestore();
    }
    expect(
      db
        .prepare("SELECT dipakai FROM reset_sandi WHERE token_hash = ?")
        .get(sha(token)),
    ).toEqual({ dipakai: 0 });
    expect(
      await auth.prosesLogin(
        { email: akun.email, password: "Password123!" },
        "rollback",
      ),
    ).toMatchObject({ pengguna: { id: akun.id } });
  });
  it("validasi email, token, sandi pendek/panjang, dan field asing -> 400", async () => {
    expect((await lupa(req({ email: "bukan-email" }))).status).toBe(400);
    expect(
      (await lupa(req({ email: "valid@kerjain.test", ekstra: true }))).status,
    ).toBe(400);
    const akun = await akunBaru();
    const token = await tautan(akun.email);
    for (const body of [
      { token },
      { token: "rusak", passwordBaru: "Password123!" },
      { token, passwordBaru: "short" },
      { token, passwordBaru: "a".repeat(73) },
      { ...payload(token), ekstra: true },
    ])
      expect((await reset(req(body))).status).toBe(400);
  });
  it("tautan baru menonaktifkan tautan lama", async () => {
    const akun = await akunBaru();
    const lama = await tautan(akun.email);
    const baru = await tautan(akun.email);
    expect((await reset(req(payload(lama)))).status).toBe(400);
    expect((await reset(req(payload(baru)))).status).toBe(204);
  });
  it("lupa sandi tidak menghabiskan jatah login", async () => {
    const akun = await akunBaru();
    for (let i = 0; i < 5; i++) await lupa(req({ email: akun.email }));
    await expect(
      auth.prosesLogin(
        { email: akun.email, password: "Password123!" },
        "local",
      ),
    ).resolves.toBeDefined();
  });
  it("lupa sandi dibatasi lima percobaan per 15 menit", async () => {
    const email = `${randomUUID()}@kerjain.test`;
    for (let i = 0; i < 5; i++)
      expect((await lupa(req({ email }))).status).toBe(200);
    expect((await lupa(req({ email }))).status).toBe(429);
  });
});
