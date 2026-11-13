import "server-only";
import { randomUUID } from "node:crypto";
import { db, tx } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { Pengguna, Registrasi } from "@/lib/validation/auth";

export function cariEmail(email: string) {
  return db
    .prepare(
      `SELECT id_pengguna AS id, password_hash AS passwordHash FROM pengguna WHERE email = ?`,
    )
    .get(email) as { id: string; passwordHash: string } | undefined;
}

export function ambil(id: string): Pengguna {
  const row = db
    .prepare(
      `SELECT p.id_pengguna AS id, p.nama, p.email, p.peran,
    t.status_verifikasi AS statusVerifikasi FROM pengguna p
    LEFT JOIN tenaga_kerja t USING (id_pengguna) WHERE p.id_pengguna = ?`,
    )
    .get(id) as Omit<Pengguna, "statusVerifikasi"> & {
    statusVerifikasi: Pengguna["statusVerifikasi"] | null;
  };
  const { statusVerifikasi, ...pengguna } = row;
  return statusVerifikasi ? { ...pengguna, statusVerifikasi } : pengguna;
}

/** C01: pengguna dan profil dibuat atomik, pemeriksaan duplikat di dalam BEGIN IMMEDIATE. */
export function buat(input: Registrasi, passwordHash: string): Pengguna {
  return tx(() => {
    if (cariEmail(input.email))
      throw new AppError(
        "EMAIL_TERDAFTAR",
        409,
        "Email sudah terdaftar. Silakan masuk.",
        { email: "Email sudah terdaftar. Silakan masuk." },
      );
    const id = randomUUID();
    db.prepare(
      `INSERT INTO pengguna (id_pengguna, nama, email, password_hash, peran, tanggal_lahir, persetujuan_privasi_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    ).run(
      id,
      input.nama,
      input.email,
      passwordHash,
      input.peran,
      input.tanggalLahir,
    );
    if (input.peran === "TK")
      db.prepare(
        "INSERT INTO tenaga_kerja (id_tenaga_kerja, id_pengguna) VALUES (?, ?)",
      ).run(randomUUID(), id);
    else
      db.prepare(
        "INSERT INTO penyedia_kerja (id_penyedia_kerja, id_pengguna) VALUES (?, ?)",
      ).run(randomUUID(), id);
    return ambil(id);
  });
}
