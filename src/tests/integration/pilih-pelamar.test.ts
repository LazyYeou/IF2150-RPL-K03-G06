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
  PelamarResponse,
  TerimaPenawaranResponse,
} from "@/lib/validation/penawaran";

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
let daftar: typeof import("@/app/api/lowongan/[id]/pelamar/route");
let terima: typeof import("@/app/api/penawaran/[id]/terima/route");

const one = <T>(sql: string, ...p: unknown[]) => db.prepare(sql).get(...p) as T;
const idProfil = (tabel: "tenaga_kerja" | "penyedia_kerja", email: string) =>
  one<{ id: string }>(
    `SELECT t.id_${tabel} id FROM ${tabel} t JOIN pengguna u USING (id_pengguna) WHERE u.email = ?`,
    email,
  ).id;
const daftarPelamar = (id: string) =>
  daftar.GET(new Request(`http://localhost/api/lowongan/${id}/pelamar`), {
    params: Promise.resolve({ id }),
  });
const pilih = (id: string) =>
  terima.POST(
    new Request(`http://localhost/api/penawaran/${id}/terima`, {
      method: "POST",
    }),
    { params: Promise.resolve({ id }) },
  );
const kode = async (r: Response) => (await r.json()).error?.code;

/** Lowongan milik pk1 dengan kuota tertentu. */
function buatLowongan(kuota: number, pemilik = "pk1@kerjain.test") {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO lowongan_pekerjaan (id_lowongan, id_penyedia_kerja, judul, deskripsi, ruang_lingkup, kriteria_hasil,
       kategori, lokasi, tanggal_pekerjaan, estimasi_durasi, upah, satuan_upah, kuota)
     VALUES (?, ?, 'Lowongan uji pilih pelamar', 'Deskripsi lowongan untuk pengujian pilih pelamar', 'a', 'b',
       'Kebersihan', 'Coblong, Bandung', '2026-12-01', '2 jam', 200000, 'PER_TUGAS', ?)`,
  ).run(id, idProfil("penyedia_kerja", pemilik), kuota);
  return id;
}
function buatPenawaran(
  idLowongan: string,
  emailTK: string,
  status = "MENUNGGU",
  harga = 250000,
) {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO pengajuan_penawaran (id_penawaran, id_lowongan, id_tenaga_kerja, harga_penawaran, ketersediaan, status_penawaran)
     VALUES (?, ?, ?, ?, 'Kamis pagi', ?)`,
  ).run(id, idLowongan, idProfil("tenaga_kerja", emailTK), harga, status);
  return id;
}
const lowongan = (id: string) =>
  one<{ s: string; n: number }>(
    "SELECT status_lowongan s, jumlah_diterima n FROM lowongan_pekerjaan WHERE id_lowongan = ?",
    id,
  );
const statusPenawaran = (id: string) =>
  one<{ s: string }>(
    "SELECT status_penawaran s FROM pengajuan_penawaran WHERE id_penawaran = ?",
    id,
  ).s;
