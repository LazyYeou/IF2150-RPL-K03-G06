import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

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
let db: Db;
let dir: string;
let daftar: typeof import("@/app/api/transaksi/route");
let detail: typeof import("@/app/api/transaksi/[id]/route");

const one = <T>(sql: string, ...params: unknown[]) =>
  db.prepare(sql).get(...params) as T;

describe("API transaksi", () => {
  beforeAll(async () => {
    dir = mkdtempSync(path.join(tmpdir(), "kerjain-transaksi-"));
    process.env.DATABASE_PATH = path.join(dir, "test.db");
    const { bukaDb } = await import("@/db/open");
    const { migrate } = await import("@/scripts/migrate");
    const { seed } = await import("@/db/seed");
    const awal = bukaDb();
    migrate(awal);
    await seed(awal);
    awal.close();
    ({ db } = await import("@/lib/db"));
    daftar = await import("@/app/api/transaksi/route");
    detail = await import("@/app/api/transaksi/[id]/route");
  });

  afterAll(() => jar.clear());

  it("peserta dapat melihat daftar dan detail status Indonesia", async () => {
    const userTk = one<{ id: string }>(
      "SELECT id_pengguna id FROM pengguna WHERE email = 'tk1@kerjain.test'",
    );
    const sesi = await import("@/lib/auth/session");
    await sesi.buatSesi(userTk.id);
    const transaksi = one<{ id: string }>(
      "SELECT id_transaksi id FROM transaksi_pekerjaan LIMIT 1",
    );

    const listRes = await daftar.GET(
      new Request("http://localhost/api/transaksi?peran=TK"),
    );
    expect(listRes.status).toBe(200);
    const detailRes = await detail.GET(
      new Request(`http://localhost/api/transaksi/${transaksi.id}`),
      { params: Promise.resolve({ id: transaksi.id }) },
    );
    expect(detailRes.status).toBe(200);
    const body = await detailRes.json();
    expect(body.timeline.some((item: { aktif: boolean }) => item.aktif)).toBe(true);
    expect(body.timeline.some((item: { label: string }) => item.label.length > 0)).toBe(true);
  });

  it("peran bukan peserta ditolak 403", async () => {
    const transaksi = one<{ id: string }>(
      "SELECT id_transaksi id FROM transaksi_pekerjaan LIMIT 1",
    );
    const tk2 = one<{ id: string }>(
      "SELECT id_pengguna id FROM pengguna WHERE email = 'tk2@kerjain.test'",
    );
    const { buatSesi } = await import("@/lib/auth/session");
    await buatSesi(tk2.id);

    const response = await detail.GET(
      new Request(`http://localhost/api/transaksi/${transaksi.id}`),
      { params: Promise.resolve({ id: transaksi.id }) },
    );
    expect(response.status).toBe(403);
  });

  it("CS dapat mengakses detail", async () => {
    const transaksi = one<{ id: string }>(
      "SELECT id_transaksi id FROM transaksi_pekerjaan LIMIT 1",
    );
    const cs = one<{ id: string }>(
      "SELECT id_pengguna id FROM pengguna WHERE email = 'cs1@kerjain.test'",
    );
    const { buatSesi } = await import("@/lib/auth/session");
    await buatSesi(cs.id);

    const response = await detail.GET(
      new Request(`http://localhost/api/transaksi/${transaksi.id}`),
      { params: Promise.resolve({ id: transaksi.id }) },
    );
    expect(response.status).toBe(200);
  });
});
