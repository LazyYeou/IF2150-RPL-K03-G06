import "server-only";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { batasiPercobaan } from "@/lib/auth/rate-limit";
import { buatSesi, hapusSesi } from "@/lib/auth/session";
import { requireUser } from "@/lib/auth/guards";
import { AppError } from "@/lib/errors";
import {
  AuthResponse,
  LoginInput,
  RegistrasiInput,
  type Pengguna,
} from "@/lib/validation/auth";
import * as PenggunaModel from "@/models/Pengguna";

const redirect = { TK: "/tk", PK: "/pk", CS: "/cs" } as const;
const hasil = (pengguna: Pengguna) =>
  AuthResponse.parse({ pengguna, redirectTo: redirect[pengguna.peran] });
function batasi(input: unknown, ip: string) {
  const email =
    input && typeof input === "object" && "email" in input
      ? input.email
      : undefined;
  batasiPercobaan(ip, email);
}

export async function registrasi(body: unknown, ip: string) {
  batasi(body, ip);
  const input = RegistrasiInput.parse(body);
  const pengguna = PenggunaModel.buat(
    input,
    await hashPassword(input.password),
  );
  await buatSesi(pengguna.id);
  return hasil(pengguna);
}

let dummyHash: Promise<string> | undefined;
export async function prosesLogin(body: unknown, ip: string) {
  batasi(body, ip);
  const input = LoginInput.parse(body);
  const akun = PenggunaModel.cariEmail(input.email);
  // Tetap verifikasi hash bila email tidak ditemukan untuk mengurangi perbedaan waktu respons.
  const hash =
    akun?.passwordHash ??
    (await (dummyHash ??= hashPassword("akun-tidak-tersedia")));
  const valid = await verifyPassword(hash, input.password);
  if (!akun || !valid)
    throw new AppError(
      "KREDENSIAL_SALAH",
      401,
      "Email atau kata sandi tidak valid",
    );
  await buatSesi(akun.id);
  return hasil(PenggunaModel.ambil(akun.id));
}

export async function logout() {
  await requireUser();
  await hapusSesi();
}
