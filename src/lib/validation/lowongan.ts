import { z } from "zod";
import {
  Id,
  KATEGORI,
  KATEGORI_BERISIKO,
  Page,
  Paginasi,
  ProfilPublik,
  Rupiah,
  StatusLowongan,
  StatusPenawaran,
  Tanggal,
  Waktu,
} from "./common";

const Satuan = z.enum(["PER_TUGAS", "PER_HARI"]);

// POST /api/lowongan (PK) — KF07, KF08, KNF09
export const BuatLowonganInput = z
  .object({
    judul: z.string().trim().min(8).max(150),
    deskripsi: z.string().trim().min(20).max(2000),
    ruangLingkup: z.string().trim().min(1),
    kriteriaHasil: z.string().trim().min(1),
    kategori: z.enum(KATEGORI),
    lokasi: z.string().trim().min(1), // kecamatan & kota, bukan alamat lengkap
    tanggalPekerjaan: Tanggal,
    estimasiDurasi: z.string().trim().min(1),
    upah: z.number().int().min(1000).max(100_000_000),
    satuanUpah: Satuan,
    kuota: z.number().int().min(1).max(50),
    pernyataanRisiko: z.boolean(),
  })
  .strict()
  .refine(
    (v) => !KATEGORI_BERISIKO.includes(v.kategori) || v.pernyataanRisiko,
    {
      path: ["pernyataanRisiko"],
      message: "Centang pernyataan risiko untuk kategori ini",
    },
  );
export type BuatLowonganInput = z.infer<typeof BuatLowonganInput>;

// GET /api/lowongan?q=&kategori=&upahMin=&urut=&page= (publik) — KF09
export const CariLowonganQuery = z
  .object({
    q: z.string().trim().max(100).optional(),
    kategori: z.enum(KATEGORI).optional(),
    upahMin: z.coerce.number().int().min(0).optional(),
    urut: z.enum(["terbaru", "upah_tertinggi"]).default("terbaru"),
    page: Page,
  })
  .strict();
export type CariLowonganQuery = z.infer<typeof CariLowonganQuery>;

// GET /api/lowongan/saya?page= (PK)
export const LowonganSayaQuery = z.object({ page: Page }).strict();

export const LowonganRingkas = z.object({
  id: Id,
  judul: z.string(),
  kategori: z.string(),
  lokasi: z.string(),
  tanggalPekerjaan: Tanggal,
  upah: Rupiah,
  satuanUpah: Satuan,
  kuota: z.number().int(),
  jumlahDiterima: z.number().int(),
  status: StatusLowongan,
  createdAt: Waktu,
});
export type LowonganRingkas = z.infer<typeof LowonganRingkas>;

export const LowonganDetail = LowonganRingkas.extend({
  deskripsi: z.string(),
  ruangLingkup: z.string(),
  kriteriaHasil: z.string(),
  estimasiDurasi: z.string(),
  pernyataanRisiko: z.boolean(),
  penyedia: ProfilPublik,
  penawaranSaya: z.object({ id: Id, status: StatusPenawaran }).optional(), // hanya bila TK login
});
export type LowonganDetail = z.infer<typeof LowonganDetail>;

export const DaftarLowonganResponse = Paginasi(LowonganRingkas);
export const LowonganSayaResponse = Paginasi(
  LowonganRingkas.extend({ jumlahPelamarMenunggu: z.number().int() }),
);
