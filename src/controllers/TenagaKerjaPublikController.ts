import "server-only";
import { requireRole } from "@/lib/auth/guards";
import { AppError } from "@/lib/errors";
import { Id } from "@/lib/validation/common";
import { CariTKQuery, UndangTKInput } from "@/lib/validation/tenagaKerja";
import * as TenagaKerja from "@/models/TenagaKerjaPublik";
import * as Undangan from "@/models/UndanganPekerjaan";
import { kirimNotifikasi } from "./NotifikasiController";
import { ambilProfilPublik } from "./TransaksiPekerjaanController";

// #52. Daftar dan detail publik (hanya TK terverifikasi); undangan hanya oleh PK.
export async function cariTenagaKerja(query: unknown) {
  const q = CariTKQuery.parse(query);
  return TenagaKerja.cari(q.q || undefined, q.page);
}

export async function ambilTenagaKerja(rawId: string) {
  const profil = await ambilProfilPublik(rawId);
  if (profil.peran !== "TK" || profil.statusVerifikasi !== "TERVERIFIKASI")
    throw new AppError("NOT_FOUND", 404, "Tenaga kerja tidak ditemukan");
  return profil;
}

export async function prosesUndangan(rawId: string, body: unknown) {
  const pk = await requireRole("PK");
  const idTK = Id.safeParse(rawId);
  if (!idTK.success)
    throw new AppError("NOT_FOUND", 404, "Tenaga kerja tidak ditemukan");
  const { idLowongan } = UndangTKInput.parse(body);
  const h = Undangan.undang(pk.id, idTK.data, idLowongan);
  if (!h.ok) {
    if (h.alasan === "TK_TIDAK_ADA")
      throw new AppError("NOT_FOUND", 404, "Tenaga kerja tidak ditemukan");
    if (h.alasan === "LOWONGAN_TIDAK_ADA")
      throw new AppError("NOT_FOUND", 404, "Lowongan tidak ditemukan");
    if (h.alasan === "BUKAN_PEMILIK")
      throw new AppError("FORBIDDEN", 403, "Lowongan ini bukan milik Anda");
    if (h.alasan === "SUDAH_DIUNDANG")
      throw new AppError(
        "SUDAH_DIUNDANG",
        409,
        "Tenaga kerja ini sudah diundang ke lowongan tersebut",
      );
    throw new AppError(
      "STATUS_TIDAK_VALID",
      409,
      "Hanya lowongan yang masih terbuka yang dapat dipakai untuk mengundang",
    );
  }
  await kirimNotifikasi(
    idTK.data,
    `${h.namaPK} mengundang Anda melamar "${h.judul}".`,
    `/lowongan/${idLowongan}`,
  );
  return { idLowongan, idTenagaKerja: idTK.data };
}
