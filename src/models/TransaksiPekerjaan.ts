import { db } from "@/lib/db";
import { tx } from "@/lib/db";
import { keIso } from "@/lib/http";
import { randomUUID } from "node:crypto";
import {
  labelStatus,
  transisiDiizinkan,
  type StatusPekerjaan,
} from "@/models/statusMachine";

export const UKURAN_HALAMAN = 12;

export type TransaksiRingkasBaris = {
  id: string;
  judul: string;
  status: StatusPekerjaan;
  nominalUpah: number;
  commissionFee: number | null;
  totalBayar: number | null;
  tenagaKerja: string;
  penyediaKerja: string;
  createdAt: string;
};

export type TransaksiRingkasDTO = Omit<
  TransaksiRingkasBaris,
  "createdAt" | "commissionFee" | "totalBayar"
> & {
  createdAt: string;
  commissionFee?: number;
  totalBayar?: number;
};

const SELECT_TRANSaksi = `SELECT t.id_transaksi AS id, l.judul,
    t.status_pekerjaan AS status, t.nominal_upah AS nominalUpah,
    tb.commission_fee AS commissionFee, tb.total_bayar AS totalBayar,
    utk.nama AS tenagaKerja, upk.nama AS penyediaKerja,
    t.created_at AS createdAt`;

const DARI_TRANSaksi = `FROM transaksi_pekerjaan t
  JOIN lowongan_pekerjaan l ON l.id_lowongan = t.id_lowongan
  LEFT JOIN tagihan_pembayaran tb ON tb.id_tagihan = (
    SELECT tb2.id_tagihan FROM tagihan_pembayaran tb2
    WHERE tb2.id_transaksi = t.id_transaksi
    ORDER BY tb2.created_at DESC LIMIT 1
  )
  JOIN tenaga_kerja tk ON tk.id_tenaga_kerja = t.id_tenaga_kerja
  JOIN pengguna utk ON utk.id_pengguna = tk.id_pengguna
  JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = t.id_penyedia_kerja
  JOIN pengguna upk ON upk.id_pengguna = pk.id_pengguna`;

function dto(r: TransaksiRingkasBaris): TransaksiRingkasDTO {
  const out: TransaksiRingkasDTO = {
    id: r.id,
    judul: r.judul,
    status: r.status,
    nominalUpah: r.nominalUpah,
    tenagaKerja: r.tenagaKerja,
    penyediaKerja: r.penyediaKerja,
    createdAt: keIso(r.createdAt),
  };
  if (r.commissionFee !== null) out.commissionFee = r.commissionFee;
  if (r.totalBayar !== null) out.totalBayar = r.totalBayar;
  return out;
}

export function milikTK(idTK: string, page = 1) {
  const p = { idTK, limit: UKURAN_HALAMAN, offset: (page - 1) * UKURAN_HALAMAN };
  const rows = db
    .prepare(
      `${SELECT_TRANSaksi} ${DARI_TRANSaksi}
       WHERE t.id_tenaga_kerja = @idTK
       ORDER BY t.created_at DESC LIMIT @limit OFFSET @offset`,
    )
    .all(p) as TransaksiRingkasBaris[];
  const { total } = db
    .prepare(
      `SELECT COUNT(*) AS total ${DARI_TRANSaksi}
       WHERE t.id_tenaga_kerja = @idTK`,
    )
    .get({ idTK }) as { total: number };
  return { items: rows.map(dto), total, page, pageSize: UKURAN_HALAMAN };
}

export function milikPK(idPK: string, page = 1) {
  const p = { idPK, limit: UKURAN_HALAMAN, offset: (page - 1) * UKURAN_HALAMAN };
  const rows = db
    .prepare(
      `${SELECT_TRANSaksi} ${DARI_TRANSaksi}
       WHERE t.id_penyedia_kerja = @idPK
       ORDER BY t.created_at DESC LIMIT @limit OFFSET @offset`,
    )
    .all(p) as TransaksiRingkasBaris[];
  const { total } = db
    .prepare(
      `SELECT COUNT(*) AS total ${DARI_TRANSaksi}
       WHERE t.id_penyedia_kerja = @idPK`,
    )
    .get({ idPK }) as { total: number };
  return { items: rows.map(dto), total, page, pageSize: UKURAN_HALAMAN };
}

