import "server-only";
import { createHash } from "node:crypto";
import { AppError } from "@/lib/errors";

const JENDELA = 15 * 60 * 1000;
const state = globalThis as unknown as {
  authPercobaan?: Map<string, { jumlah: number; sampai: number }>;
};
const percobaan = (state.authPercobaan ??= new Map());

/** Limiter sederhana per proses; login dan registrasi berbagi jatah IP+email. */
export function batasiPercobaan(
  ip: string,
  email: unknown,
  sekarang = Date.now(),
) {
  for (const [kunci, nilai] of percobaan)
    if (nilai.sampai <= sekarang) percobaan.delete(kunci);
  const normal =
    typeof email === "string" ? email.trim().toLowerCase().slice(0, 254) : "";
  const kunci = createHash("sha256")
    .update(JSON.stringify([ip, normal]))
    .digest("hex");
  const lama = percobaan.get(kunci);
  if ((lama && lama.jumlah >= 5) || (!lama && percobaan.size >= 10_000))
    throw new AppError(
      "TERLALU_BANYAK_PERCOBAAN",
      429,
      "Terlalu banyak percobaan. Coba lagi dalam 15 menit.",
    );
  percobaan.set(kunci, {
    jumlah: (lama?.jumlah ?? 0) + 1,
    sampai: lama?.sampai ?? sekarang + JENDELA,
  });
}

/** Header proxy hanya dipercaya bila aplikasi berada di belakang proxy tepercaya. */
export function ipPermintaan(req: Request) {
  return process.env.TRUST_PROXY === "true"
    ? req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local"
    : "local";
}
