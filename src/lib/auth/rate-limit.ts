import "server-only";
import { createHash } from "node:crypto";
import { AppError } from "@/lib/errors";

const JENDELA = 15 * 60 * 1000;
const state = globalThis as unknown as {
  authPercobaan?: Map<string, { jumlah: number; sampai: number }>;
};
const percobaan = (state.authPercobaan ??= new Map());

export type AksiAuth = "login" | "registrasi" | "lupa-sandi";

function kunci(aksi: AksiAuth, ip: string, email: unknown) {
  const normal =
    typeof email === "string" ? email.trim().toLowerCase().slice(0, 254) : "";
  return createHash("sha256")
    .update(JSON.stringify([aksi, ip, normal]))
    .digest("hex");
}

/** Ambil `email` mentah dari body yang belum divalidasi (kunci limiter dipakai sebelum Zod). */
export const emailDariBody = (body: unknown) =>
  body && typeof body === "object" && "email" in body ? body.email : undefined;

/** Tolak (429) bila jatah aksi ini untuk IP+email sudah habis; tidak menambah hitungan. */
export function periksaPercobaan(
  aksi: AksiAuth,
  ip: string,
  email: unknown,
  sekarang = Date.now(),
) {
  for (const [k, nilai] of percobaan)
    if (nilai.sampai <= sekarang) percobaan.delete(k);
  const lama = percobaan.get(kunci(aksi, ip, email));
  if ((lama && lama.jumlah >= 5) || (!lama && percobaan.size >= 10_000))
    throw new AppError(
      "TERLALU_BANYAK_PERCOBAAN",
      429,
      "Terlalu banyak percobaan. Coba lagi dalam 15 menit.",
    );
}

/** Tambah hitungan satu percobaan. Jatah tiap aksi terpisah (5 per 15 menit per IP+email). */
export function catatPercobaan(
  aksi: AksiAuth,
  ip: string,
  email: unknown,
  sekarang = Date.now(),
) {
  const k = kunci(aksi, ip, email);
  const lama = percobaan.get(k);
  percobaan.set(k, {
    jumlah: (lama?.jumlah ?? 0) + 1,
    sampai: lama?.sampai ?? sekarang + JENDELA,
  });
}

/** Periksa lalu hitung; untuk aksi yang setiap permintaannya dihitung (registrasi, lupa sandi). */
export function batasiPercobaan(
  aksi: AksiAuth,
  ip: string,
  email: unknown,
  sekarang = Date.now(),
) {
  periksaPercobaan(aksi, ip, email, sekarang);
  catatPercobaan(aksi, ip, email, sekarang);
}

/** Header proxy hanya dipercaya bila aplikasi berada di belakang proxy tepercaya. */
export function ipPermintaan(req: Request) {
  return process.env.TRUST_PROXY === "true"
    ? req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local"
    : "local";
}
