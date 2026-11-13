import { randomUUID } from "node:crypto";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { seed } from "../db/seed";
import { bukaDb } from "../db/open";
import { migrate } from "./migrate";

// Basis data besar untuk profiling pencarian (#45): npm run db:seed-besar [jumlah] [berkas]
// Selalu membuat ulang berkas; tidak pernah menyentuh data/kerjain.db.
const JUMLAH = Number(process.argv[2] ?? 20_000);
const FILE = path.resolve(process.argv[3] ?? "data/besar.db");
const KATA = [
  "bersih",
  "cuci",
  "angkut",
  "pasang",
  "perbaiki",
  "cat",
  "rapikan",
  "bantu",
  "pindahan",
  "karpet",
  "atap",
  "pagar",
  "taman",
  "gudang",
  "kamar",
  "dapur",
  "lampu",
  "kabel",
  "pipa",
  "rak",
  "lemari",
  "meja",
  "mobil",
  "motor",
  "hajatan",
];
const KATEGORI = [
  "Kebersihan",
  "Perbaikan Rumah",
  "Angkut Barang",
  "Acara & Katering",
  "Pertukangan",
  "Kelistrikan",
  "Lainnya",
];
const KOTA = [
  "Coblong",
  "Dago",
  "Cicendo",
  "Lengkong",
  "Buah Batu",
  "Antapani",
];
const pilih = <T>(a: T[], i: number) => a[i % a.length];

async function main() {
  for (const s of ["", "-wal", "-shm"]) rmSync(FILE + s, { force: true });
  if (existsSync(FILE)) throw new Error("Gagal menghapus " + FILE);
  const db = bukaDb(FILE);
  migrate(db);
  await seed(db);
  const pk = (
    db
      .prepare("SELECT id_penyedia_kerja id FROM penyedia_kerja LIMIT 1")
      .get() as {
      id: string;
    }
  ).id;
  const ins = db.prepare(
    `INSERT INTO lowongan_pekerjaan (id_lowongan, id_penyedia_kerja, judul, deskripsi, ruang_lingkup, kriteria_hasil,
       kategori, lokasi, tanggal_pekerjaan, estimasi_durasi, upah, satuan_upah, kuota, status_lowongan, created_at)
     VALUES (?, ?, ?, ?, 'Sesuai kesepakatan', 'Hasil rapi', ?, ?, '2026-12-01', '2 jam', ?, 'PER_TUGAS', 1, ?, datetime('now', ?))`,
  );
  db.transaction(() => {
    for (let i = 0; i < JUMLAH; i++) {
      const a = pilih(KATA, i * 7),
        b = pilih(KATA, i * 13 + 3),
        c = pilih(KATA, i * 5 + 1);
      ins.run(
        randomUUID(),
        pk,
        `${a} ${b} nomor ${i}`.replace(/^./, (x) => x.toUpperCase()),
        `Butuh bantuan untuk ${a} ${b} dan ${c} di area ${pilih(KOTA, i)}, pekerjaan harian dengan hasil rapi.`,
        pilih(KATEGORI, i),
        `${pilih(KOTA, i * 3)}, Bandung`,
        10_000 + (i % 90) * 5_000,
        i % 10 === 0 ? "CLOSED_FULL" : "OPEN", // 10% bukan OPEN
        `-${i} minutes`,
      );
    }
  })();
  console.log(`${JUMLAH} lowongan dibuat di ${FILE}`);
  db.close();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
