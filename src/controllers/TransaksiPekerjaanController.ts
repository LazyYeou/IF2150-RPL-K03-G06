import "server-only";
import { requireUser } from "@/lib/auth/guards";
import { AppError } from "@/lib/errors";
import { Id } from "@/lib/validation/common";
import { DaftarTransaksiQuery } from "@/lib/validation/transaksi";
import { idPenyediaKerja } from "@/models/LowonganPekerjaan";
import * as Transaksi from "@/models/TransaksiPekerjaan";
import { idDariPengguna } from "@/models/TenagaKerja";

export async function ambilTransaksiSaya(query: unknown) {
  const user = await requireUser();
  const q = DaftarTransaksiQuery.parse(query);
  if (q.peran && q.peran !== user.peran && user.peran !== "CS")
    throw new AppError("FORBIDDEN", 403, "Anda tidak berhak mengakses ini");

  if (user.peran === "TK") {
    const idTK = idDariPengguna(user.id);
    if (!idTK)
      throw new AppError(
        "FORBIDDEN",
        403,
        "Profil tenaga kerja tidak ditemukan",
      );
    return Transaksi.milikTK(idTK, q.page, q.status);
  }
  if (user.peran === "PK") {
    const idPK = idPenyediaKerja(user.id);
    if (!idPK)
      throw new AppError(
        "FORBIDDEN",
        403,
        "Profil penyedia kerja tidak ditemukan",
      );
    return Transaksi.milikPK(idPK, q.page, q.status);
  }
  return Transaksi.semua(q.peran ?? "TK", q.page, q.status);
}

export async function ambilDetailTransaksi(rawId: string) {
  const user = await requireUser();
  const parsed = Id.safeParse(rawId);
  if (!parsed.success)
    throw new AppError("NOT_FOUND", 404, "Transaksi tidak ditemukan");
  const transaksi = Transaksi.detail(parsed.data, user.id);
  if (!transaksi)
    throw new AppError("NOT_FOUND", 404, "Transaksi tidak ditemukan");

  const peserta =
    user.peran === "TK"
      ? Transaksi.detailPeserta(parsed.data, "TK", idDariPengguna(user.id))
      : user.peran === "PK"
        ? Transaksi.detailPeserta(parsed.data, "PK", idPenyediaKerja(user.id))
        : true;
  if (!peserta && user.peran !== "CS")
    throw new AppError("FORBIDDEN", 403, "Anda bukan peserta transaksi ini");
  return transaksi;
}
