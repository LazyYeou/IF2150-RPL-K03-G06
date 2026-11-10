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

// Lease lebih panjang daripada timeout; klaim yang kedaluwarsa dapat dipulihkan
// setelah proses server berhenti. Gateway wajib memakai idPencairan sebagai key.
export const BATAS_GATEWAY_MS = 10_000;
const DURASI_KLAIM_MS = 30_000;
const aktif = (status: string) =>
  status === "DIPROSES" || status === "MENUNGGU_PROSES";

type Pengiriman = { status: string; klaim: string | null; batas_klaim: number };

export function bisaUlangPencairan(id: string, status: string): boolean {
  if (!aktif(status)) return false;
  const pengiriman = db
    .prepare(
      "SELECT status, klaim, batas_klaim FROM pengiriman_pencairan WHERE id_pencairan = ?",
    )
    .get(id) as Pengiriman | undefined;
  return (
    !!pengiriman &&
    (pengiriman.status === "SIAP" ||
      pengiriman.status === "BELUM_PASTI" ||
      (pengiriman.status === "MENGIRIM" &&
        pengiriman.batas_klaim <= Date.now()))
  );
}

function respons(id: string): PencairanResponse {
  const pencairan = cariPencairanBerdasarkanId(id)!;
  return {
    id,
    nominal: pencairan.nominal,
    rekeningMasked: maskerRekening(pencairan.rekeningTujuan),
    status: pencairan.status,
    bisaCobaUlang: bisaUlangPencairan(id, pencairan.status),
  };
}

async function kirim(id: string): Promise<PencairanResponse> {
  const adapter = getPaymentAdapter();
  const token = randomUUID();
  const pencairan = tx(() => {
    const row = cariPencairanBerdasarkanId(id)!;
    if (!bisaUlangPencairan(id, row.status)) return null;
    db.prepare(
      `UPDATE pengiriman_pencairan
      SET status = 'MENGIRIM', klaim = ?, batas_klaim = ? WHERE id_pencairan = ?`,
    ).run(token, Date.now() + DURASI_KLAIM_MS, id);
    return row;
  });
  if (!pencairan) return respons(id);

  let timer: ReturnType<typeof setTimeout> | undefined;
  let hasil: "DITERIMA" | "GAGAL" | "BELUM_PASTI";
  try {
    const result = await Promise.race([
      adapter.disburse({
        idPencairan: id,
        rekening: pencairan.rekeningTujuan,
        nominal: pencairan.nominal,
      }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Gateway timeout")),
          BATAS_GATEWAY_MS,
        );
      }),
    ]);
    // Respons tidak dikenal juga tidak boleh membebaskan reservasi.
    hasil =
      result.status === "GAGAL"
        ? "GAGAL"
        : result.status === "DITERIMA"
          ? "DITERIMA"
          : "BELUM_PASTI";
  } catch {
    hasil = "BELUM_PASTI";
  } finally {
    if (timer) clearTimeout(timer);
  }

  tx(() => {
    const updated = db
      .prepare(
        `UPDATE pengiriman_pencairan
      SET status = ?, klaim = NULL, batas_klaim = 0
      WHERE id_pencairan = ? AND klaim = ?`,
      )
      .run(hasil === "GAGAL" ? "DITOLAK" : hasil, id, token);
    if (updated.changes && hasil === "GAGAL") {
      // Callback yang sudah menetapkan hasil akhir selalu menang.
      db.prepare(
        `UPDATE pencairan_dana SET status_pencairan = 'GAGAL'
        WHERE id_pencairan = ? AND status_pencairan IN ('MENUNGGU_PROSES', 'DIPROSES')`,
      ).run(id);
    }
  });
  return respons(id);
}

export async function ajukanPencairanDana(
  idTenagaKerja: string,
  nominal: number,
  rekeningTujuan: string,
  idPencairan: string = randomUUID(),
): Promise<PencairanResponse> {
  // Kesalahan konfigurasi diketahui sebelum melakukan reservasi.
  getPaymentAdapter();
  tx(() => {
    const existing = cariPencairanBerdasarkanId(idPencairan);
    if (existing) {
      if (existing.idTenagaKerja !== idTenagaKerja) {
        throw new AppError("FORBIDDEN", 403, "Pencairan bukan milik Anda");
      }
      if (
        existing.nominal !== nominal ||
        existing.rekeningTujuan !== rekeningTujuan
      ) {
        throw new AppError(
          "IDEMPOTENCY_CONFLICT",
          409,
          "Kunci pengajuan sudah digunakan untuk isian berbeda",
        );
      }
      return;
    }
    const ledger = db
      .prepare(
        `SELECT COALESCE(SUM(nominal), 0) AS total FROM mutasi_saldo WHERE id_tenaga_kerja = ?`,
      )
      .get(idTenagaKerja) as { total: number };
    const reserved = db
      .prepare(
        `SELECT COALESCE(SUM(nominal), 0) AS total FROM pencairan_dana
      WHERE id_tenaga_kerja = ? AND status_pencairan IN ('MENUNGGU_PROSES', 'DIPROSES')`,
      )
      .get(idTenagaKerja) as { total: number };
    if (nominal > Math.max(0, ledger.total - reserved.total)) {
      throw new AppError(
        "SALDO_TIDAK_CUKUP",
        422,
        "Saldo tersedia tidak mencukupi untuk pencairan",
      );
    }
    db.prepare(
      `INSERT INTO pencairan_dana
      (id_pencairan, id_tenaga_kerja, nominal, rekening_tujuan, status_pencairan)
      VALUES (?, ?, ?, ?, 'DIPROSES')`,
    ).run(idPencairan, idTenagaKerja, nominal, rekeningTujuan);
    db.prepare(
      "INSERT INTO pengiriman_pencairan (id_pencairan, status) VALUES (?, 'SIAP')",
    ).run(idPencairan);
  });
  return kirim(idPencairan);
}

export async function ulangPencairanDana(
  idTenagaKerja: string,
  id: string,
): Promise<PencairanResponse> {
  const pencairan = cariPencairanBerdasarkanId(id);
  if (!pencairan)
    throw new AppError("NOT_FOUND", 404, "Pencairan tidak ditemukan");
  if (pencairan.idTenagaKerja !== idTenagaKerja) {
    throw new AppError("FORBIDDEN", 403, "Pencairan bukan milik Anda");
  }
  return kirim(id);
}
