import { randomUUID } from "node:crypto";
import type Database from "better-sqlite3";

/** Tambahan >12 transaksi hanya untuk DB fixture pengujian. */
export function tambahFixtureTransaksi(db: Database.Database) {
  const asal = db
    .prepare(
      `SELECT t.* FROM transaksi_pekerjaan t
    JOIN tenaga_kerja tk USING (id_tenaga_kerja)
    JOIN pengguna p ON p.id_pengguna = tk.id_pengguna
    WHERE p.email = 'tk1@kerjain.test' LIMIT 1`,
    )
    .get() as {
    id_lowongan: string;
    id_tenaga_kerja: string;
    id_penyedia_kerja: string;
  };
  db.transaction(() => {
    for (let i = 0; i < 26; i++) {
      const idLowongan = randomUUID(),
        idPenawaran = randomUUID();
      db.prepare(
        `INSERT INTO lowongan_pekerjaan
        (id_lowongan, id_penyedia_kerja, judul, deskripsi, ruang_lingkup, kriteria_hasil, kategori,
        lokasi, tanggal_pekerjaan, estimasi_durasi, upah, satuan_upah, kuota, jumlah_diterima, status_lowongan)
        SELECT ?, id_penyedia_kerja, ?, deskripsi, ruang_lingkup, kriteria_hasil, kategori,
        lokasi, tanggal_pekerjaan, estimasi_durasi, upah, satuan_upah, 1, 1, 'CLOSED_FULL'
        FROM lowongan_pekerjaan WHERE id_lowongan = ?`,
      ).run(
        idLowongan,
        `Fixture paginasi transaksi ${i + 1}`,
        asal.id_lowongan,
      );
      db.prepare(
        `INSERT INTO pengajuan_penawaran
        (id_penawaran, id_lowongan, id_tenaga_kerja, harga_penawaran, ketersediaan, status_penawaran)
        VALUES (?, ?, ?, 100000, 'Sesuai jadwal', 'DITERIMA')`,
      ).run(idPenawaran, idLowongan, asal.id_tenaga_kerja);
      db.prepare(
        `INSERT INTO transaksi_pekerjaan
        (id_transaksi, id_lowongan, id_penawaran, id_tenaga_kerja, id_penyedia_kerja, nominal_upah, status_pekerjaan, created_at)
        VALUES (?, ?, ?, ?, ?, 100000, ?, '2030-01-01 00:00:00')`,
      ).run(
        randomUUID(),
        idLowongan,
        idPenawaran,
        asal.id_tenaga_kerja,
        asal.id_penyedia_kerja,
        i < 14 ? "SUBMITTED" : "IN_PROGRESS",
      );
    }
  })();
}
