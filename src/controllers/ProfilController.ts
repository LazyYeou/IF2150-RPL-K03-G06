import "server-only";
import { requireUser } from "@/lib/auth/guards";
import { AppError } from "@/lib/errors";
import { PerbaruiProfilInput, ProfilResponse } from "@/lib/validation/profil";
import * as Profil from "@/models/Profil";

function hasil(profil: ReturnType<typeof Profil.ambil>) {
  if (!profil) throw new AppError("NOT_FOUND", 404, "Profil tidak ditemukan");
  return ProfilResponse.parse(profil);
}
export async function ambilProfil() {
  const user = await requireUser();
  return hasil(Profil.ambil(user.id));
}
/** Identitas selalu dari sesi; email/peran/rating/status bukan field yang boleh diedit. */
export async function perbaruiProfil(body: unknown) {
  const user = await requireUser();
  const input = PerbaruiProfilInput.parse(body);
  return hasil(Profil.perbarui(user.id, input));
}
