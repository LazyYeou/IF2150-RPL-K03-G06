import "server-only";
import { randomUUID } from "node:crypto";
import { db, tx } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { maskerRekening } from "@/models/Dompet";
import { getPaymentAdapter } from "@/lib/payment/adapter";
import type { PencairanResponse } from "@/lib/validation/dompet";

export interface PencairanDTO {
  id: string;
  idTenagaKerja: string;
  nominal: number;
  rekeningTujuan: string;
  status: string;
  waktuPengajuan: string;
}

export function cariPencairanBerdasarkanId(
  idPencairan: string,
): PencairanDTO | null {
  const row = db
    .prepare(
      `SELECT id_pencairan, id_tenaga_kerja, nominal, rekening_tujuan, status_pencairan, waktu_pengajuan
       FROM pencairan_dana
       WHERE id_pencairan = ?`,
    )
    .get(idPencairan) as
    | {
        id_pencairan: string;
        id_tenaga_kerja: string;
        nominal: number;
        rekening_tujuan: string;
        status_pencairan: string;
        waktu_pengajuan: string;
      }
    | undefined;

  if (!row) return null;
  return {
    id: row.id_pencairan,
    idTenagaKerja: row.id_tenaga_kerja,
    nominal: row.nominal,
    rekeningTujuan: row.rekening_tujuan,
    status: row.status_pencairan,
    waktuPengajuan: row.waktu_pengajuan,
  };
}

export async function ajukanPencairanDana(
  idTenagaKerja: string,
  nominal: number,
  rekeningTujuan: string,
): Promise<PencairanResponse> {
  const idPencairan = randomUUID();

  tx(() => {
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

    if (nominal > saldoTersedia) {
      throw new AppError(
        "SALDO_TIDAK_CUKUP",
        422,
        `Saldo tersedia (Rp ${saldoTersedia.toLocaleString("id-ID")}) tidak mencukupi untuk melakukan penarikan sebesar Rp ${nominal.toLocaleString("id-ID")}`,
      );
    }

    db.prepare(
      `INSERT INTO pencairan_dana (id_pencairan, id_tenaga_kerja, nominal, rekening_tujuan, status_pencairan, waktu_pengajuan)
       VALUES (?, ?, ?, ?, 'DIPROSES', datetime('now'))`,
    ).run(idPencairan, idTenagaKerja, nominal, rekeningTujuan);
  });

  const adapter = getPaymentAdapter();
  await adapter.disburse({
    idPencairan,
    rekening: rekeningTujuan,
    nominal,
  });

  return {
    id: idPencairan,
    nominal,
    rekeningMasked: maskerRekening(rekeningTujuan),
    status: "DIPROSES",
  };
}
