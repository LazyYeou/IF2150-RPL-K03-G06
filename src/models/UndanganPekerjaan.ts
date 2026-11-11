import "server-only";
import { db, tx } from "@/lib/db";

export type HasilUndang =
  | { ok: true; judul: string; namaPK: string }
  | {
      ok: false;
      alasan:
        | "TK_TIDAK_ADA"
        | "LOWONGAN_TIDAK_ADA"
        | "BUKAN_PEMILIK"
        | "LOWONGAN_TIDAK_OPEN"
        | "SUDAH_DIUNDANG";
    };

/** #52: PK mengundang TK terverifikasi ke lowongan OPEN miliknya; satu kali per pasangan. */
export function undang(
  idPenggunaPK: string,
  idPenggunaTK: string,
  idLowongan: string,
): HasilUndang {
  return tx(() => {
    const tk = db
      .prepare(
        "SELECT id_tenaga_kerja AS id FROM tenaga_kerja WHERE id_pengguna = ? AND status_verifikasi = 'TERVERIFIKASI'",
      )
      .get(idPenggunaTK) as { id: string } | undefined;
    if (!tk) return { ok: false, alasan: "TK_TIDAK_ADA" } as const;
    const l = db
      .prepare(
        `SELECT l.judul, l.status_lowongan AS status, pk.id_pengguna AS pemilik, u.nama AS namaPK
         FROM lowongan_pekerjaan l JOIN penyedia_kerja pk USING (id_penyedia_kerja)
         JOIN pengguna u ON u.id_pengguna = pk.id_pengguna WHERE l.id_lowongan = ?`,
      )
      .get(idLowongan) as
      | { judul: string; status: string; pemilik: string; namaPK: string }
      | undefined;
    if (!l) return { ok: false, alasan: "LOWONGAN_TIDAK_ADA" } as const;
    if (l.pemilik !== idPenggunaPK)
      return { ok: false, alasan: "BUKAN_PEMILIK" } as const;
    if (l.status !== "OPEN")
      return { ok: false, alasan: "LOWONGAN_TIDAK_OPEN" } as const;
    const baru = db
      .prepare(
        "INSERT OR IGNORE INTO undangan_pekerjaan (id_lowongan, id_tenaga_kerja) VALUES (?, ?)",
      )
      .run(idLowongan, tk.id);
    if (baru.changes === 0)
      return { ok: false, alasan: "SUDAH_DIUNDANG" } as const;
    return { ok: true, judul: l.judul, namaPK: l.namaPK } as const;
  });
}
