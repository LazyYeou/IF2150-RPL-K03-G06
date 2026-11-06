import "server-only";
import { requireUser } from "@/lib/auth/guards";
import { AppError } from "@/lib/errors";
import { bacaBerkas } from "@/lib/storage";
import { Id } from "@/lib/validation/common";
import {
  cariBuktiDenganPeserta,
  type BerkasDenganPeserta,
} from "@/models/BuktiPenyerahan";
import { cariBuktiSengketaDenganPeserta } from "@/models/BuktiSengketa";

// KNF06, KNF14. Hanya peserta atau CS yang boleh mengunduh; ID pelaku dari sesi.
async function unduh(
  id: string,
  cari: (id: string) => BerkasDenganPeserta | null,
) {
  const user = await requireUser();
  const parsed = Id.safeParse(id);
  const berkas = parsed.success ? cari(parsed.data) : null;
  if (!berkas) throw new AppError("NOT_FOUND", 404, "Berkas tidak ditemukan");
  if (user.peran !== "CS" && !berkas.peserta.includes(user.id))
    throw new AppError(
      "FORBIDDEN",
      403,
      "Anda tidak berhak mengakses berkas ini",
    );

  try {
    return await bacaBerkas(berkas.filePath);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT")
      throw new AppError("NOT_FOUND", 404, "Berkas tidak ditemukan");
    throw e;
  }
}

export const unduhBuktiPenyerahan = (id: string) =>
  unduh(id, cariBuktiDenganPeserta);
export const unduhBuktiSengketa = (id: string) =>
  unduh(id, cariBuktiSengketaDenganPeserta);
