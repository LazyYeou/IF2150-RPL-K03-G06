import { z } from "zod";

export const LupaSandiInput = z
  .object({
    email: z.string().trim().max(254).email("Email tidak valid").toLowerCase(),
  })
  .strict();
export const ResetSandiInput = z
  .object({
    token: z.string().regex(/^[A-Za-z0-9_-]{43}$/, "Tautan reset tidak valid"),
    passwordBaru: z
      .string()
      .min(8, "Kata sandi minimal 8 karakter")
      .max(72, "Kata sandi maksimal 72 karakter"),
  })
  .strict();
export const LupaSandiResponse = z.object({ message: z.string() }).strict();
