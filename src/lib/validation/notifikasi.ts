import { z } from "zod";
import { Id, Waktu } from "./common";
export const NotifikasiQuery = z
  .object({ belumDibaca: z.literal("true").optional() })
  .strict();
export const Notifikasi = z
  .object({
    id: Id,
    pesan: z.string(),
    tautan: z.string().nullable(),
    dibaca: z.boolean(),
    waktuKirim: Waktu,
  })
  .strict();
export const DaftarNotifikasiResponse = z
  .object({
    items: z.array(Notifikasi).max(20),
    jumlahBelumDibaca: z.number().int().nonnegative(),
  })
  .strict();
export type Notifikasi = z.infer<typeof Notifikasi>;
export type DaftarNotifikasi = z.infer<typeof DaftarNotifikasiResponse>;

/** Tautan notifikasi hanya boleh membuka route internal; abaikan URL eksternal/protokol skrip. */
export function tautanNotifikasi(tautan: string | null): string | null {
  if (
    !tautan ||
    !tautan.startsWith("/") ||
    tautan.startsWith("//") ||
    /[\\\u0000-\u001f\u007f]/.test(tautan)
  )
    return null;
  try {
    const url = new URL(tautan, "https://kerjain.invalid");
    return url.origin === "https://kerjain.invalid"
      ? url.pathname + url.search + url.hash
      : null;
  } catch {
    return null;
  }
}
