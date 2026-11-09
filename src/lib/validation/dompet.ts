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

export type DompetResponse = z.infer<typeof DompetResponseSchema>;
export type MutasiSaldoItem = z.infer<typeof MutasiSaldoItemSchema>;
export type PencairanItem = z.infer<typeof PencairanItemSchema>;