const jumlahTransaksi = (idLowongan: string) =>
  one<{ n: number }>(
    "SELECT COUNT(*) n FROM transaksi_pekerjaan WHERE id_lowongan = ?",
    idLowongan,
  ).n;

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "kerjain-pelamar-"));
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
  daftar = await import("@/app/api/lowongan/[id]/pelamar/route");
  terima = await import("@/app/api/penawaran/[id]/terima/route");
  masuk = (email) =>
    buatSesi(
      one<{ id: string }>(
        "SELECT id_pengguna id FROM pengguna WHERE email = ?",
        email,
      ).id,
    );
  // PK kedua untuk uji kepemilikan (IDOR)
  const idU = randomUUID();
  db.prepare(
    `INSERT INTO pengguna (id_pengguna, nama, email, password_hash, peran, tanggal_lahir, persetujuan_privasi_at)
     VALUES (?, 'PK Lain', 'pk2@kerjain.test', 'x', 'PK', '1990-01-01', datetime('now'))`,
  ).run(idU);
  db.prepare(
    "INSERT INTO penyedia_kerja (id_penyedia_kerja, id_pengguna) VALUES (?, ?)",
  ).run(randomUUID(), idU);
});
afterAll(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
beforeEach(() => jar.clear());

describe("GET /api/lowongan/:id/pelamar (I-32)", () => {
  it("PK pemilik: daftar sesuai skema; yang ditarik tidak muncul; menunggu lebih dulu", async () => {
    const l = buatLowongan(2);
    const a = buatPenawaran(l, "tk1@kerjain.test", "DITOLAK");
    const b = buatPenawaran(l, "tk2@kerjain.test");
    buatPenawaran(l, "tk3@kerjain.test", "DITARIK");
    await masuk("pk1@kerjain.test");
    const r = await daftarPelamar(l);
    expect(r.status).toBe(200);
    const d = PelamarResponse.parse(await r.json());
    expect(d.sisaKuota).toBe(2);
    expect(d.lowongan.id).toBe(l);
    expect(d.items.map((i) => i.idPenawaran)).toEqual([b, a]);
    expect(d.items[0].tenagaKerja.nama).toBeTruthy();
  });
  it("tanpa sesi 401; TK 403; PK lain 403; id tak dikenal atau tak valid 404", async () => {
    const l = buatLowongan(1);
    expect((await daftarPelamar(l)).status).toBe(401);
    await masuk("tk1@kerjain.test");
    expect((await daftarPelamar(l)).status).toBe(403);
    jar.clear();
    await masuk("pk2@kerjain.test");
    expect((await daftarPelamar(l)).status).toBe(403);
    expect((await daftarPelamar(randomUUID())).status).toBe(404);
    expect((await daftarPelamar("bukan-uuid")).status).toBe(404);
  });
});

describe("POST /api/penawaran/:id/terima (KF12, KF13, KNF07)", () => {
  it("terima: transaksi MENUNGGU_PEMBAYARAN, nominal = harga, kuota bertambah, TK dinotifikasi", async () => {
    const l = buatLowongan(2);
    const p = buatPenawaran(l, "tk1@kerjain.test", "MENUNGGU", 275000);
    await masuk("pk1@kerjain.test");
    const r = await pilih(p);
    expect(r.status).toBe(200);
    const d = TerimaPenawaranResponse.parse(await r.json());
    expect(d).toMatchObject({ statusLowongan: "OPEN", sisaKuota: 1 });
    expect(
      one<{ s: string; n: number; t: string }>(
        "SELECT status_pekerjaan s, nominal_upah n, id_penawaran t FROM transaksi_pekerjaan WHERE id_transaksi = ?",
        d.idTransaksi,
      ),
    ).toEqual({ s: "MENUNGGU_PEMBAYARAN", n: 275000, t: p });
    expect(statusPenawaran(p)).toBe("DITERIMA");
    expect(lowongan(l)).toEqual({ s: "OPEN", n: 1 });
    expect(
      one<{ n: number }>(
        `SELECT COUNT(*) n FROM notifikasi n JOIN pengguna u ON u.id_pengguna = n.id_penerima
         WHERE u.email = 'tk1@kerjain.test' AND n.tautan = ?`,
        `/tk/transaksi/${d.idTransaksi}`,
      ).n,
    ).toBe(1);
  });
  it("penerimaan terakhir: lowongan CLOSED_FULL dan sisa MENUNGGU jadi DITOLAK_OTOMATIS", async () => {
    const l = buatLowongan(1);
    const a = buatPenawaran(l, "tk1@kerjain.test");
    const b = buatPenawaran(l, "tk2@kerjain.test");
    await masuk("pk1@kerjain.test");
    const r = await pilih(a);
    expect(await r.json()).toMatchObject({
      statusLowongan: "CLOSED_FULL",
      sisaKuota: 0,
    });
    expect(statusPenawaran(b)).toBe("DITOLAK_OTOMATIS");
    expect(lowongan(l)).toEqual({ s: "CLOSED_FULL", n: 1 });
  });
  it("kuota penuh -> 409 KUOTA_PENUH dan tidak ada transaksi baru (UC06 alt1)", async () => {
    const l = buatLowongan(1);
    const a = buatPenawaran(l, "tk1@kerjain.test");
    const b = buatPenawaran(l, "tk2@kerjain.test");
    await masuk("pk1@kerjain.test");
    expect((await pilih(a)).status).toBe(200);
    const r = await pilih(b);
    expect(r.status).toBe(409);
    expect(await kode(r)).toBe("KUOTA_PENUH");
    expect(jumlahTransaksi(l)).toBe(1);
  });
  it("KNF07: dua penerimaan bersamaan untuk kuota terakhir, hanya satu berhasil", async () => {
    const l = buatLowongan(1);
    const a = buatPenawaran(l, "tk1@kerjain.test");
    const b = buatPenawaran(l, "tk2@kerjain.test");
    await masuk("pk1@kerjain.test");
    const hasil = await Promise.all([pilih(a), pilih(b)]);
    expect(hasil.map((r) => r.status).sort()).toEqual([200, 409]);
    expect(lowongan(l).n).toBe(1);
    expect(jumlahTransaksi(l)).toBe(1);
  });
  it("PK lain 403 (IDOR) dan tidak mengubah apa pun; TK 403; tanpa sesi 401", async () => {
    const l = buatLowongan(1);
    const p = buatPenawaran(l, "tk1@kerjain.test");
    expect((await pilih(p)).status).toBe(401);
    await masuk("pk2@kerjain.test");
    expect((await pilih(p)).status).toBe(403);
    jar.clear();
    await masuk("tk1@kerjain.test");
    expect((await pilih(p)).status).toBe(403);
    expect(statusPenawaran(p)).toBe("MENUNGGU");
    expect(jumlahTransaksi(l)).toBe(0);
  });
  it("penawaran bukan MENUNGGU -> 409 STATUS_TIDAK_VALID; tidak ada atau id tak valid -> 404", async () => {
    const l = buatLowongan(2);
    const p = buatPenawaran(l, "tk1@kerjain.test", "DITARIK");
    await masuk("pk1@kerjain.test");
    const r = await pilih(p);
    expect(r.status).toBe(409);
    expect(await kode(r)).toBe("STATUS_TIDAK_VALID");
    expect((await pilih(randomUUID())).status).toBe(404);
    expect((await pilih("bukan-uuid")).status).toBe(404);
    expect(lowongan(l).n).toBe(0);
  });
  it("menerima penawaran yang sama dua kali -> kedua 409 dan kuota tidak bertambah dua kali", async () => {
    const l = buatLowongan(3);
    const p = buatPenawaran(l, "tk1@kerjain.test");
    await masuk("pk1@kerjain.test");
    expect((await pilih(p)).status).toBe(200);
    expect((await pilih(p)).status).toBe(409);
    expect(lowongan(l).n).toBe(1);
    expect(jumlahTransaksi(l)).toBe(1);
  });
});
