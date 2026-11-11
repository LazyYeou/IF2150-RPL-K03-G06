import "server-only";
import { requireRole } from "@/lib/auth/guards";
import { AppError } from "@/lib/errors";
import { Id } from "@/lib/validation/common";
import { LowonganSayaQuery } from "@/lib/validation/lowongan";
import * as Lowongan from "@/models/LowonganPekerjaan";

// #51. Hanya TK; simpan/hapus idempoten.
const idLowongan = (raw: string) => {
  const p = Id.safeParse(raw);
  if (!p.success)
    throw new AppError("NOT_FOUND", 404, "Lowongan tidak ditemukan");
  return p.data;
};

export async function simpanLowongan(rawId: string) {
  const user = await requireRole("TK");
  if (!Lowongan.simpan(user.id, idLowongan(rawId)))
    throw new AppError(
      "NOT_FOUND",
      404,
      "Lowongan tidak ditemukan atau sudah ditutup",
    );
  return { tersimpan: true };
}

export async function hapusLowonganTersimpan(rawId: string) {
  const user = await requireRole("TK");
  Lowongan.hapusSimpan(user.id, idLowongan(rawId));
  return { tersimpan: false };
}

export async function ambilLowonganTersimpan(query: unknown) {
  const user = await requireRole("TK");
  return Lowongan.tersimpanMilik(user.id, LowonganSayaQuery.parse(query).page);
}
