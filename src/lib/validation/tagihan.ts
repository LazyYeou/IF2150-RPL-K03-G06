import { z } from "zod";
import { Id, Rupiah, Waktu } from "./common";

export const StatusTagihan = z.enum([
  "MENUNGGU_PEMBAYARAN",
  "DIPROSES",
  "BERHASIL",
  "GAGAL",
  "KEDALUWARSA",
  "DIKEMBALIKAN",
]);
export type StatusTagihan = z.infer<typeof StatusTagihan>;

export const MetodePembayaran = z.enum([
  "VA_BCA",
  "VA_BNI",
  "QRIS",
  "EWALLET",
]);
export type MetodePembayaran = z.infer<typeof MetodePembayaran>;

export const Tagihan = z.object({
  id: Id,
  idTransaksi: Id,
  nominalUpah: Rupiah.nonnegative(),
  commissionFee: Rupiah.nonnegative(),
  totalBayar: Rupiah.nonnegative(),
  metode: MetodePembayaran.nullable(),
  expiry: Waktu,
  status: StatusTagihan,
  createdAt: Waktu,
});
export type Tagihan = z.infer<typeof Tagihan>;
