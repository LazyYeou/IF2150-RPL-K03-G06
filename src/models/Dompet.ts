import "server-only";
import { dekripsiRekening } from "@/lib/rekening";
import { db } from "@/lib/db";
import { keIso } from "@/lib/http";
import type {
  DompetResponse,
  MutasiSaldoItem,
  PencairanItem,
} from "@/lib/validation/dompet";

export function maskerRekening(rekening: string): string {
  if (!rekening) return "****";
  const digits = rekening.replace(/\D/g, "");
  if (digits.length >= 4) {
    return `****${digits.slice(-4)}`;
  }
  return `****${digits}`;
}

export function bacaDataDompet(idTenagaKerja: string): DompetResponse {
  const ledgerRow = db
    .prepare(
      `SELECT COALESCE(SUM(nominal), 0) AS totalLedger
       FROM mutasi_saldo
       WHERE id_tenaga_kerja = ?`,
    )
    .get(idTenagaKerja) as { totalLedger: number };

  const saldo = Math.max(0, ledgerRow.totalLedger);

  const tk = db
    .prepare(
      `SELECT saldo_pendapatan FROM tenaga_kerja WHERE id_tenaga_kerja = ?`,
    )
    .get(idTenagaKerja) as { saldo_pendapatan: number } | undefined;

  if (tk && tk.saldo_pendapatan !== saldo) {
    db.prepare(
      `UPDATE tenaga_kerja SET saldo_pendapatan = ? WHERE id_tenaga_kerja = ?`,
    ).run(saldo, idTenagaKerja);
  }

  const pencairanAktifRow = db
    .prepare(
      `SELECT COALESCE(SUM(nominal), 0) AS totalPencairanAktif
       FROM pencairan_dana
       WHERE id_tenaga_kerja = ?
         AND status_pencairan IN ('MENUNGGU_PROSES', 'DIPROSES')`,
    )
    .get(idTenagaKerja) as { totalPencairanAktif: number };

  const saldoTersedia = Math.max(
    0,
    saldo - pencairanAktifRow.totalPencairanAktif,
  );

  const mutasiRows = db
    .prepare(
      `SELECT kunci_operasi, nominal, created_at
       FROM mutasi_saldo
       WHERE id_tenaga_kerja = ?
       ORDER BY created_at DESC, rowid DESC`,
    )
    .all(idTenagaKerja) as Array<{
    kunci_operasi: string;
    nominal: number;
    created_at: string;
  }>;

  const mutasi: MutasiSaldoItem[] = mutasiRows.map((r) => ({
    kunciOperasi: r.kunci_operasi,
    nominal: r.nominal,
    createdAt: r.created_at.includes("T") ? r.created_at : keIso(r.created_at),
  }));

  const pencairanRows = db
    .prepare(
      `SELECT p.id_pencairan, nominal, rekening_tujuan, status_pencairan, waktu_pengajuan,
         CASE WHEN status_pencairan IN ('MENUNGGU_PROSES', 'DIPROSES') AND
           (g.status IN ('SIAP', 'BELUM_PASTI') OR (g.status = 'MENGIRIM' AND g.batas_klaim <= ?))
           THEN 1 ELSE 0 END AS bisa_ulang
       FROM pencairan_dana p LEFT JOIN pengiriman_pencairan g ON g.id_pencairan = p.id_pencairan
       WHERE id_tenaga_kerja = ?
       ORDER BY waktu_pengajuan DESC, p.rowid DESC`,
    )
    .all(Date.now(), idTenagaKerja) as Array<{
    bisa_ulang: number;
    id_pencairan: string;
    nominal: number;
    rekening_tujuan: string;
    status_pencairan: string;
    waktu_pengajuan: string;
  }>;

  const pencairan: PencairanItem[] = pencairanRows.map((r) => ({
    id: r.id_pencairan,
    nominal: r.nominal,
    rekeningMasked: maskerRekening(
      dekripsiRekening(r.rekening_tujuan, `pencairan:${r.id_pencairan}`),
    ),
    status: r.status_pencairan,
    bisaCobaUlang: !!r.bisa_ulang,
    waktuPengajuan: r.waktu_pengajuan.includes("T")
      ? r.waktu_pengajuan
      : keIso(r.waktu_pengajuan),
  }));

  return {
    saldo,
    saldoTersedia,
    mutasi,
    pencairan,
  };
}

export function hitungSaldoRingkas(idTenagaKerja: string): {
  saldo: number;
  saldoTersedia: number;
} {
  const ledgerRow = db
    .prepare(
      `SELECT COALESCE(SUM(nominal), 0) AS totalLedger
       FROM mutasi_saldo
       WHERE id_tenaga_kerja = ?`,
    )
    .get(idTenagaKerja) as { totalLedger: number };

  const saldo = Math.max(0, ledgerRow.totalLedger);

  const pencairanAktifRow = db
    .prepare(
      `SELECT COALESCE(SUM(nominal), 0) AS totalPencairanAktif
       FROM pencairan_dana
       WHERE id_tenaga_kerja = ?
         AND status_pencairan IN ('MENUNGGU_PROSES', 'DIPROSES')`,
    )
    .get(idTenagaKerja) as { totalPencairanAktif: number };

  const saldoTersedia = Math.max(
    0,
    saldo - pencairanAktifRow.totalPencairanAktif,
  );

  return { saldo, saldoTersedia };
}
