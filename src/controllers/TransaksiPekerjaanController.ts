import "server-only";
import type Database from "better-sqlite3";
import { requireUser } from "@/lib/auth/guards";
import { AppError } from "@/lib/errors";
import { Id } from "@/lib/validation/common";
import {
  DaftarTransaksiQuery,
  MintaRevisiInput,
  UlasanTransaksiInput,
} from "@/lib/validation/transaksi";
import { idPenyediaKerja } from "@/models/LowonganPekerjaan";
import * as Transaksi from "@/models/TransaksiPekerjaan";
import { idDariPengguna } from "@/models/TenagaKerja";
import { kirimNotifikasi } from "./NotifikasiController";
import * as Profil from "@/models/Profil";
import { ProfilPublikResponse } from "@/lib/validation/profil";

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

export function kreditUpahDalamTx(
  database: Database.Database,
  idTransaksi: string,
) {
  return Transaksi.kreditUpahDalamTx(database, idTransaksi);
}

function idTransaksiValid(rawId: string) {
  const parsed = Id.safeParse(rawId);
  if (!parsed.success)
    throw new AppError("NOT_FOUND", 404, "Transaksi tidak ditemukan");
  return parsed.data;
}

async function penyediaAktif() {
  const user = await requireUser();
  if (user.peran !== "PK")
    throw new AppError("FORBIDDEN", 403, "Hanya penyedia kerja yang dapat melakukan tindakan ini");
  const idPK = idPenyediaKerja(user.id);
  if (!idPK)
    throw new AppError("FORBIDDEN", 403, "Profil penyedia kerja tidak ditemukan");
  return { user, idPK };
}

function tanganiKesalahanTindakan(alasan: string): never {
  if (alasan === "TIDAK_ADA")
    throw new AppError("NOT_FOUND", 404, "Transaksi tidak ditemukan");
  if (alasan === "BUKAN_PEMILIK")
    throw new AppError("FORBIDDEN", 403, "Anda bukan pemilik transaksi ini");
  throw new AppError(
    "STATUS_TIDAK_VALID",
    409,
    "Transaksi tidak dapat diproses pada status saat ini",
  );
}

export async function prosesSetujuiHasil(rawId: string) {
  const { user } = await penyediaAktif();
  const id = idTransaksiValid(rawId);
  const hasil = Transaksi.setujuiHasil(id, user.id);
  if (!hasil.ok) tanganiKesalahanTindakan(hasil.alasan);

  await kirimNotifikasi(
    hasil.idPenggunaTK,
    `Upah sebesar Rp${new Intl.NumberFormat("id-ID").format(hasil.nominalUpah)} telah masuk ke saldo Anda.`,
    `/tk/pekerjaan/${id}`,
  );
  return { idTransaksi: id, status: "COMPLETED" as const };
}

export async function prosesMintaRevisi(rawId: string, body: unknown) {
  const { user } = await penyediaAktif();
  const id = idTransaksiValid(rawId);
  const { catatan } = MintaRevisiInput.parse(body);
  const hasil = Transaksi.mintaRevisi(id, user.id, catatan);
  if (!hasil.ok) tanganiKesalahanTindakan(hasil.alasan);

  await kirimNotifikasi(
    hasil.idPenggunaTK,
    "Penyedia kerja meminta revisi pada hasil pekerjaan Anda.",
    `/tk/pekerjaan/${id}`,
  );
  return { idTransaksi: id, status: "IN_PROGRESS" as const };
}

export async function prosesUlasanTransaksi(rawId: string, body: unknown) {
  const user = await requireUser();
  if (user.peran !== "PK" && user.peran !== "TK")
    throw new AppError("FORBIDDEN", 403, "Hanya peserta transaksi yang dapat memberi ulasan");
  const id = idTransaksiValid(rawId);
  const input = UlasanTransaksiInput.parse(body);
  const hasil = Transaksi.buatUlasan(id, user.id, input);
  if (!hasil.ok) {
    if (hasil.alasan === "SUDAH_ADA")
      throw new AppError("ULASAN_GANDA", 409, "Ulasan untuk transaksi ini sudah diberikan");
    tanganiKesalahanTindakan(hasil.alasan);
  }
  return {
    id: hasil.id,
    idPenerima: hasil.idPenerima,
    nilai: hasil.nilai,
    deskripsi: hasil.deskripsi,
  };
}

export async function ambilDataFormUlasan(rawId: string) {
  const user = await requireUser();
  if (user.peran !== "PK" && user.peran !== "TK")
    throw new AppError("FORBIDDEN", 403, "Hanya peserta transaksi yang dapat memberi ulasan");
  const id = idTransaksiValid(rawId);
  const transaksi = Transaksi.detail(id, user.id);
  if (!transaksi)
    throw new AppError("NOT_FOUND", 404, "Transaksi tidak ditemukan");
  const peserta =
    user.peran === "PK"
      ? Transaksi.detailPeserta(id, "PK", idPenyediaKerja(user.id))
      : Transaksi.detailPeserta(id, "TK", idDariPengguna(user.id));
  if (!peserta)
    throw new AppError("FORBIDDEN", 403, "Anda bukan peserta transaksi ini");
  if (transaksi.status !== "COMPLETED")
    throw new AppError(
      "STATUS_TIDAK_VALID",
      409,
      "Ulasan hanya dapat diberikan setelah hasil pekerjaan disetujui",
    );
  return {
    idTransaksi: id,
    judul: transaksi.lowongan.judul,
    namaPenerima:
      user.peran === "PK"
        ? transaksi.tenagaKerja.nama
        : transaksi.penyediaKerja.nama,
    peran: user.peran,
    sudahDiulas: transaksi.ulasanSaya !== null,
  };
}

export async function ambilUlasanSaya() {
  const user = await requireUser();
  return Profil.ulasanDiterima(user.id);
}

export async function ambilProfilPublik(rawId: string) {
  const parsed = Id.safeParse(rawId);
  if (!parsed.success)
    throw new AppError("NOT_FOUND", 404, "Profil tidak ditemukan");
  const profil = Profil.ambilPublik(parsed.data);
  if (!profil)
    throw new AppError("NOT_FOUND", 404, "Profil tidak ditemukan");
  return ProfilPublikResponse.parse(profil);
}
