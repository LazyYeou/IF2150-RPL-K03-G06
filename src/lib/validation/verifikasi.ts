import { z } from "zod";
import { Id, StatusVerifikasi, Waktu } from "./common";

export const BATAS_BERKAS_IDENTITAS = 5 * 1024 * 1024; // KTP 5 MB

// POST /api/verifikasi (multipart): field non-berkas saja. Berkas (JPG/PNG/PDF) dicek di lib/storage.
// Di multipart semua nilai berupa string.
export const UnggahVerifikasiInput = z
  .object({ persetujuan: z.literal("true") })
  .strict();

// GET /api/verifikasi/status (TK)
export const VerifikasiStatusResponse = z.object({
  status: StatusVerifikasi,
  waktuPengajuan: Waktu.nullable(),
  alasanPenolakan: z.string().nullable(),
});

// GET /api/cs/verifikasi (CS)
export const AntreanVerifikasiResponse = z.object({
  items: z.array(
    z.object({
      idTenagaKerja: Id,
      nama: z.string(),
      email: z.string().email(),
      waktuPengajuan: Waktu,
    }),
  ),
});

// POST /api/cs/verifikasi/:idTK/tolak (CS); /setujui tanpa body
export const TolakVerifikasiInput = z
  .object({ alasan: z.string().trim().min(5).max(500) })
  .strict();

export const HasilVerifikasiResponse = z.object({
  status: z.enum(["TERVERIFIKASI", "DITOLAK"]),
});
