import { z } from "zod";

export const MutasiSaldoItemSchema = z
  .object({
    kunciOperasi: z.string(),
    nominal: z.number().int(),
    createdAt: z.string(),
  })
  .strict();

export const PencairanItemSchema = z
  .object({
    id: z.string(),
    nominal: z.number().int().nonnegative(),
    rekeningMasked: z.string(),
    status: z.string(),
    bisaCobaUlang: z.boolean().optional(),
    waktuPengajuan: z.string(),
  })
  .strict();

export const DompetResponseSchema = z
  .object({
    saldo: z.number().int().nonnegative(),
    saldoTersedia: z.number().int().nonnegative(),
    mutasi: z.array(MutasiSaldoItemSchema),
    pencairan: z.array(PencairanItemSchema),
  })
  .strict();

export const RekeningTujuanRegex = /^(BANK:\d{10,16}|EWALLET:08\d{8,11})$/;

export const PencairanInputSchema = z
  .object({
    nominal: z
      .number({
        required_error: "Nominal penarikan wajib diisi",
        invalid_type_error: "Nominal harus berupa angka",
      })
      .int("Nominal harus berupa bilangan bulat")
      .min(10000, "Nominal pencairan minimal Rp 10.000"),
    rekeningTujuan: z
      .string({
        required_error: "Rekening tujuan wajib diisi",
      })
      .regex(
        RekeningTujuanRegex,
        "Format rekening tujuan harus BANK:<10-16 digit> atau EWALLET:08<8-11 digit>",
      ),
  })
  .strict();

export const PencairanResponseSchema = z
  .object({
    id: z.string(),
    nominal: z.number().int().nonnegative(),
    rekeningMasked: z.string(),
    status: z.string(),
    bisaCobaUlang: z.boolean().optional(),
  })
  .strict();

export type DompetResponse = z.infer<typeof DompetResponseSchema>;
export type MutasiSaldoItem = z.infer<typeof MutasiSaldoItemSchema>;
export type PencairanItem = z.infer<typeof PencairanItemSchema>;
export type PencairanInput = z.infer<typeof PencairanInputSchema>;
export type PencairanResponse = z.infer<typeof PencairanResponseSchema>;
