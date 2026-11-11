import { z } from "zod";
import { Id, Page, Paginasi } from "./common";

// GET /api/tenaga-kerja?q=&page= (publik) — #52, hanya TK terverifikasi, tanpa data pribadi sensitif.
export const CariTKQuery = z
  .object({ q: z.string().trim().max(100).optional(), page: Page })
  .strict();
export type CariTKQuery = z.infer<typeof CariTKQuery>;

export const TKRingkas = z.object({
  id: Id,
  nama: z.string(),
  areaLayanan: z.string().nullable(),
  bio: z.string().nullable(),
  akumulasiRating: z.number(),
  jumlahUlasan: z.number().int(),
});
export const DaftarTKResponse = Paginasi(TKRingkas);

// POST /api/tenaga-kerja/:id/undang (PK pemilik lowongan OPEN)
export const UndangTKInput = z.object({ idLowongan: Id }).strict();
