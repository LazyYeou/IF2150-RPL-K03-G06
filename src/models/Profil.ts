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
