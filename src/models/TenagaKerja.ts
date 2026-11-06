import "server-only";
import { db, tx } from "@/lib/db";
import { keIso } from "@/lib/http";

// C02. Status verifikasi: docs/contracts/modules.md §2.1.
export type StatusVerifikasi =
  "BELUM_TERVERIFIKASI" | "MENUNGGU_VERIFIKASI" | "TERVERIFIKASI" | "DITOLAK";

// shortcut: transisi dicek di sini sampai transisiDiizinkan() (#17) tersedia; ganti saat #17 masuk.
const BOLEH_DIAJUKAN = ["BELUM_TERVERIFIKASI", "DITOLAK"] as const;

type Baris = {
  status: StatusVerifikasi;
  waktuPengajuan: string | null;
  alasanPenolakan: string | null;
  dokumenPath: string | null;
};

export function cariVerifikasi(idPengguna: string) {
  const r = db
    .prepare(
      `SELECT status_verifikasi AS status, waktu_pengajuan_verifikasi AS waktuPengajuan,
              alasan_penolakan AS alasanPenolakan, dokumen_identitas_path AS dokumenPath
       FROM tenaga_kerja WHERE id_pengguna = ?`,
    )
    .get(idPengguna) as Baris | undefined;
  return (
    r && { ...r, waktuPengajuan: r.waktuPengajuan && keIso(r.waktuPengajuan) }
  );
}

/**
 * Catat pengajuan (KF04). Hanya dari BELUM_TERVERIFIKASI/DITOLAK; kondisi di WHERE menjaga balapan
 * dua pengajuan sekaligus. Mengembalikan path dokumen lama (untuk dihapus) atau false bila ditolak.
 */
export function ajukanVerifikasi(
  idPengguna: string,
  dokumenPath: string,
): { dokumenLama: string | null } | false {
  return tx(() => {
    const lama = db
      .prepare(
        "SELECT dokumen_identitas_path AS p FROM tenaga_kerja WHERE id_pengguna = ?",
      )
      .get(idPengguna) as { p: string | null } | undefined;
    const r = db
      .prepare(
        `UPDATE tenaga_kerja
         SET status_verifikasi = 'MENUNGGU_VERIFIKASI', dokumen_identitas_path = ?,
             waktu_pengajuan_verifikasi = datetime('now'), alasan_penolakan = NULL
         WHERE id_pengguna = ? AND status_verifikasi IN (?, ?)`,
      )
      .run(dokumenPath, idPengguna, ...BOLEH_DIAJUKAN);
    return r.changes === 1 ? { dokumenLama: lama?.p ?? null } : false;
  });
}
