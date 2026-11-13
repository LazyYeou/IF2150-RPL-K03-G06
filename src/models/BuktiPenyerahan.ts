import "server-only";
import { db } from "@/lib/db";

export type BerkasDenganPeserta = {
  filePath: string;
  /** id_pengguna yang boleh melihat selain CS */
  peserta: string[];
};

/** C08: bukti penyerahan + dua pihak transaksinya (TK yang ditugaskan dan PK pemilik). */
export function cariBuktiDenganPeserta(
  idPenyerahan: string,
): BerkasDenganPeserta | null {
  const r = db
    .prepare(
      `SELECT b.file_path AS filePath, tk.id_pengguna AS idTK, pk.id_pengguna AS idPK
       FROM bukti_penyerahan b
       JOIN transaksi_pekerjaan t USING (id_transaksi)
       JOIN tenaga_kerja tk ON tk.id_tenaga_kerja = t.id_tenaga_kerja
       JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = t.id_penyedia_kerja
       WHERE b.id_penyerahan = ?`,
    )
    .get(idPenyerahan) as
    { filePath: string; idTK: string; idPK: string } | undefined;
  return r ? { filePath: r.filePath, peserta: [r.idTK, r.idPK] } : null;
}
