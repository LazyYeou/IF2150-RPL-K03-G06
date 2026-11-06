import { z } from "zod";
import { StatusVerifikasi } from "./common";

/** Bandingkan tanggal kalender WIB; tanggal mustahil dan tanggal masa depan ditolak. */
export function validasiBatasUsia(
  tanggal: string,
  sekarang = new Date(),
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) return false;
  const lahir = new Date(`${tanggal}T00:00:00Z`);
  if (
    !Number.isFinite(lahir.getTime()) ||
    lahir.toISOString().slice(0, 10) !== tanggal
  )
    return false;
  const hariIni = new Date(sekarang.getTime() + 7 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const [tahun, bulan, hari] = hariIni.split("-").map(Number);
  const [y, m, d] = tanggal.split("-").map(Number);
  return tahun - y - (bulan < m || (bulan === m && hari < d) ? 1 : 0) >= 17;
}

const Email = z
  .string()
  .trim()
  .max(254)
  .email("Email tidak valid")
  .toLowerCase();
const Password = z
  .string()
  .min(8, "Kata sandi minimal 8 karakter")
  .max(72, "Kata sandi maksimal 72 karakter");
export const RegistrasiInput = z
  .object({
    nama: z.string().trim().min(1, "Nama wajib diisi").max(80),
    email: Email,
    password: Password,
    peran: z.enum(["TK", "PK"]),
    tanggalLahir: z
      .string()
      .refine(
        (v) => validasiBatasUsia(v),
        "Tanggal lahir harus valid dan usia minimal 17 tahun",
      ),
    persetujuanPrivasi: z.literal(true, {
      errorMap: () => ({ message: "Persetujuan privasi wajib dicentang" }),
    }),
  })
  .strict();
export const LoginInput = z
  .object({ email: Email, password: z.string().min(1).max(72) })
  .strict();
export const PenggunaSesi = z
  .object({
    id: z.string().uuid(),
    nama: z.string(),
    email: z.string().email(),
    peran: z.enum(["TK", "PK", "CS"]),
    statusVerifikasi: StatusVerifikasi.optional(),
  })
  .strict();
export const AuthResponse = z
  .object({
    pengguna: PenggunaSesi,
    redirectTo: z.enum(["/tk", "/pk", "/cs"]),
  })
  .strict();
export type Registrasi = z.infer<typeof RegistrasiInput>;
export type Pengguna = z.infer<typeof PenggunaSesi>;
