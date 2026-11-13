import "server-only";
import { db, tx } from "@/lib/db";
import { keIso } from "@/lib/http";
import { transisiDiizinkan } from "@/models/statusMachine";

// C02. Status verifikasi: src/docs/contracts/modules.md §2.1.
export type StatusVerifikasi =
  "BELUM_TERVERIFIKASI" | "MENUNGGU_VERIFIKASI" | "TERVERIFIKASI" | "DITOLAK";

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
    const status = db
      .prepare(
        "SELECT status_verifikasi AS status FROM tenaga_kerja WHERE id_pengguna = ?",
      )
      .get(idPengguna) as { status: StatusVerifikasi } | undefined;
    if (
      !status ||
      !transisiDiizinkan(
        "verifikasi",
        status.status,
        "MENUNGGU_VERIFIKASI",
      )
    )
      return false;

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

export function idDariPengguna(idPengguna: string): string | null {
  const r = db
    .prepare(
      "SELECT id_tenaga_kerja AS id FROM tenaga_kerja WHERE id_pengguna = ?",
    )
    .get(idPengguna) as { id: string } | undefined;
  return r?.id ?? null;
}

/** Antrean verifikasi CS: pengajuan MENUNGGU, terlama dulu (KF05). */
export function antreanVerifikasi() {
  const rows = db
    .prepare(
      `SELECT tk.id_tenaga_kerja AS idTenagaKerja, u.nama, u.email,
              tk.waktu_pengajuan_verifikasi AS waktuPengajuan
       FROM tenaga_kerja tk JOIN pengguna u USING (id_pengguna)
       WHERE tk.status_verifikasi = 'MENUNGGU_VERIFIKASI'
       ORDER BY tk.waktu_pengajuan_verifikasi, tk.id_tenaga_kerja`,
    )
    .all() as {
    idTenagaKerja: string;
    nama: string;
    email: string;
    waktuPengajuan: string;
  }[];
  return rows.map((r) => ({ ...r, waktuPengajuan: keIso(r.waktuPengajuan) }));
}

/** Path dokumen identitas (terenkripsi) milik satu TK, atau null bila TK/dokumen tidak ada. */
export function dokumenIdentitas(idTenagaKerja: string): string | null {
  const r = db
    .prepare(
      "SELECT dokumen_identitas_path AS p FROM tenaga_kerja WHERE id_tenaga_kerja = ?",
    )
    .get(idTenagaKerja) as { p: string | null } | undefined;
  return r?.p ?? null;
}

export type HasilKeputusan =
  | { ok: true; idPengguna: string }
  | { ok: false; alasan: "TIDAK_ADA" | "BUKAN_MENUNGGU" };

/**
 * Setujui/tolak pengajuan (KF05). Hanya dari MENUNGGU_VERIFIKASI; dicek di dalam tx() agar dua CS
 * yang memutus bersamaan tidak saling menimpa.
 */
export function putuskanVerifikasi(
  idTenagaKerja: string,
  keputusan: { setujui: true } | { tolak: string },
): HasilKeputusan {
  return tx(() => {
    const tk = db
      .prepare(
        "SELECT id_pengguna AS idPengguna, status_verifikasi AS status FROM tenaga_kerja WHERE id_tenaga_kerja = ?",
      )
      .get(idTenagaKerja) as
      { idPengguna: string; status: StatusVerifikasi } | undefined;
    if (!tk) return { ok: false, alasan: "TIDAK_ADA" } as const;
    if (
      !transisiDiizinkan(
        "verifikasi",
        tk.status,
        "setujui" in keputusan ? "TERVERIFIKASI" : "DITOLAK",
      )
    )
      return { ok: false, alasan: "BUKAN_MENUNGGU" } as const;
    db.prepare(
      "UPDATE tenaga_kerja SET status_verifikasi = ?, alasan_penolakan = ? WHERE id_tenaga_kerja = ?",
    ).run(
      "setujui" in keputusan ? "TERVERIFIKASI" : "DITOLAK",
      "tolak" in keputusan ? keputusan.tolak : null,
      idTenagaKerja,
    );
    return { ok: true, idPengguna: tk.idPengguna } as const;
  });
}
