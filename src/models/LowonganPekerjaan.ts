import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { keIso } from "@/lib/http";
import type {
  BuatLowonganInput,
  CariLowonganQuery,
  LowonganDetail,
  LowonganRingkas,
} from "@/lib/validation/lowongan";

// C05. Query SQL ber-parameter saja; mapping snake_case -> camelCase di sini.
export const UKURAN_HALAMAN = 12;

/** Lindungi karakter khusus LIKE agar `%`/`_` dari pengguna dicari apa adanya. */
export const escapeLike = (s: string) => s.replace(/[\\%_]/g, "\\$&");

const KOLOM_RINGKAS = `l.id_lowongan AS id, l.judul, l.kategori, l.lokasi, l.tanggal_pekerjaan AS tanggalPekerjaan,
  l.upah, l.satuan_upah AS satuanUpah, l.kuota, l.jumlah_diterima AS jumlahDiterima,
  l.status_lowongan AS status, l.created_at AS createdAt`;

type BarisRingkas = Omit<LowonganRingkas, "createdAt"> & { createdAt: string };
const ringkas = <T extends BarisRingkas>(r: T): T => ({
  ...r,
  createdAt: keIso(r.createdAt),
});

export function idPenyediaKerja(idPengguna: string): string | null {
  const r = db
    .prepare(
      "SELECT id_penyedia_kerja AS id FROM penyedia_kerja WHERE id_pengguna = ?",
    )
    .get(idPengguna) as { id: string } | undefined;
  return r?.id ?? null;
}

/** KF07: status awal OPEN dan jumlah_diterima 0 (default kolom) selalu ditentukan di sini. */
export function buat(idPK: string, v: BuatLowonganInput): string {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO lowongan_pekerjaan (id_lowongan, id_penyedia_kerja, judul, deskripsi, ruang_lingkup, kriteria_hasil,
       kategori, lokasi, tanggal_pekerjaan, estimasi_durasi, upah, satuan_upah, kuota, jumlah_diterima,
       pernyataan_risiko, status_lowongan)
     VALUES (@id, @idPK, @judul, @deskripsi, @ruangLingkup, @kriteriaHasil, @kategori, @lokasi, @tanggalPekerjaan,
       @estimasiDurasi, @upah, @satuanUpah, @kuota, 0, @risiko, 'OPEN')`,
  ).run({ ...v, id, idPK, risiko: v.pernyataanRisiko ? 1 : 0 });
  return id;
}

/** Q-102a + Q-103: hanya lowongan OPEN (KF09). Diganti FTS5 (Q-102) setelah profiling #45. */
export function cari(q: CariLowonganQuery) {
  const p = {
    q: q.q ? `%${escapeLike(q.q)}%` : null,
    kategori: q.kategori ?? null,
    upahMin: q.upahMin ?? null,
    limit: UKURAN_HALAMAN,
    offset: (q.page - 1) * UKURAN_HALAMAN,
  };
  const where = `l.status_lowongan = 'OPEN'
    AND (@q IS NULL OR l.judul LIKE @q ESCAPE '\\' OR l.deskripsi LIKE @q ESCAPE '\\')
    AND (@kategori IS NULL OR l.kategori = @kategori)
    AND (@upahMin IS NULL OR l.upah >= @upahMin)`;
  const urut =
    q.urut === "upah_tertinggi"
      ? "l.upah DESC, l.created_at DESC"
      : "l.created_at DESC, l.id_lowongan";
  const items = db
    .prepare(
      `SELECT ${KOLOM_RINGKAS} FROM lowongan_pekerjaan l WHERE ${where} ORDER BY ${urut} LIMIT @limit OFFSET @offset`,
    )
    .all(p) as BarisRingkas[];
  const { total } = db
    .prepare(
      `SELECT COUNT(*) AS total FROM lowongan_pekerjaan l WHERE ${where}`,
    )
    .get({ q: p.q, kategori: p.kategori, upahMin: p.upahMin }) as {
    total: number;
  };
  return {
    items: items.map(ringkas),
    total,
    page: q.page,
    pageSize: UKURAN_HALAMAN,
  };
}

/** Lowongan milik satu PK beserta jumlah pelamar yang masih menunggu. */
export function milikPK(idPK: string, page: number) {
  const items = db
    .prepare(
      `SELECT ${KOLOM_RINGKAS},
         (SELECT COUNT(*) FROM pengajuan_penawaran p
           WHERE p.id_lowongan = l.id_lowongan AND p.status_penawaran = 'MENUNGGU') AS jumlahPelamarMenunggu
       FROM lowongan_pekerjaan l WHERE l.id_penyedia_kerja = ?
       ORDER BY l.created_at DESC, l.id_lowongan LIMIT ? OFFSET ?`,
    )
    .all(idPK, UKURAN_HALAMAN, (page - 1) * UKURAN_HALAMAN) as (BarisRingkas & {
    jumlahPelamarMenunggu: number;
  })[];
  const { total } = db
    .prepare(
      "SELECT COUNT(*) AS total FROM lowongan_pekerjaan WHERE id_penyedia_kerja = ?",
    )
    .get(idPK) as { total: number };
  return { items: items.map(ringkas), total, page, pageSize: UKURAN_HALAMAN };
}

/** Detail publik; `idPenggunaTK` (opsional) menambahkan penawaran aktif milik TK yang melihat. */
export function detail(
  id: string,
  idPenggunaTK?: string,
): LowonganDetail | null {
  const r = db
    .prepare(
      `SELECT ${KOLOM_RINGKAS}, l.deskripsi, l.ruang_lingkup AS ruangLingkup, l.kriteria_hasil AS kriteriaHasil,
         l.estimasi_durasi AS estimasiDurasi, l.pernyataan_risiko AS pernyataanRisiko,
         u.id_pengguna AS idPenyedia, u.nama AS namaPenyedia, u.akumulasi_rating AS rating, u.jumlah_ulasan AS ulasan
       FROM lowongan_pekerjaan l
       JOIN penyedia_kerja pk USING (id_penyedia_kerja)
       JOIN pengguna u ON u.id_pengguna = pk.id_pengguna
       WHERE l.id_lowongan = ?`,
    )
    .get(id) as
    | (BarisRingkas & {
        deskripsi: string;
        ruangLingkup: string;
        kriteriaHasil: string;
        estimasiDurasi: string;
        pernyataanRisiko: number;
        idPenyedia: string;
        namaPenyedia: string;
        rating: number;
        ulasan: number;
      })
    | undefined;
  if (!r) return null;

  const {
    idPenyedia,
    namaPenyedia,
    rating,
    ulasan,
    pernyataanRisiko,
    ...sisa
  } = r;
  const hasil: LowonganDetail = {
    ...ringkas(sisa),
    pernyataanRisiko: pernyataanRisiko === 1,
    penyedia: {
      id: idPenyedia,
      nama: namaPenyedia,
      akumulasiRating: rating,
      jumlahUlasan: ulasan,
    },
  };
  if (idPenggunaTK) {
    const p = db
      .prepare(
        `SELECT p.id_penawaran AS id, p.status_penawaran AS status
         FROM pengajuan_penawaran p JOIN tenaga_kerja tk USING (id_tenaga_kerja)
         WHERE p.id_lowongan = ? AND tk.id_pengguna = ? AND p.status_penawaran IN ('MENUNGGU','DITERIMA')`,
      )
      .get(id, idPenggunaTK) as LowonganDetail["penawaranSaya"];
    if (p) hasil.penawaranSaya = p;
  }
  return hasil;
}
