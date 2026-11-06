import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

// Kontrak: docs/contracts/modules.md §1. Q-105. KNF01.
export const NAMA_COOKIE = "kerjain_sesi";
const HARI = 7;

export type Peran = "TK" | "PK" | "CS";
export type SesiPengguna = {
  id: string;
  nama: string;
  email: string;
  peran: Peran;
};

// DB hanya menyimpan SHA-256 token; token mentah tidak pernah ditulis ke DB.
const sha256 = (token: string) =>
  createHash("sha256").update(token).digest("hex");

/** Buat sesi baru untuk pengguna dan pasang cookie. Token baru tiap login (anti session fixation). */
export async function buatSesi(idPengguna: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  db.prepare(
    `INSERT INTO sesi (id_sesi, id_pengguna, expires_at)
     VALUES (?, ?, datetime('now', '+${HARI} days'))`,
  ).run(sha256(token), idPengguna);
  (await cookies()).set(NAMA_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: HARI * 24 * 60 * 60,
  });
}

/** Sesi dari cookie permintaan ini, atau null bila tidak ada/kedaluwarsa. Memperpanjang sesi yang aktif. */
export async function bacaSesi(): Promise<SesiPengguna | null> {
  const token = (await cookies()).get(NAMA_COOKIE)?.value;
  if (!token) return null;
  const id = sha256(token);
  const row = db
    .prepare(
      `SELECT p.id_pengguna AS id, p.nama, p.email, p.peran
       FROM sesi s JOIN pengguna p USING (id_pengguna)
       WHERE s.id_sesi = ? AND s.expires_at > datetime('now')`,
    )
    .get(id) as SesiPengguna | undefined;
  if (!row) return null;
  // perpanjang hanya bila sisa < 6 hari agar tidak menulis di setiap request
  db.prepare(
    `UPDATE sesi SET expires_at = datetime('now', '+${HARI} days')
     WHERE id_sesi = ? AND expires_at < datetime('now', '+${HARI - 1} days')`,
  ).run(id);
  return row;
}

/** Logout: hapus sesi di DB dan cookie. */
export async function hapusSesi(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(NAMA_COOKIE)?.value;
  if (token)
    db.prepare("DELETE FROM sesi WHERE id_sesi = ?").run(sha256(token));
  jar.delete(NAMA_COOKIE);
}

/** Dipakai reset sandi: semua perangkat keluar (rancangan §15). */
export function hapusSemuaSesi(idPengguna: string): void {
  db.prepare("DELETE FROM sesi WHERE id_pengguna = ?").run(idPengguna);
}
