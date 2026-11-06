import "server-only";
import { db } from "@/lib/db";
import type { BerkasDenganPeserta } from "./BuktiPenyerahan";

/**
 * Bukti sengketa + pihak yang boleh melihat: pelapor dan, bila tiket terkait transaksi,
 * TK dan PK transaksi itu. Tiket bantuan umum (tanpa transaksi) hanya untuk pelapor.
 */
export function cariBuktiSengketaDenganPeserta(
  idBukti: string,
): BerkasDenganPeserta | null {
  const r = db
    .prepare(
      `SELECT bs.file_path AS filePath, ts.id_pelapor AS idPelapor,
              tk.id_pengguna AS idTK, pk.id_pengguna AS idPK
       FROM bukti_sengketa bs
       JOIN tiket_sengketa ts USING (id_tiket)
       LEFT JOIN transaksi_pekerjaan t ON t.id_transaksi = ts.id_transaksi
       LEFT JOIN tenaga_kerja tk ON tk.id_tenaga_kerja = t.id_tenaga_kerja
       LEFT JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = t.id_penyedia_kerja
       WHERE bs.id_bukti = ?`,
    )
    .get(idBukti) as
    | {
        filePath: string;
        idPelapor: string;
        idTK: string | null;
        idPK: string | null;
      }
    | undefined;
  return r
    ? {
        filePath: r.filePath,
        peserta: [r.idPelapor, r.idTK, r.idPK].filter((x): x is string => !!x),
      }
    : null;
}
