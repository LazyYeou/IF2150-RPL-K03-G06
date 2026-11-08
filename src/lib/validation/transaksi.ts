import { z } from "zod";
import { Id, Page, Paginasi, Rupiah, StatusPekerjaan, Waktu } from "./common";

export const PeranTransaksi = z.preprocess(
  (nilai) => typeof nilai === "string" ? nilai.toUpperCase() : nilai,
  z.enum(["TK", "PK"]),
);

export const DaftarTransaksiQuery = z.object({
  peran: PeranTransaksi.optional(),
  page: Page,
});

export const TransaksiRingkas = z.object({
  id: Id,
  judul: z.string(),
  status: StatusPekerjaan,
  nominalUpah: Rupiah.nonnegative(),
  commissionFee: Rupiah.nonnegative().optional(),
  totalBayar: Rupiah.nonnegative().optional(),
  tenagaKerja: z.string(),
  penyediaKerja: z.string(),
  createdAt: Waktu,
});

export const TimelineTransaksi = z.object({
  status: StatusPekerjaan,
  label: z.string(),
  tercapai: z.boolean(),
  aktif: z.boolean(),
});

export const TransaksiDetail = TransaksiRingkas.extend({
  timeline: z.array(TimelineTransaksi),
});

export const DaftarTransaksi = Paginasi(TransaksiRingkas);

export const UnggahBuktiPekerjaanInput = z.object({
  deskripsi: z.string().trim().min(10).max(2000),
});
