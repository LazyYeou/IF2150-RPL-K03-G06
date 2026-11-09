import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
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

  afterAll(() => {
    jar.clear();
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

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
    expect(body.timeline.some((item: { aktif: boolean }) => item.aktif)).toBe(
      true,
    );
    expect(
      body.timeline.some((item: { label: string }) => item.label.length > 0),
    ).toBe(true);
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

  it("peserta PK dapat melihat detail miliknya", async () => {
    const pk = one<{ id: string }>(
      "SELECT id_pengguna id FROM pengguna WHERE email = 'pk1@kerjain.test'",
    );
    const transaksi = one<{ id: string }>(
      "SELECT id_transaksi id FROM transaksi_pekerjaan LIMIT 1",
    );
    const { buatSesi } = await import("@/lib/auth/session");
    await buatSesi(pk.id);

    const response = await detail.GET(
      new Request(`http://localhost/api/transaksi/${transaksi.id}`),
      { params: Promise.resolve({ id: transaksi.id }) },
    );

    expect(response.status).toBe(200);
  });

  it("TK lain tidak dapat melihat detail transaksi", async () => {
    const transaksi = one<{ id: string }>(
      "SELECT id_transaksi id FROM transaksi_pekerjaan LIMIT 1",
    );
    const tkLain = one<{ id: string }>(
      "SELECT id_pengguna id FROM pengguna WHERE email = 'tk2@kerjain.test'",
    );
    const { buatSesi } = await import("@/lib/auth/session");
    await buatSesi(tkLain.id);

    const response = await detail.GET(
      new Request(`http://localhost/api/transaksi/${transaksi.id}`),
      { params: Promise.resolve({ id: transaksi.id }) },
    );

    expect(response.status).toBe(403);
  });

  it("PK lain tidak dapat melihat detail transaksi", async () => {
    const idPengguna = randomUUID();
    const idPk = randomUUID();
    db.prepare(
      `INSERT INTO pengguna
       (id_pengguna, nama, email, password_hash, peran, tanggal_lahir, persetujuan_privasi_at)
       VALUES (?, ?, ?, ?, 'PK', '1995-05-17', datetime('now'))`,
    ).run(idPengguna, "PK Lain", "pk-lain@kerjain.test", "test-only");
    db.prepare(
      "INSERT INTO penyedia_kerja (id_penyedia_kerja, id_pengguna) VALUES (?, ?)",
    ).run(idPk, idPengguna);

    const transaksi = one<{ id: string }>(
      "SELECT id_transaksi id FROM transaksi_pekerjaan LIMIT 1",
    );
    const { buatSesi } = await import("@/lib/auth/session");
    await buatSesi(idPengguna);

    const response = await detail.GET(
      new Request(`http://localhost/api/transaksi/${transaksi.id}`),
      { params: Promise.resolve({ id: transaksi.id }) },
    );

    expect(response.status).toBe(403);
  });

  it("daftar PK hanya memuat transaksi milik profil PK yang login", async () => {
    const pk = one<{ userId: string; profileId: string }>(
      `SELECT p.id_pengguna AS userId, pk.id_penyedia_kerja AS profileId
       FROM pengguna p JOIN penyedia_kerja pk ON pk.id_pengguna = p.id_pengguna
       WHERE p.email = 'pk1@kerjain.test'`,
    );
    const { buatSesi } = await import("@/lib/auth/session");
    await buatSesi(pk.userId);

    const response = await daftar.GET(
      new Request("http://localhost/api/transaksi?peran=PK"),
    );
    expect(response.status).toBe(200);
    const body = await response.json();

    const milikPk = db
      .prepare(
        "SELECT id_transaksi AS id FROM transaksi_pekerjaan WHERE id_penyedia_kerja = ?",
      )
      .all(pk.profileId) as Array<{ id: string }>;
    expect(body.items.map((item: { id: string }) => item.id).sort()).toEqual(
      milikPk.map((item) => item.id).sort(),
    );
  });

  it("detail mengikuti kontrak dan ulasanSaya mengikuti pengguna yang sedang login", async () => {
    const transaksi = one<{ id: string }>(
      "SELECT id_transaksi AS id FROM transaksi_pekerjaan WHERE status_pekerjaan = 'COMPLETED' LIMIT 1",
    );
    const tk = one<{ id: string }>(
      "SELECT id_pengguna AS id FROM pengguna WHERE email = 'tk1@kerjain.test'",
    );
    const pk = one<{ id: string }>(
      "SELECT id_pengguna AS id FROM pengguna WHERE email = 'pk1@kerjain.test'",
    );
    db.prepare(
      "INSERT INTO ulasan_rating (id_ulasan, id_transaksi, id_penilai, id_penerima, nilai) VALUES (?, ?, ?, ?, 4)",
    ).run(randomUUID(), transaksi.id, tk.id, pk.id);
    db.prepare(
      "INSERT INTO catatan_revisi (id_revisi, id_transaksi, catatan) VALUES (?, ?, ?)",
    ).run(randomUUID(), transaksi.id, "Mohon rapikan kembali bagian tepi.");
    const { buatSesi } = await import("@/lib/auth/session");
    const { TransaksiDetail } = await import("@/lib/validation/transaksi");
    for (const [idPengguna, ulasanSaya] of [
      [tk.id, { nilai: 4 }],
      [pk.id, null],
    ] as const) {
      await buatSesi(idPengguna);
      const response = await detail.GET(
        new Request(`http://localhost/api/transaksi/${transaksi.id}`),
        { params: Promise.resolve({ id: transaksi.id }) },
      );
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(TransaksiDetail.safeParse(body).success).toBe(true);
      expect(body.ulasanSaya).toEqual(ulasanSaya);
      expect(body.revisi).toEqual([
        {
          catatan: "Mohon rapikan kembali bagian tepi.",
          waktu: expect.any(String),
        },
      ]);
      expect(body.tagihan.status).toBe("BERHASIL");
      expect(body.bukti.length).toBeGreaterThan(0);
      expect(body.tiketAktif).toBeNull();
    }
  });
});
