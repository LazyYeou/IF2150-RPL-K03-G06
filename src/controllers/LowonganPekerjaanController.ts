import "server-only";
import { requireRole } from "@/lib/auth/guards";
import { bacaSesi } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import {
  BuatLowonganInput,
  CariLowonganQuery,
  LowonganSayaQuery,
} from "@/lib/validation/lowongan";
import { Id } from "@/lib/validation/common";
import * as Lowongan from "@/models/LowonganPekerjaan";

// C35. KF07–KF09, KNF09. Urutan: guard -> validasi Zod -> model.

async function pemilikPK() {
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

export async function prosesPembuatanLowongan(body: unknown) {
  const idPK = await pemilikPK();
  const input = BuatLowonganInput.parse(body); // KF08: error per field
  const id = Lowongan.buat(idPK, input);
  return Lowongan.detail(id)!;
}

export async function ambilLowonganSaya(query: unknown) {
  const idPK = await pemilikPK();
  return Lowongan.milikPK(idPK, LowonganSayaQuery.parse(query).page);
}

export async function prosesCariLowongan(query: unknown) {
  return Lowongan.cari(CariLowonganQuery.parse(query)); // publik
}

export async function ambilDetailLowongan(id: string) {
  const parsed = Id.safeParse(id);
  const sesi = await bacaSesi();
  const hasil = parsed.success
    ? Lowongan.detail(parsed.data, sesi?.peran === "TK" ? sesi.id : undefined)
    : null;
  if (!hasil) throw new AppError("NOT_FOUND", 404, "Lowongan tidak ditemukan");
  return hasil;
}
