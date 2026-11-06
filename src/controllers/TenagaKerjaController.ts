import "server-only";
import { requireRole } from "@/lib/auth/guards";
import { AppError } from "@/lib/errors";
import { hapusBerkas, simpanBerkas } from "@/lib/storage";
import { UnggahVerifikasiInput } from "@/lib/validation/verifikasi";
import * as TenagaKerja from "@/models/TenagaKerja";

// C32. UC02, KF04. Urutan: guard -> validasi -> (berkas di luar tx) -> tulis DB.

const tidakBolehMengajukan = () =>
  new AppError(
    "STATUS_TIDAK_VALID",
    409,
    "Pengajuan verifikasi tidak dapat dilakukan pada status saat ini",
  );

export async function prosesPengajuanVerifikasi(form: FormData) {
  const user = await requireRole("TK");
  UnggahVerifikasiInput.parse({ persetujuan: form.get("persetujuan") }); // tanpa persetujuan -> 400 (KF04)
  const berkas = form.get("berkas");
  if (!(berkas instanceof File))
    throw new AppError(
      "BERKAS_TIDAK_VALID",
      400,
      "Berkas dokumen identitas wajib diunggah",
    );

  // cek status dulu agar berkas tidak ditulis percuma; tulis DB tetap menjaga balapan
  const sekarang = TenagaKerja.cariVerifikasi(user.id);
  if (!sekarang)
    throw new AppError("FORBIDDEN", 403, "Profil tenaga kerja tidak ditemukan");
  if (!["BELUM_TERVERIFIKASI", "DITOLAK"].includes(sekarang.status))
    throw tidakBolehMengajukan();

  const { path } = await simpanBerkas("identitas", berkas, { enkripsi: true });
  let hasil;
  try {
    hasil = TenagaKerja.ajukanVerifikasi(user.id, path);
  } catch (e) {
    await hapusBerkas(path);
    throw e;
  }
  if (!hasil) {
    await hapusBerkas(path);
    throw tidakBolehMengajukan();
  }
  if (hasil.dokumenLama) await hapusBerkas(hasil.dokumenLama); // unggah ulang setelah ditolak

  const baru = TenagaKerja.cariVerifikasi(user.id)!;
  return { status: baru.status, waktuPengajuan: baru.waktuPengajuan };
}

export async function ambilStatusVerifikasi() {
  const user = await requireRole("TK");
  const v = TenagaKerja.cariVerifikasi(user.id);
  if (!v)
    throw new AppError("FORBIDDEN", 403, "Profil tenaga kerja tidak ditemukan");
  return {
    status: v.status,
    waktuPengajuan: v.waktuPengajuan,
    alasanPenolakan: v.alasanPenolakan,
  };
}
