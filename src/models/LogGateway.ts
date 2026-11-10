import "server-only";
import { sanitasiLog } from "@/lib/rekening";
import { db } from "@/lib/db";
import { keIso } from "@/lib/http";

export type JenisLogGateway = "CHARGE" | "DISBURSEMENT" | "REFUND" | "CALLBACK";

export interface LogGateway {
  idLog: number;
  jenis: JenisLogGateway;
  referensiId: string;
  provider: string;
  payload: unknown;
  createdAt: string;
}

/**
 * C15: Mencatat aktivitas gateway ke tabel log_gateway (append-only).
 * Setiap charge, disbursement, refund, dan webhook callback dicatat di sini.
 */
export function catatLog(
  jenis: JenisLogGateway,
  referensiId: string,
  payload: unknown,
  provider: string = "MOCK",
): number {
  let isi: unknown = payload;
  if (typeof payload === "string") {
    try {
      isi = JSON.parse(payload);
    } catch {
      /* teks bebas tetap disanitasi */
    }
  }
  const aman = sanitasiLog(isi);
  const payloadStr = typeof aman === "string" ? aman : JSON.stringify(aman);

  const result = db
    .prepare(
      `INSERT INTO log_gateway (jenis, referensi_id, provider, payload)
       VALUES (?, ?, ?, ?)`,
    )
    .run(jenis, referensiId, provider, payloadStr);

  return Number(result.lastInsertRowid);
}

/**
 * Mengambil riwayat log komunikasi gateway berdasarkan referensi_id (id_tagihan, id_pencairan, id_tiket).
 */
export function ambilLog(referensiId: string): LogGateway[] {
  const rows = db
    .prepare(
      `SELECT id_log AS idLog, jenis, referensi_id AS referensiId,
              provider, payload, created_at AS createdAt
       FROM log_gateway
       WHERE referensi_id = ?
       ORDER BY id_log ASC`,
    )
    .all(referensiId) as {
    idLog: number;
    jenis: JenisLogGateway;
    referensiId: string;
    provider: string;
    payload: string;
    createdAt: string;
  }[];

  return rows.map((r) => {
    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(r.payload);
    } catch {
      parsedPayload = r.payload;
    }
    return {
      ...r,
      payload: sanitasiLog(parsedPayload),
      createdAt: keIso(r.createdAt),
    };
  });
}
