import { z } from "zod";
import {
  Id,
  Page,
  Paginasi,
  ProfilPublik,
  Rupiah,
  StatusLowongan,
  StatusPenawaran,
  Waktu,
} from "./common";
import { LowonganRingkas } from "./lowongan";

// POST /api/penawaran (TK terverifikasi) — KF10, KF11
export const AjukanPenawaranInput = z
  .object({
    idLowongan: Id,
    hargaPenawaran: z.number().int().min(1000).max(100_000_000),
    ketersediaan: z.string().trim().min(1).max(120),
    pesan: z.string().trim().max(1000).optional(),
  })
  .strict();
export type AjukanPenawaranInput = z.infer<typeof AjukanPenawaranInput>;

// GET /api/penawaran/saya
export const PenawaranSayaQuery = z
  .object({ status: StatusPenawaran.optional(), page: Page })
  .strict();

export const Penawaran = z.object({
  id: Id,
  lowongan: z.object({ id: Id, judul: z.string() }),
  hargaPenawaran: Rupiah,
  ketersediaan: z.string(),
  pesan: z.string().nullable(),
  status: StatusPenawaran,
  createdAt: Waktu,
});
export type Penawaran = z.infer<typeof Penawaran>;
export const PenawaranSayaResponse = Paginasi(Penawaran);

// GET /api/lowongan/:id/pelamar (PK pemilik)
export const Pelamar = z.object({
  idPenawaran: Id,
  tenagaKerja: ProfilPublik,
  hargaPenawaran: Rupiah,
  ketersediaan: z.string(),
  pesan: z.string().nullable(),
  status: StatusPenawaran,
  createdAt: Waktu,
});
export const PelamarResponse = z.object({
  lowongan: LowonganRingkas,
  sisaKuota: z.number().int(),
  items: z.array(Pelamar),
});

// POST /api/penawaran/:id/terima (PK pemilik) — tanpa body
export const TerimaPenawaranResponse = z.object({
  idTransaksi: Id,
  statusLowongan: StatusLowongan,
  sisaKuota: z.number().int(),
});
