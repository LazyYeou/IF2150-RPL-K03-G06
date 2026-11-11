import "server-only";
import { db } from "@/lib/db";

export const UKURAN_HALAMAN = 12;

/** #52: hanya TK terverifikasi; kolom publik saja (tanpa email, dokumen, saldo, rekening). */
export function cari(q: string | undefined, page: number) {
  const cocok = q
    ? "AND (p.nama LIKE @q ESCAPE '\\' OR p.bio LIKE @q ESCAPE '\\' OR p.area_layanan LIKE @q ESCAPE '\\')"
    : "";
  const filter = q ? { q: `%${q.replace(/[\\%_]/g, "\\$&")}%` } : {};
  const dari = `FROM pengguna p JOIN tenaga_kerja tk USING (id_pengguna)
    WHERE p.peran = 'TK' AND tk.status_verifikasi = 'TERVERIFIKASI' ${cocok}`;
  const items = db
    .prepare(
      `SELECT p.id_pengguna AS id, p.nama, p.area_layanan AS areaLayanan, p.bio,
         p.akumulasi_rating AS akumulasiRating, p.jumlah_ulasan AS jumlahUlasan
       ${dari} ORDER BY p.akumulasi_rating DESC, p.jumlah_ulasan DESC, p.id_pengguna
       LIMIT @limit OFFSET @offset`,
    )
    .all({
      ...filter,
      limit: UKURAN_HALAMAN,
      offset: (page - 1) * UKURAN_HALAMAN,
    });
  const { total } = db
    .prepare(`SELECT COUNT(*) AS total ${dari}`)
    .get(filter) as {
    total: number;
  };
  return { items, total, page, pageSize: UKURAN_HALAMAN };
}
