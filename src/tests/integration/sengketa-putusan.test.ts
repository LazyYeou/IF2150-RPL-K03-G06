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

// KF25. CS memutuskan, meminta bukti, atau menolak tiket sengketa.
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
type Rute = {
  POST: (
    r: Request,
    c: { params: Promise<{ id: string }> },
  ) => Promise<Response>;
};
let dir: string;
let db: Db;
let masuk: (email: string) => Promise<void>;
let buat: typeof import("@/app/api/tiket/route");
let putuskan: Rute;
let mintaBukti: Rute;
let tolak: Rute;

const one = <T>(sql: string, ...p: unknown[]) => db.prepare(sql).get(...p) as T;
const idProfil = (tabel: "tenaga_kerja" | "penyedia_kerja", email: string) =>
  one<{ id: string }>(
    `SELECT t.id_${tabel} id FROM ${tabel} t JOIN pengguna u USING (id_pengguna) WHERE u.email = ?`,
    email,
  ).id;
const saldo = (email: string) =>
  one<{ s: number }>(
    `SELECT t.saldo_pendapatan s FROM tenaga_kerja t JOIN pengguna u USING (id_pengguna) WHERE u.email = ?`,
    email,
  ).s;
const pekerjaan = (id: string) =>
  one<{ s: string }>(
    "SELECT status_pekerjaan s FROM transaksi_pekerjaan WHERE id_transaksi = ?",
    id,
  ).s;
const notif = (email: string) =>
  one<{ n: number }>(
    `SELECT COUNT(*) n FROM notifikasi WHERE id_penerima = (SELECT id_pengguna FROM pengguna WHERE email = ?)`,
    email,
  ).n;

function transaksi(status: string) {
  const [lowongan, penawaran, id] = [randomUUID(), randomUUID(), randomUUID()];
  const pk = idProfil("penyedia_kerja", "pk1@kerjain.test");
  const tk = idProfil("tenaga_kerja", "tk1@kerjain.test");
  db.prepare(
    `INSERT INTO lowongan_pekerjaan (id_lowongan, id_penyedia_kerja, judul, deskripsi, ruang_lingkup, kriteria_hasil,
       kategori, lokasi, tanggal_pekerjaan, estimasi_durasi, upah, satuan_upah, kuota, jumlah_diterima, status_lowongan)
     VALUES (?, ?, 'Lowongan uji putusan sengketa', 'Deskripsi lowongan uji putusan sengketa', 'a', 'b',
       'Kebersihan', 'Bandung', '2026-12-01', '2 jam', 200000, 'PER_TUGAS', 1, 1, 'CLOSED_FULL')`,
  ).run(lowongan, pk);
  db.prepare(
    `INSERT INTO pengajuan_penawaran (id_penawaran, id_lowongan, id_tenaga_kerja, harga_penawaran, ketersediaan, status_penawaran)
     VALUES (?, ?, ?, 200000, 'Kamis', 'DITERIMA')`,
  ).run(penawaran, lowongan, tk);
  db.prepare(
    `INSERT INTO transaksi_pekerjaan (id_transaksi, id_lowongan, id_penawaran, id_tenaga_kerja, id_penyedia_kerja, nominal_upah, status_pekerjaan)
     VALUES (?, ?, ?, ?, ?, 200000, ?)`,
  ).run(id, lowongan, penawaran, tk, pk, status);
  return id;
}

async function ajukan(trx: string | undefined, sebagai = "pk1@kerjain.test") {
  await masuk(sebagai);
  const f = new FormData();
  f.set("kategoriMasalah", "Pekerjaan tidak sesuai");
  f.set("deskripsi", "Hasil pekerjaan tidak sesuai kesepakatan awal kami.");
  if (trx) f.set("idTransaksi", trx);
  const r = await buat.POST(
    new Request("http://localhost/api/tiket", { method: "POST", body: f }),
  );
  expect(r.status).toBe(201);
  return (await r.json()) as { id: string };
}

