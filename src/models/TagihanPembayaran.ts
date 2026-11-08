import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { keIso } from "@/lib/http";
import type { StatusTagihan } from "@/lib/validation/tagihan";

export interface TagihanDTO {
  id: string;
  idTransaksi: string;
  nominalUpah: number;
  commissionFee: number;
  totalBayar: number;
  metode: string | null;
  expiry: string;
  status: StatusTagihan;
  createdAt: string;
}

interface TagihanRow {
  id_tagihan: string;
  id_transaksi: string;
  nominal_upah: number;
  commission_fee: number;
  total_bayar: number;
  metode: string | null;
  expiry_timestamp: string;
  status_pembayaran: StatusTagihan;
  created_at: string;
}

function keDTO(r: TagihanRow): TagihanDTO {
  return {
    id: r.id_tagihan,
    idTransaksi: r.id_transaksi,
    nominalUpah: r.nominal_upah,
    commissionFee: r.commission_fee,
    totalBayar: r.total_bayar,
    metode: r.metode,
    expiry: keIso(r.expiry_timestamp),
    status: r.status_pembayaran,
    createdAt: keIso(r.created_at),
  };
}

export function cariTagihanAktif(idTransaksi: string): TagihanDTO | null {
  const row = db
    .prepare(
      `SELECT id_tagihan, id_transaksi, nominal_upah, commission_fee,
              total_bayar, metode, expiry_timestamp, status_pembayaran, created_at
       FROM tagihan_pembayaran
       WHERE id_transaksi = ?
         AND status_pembayaran IN ('MENUNGGU_PEMBAYARAN', 'DIPROSES', 'BERHASIL')
       LIMIT 1`,
    )
    .get(idTransaksi) as TagihanRow | undefined;

  if (!row) return null;
  return keDTO(row);
}

export function cariTagihanBerdasarkanId(idTagihan: string): TagihanDTO | null {
  const row = db
    .prepare(
      `SELECT id_tagihan, id_transaksi, nominal_upah, commission_fee,
              total_bayar, metode, expiry_timestamp, status_pembayaran, created_at
       FROM tagihan_pembayaran
       WHERE id_tagihan = ?`,
    )
    .get(idTagihan) as TagihanRow | undefined;

  if (!row) return null;
  return keDTO(row);
}

export function buatTagihan(
  idTransaksi: string,
  nominalUpah: number,
): { tagihan: TagihanDTO; baru: boolean } {
  // Q-035: Periksa apakah sudah ada tagihan aktif
  const aktif = cariTagihanAktif(idTransaksi);
  if (aktif) {
    return { tagihan: aktif, baru: false };
  }

  const rate = Number(process.env.COMMISSION_RATE || "0.05");
  const expiryHours = Number(process.env.PAYMENT_EXPIRY_HOURS || "24");

  const commissionFee = Math.round(rate * nominalUpah);
  const totalBayar = nominalUpah + commissionFee;

  const expiryDate = new Date(Date.now() + expiryHours * 3600 * 1000);
  const expiryStr = expiryDate
    .toISOString()
    .replace("T", " ")
    .replace("Z", "")
    .slice(0, 19);

  const idTagihan = randomUUID();

  // Q-036: Insert tagihan baru
  db.prepare(
    `INSERT INTO tagihan_pembayaran (
       id_tagihan, id_transaksi, nominal_upah, commission_fee,
       total_bayar, expiry_timestamp, status_pembayaran
     ) VALUES (?, ?, ?, ?, ?, ?, 'MENUNGGU_PEMBAYARAN')`,
  ).run(idTagihan, idTransaksi, nominalUpah, commissionFee, totalBayar, expiryStr);

  const tagihanBaru = cariTagihanBerdasarkanId(idTagihan);
  if (!tagihanBaru) {
    throw new Error("Gagal mengambil tagihan yang baru dibuat");
  }

  return { tagihan: tagihanBaru, baru: true };
}

export function periksaKedaluwarsaLazy(tagihan: TagihanDTO): TagihanDTO {
  if (tagihan.status === "MENUNGGU_PEMBAYARAN") {
    const expired = db
      .prepare(
        `UPDATE tagihan_pembayaran
         SET status_pembayaran = 'KEDALUWARSA'
         WHERE id_tagihan = ?
           AND status_pembayaran = 'MENUNGGU_PEMBAYARAN'
           AND expiry_timestamp < datetime('now')
         RETURNING id_tagihan`,
      )
      .get(tagihan.id);

    if (expired) {
      return { ...tagihan, status: "KEDALUWARSA" };
    }
  }
  return tagihan;
}
