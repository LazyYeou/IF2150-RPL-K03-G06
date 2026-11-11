import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// #45: pencarian FTS5 (Q-102) harus setara dengan LIKE '%q%' lama, dan indeks ikut berubah lewat trigger.
type Db = typeof import("@/lib/db").db;
let dir: string;
let db: Db;
let cari: typeof import("@/models/LowonganPekerjaan").cari;
let toFtsQuery: typeof import("@/models/LowonganPekerjaan").toFtsQuery;

const JUDUL = [
  "Bersihkan atap rumah bocor",
  "Cuci karpet 100% bersih",
  "Pasang rak_dinding kamar",
  "Angkut lemari ke kos baru",
  "Perbaiki lampu Teras depan",
  'Cat ulang pagar "besi" rumah',
];
const q = (s?: string, extra: object = {}) =>
  cari({ q: s, urut: "terbaru", page: 1, ...extra } as never);
const judul = (s?: string) =>
  q(s)
    .items.map((i) => i.judul)
    .sort();
/** Pembanding: perilaku LIKE lama. */
const like = (s: string) =>
  (
    db
      .prepare(
        String.raw`SELECT judul FROM lowongan_pekerjaan WHERE status_lowongan = 'OPEN'
         AND (judul LIKE ? ESCAPE '\' OR deskripsi LIKE ? ESCAPE '\')`,
      )
      .all(
        `%${s.replace(/[\\%_]/g, "\\$&")}%`,
        `%${s.replace(/[\\%_]/g, "\\$&")}%`,
      ) as { judul: string }[]
  )
    .map((r) => r.judul)
    .sort();

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "kerjain-fts-"));
  process.env.DATABASE_PATH = path.join(dir, "test.db");
  const { bukaDb } = await import("@/db/open");
  const { migrate } = await import("@/scripts/migrate");
  const { seed } = await import("@/db/seed");
  const awal = bukaDb();
  migrate(awal);
  await seed(awal);
  awal.exec(
    "DELETE FROM lowongan_pekerjaan WHERE id_lowongan NOT IN (SELECT id_lowongan FROM transaksi_pekerjaan)",
  );
  awal.close();
  ({ db } = await import("@/lib/db"));
  ({ cari, toFtsQuery } = await import("@/models/LowonganPekerjaan"));
  const pk = (
    db
      .prepare("SELECT id_penyedia_kerja id FROM penyedia_kerja LIMIT 1")
      .get() as {
      id: string;
    }
  ).id;
  for (const j of JUDUL)
    db.prepare(
      `INSERT INTO lowongan_pekerjaan (id_lowongan, id_penyedia_kerja, judul, deskripsi, ruang_lingkup, kriteria_hasil,
         kategori, lokasi, tanggal_pekerjaan, estimasi_durasi, upah, satuan_upah, kuota)
       VALUES (?, ?, ?, 'Deskripsi pekerjaan harian di Coblong, Bandung', 'a', 'b', 'Kebersihan', 'Coblong, Bandung',
         '2026-12-01', '2 jam', 150000, 'PER_TUGAS', 1)`,
    ).run(randomUUID(), pk, j);
});
afterAll(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

describe("Q-102: FTS5 trigram setara LIKE", () => {
  it("toFtsQuery mengutip frasa dan menggandakan tanda kutip", () => {
    expect(toFtsQuery('a "b" c')).toBe('"a ""b"" c"');
  });
  it.each([
    "atap",
    "ATAP",
    "rumah",
    "bocor",
    "karpet 100%",
    "100%",
    "rak_din",
    "lampu teras",
    '"besi"',
    "baru",
    "coblong",
    "harian di",
    "tidak-ada-ini",
  ])("hasil sama dengan LIKE untuk %j", (kata) => {
    expect(judul(kata)).toEqual(like(kata));
  });
  it.each(["at", "100", "%", "_", "a"])(
    "query pendek (<3 karakter) %j tetap berfungsi lewat LIKE",
    (kata) => {
      expect(judul(kata)).toEqual(like(kata));
    },
  );
  it.each([
    "atap AND rumah",
    "ata*",
    "(atap",
    "atap OR",
    "NOT atap",
    '"',
    "col:atap",
  ])(
    "operator FTS dari pengguna %j diperlakukan sebagai teks biasa",
    (kata) => {
      expect(() => q(kata)).not.toThrow();
      expect(judul(kata)).toEqual(like(kata));
    },
  );
  it("kombinasi dengan kategori, upah minimum, dan total hitungan", () => {
    expect(q("karpet", { kategori: "Kebersihan" }).total).toBe(1);
    expect(q("karpet", { kategori: "Lainnya" }).total).toBe(0);
    expect(q("karpet", { upahMin: 200000 }).total).toBe(0);
    expect(q(undefined).total).toBe(JUDUL.length);
  });
  it("hanya lowongan OPEN yang muncul", () => {
    db.prepare(
      "UPDATE lowongan_pekerjaan SET status_lowongan = 'CLOSED_FULL', jumlah_diterima = 1 WHERE judul = ?",
    ).run(JUDUL[0]);
    expect(judul("atap")).toEqual([]);
    db.prepare(
      "UPDATE lowongan_pekerjaan SET status_lowongan = 'OPEN', jumlah_diterima = 0 WHERE judul = ?",
    ).run(JUDUL[0]);
    expect(judul("atap")).toEqual([JUDUL[0]]);
  });
  it("indeks mengikuti UPDATE dan DELETE lewat trigger", () => {
    db.prepare(
      "UPDATE lowongan_pekerjaan SET judul = 'Servis genteng rumah' WHERE judul = ?",
    ).run(JUDUL[0]);
    expect(judul("atap")).toEqual([]);
    expect(judul("genteng")).toEqual(["Servis genteng rumah"]);
    db.prepare(
      "DELETE FROM lowongan_pekerjaan WHERE judul = 'Servis genteng rumah'",
    ).run();
    expect(judul("genteng")).toEqual([]);
  });
  it("INSERT baru langsung dapat dicari", () => {
    const pk = (
      db
        .prepare("SELECT id_penyedia_kerja id FROM penyedia_kerja LIMIT 1")
        .get() as { id: string }
    ).id;
    db.prepare(
      `INSERT INTO lowongan_pekerjaan (id_lowongan, id_penyedia_kerja, judul, deskripsi, ruang_lingkup, kriteria_hasil,
         kategori, lokasi, tanggal_pekerjaan, estimasi_durasi, upah, satuan_upah, kuota)
       VALUES (?, ?, 'Pasang antena televisi', 'Deskripsi pekerjaan untuk uji trigger insert', 'a', 'b', 'Lainnya', 'Dago, Bandung',
         '2026-12-01', '1 jam', 100000, 'PER_TUGAS', 1)`,
    ).run(randomUUID(), pk);
    expect(judul("antena")).toEqual(["Pasang antena televisi"]);
  });
});
