import { z } from "zod";
import { PenggunaSesi } from "./auth";

export const PerbaruiProfilInput = z
  .object({
    nama: z
      .string()
      .trim()
      .min(1, "Nama wajib diisi")
      .max(80, "Nama maksimal 80 karakter")
      .optional(),
    areaLayanan: z
      .string()
      .trim()
      .max(150, "Area layanan maksimal 150 karakter")
      .optional(),
    bio: z.string().trim().max(1000, "Bio maksimal 1.000 karakter").optional(),
  })
  .strict()
  .refine(
    (input) => Object.keys(input).length > 0,
    "Isi minimal satu perubahan profil",
  );
export const ProfilResponse = PenggunaSesi.extend({
  areaLayanan: z.string().nullable(),
  bio: z.string().nullable(),
  akumulasiRating: z.number(),
  jumlahUlasan: z.number().int().nonnegative(),
}).strict();
export const UlasanProfil = z
  .object({
    id: z.string().uuid(),
    namaPenilai: z.string(),
    judulPekerjaan: z.string(),
    nilai: z.number().int().min(1).max(5),
    deskripsi: z.string().nullable(),
    createdAt: z.string().datetime(),
  })
  .strict();
export const ProfilPublikResponse = z
  .object({
    id: z.string().uuid(),
    nama: z.string(),
    peran: z.enum(["TK", "PK"]),
    areaLayanan: z.string().nullable(),
    bio: z.string().nullable(),
    statusVerifikasi: z
      .enum([
        "BELUM_TERVERIFIKASI",
        "MENUNGGU_VERIFIKASI",
        "TERVERIFIKASI",
        "DITOLAK",
      ])
      .optional(),
    akumulasiRating: z.number(),
    jumlahUlasan: z.number().int().nonnegative(),
    ulasan: z.array(UlasanProfil),
  })
  .strict();
export type PerbaruiProfil = z.infer<typeof PerbaruiProfilInput>;
export type Profil = z.infer<typeof ProfilResponse>;
export type UlasanProfil = z.infer<typeof UlasanProfil>;
export type ProfilPublik = z.infer<typeof ProfilPublikResponse>;
