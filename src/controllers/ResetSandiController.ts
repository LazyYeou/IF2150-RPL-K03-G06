import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { hashPassword } from "@/lib/auth/password";
import { batasiPercobaan } from "@/lib/auth/rate-limit";
import { hapusSemuaSesi } from "@/lib/auth/session";
import { tx } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { LupaSandiInput, ResetSandiInput } from "@/lib/validation/reset-sandi";
import { cariEmail } from "@/models/Pengguna";
import * as ResetSandi from "@/models/ResetSandi";

const sha256 = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const tokenTidakValid = () =>
  new AppError(
    "VALIDATION_ERROR",
    400,
    "Tautan reset tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.",
    { token: "Tautan tidak valid, kedaluwarsa, atau sudah dipakai" },
  );

/** Publik; respons sama untuk setiap email valid (issue #9, I-10). */
export function lupaSandi(body: unknown, ip: string) {
  const email =
    body && typeof body === "object" && "email" in body
      ? body.email
      : undefined;
  batasiPercobaan(ip, email);
  const input = LupaSandiInput.parse(body);
  const akun = cariEmail(input.email);
  if (akun) {
    const token = randomBytes(32).toString("base64url");
    const url = new URL(
      "/reset-sandi",
      process.env.APP_URL ?? "http://localhost:3000",
    );
    url.searchParams.set("token", token);
    ResetSandi.simpan(sha256(token), akun.id);
    // Pengiriman lokal sesuai issue #9; tautan hanya ke konsol server, bukan respons API.
    console.info(`[Reset sandi] ${url.toString()}`);
  }
  return {
    message:
      "Jika email terdaftar, tautan reset kata sandi akan dikirim. Silakan periksa pesan dari pengelola.",
  };
}

export async function resetSandi(body: unknown) {
  const input = ResetSandiInput.parse(body);
  const tokenHash = sha256(input.token);
  if (!ResetSandi.cariAktif(tokenHash)) throw tokenTidakValid();
  const passwordHash = await hashPassword(input.passwordBaru);
  // Cek ulang setelah await di dalam BEGIN IMMEDIATE: satu token hanya bisa dipakai sekali.
  tx(() => {
    const token = ResetSandi.cariAktif(tokenHash);
    if (!token) throw tokenTidakValid();
    ResetSandi.gantiPassword(token.idPengguna, passwordHash);
    hapusSemuaSesi(token.idPengguna);
  });
}