const kirim = (rute: Rute, id: string, body: unknown) =>
  rute.POST(
    new Request(`http://localhost/api/cs/tiket/${id}/x`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  );
const CATATAN = "Keputusan diambil setelah meninjau bukti kedua pihak.";
const putus = (id: string, keputusan: string) =>
  kirim(putuskan, id, { keputusan, catatan: CATATAN });
const kode = async (r: Response) => (await r.json()).error?.code;

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "kerjain-putusan-"));
  process.env.DATABASE_PATH = path.join(dir, "test.db");
  process.env.STORAGE_DIR = path.join(dir, "storage");
  const { bukaDb } = await import("@/db/open");
  const { migrate } = await import("@/scripts/migrate");
  const { seed } = await import("@/db/seed");
  const awal = bukaDb();
  migrate(awal);
  await seed(awal);
  awal.close();
  ({ db } = await import("@/lib/db"));
  const { buatSesi } = await import("@/lib/auth/session");
  buat = await import("@/app/api/tiket/route");
  putuskan = await import("@/app/api/cs/tiket/[id]/putuskan/route");
  mintaBukti = await import("@/app/api/cs/tiket/[id]/minta-bukti/route");
  tolak = await import("@/app/api/cs/tiket/[id]/tolak/route");
  masuk = (email) =>
    buatSesi(
      one<{ id: string }>(
        "SELECT id_pengguna id FROM pengguna WHERE email = ?",
        email,
      ).id,
    );
});
afterAll(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
beforeEach(() => jar.clear());

describe("POST /api/cs/tiket/:id/putuskan PENCAIRAN", () => {
  it("pekerjaan COMPLETED, upah dikredit sekali, tiket DITUTUP, kedua pihak diberi notifikasi", async () => {
    const trx = transaksi("SUBMITTED");
    const { id } = await ajukan(trx);
    const sebelum = saldo("tk1@kerjain.test");
    const nTK = notif("tk1@kerjain.test");
    await masuk("cs1@kerjain.test");
    const r = await putus(id, "PENCAIRAN");
    expect(r.status).toBe(200);
    const t = await r.json();
    expect(t).toMatchObject({ status: "DITUTUP", keputusan: "PENCAIRAN" });
    expect(t.riwayat.at(-1).log).toContain("PENCAIRAN");
    expect(pekerjaan(trx)).toBe("COMPLETED");
    expect(saldo("tk1@kerjain.test")).toBe(sebelum + 200000);
    expect(notif("tk1@kerjain.test")).toBe(nTK + 1);
    // diputus ulang: 409, saldo tidak berubah
    expect(await kode(await putus(id, "PENCAIRAN"))).toBe("STATUS_TIDAK_VALID");
    expect(saldo("tk1@kerjain.test")).toBe(sebelum + 200000);
  });
  it("keputusan berbeda pada tiket yang sudah diputus: 409", async () => {
    const { id } = await ajukan(transaksi("IN_PROGRESS"));
    await masuk("cs1@kerjain.test");
    expect((await putus(id, "PENCAIRAN")).status).toBe(200);
    expect((await putus(id, "REFUND")).status).toBe(409);
  });
  it("bantuan umum (tanpa transaksi): 409", async () => {
    const { id } = await ajukan(undefined);
    await masuk("cs1@kerjain.test");
    expect((await putus(id, "PENCAIRAN")).status).toBe(409);
  });
  it("bukan CS: 403; tanpa login: 401; catatan pendek: 400; tiket tidak ada: 404", async () => {
    const { id } = await ajukan(transaksi("SUBMITTED"));
    expect((await putus(id, "PENCAIRAN")).status).toBe(403);
    jar.clear();
    expect((await putus(id, "PENCAIRAN")).status).toBe(401);
    await masuk("cs1@kerjain.test");
    expect(
      (await kirim(putuskan, id, { keputusan: "PENCAIRAN", catatan: "x" }))
        .status,
    ).toBe(400);
    expect((await putus(randomUUID(), "PENCAIRAN")).status).toBe(404);
    expect(
      one<{ s: string }>(
        "SELECT status_tiket s FROM tiket_sengketa WHERE id_tiket = ?",
        id,
      ).s,
    ).toBe("DIAJUKAN");
  });
});

describe("POST /api/cs/tiket/:id/minta-bukti", () => {
  it("DIAJUKAN -> MENUNGGU_BALASAN, peserta diberi notifikasi; kedua kali 409; bukti peserta mengembalikan ke DITINJAU", async () => {
    const trx = transaksi("IN_PROGRESS");
    const { id } = await ajukan(trx);
    const n = notif("tk1@kerjain.test");
    await masuk("cs1@kerjain.test");
    const r = await kirim(mintaBukti, id, {
      pesan: "Mohon unggah foto hasil pekerjaan.",
    });
    expect(r.status).toBe(200);
    expect((await r.json()).status).toBe("MENUNGGU_BALASAN");
    expect(notif("tk1@kerjain.test")).toBe(n + 1);
    expect(
      (await kirim(mintaBukti, id, { pesan: "Mohon unggah foto lagi." }))
        .status,
    ).toBe(409);
    // pekerjaan tetap DISENGKETAKAN
    expect(pekerjaan(trx)).toBe("DISENGKETAKAN");
  });
});

describe("POST /api/cs/tiket/:id/tolak", () => {
  it("DIAJUKAN -> DITOLAK dan pekerjaan kembali ke status sebelum sengketa; final tidak bisa diproses lagi", async () => {
    const trx = transaksi("SUBMITTED");
    const sebelum = saldo("tk1@kerjain.test");
    const { id } = await ajukan(trx);
    await masuk("cs1@kerjain.test");
    const r = await kirim(tolak, id, {
      alasan: "Keluhan tidak didukung bukti apa pun.",
    });
    expect(r.status).toBe(200);
    expect((await r.json()).status).toBe("DITOLAK");
    expect(pekerjaan(trx)).toBe("SUBMITTED");
    expect(
      (await kirim(tolak, id, { alasan: "Keluhan tidak didukung bukti." }))
        .status,
    ).toBe(409);
    expect((await putus(id, "PENCAIRAN")).status).toBe(409);
    expect(pekerjaan(trx)).toBe("SUBMITTED");
    expect(saldo("tk1@kerjain.test")).toBe(sebelum);
  });
});
