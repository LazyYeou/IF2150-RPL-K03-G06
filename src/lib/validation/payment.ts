import { z } from "zod";
import { Id } from "./common";

export const NominalWebhook = z.number().finite().int().positive().safe();

// Tepat satu jenis referensi; nilai nominal diambil dari DB, bukan dari klien simulator.
export const TriggerMockGatewayInput = z.union([
  z
    .object({
      idTagihan: Id,
      status: z
        .enum(["BERHASIL", "GAGAL", "KEDALUWARSA", "DIPROSES"])
        .default("BERHASIL"),
    })
    .strict(),
  z
    .object({
      idPencairan: Id,
      status: z
        .enum(["BERHASIL", "GAGAL", "DITOLAK", "DIPROSES"])
        .default("BERHASIL"),
    })
    .strict(),
]);
