import "server-only";
import { db, tx } from "@/lib/db";
import type { PerbaruiProfil, Profil } from "@/lib/validation/profil";

export function ambil(id: string): Profil | null {
  const row = db
    .prepare(
      `SELECT p.id_pengguna AS id, p.nama, p.email, p.peran,
    p.area_layanan AS areaLayanan, p.bio, p.akumulasi_rating AS akumulasiRating,
    p.jumlah_ulasan AS jumlahUlasan, tk.status_verifikasi AS statusVerifikasi
    FROM pengguna p LEFT JOIN tenaga_kerja tk USING (id_pengguna)
    WHERE p.id_pengguna = ?`,
    )
    .get(id) as
    | (Omit<Profil, "statusVerifikasi"> & {
        statusVerifikasi: Profil["statusVerifikasi"] | null;
      })
    | undefined;
  if (!row) return null;
  const { statusVerifikasi, ...profil } = row;
  return statusVerifikasi ? { ...profil, statusVerifikasi } : profil;
}

export function ambilPublik(id: string) {
  const row = db
    .prepare(
      `SELECT p.id_pengguna AS id, p.nama, p.peran,
              p.area_layanan AS areaLayanan, p.bio,
              p.akumulasi_rating AS akumulasiRating,
              p.jumlah_ulasan AS jumlahUlasan,
              tk.status_verifikasi AS statusVerifikasi
       FROM pengguna p LEFT JOIN tenaga_kerja tk USING (id_pengguna)
       WHERE p.id_pengguna = ? AND p.peran IN ('TK', 'PK')`,
    )
    .get(id) as
    | {
        id: string;
        nama: string;
        peran: "TK" | "PK";
        areaLayanan: string | null;
        bio: string | null;
        akumulasiRating: number;
        jumlahUlasan: number;
        statusVerifikasi: Profil["statusVerifikasi"] | null;
      }
    | undefined;
  if (!row) return null;

  const ulasan = db
    .prepare(
      `SELECT u.id_ulasan AS id, penilai.nama AS namaPenilai,
              l.judul AS judulPekerjaan, u.nilai,
              u.deskripsi_ulasan AS deskripsi,
              strftime('%Y-%m-%dT%H:%M:%fZ', u.created_at) AS createdAt
       FROM ulasan_rating u
       JOIN pengguna penilai ON penilai.id_pengguna = u.id_penilai
       JOIN transaksi_pekerjaan t ON t.id_transaksi = u.id_transaksi
       JOIN lowongan_pekerjaan l ON l.id_lowongan = t.id_lowongan
       WHERE u.id_penerima = ?
       ORDER BY u.created_at DESC, u.id_ulasan DESC
       LIMIT 20`,
    )
    .all(id) as {
    id: string;
    namaPenilai: string;
    judulPekerjaan: string;
    nilai: number;
    deskripsi: string | null;
    createdAt: string;
  }[];
  const { statusVerifikasi, ...profil } = row;
  return {
    ...profil,
    ...(statusVerifikasi ? { statusVerifikasi } : {}),
    ulasan,
  };
}

export function ulasanDiterima(id: string) {
  return ambilPublik(id)?.ulasan ?? [];
}

export function perbarui(id: string, input: PerbaruiProfil) {
  return tx(() => {
    db.prepare(
      `UPDATE pengguna SET
      nama = CASE WHEN @adaNama THEN @nama ELSE nama END,
      area_layanan = CASE WHEN @adaArea THEN @area ELSE area_layanan END,
      bio = CASE WHEN @adaBio THEN @bio ELSE bio END
      WHERE id_pengguna = @id`,
    ).run({
      id,
      adaNama: input.nama !== undefined ? 1 : 0,
      nama: input.nama ?? null,
      adaArea: input.areaLayanan !== undefined ? 1 : 0,
      area: input.areaLayanan || null,
      adaBio: input.bio !== undefined ? 1 : 0,
      bio: input.bio || null,
    });
    return ambil(id);
  });
}
