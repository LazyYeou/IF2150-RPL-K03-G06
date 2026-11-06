import "server-only";
import {
  requireOwner,
  requireRole,
  requireVerifiedTK,
} from "@/lib/auth/guards";
import { AppError } from "@/lib/errors";
import { Id } from "@/lib/validation/common";
import {
  AjukanPenawaranInput,
  PenawaranSayaQuery,
} from "@/lib/validation/penawaran";
import * as Lowongan from "@/models/LowonganPekerjaan";
import * as Penawaran from "@/models/PengajuanPenawaran";
import * as TenagaKerja from "@/models/TenagaKerja";
import { kirimNotifikasi } from "./NotifikasiController";

// C36. UC05, KF10, KF11. Urutan: guard -> validasi Zod -> model (tx) -> notifikasi setelah commit.

async function tenagaKerja() {
  const user = await requireRole("TK");
  const id = TenagaKerja.idDariPengguna(user.id);
  if (!id)
    throw new AppError("FORBIDDEN", 403, "Profil tenaga kerja tidak ditemukan");
  return id;
}

export async function prosesPengajuanPenawaran(body: unknown) {
  const { idTenagaKerja } = await requireVerifiedTK(); // KF06 -> 403 NOT_VERIFIED
  const input = AjukanPenawaranInput.parse(body);
  const hasil = Penawaran.ajukan(idTenagaKerja, input);
  if (!hasil.ok) {
    if (hasil.alasan === "LOWONGAN_TIDAK_ADA")
      throw new AppError("NOT_FOUND", 404, "Lowongan tidak ditemukan");
    if (hasil.alasan === "KUOTA_PENUH")
      throw new AppError(
        "KUOTA_PENUH",
        409,
        "Lowongan sudah penuh atau ditutup",
      );
    throw new AppError(
      "PENAWARAN_GANDA",
      409,
      "Anda sudah mengajukan penawaran untuk lowongan ini",
    );
  }
  await kirimNotifikasi(
    hasil.idPenggunaPK,
    `Penawaran baru untuk lowongan "${hasil.penawaran.lowongan.judul}"`,
    `/pk/lowongan/${input.idLowongan}/pelamar`,
  );
  return hasil.penawaran;
}

export async function ambilPenawaranSaya(query: unknown) {
  const idTK = await tenagaKerja();
  const q = PenawaranSayaQuery.parse(query);
  return Penawaran.milikTK(idTK, q.status, q.page);
}

export async function batalkanPengajuan(rawId: string) {
  const idTK = await tenagaKerja();
  const id = Id.safeParse(rawId);
  const hasil = id.success
    ? Penawaran.tarik(id.data, idTK)
    : ({ ok: false, alasan: "TIDAK_ADA" } as const);
  if (!hasil.ok) {
    if (hasil.alasan === "TIDAK_ADA")
      throw new AppError("NOT_FOUND", 404, "Penawaran tidak ditemukan");
    if (hasil.alasan === "BUKAN_PEMILIK")
      throw new AppError("FORBIDDEN", 403, "Anda bukan pemilik penawaran ini");
    throw new AppError(
      "STATUS_TIDAK_VALID",
      409,
      "Hanya penawaran yang masih menunggu yang dapat ditarik",
    );
  }
  return hasil.penawaran;
}

async function penyediaKerja() {
  const user = await requireRole("PK");
  const idPK = Lowongan.idPenyediaKerja(user.id);
  if (!idPK)
    throw new AppError(
      "FORBIDDEN",
      403,
      "Profil penyedia kerja tidak ditemukan",
    );
  return idPK;
}

/** C37. UC06, I-32: daftar pelamar satu lowongan, hanya untuk PK pemilik. */
export async function ambilDaftarPelamar(rawId: string) {
  const idPK = await penyediaKerja();
  const id = Id.safeParse(rawId);
  const l = id.success ? Lowongan.ringkasDenganPemilik(id.data) : null;
  if (!l) throw new AppError("NOT_FOUND", 404, "Lowongan tidak ditemukan");
  requireOwner(l.idPK, idPK);
  return {
    lowongan: l.lowongan,
    sisaKuota: l.lowongan.kuota - l.lowongan.jumlahDiterima,
    items: Penawaran.pelamar(l.lowongan.id),
  };
}

/** C38. UC06, KF12, KF13, KNF07: PK memilih pelamar; semua perubahan atomik di model, notifikasi setelah commit. */
export async function prosesPemilihanPelamar(rawId: string) {
  const idPK = await penyediaKerja();
  const id = Id.safeParse(rawId);
  const hasil = id.success
    ? Penawaran.terima(id.data, idPK)
    : ({ ok: false, alasan: "TIDAK_ADA" } as const);
  if (!hasil.ok) {
    if (hasil.alasan === "TIDAK_ADA")
      throw new AppError("NOT_FOUND", 404, "Penawaran tidak ditemukan");
    if (hasil.alasan === "BUKAN_PEMILIK")
      throw new AppError("FORBIDDEN", 403, "Anda bukan pemilik lowongan ini");
    if (hasil.alasan === "KUOTA_PENUH")
      throw new AppError(
        "KUOTA_PENUH",
        409,
        "Kuota lowongan sudah penuh atau lowongan ditutup",
      );
    throw new AppError(
      "STATUS_TIDAK_VALID",
      409,
      "Hanya penawaran yang masih menunggu yang dapat diterima",
    );
  }
  await kirimNotifikasi(
    hasil.idPenggunaTK,
    `Penawaran Anda untuk "${hasil.judul}" diterima. Menunggu pembayaran dari pemberi kerja.`,
    `/tk/transaksi/${hasil.idTransaksi}`,
  );
  return {
    idTransaksi: hasil.idTransaksi,
    statusLowongan: hasil.statusLowongan,
    sisaKuota: hasil.sisaKuota,
  };
}
