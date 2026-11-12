import "server-only";
import { requireVerifiedTK } from "@/lib/auth/guards";
import { AppError } from "@/lib/errors";
import { Id } from "@/lib/validation/common";
import { UnggahBuktiPekerjaanInput } from "@/lib/validation/transaksi";
import { hapusBerkas, simpanBerkas } from "@/lib/storage";
import * as Transaksi from "@/models/TransaksiPekerjaan";
import { kirimNotifikasi } from "./NotifikasiController";

export async function prosesUnggahBuktiPekerjaan(
  rawId: string,
  form: FormData,
) {
  const user = await requireVerifiedTK(); // KF06 -> 403 NOT_VERIFIED
  const id = Id.safeParse(rawId);
  if (!id.success)
    throw new AppError("NOT_FOUND", 404, "Transaksi tidak ditemukan");

  UnggahBuktiPekerjaanInput.parse({
    deskripsi: form.get("deskripsi"),
  });
  const deskripsi = String(form.get("deskripsi")).trim();
  const berkas = form.get("berkas");
  if (!(berkas instanceof File))
    throw new AppError(
      "BERKAS_TIDAK_VALID",
      400,
      "Berkas bukti pekerjaan wajib diunggah",
    );

  const disimpan = await simpanBerkas("bukti", berkas);
  let hasil: Awaited<ReturnType<typeof Transaksi.submitBukti>>;
  try {
    hasil = Transaksi.submitBukti(
      id.data,
      user.id,
      deskripsi,
      disimpan.path,
      disimpan.ukuran,
    );
  } catch (error) {
    await hapusBerkas(disimpan.path);
    throw error;
  }
  if (!hasil.ok) {
    await hapusBerkas(disimpan.path);
    if (hasil.alasan === "TIDAK_ADA")
      throw new AppError("NOT_FOUND", 404, "Transaksi tidak ditemukan");
    if (hasil.alasan === "BUKAN_TK_TUGAS")
      throw new AppError(
        "FORBIDDEN",
        403,
        "Anda bukan tenaga kerja terverifikasi yang ditugaskan",
      );
    throw new AppError(
      "STATUS_TIDAK_VALID",
      409,
      "Bukti hanya dapat dikirim saat pekerjaan sedang berlangsung",
    );
  }
  await kirimNotifikasi(
    hasil.idPenggunaPK,
    "Tenaga kerja telah mengirim bukti penyelesaian pekerjaan.",
    `/pk/transaksi/${id.data}`,
  );
  return Transaksi.detail(id.data, user.id);
}
