import "server-only";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { bacaSesi, type Peran, type SesiPengguna } from "./session";

// Dipanggil di baris pertama controller. ID pelaku selalu dari sesi, bukan body (KNF06).

export async function requireUser(): Promise<SesiPengguna> {
  const user = await bacaSesi();
  if (!user)
    throw new AppError("UNAUTHENTICATED", 401, "Silakan masuk terlebih dahulu");
  return user;
}

export async function requireRole(...peran: Peran[]): Promise<SesiPengguna> {
  const user = await requireUser();
  if (!peran.includes(user.peran))
    throw new AppError("FORBIDDEN", 403, "Anda tidak berhak mengakses ini");
  return user;
}

export const requireCS = () => requireRole("CS");

/** TK dengan identitas terverifikasi (KF06). Fail-closed bila profil TK tidak ditemukan (KNF23). */
export async function requireVerifiedTK(): Promise<
  SesiPengguna & { idTenagaKerja: string }
> {
  const user = await requireRole("TK");
  const tk = db
    .prepare(
      "SELECT id_tenaga_kerja AS id, status_verifikasi AS status FROM tenaga_kerja WHERE id_pengguna = ?",
    )
    .get(user.id) as { id: string; status: string } | undefined;
  if (tk?.status !== "TERVERIFIKASI")
    throw new AppError("NOT_VERIFIED", 403, "Akun Anda belum terverifikasi");
  return { ...user, idTenagaKerja: tk.id };
}

/** Pastikan sesi adalah pemilik data; `idPemilik` = id pengguna/profil pemilik sesuai yang dibandingkan. */
export function requireOwner(idPemilik: string, idPelaku: string): void {
  if (idPemilik !== idPelaku)
    throw new AppError("FORBIDDEN", 403, "Anda bukan pemilik data ini");
}
