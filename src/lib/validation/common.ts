import { z } from "zod";

// Kontrak: src/docs/contracts/api.md §1–§2. Nilai enum: src/docs/contracts/db.md §4.
export const KATEGORI = [
  "Kebersihan",
  "Perbaikan Rumah",
  "Angkut Barang",
  "Acara & Katering",
  "Pertukangan",
  "Kelistrikan",
  "Lainnya",
] as const;
export const KATEGORI_BERISIKO: readonly string[] = ["Kelistrikan"]; // KNF09

export const Id = z.string().uuid();
export const Waktu = z.string().datetime(); // ISO 8601 UTC
export const Tanggal = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const Rupiah = z.number().int();

export const StatusLowongan = z.enum(["OPEN", "CLOSED_FULL", "DIBATALKAN"]);
export const StatusPenawaran = z.enum([
  "MENUNGGU",
  "DITERIMA",
  "DITOLAK",
  "DITARIK",
  "DITOLAK_OTOMATIS",
]);
export const StatusVerifikasi = z.enum([
  "BELUM_TERVERIFIKASI",
  "MENUNGGU_VERIFIKASI",
  "TERVERIFIKASI",
  "DITOLAK",
]);
export const StatusPekerjaan = z.enum([
  "MENUNGGU_PEMBAYARAN",
  "IN_PROGRESS",
  "SUBMITTED",
  "COMPLETED",
  "DISENGKETAKAN",
  "DIBATALKAN",
]);
export const LABEL_STATUS_PEKERJAAN: Record<
  z.infer<typeof StatusPekerjaan>,
  string
> = {
  MENUNGGU_PEMBAYARAN: "Menunggu pembayaran",
  IN_PROGRESS: "Sedang dikerjakan",
  SUBMITTED: "Menunggu pemeriksaan",
  COMPLETED: "Selesai",
  DISENGKETAKAN: "Dalam peninjauan CS",
  DIBATALKAN: "Dibatalkan",
};
export const StatusTiket = z.enum([
  "DIAJUKAN",
  "DITINJAU",
  "MENUNGGU_BALASAN",
  "DIPROSES",
  "DITUTUP",
  "DITOLAK",
  "DIBATALKAN",
]);
export const Keputusan = z.enum(["REFUND", "PENCAIRAN"]);

export const ProfilPublik = z.object({
  id: Id,
  nama: z.string(),
  akumulasiRating: z.number(),
  jumlahUlasan: z.number().int(),
});

/** Query `page` dari URL (string) menjadi angka >= 1. */
export const Page = z.coerce.number().int().min(1).default(1);

export const Paginasi = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    total: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
  });
