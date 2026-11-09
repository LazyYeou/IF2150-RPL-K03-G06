import { z } from "zod";
import {
  Id,
  Page,
  Paginasi,
  ProfilPublik,
  Rupiah,
  StatusPekerjaan,
  Waktu,
} from "./common";

export const PeranTransaksi = z.preprocess(
  (nilai) => (typeof nilai === "string" ? nilai.toUpperCase() : nilai),
  z.enum(["TK", "PK"]),
);

export const DaftarTransaksiQuery = z.object({
  peran: PeranTransaksi.optional(),
  status: StatusPekerjaan.optional(),
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

export const TransaksiDetail = TransaksiRingkas.omit({
  tenagaKerja: true,
  penyediaKerja: true,
}).extend({
  lowongan: z.object({ id: Id, judul: z.string() }),
  tenagaKerja: ProfilPublik,
  penyediaKerja: ProfilPublik,
  tagihan: z
    .object({
      id: Id,
      idTransaksi: Id,
      nominalUpah: Rupiah,
      commissionFee: Rupiah.nonnegative(),
      totalBayar: Rupiah,
      metode: z.string().nullable(),
      expiry: Waktu,
      status: z.enum([
        "MENUNGGU_PEMBAYARAN",
        "DIPROSES",
        "BERHASIL",
        "GAGAL",
        "KEDALUWARSA",
        "DIKEMBALIKAN",
      ]),
    })
    .nullable(),
  bukti: z.array(
    z.object({
      id: Id,
      deskripsi: z.string(),
      urlBerkas: z.string(),
      waktu: Waktu,
    }),
  ),
  revisi: z.array(z.object({ catatan: z.string(), waktu: Waktu })),
  tiketAktif: z.object({ id: Id, nomorTiket: z.string() }).nullable(),
  ulasanSaya: z.object({ nilai: z.number().int().min(1).max(5) }).nullable(),
  labelStatus: z.string(),
  timeline: z.array(TimelineTransaksi),
});

export const DaftarTransaksi = Paginasi(TransaksiRingkas);

export const UnggahBuktiPekerjaanInput = z.object({
  deskripsi: z.string().trim().min(10).max(1000),
});

export const MintaRevisiInput = z
  .object({
    catatan: z.string().trim().min(10).max(1000),
  })
  .strict();

export const UlasanTransaksiInput = z
  .object({
    nilai: z.number().int().min(1).max(5),
    deskripsi: z.string().trim().max(1000).optional(),
  })
  .strict();
