import "server-only";
import { requireUser } from "@/lib/auth/guards";
import { AppError } from "@/lib/errors";
import { Id } from "@/lib/validation/common";
import {
  DaftarNotifikasiResponse,
  NotifikasiQuery,
} from "@/lib/validation/notifikasi";
import * as Notifikasi from "@/models/Notifikasi";

/**
 * Kontrak: src/docs/contracts/modules.md §1. Panggil SETELAH commit transaksi bisnis.
 * `idPengguna` = pengguna.id_pengguna (bukan id profil).
 * Fungsi internal dipakai modul domain; bukan endpoint pengiriman publik.
 */
export async function kirimNotifikasi(
  idPengguna: string,
  pesan: string,
  tautan?: string,
): Promise<void> {
  Notifikasi.buat(idPengguna, pesan, tautan);
}

export async function ambilNotifikasi(query: unknown) {
  const user = await requireUser();
  const input = NotifikasiQuery.parse(query);
  return DaftarNotifikasiResponse.parse(
    Notifikasi.daftar(user.id, input.belumDibaca === "true"),
  );
}
export async function tandaiNotifikasiDibaca(rawId: string) {
  const user = await requireUser();
  const id = Id.safeParse(rawId);
  if (!id.success || !Notifikasi.tandaiDibaca(id.data, user.id))
    throw new AppError("NOT_FOUND", 404, "Notifikasi tidak ditemukan");
}
