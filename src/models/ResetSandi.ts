import "server-only";
import { db, tx } from "@/lib/db";

/** Hanya tautan terbaru yang berlaku: token lama pengguna dinonaktifkan di transaksi yang sama. */
export function simpan(tokenHash: string, idPengguna: string) {
  tx(() => {
    db.prepare("UPDATE reset_sandi SET dipakai = 1 WHERE id_pengguna = ?").run(
      idPengguna,
    );
    db.prepare(
      `INSERT INTO reset_sandi (token_hash, id_pengguna, expires_at)
    VALUES (?, ?, datetime('now', '+30 minutes'))`,
    ).run(tokenHash, idPengguna);
  });
}

export function cariAktif(tokenHash: string) {
  return db
    .prepare(
      `SELECT id_pengguna AS idPengguna FROM reset_sandi
    WHERE token_hash = ? AND dipakai = 0 AND expires_at > datetime('now')`,
    )
    .get(tokenHash) as { idPengguna: string } | undefined;
}

export function gantiPassword(idPengguna: string, passwordHash: string) {
  db.prepare("UPDATE pengguna SET password_hash = ? WHERE id_pengguna = ?").run(
    passwordHash,
    idPengguna,
  );
  // Semua tautan lain milik pengguna ikut dinonaktifkan setelah reset berhasil.
  db.prepare("UPDATE reset_sandi SET dipakai = 1 WHERE id_pengguna = ?").run(
    idPengguna,
  );
}
