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
export type PerbaruiProfil = z.infer<typeof PerbaruiProfilInput>;
export type Profil = z.infer<typeof ProfilResponse>;