export function semua(peran: "TK" | "PK", page = 1) {
  const rows = db
    .prepare(
      `${SELECT_TRANSaksi} ${DARI_TRANSaksi}
       ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
    )
    .all(UKURAN_HALAMAN, (page - 1) * UKURAN_HALAMAN) as TransaksiRingkasBaris[];
  const { total } = db
    .prepare(
      `SELECT COUNT(*) AS total ${DARI_TRANSaksi}`,
    )
    .get() as { total: number };
  return { items: rows.map(dto), total, page, pageSize: UKURAN_HALAMAN };
}

export function detail(idTransaksi: string) {
  const row = db
    .prepare(`${SELECT_TRANSaksi} ${DARI_TRANSaksi} WHERE t.id_transaksi = ?`)
    .get(idTransaksi) as TransaksiRingkasBaris | undefined;
  return row
    ? { ...dto(row), labelStatus: labelStatus(row.status), timeline: timeline(row.status) }
    : null;
}

export function detailPeserta(
  idTransaksi: string,
  peran: "TK" | "PK",
  idProfil: string | null,
) {
  if (!idProfil) return false;
  const kolom = peran === "TK" ? "t.id_tenaga_kerja" : "t.id_penyedia_kerja";
  const baris = db
    .prepare(`SELECT 1 AS ditemukan FROM transaksi_pekerjaan t WHERE t.id_transaksi = ? AND ${kolom} = ?`)
    .get(idTransaksi, idProfil);
  return Boolean(baris);
}

export function submitBukti(
  idTransaksi: string,
  idPenggunaTK: string,
  deskripsi: string,
  filePath: string,
  ukuranFile: number,
) {
  return tx(() => {
    const transaksi = db
      .prepare(
        `SELECT t.status_pekerjaan AS status, t.id_tenaga_kerja AS idTK,
                tk.id_pengguna AS idPenggunaTK, tk.status_verifikasi AS statusVerifikasi,
                pk.id_pengguna AS idPenggunaPK
         FROM transaksi_pekerjaan t
         JOIN tenaga_kerja tk ON tk.id_tenaga_kerja = t.id_tenaga_kerja
         JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = t.id_penyedia_kerja
         WHERE t.id_transaksi = ?`,
      )
      .get(idTransaksi) as
      | {
          status: StatusPekerjaan;
          idTK: string;
          idPenggunaTK: string;
          statusVerifikasi: string;
          idPenggunaPK: string;
        }
      | undefined;

    if (!transaksi) return { ok: false as const, alasan: "TIDAK_ADA" };
    if (
      transaksi.idPenggunaTK !== idPenggunaTK ||
      transaksi.statusVerifikasi !== "TERVERIFIKASI"
    )
      return { ok: false as const, alasan: "BUKAN_TK_TUGAS" };
    if (transaksi.status !== "IN_PROGRESS")
      return { ok: false as const, alasan: "STATUS_TIDAK_VALID" };
    if (!transisiDiizinkan("pekerjaan", transaksi.status, "SUBMITTED"))
      return { ok: false as const, alasan: "STATUS_TIDAK_VALID" };

    const updated = db
      .prepare(
        `UPDATE transaksi_pekerjaan
         SET status_pekerjaan = 'SUBMITTED'
         WHERE id_transaksi = ? AND status_pekerjaan = 'IN_PROGRESS'
         RETURNING id_transaksi`,
      )
      .get(idTransaksi);
    if (!updated) return { ok: false as const, alasan: "STATUS_TIDAK_VALID" };

    db.prepare(
      `INSERT INTO bukti_penyerahan
       (id_penyerahan, id_transaksi, deskripsi_pengerjaan, file_path, ukuran_file)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(randomUUID(), idTransaksi, deskripsi, filePath, ukuranFile);

    return {
      ok: true as const,
      idPenggunaPK: transaksi.idPenggunaPK,
    };
  });
}

const ALUR_PEKERJAAN: readonly StatusPekerjaan[] = [
  "MENUNGGU_PEMBAYARAN",
  "IN_PROGRESS",
  "SUBMITTED",
  "COMPLETED",
];

export function timeline(statusSaatIni: StatusPekerjaan) {
  const urutan = [...ALUR_PEKERJAAN];
  const tercapaiStatus = (status: StatusPekerjaan) =>
    urutan.indexOf(statusSaatIni) >= urutan.indexOf(status) &&
    statusSaatIni !== "DIBATALKAN";
  if (statusSaatIni === "DISENGKETAKAN" || statusSaatIni === "DIBATALKAN") {
    return [
      ...urutan.map((status) => ({
        status,
        label: labelStatus(status),
        tercapai: status === "MENUNGGU_PEMBAYARAN" || status === "IN_PROGRESS",
        aktif: false,
      })),
      {
        status: statusSaatIni,
        label: labelStatus(statusSaatIni),
        tercapai: true,
        aktif: true,
      },
    ];
  }
  return urutan.map((status) => ({
    status,
    label: labelStatus(status),
    tercapai: tercapaiStatus(status),
    aktif: status === statusSaatIni,
  }));
}
