import { z } from "zod";
import { Id, Keputusan, Page, Paginasi, StatusTiket, Waktu } from "./common";

// POST /api/tiket (multipart; dari transaksi atau bantuan umum) — KF24.
// Berkas opsional (<= 10 MB) dicek di lib/storage.
export const BuatTiketInput = z
  .object({
    idTransaksi: Id.optional(),
    kategoriMasalah: z.string().trim().min(1).max(100),
    deskripsi: z.string().trim().min(20).max(1000),
  })
  .strict();
export type BuatTiketInput = z.infer<typeof BuatTiketInput>;

// GET /api/cs/tiket
export const DaftarTiketQuery = z
  .object({ status: StatusTiket.optional(), page: Page })
  .strict();

// POST /api/cs/tiket/:id/putuskan — KF25
export const PutuskanTiketInput = z
  .object({
    keputusan: Keputusan,
    catatan: z.string().trim().min(10).max(1000),
  })
  .strict();

// POST /api/cs/tiket/:id/minta-bukti
export const MintaBuktiInput = z
  .object({ pesan: z.string().trim().min(10).max(1000) })
  .strict();

// POST /api/cs/tiket/:id/tolak
export const TolakTiketInput = z
  .object({ alasan: z.string().trim().min(10).max(1000) })
  .strict();

export const Tiket = z.object({
  id: Id,
  nomorTiket: z.string().regex(/^KIN-/),
  idTransaksi: Id.nullable(),
  kategoriMasalah: z.string(),
  deskripsi: z.string(),
  status: StatusTiket,
  keputusan: Keputusan.nullable(),
  createdAt: Waktu,
  pelapor: z.object({ id: Id, nama: z.string() }),
  bukti: z.array(z.object({ id: Id, urlBerkas: z.string(), createdAt: Waktu })),
  riwayat: z.array(
    z.object({
      aktor: z.string().nullable(),
      log: z.string(),
      timestamp: Waktu,
    }),
  ), // kronologis
});
export type Tiket = z.infer<typeof Tiket>;

// Daftar CS: tanpa riwayat
export const DaftarTiketResponse = Paginasi(Tiket.omit({ riwayat: true }));
