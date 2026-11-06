import "server-only";
import { requireCS } from "@/lib/auth/guards";
import { AppError } from "@/lib/errors";
import { bacaBerkas } from "@/lib/storage";
import { Id } from "@/lib/validation/common";
import { TolakVerifikasiInput } from "@/lib/validation/verifikasi";
import * as TenagaKerja from "@/models/TenagaKerja";
import { kirimNotifikasi } from "./NotifikasiController";

// C34. UC02, KF05, KF06, KNF19. Semua operasi: requireCS() di baris pertama (non-CS -> 403).

const tidakDitemukan = () =>
  new AppError("NOT_FOUND", 404, "Tenaga kerja tidak ditemukan");

function idTK(raw: string) {
  const p = Id.safeParse(raw);
  if (!p.success) throw tidakDitemukan();
  return p.data;
}

export async function ambilAntreanVerifikasi() {
  await requireCS();
  return { items: TenagaKerja.antreanVerifikasi() };
}

/** Dokumen KTP terdekripsi, hanya untuk CS (KNF02). */
export async function tinjauDokumenIdentitas(rawId: string) {
  await requireCS();
  const path = TenagaKerja.dokumenIdentitas(idTK(rawId));
  if (!path) throw new AppError("NOT_FOUND", 404, "Dokumen tidak ditemukan");
  try {
    return await bacaBerkas(path);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT")
      throw new AppError("NOT_FOUND", 404, "Dokumen tidak ditemukan");
    throw e;
  }
}

function putuskan(
  rawId: string,
  keputusan: Parameters<typeof TenagaKerja.putuskanVerifikasi>[1],
) {
  const hasil = TenagaKerja.putuskanVerifikasi(idTK(rawId), keputusan);
  if (!hasil.ok) {
    if (hasil.alasan === "TIDAK_ADA") throw tidakDitemukan();
    throw new AppError(
      "STATUS_TIDAK_VALID",
      409,
      "Pengajuan tidak sedang menunggu verifikasi",
    );
  }
  return hasil.idPengguna;
}

export async function prosesPersetujuanVerifikasi(rawId: string) {
  await requireCS();
  const idPengguna = putuskan(rawId, { setujui: true });
  await kirimNotifikasi(
    idPengguna,
    "Identitas Anda telah terverifikasi. Anda sudah bisa mengajukan penawaran.",
    "/tk",
  );
  return { status: "TERVERIFIKASI" as const };
}

export async function prosesPenolakanVerifikasi(rawId: string, body: unknown) {
  await requireCS();
  const { alasan } = TolakVerifikasiInput.parse(body); // alasan wajib
  const idPengguna = putuskan(rawId, { tolak: alasan });
  await kirimNotifikasi(
    idPengguna,
    `Verifikasi identitas ditolak: ${alasan}`,
    "/tk/verifikasi",
  );
  return { status: "DITOLAK" as const };
}
