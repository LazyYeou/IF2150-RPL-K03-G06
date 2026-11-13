import "server-only";
import { randomUUID } from "node:crypto";
import { db, tx } from "@/lib/db";
import { keIso } from "@/lib/http";
import type { z } from "zod";
import type {
  AjukanPenawaranInput,
  Pelamar as PelamarSkema,
  Penawaran,
} from "@/lib/validation/penawaran";
import { transisiDiizinkan, type StatusPenawaran } from "@/models/statusMachine";

type PelamarItem = z.infer<typeof PelamarSkema>;

// C06. Status penawaran: src/docs/contracts/modules.md §2.3.
export const UKURAN_HALAMAN = 12;

const SELECT_DTO = `SELECT p.id_penawaran AS id, l.id_lowongan AS idLowongan, l.judul, p.harga_penawaran AS hargaPenawaran,
    p.ketersediaan, p.pesan_penawaran AS pesan, p.status_penawaran AS status, p.created_at AS createdAt
  FROM pengajuan_penawaran p JOIN lowongan_pekerjaan l USING (id_lowongan)`;

type Baris = Omit<Penawaran, "lowongan" | "createdAt"> & {
  idLowongan: string;
  judul: string;
  createdAt: string;
};

function dto({ idLowongan, judul, createdAt, ...r }: Baris): Penawaran {
  return {
    ...r,
    lowongan: { id: idLowongan, judul },
    createdAt: keIso(createdAt),
  };
}

const cari = (id: string) => {
  const r = db.prepare(`${SELECT_DTO} WHERE p.id_penawaran = ?`).get(id) as
    Baris | undefined;
  return r && dto(r);
};

export type HasilAjukan =
  | { ok: true; penawaran: Penawaran; idPenggunaPK: string }
  | {
      ok: false;
      alasan: "LOWONGAN_TIDAK_ADA" | "KUOTA_PENUH" | "PENAWARAN_GANDA";
    };

/** KF10, KF11. Semua cek di dalam tx() agar konsisten dengan kuota/penawaran terbaru. */
export function ajukan(idTK: string, v: AjukanPenawaranInput): HasilAjukan {
  return tx(() => {
    const l = db
      .prepare(
        `SELECT l.status_lowongan AS status, l.kuota, l.jumlah_diterima AS diterima, pk.id_pengguna AS idPenggunaPK
         FROM lowongan_pekerjaan l JOIN penyedia_kerja pk USING (id_penyedia_kerja) WHERE l.id_lowongan = ?`,
      )
      .get(v.idLowongan) as
      | {
          status: string;
          kuota: number;
          diterima: number;
          idPenggunaPK: string;
        }
      | undefined;
    if (!l) return { ok: false, alasan: "LOWONGAN_TIDAK_ADA" } as const;
    if (l.status !== "OPEN" || l.diterima >= l.kuota)
      return { ok: false, alasan: "KUOTA_PENUH" } as const;

    const aktif = db
      .prepare(
        `SELECT 1 FROM pengajuan_penawaran
         WHERE id_lowongan = ? AND id_tenaga_kerja = ? AND status_penawaran IN ('MENUNGGU','DITERIMA')`,
      )
      .get(v.idLowongan, idTK);
    if (aktif) return { ok: false, alasan: "PENAWARAN_GANDA" } as const;

    const id = randomUUID();
    db.prepare(
      `INSERT INTO pengajuan_penawaran (id_penawaran, id_lowongan, id_tenaga_kerja, harga_penawaran, ketersediaan, pesan_penawaran)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      v.idLowongan,
      idTK,
      v.hargaPenawaran,
      v.ketersediaan,
      v.pesan ?? null,
    );
    return {
      ok: true,
      penawaran: cari(id)!,
      idPenggunaPK: l.idPenggunaPK,
    } as const;
  });
}

/** Lamaran saya (I-13), terbaru dulu, opsional per status. */
export function milikTK(
  idTK: string,
  status: string | undefined,
  page: number,
) {
  const p = { idTK, status: status ?? null };
  const where =
    "p.id_tenaga_kerja = @idTK AND (@status IS NULL OR p.status_penawaran = @status)";
  const items = db
    .prepare(
      `${SELECT_DTO} WHERE ${where} ORDER BY p.created_at DESC, p.id_penawaran LIMIT @limit OFFSET @offset`,
    )
    .all({
      ...p,
      limit: UKURAN_HALAMAN,
      offset: (page - 1) * UKURAN_HALAMAN,
    }) as Baris[];
  const { total } = db
    .prepare(
      `SELECT COUNT(*) AS total FROM pengajuan_penawaran p WHERE ${where}`,
    )
    .get(p) as { total: number };
  return { items: items.map(dto), total, page, pageSize: UKURAN_HALAMAN };
}

export type HasilTarik =
  | { ok: true; penawaran: Penawaran }
  | { ok: false; alasan: "TIDAK_ADA" | "BUKAN_PEMILIK" | "BUKAN_MENUNGGU" };

/** Q-098 + Q-100: hanya pemilik, hanya status MENUNGGU. */
export function tarik(idPenawaran: string, idTK: string): HasilTarik {
  return tx(() => {
    const p = db
      .prepare(
        "SELECT id_tenaga_kerja AS pemilik, status_penawaran AS status FROM pengajuan_penawaran WHERE id_penawaran = ?",
      )
      .get(idPenawaran) as { pemilik: string; status: string } | undefined;
    if (!p) return { ok: false, alasan: "TIDAK_ADA" } as const;
    if (p.pemilik !== idTK)
      return { ok: false, alasan: "BUKAN_PEMILIK" } as const;
    if (p.status !== "MENUNGGU")
      return { ok: false, alasan: "BUKAN_MENUNGGU" } as const;
    db.prepare(
      "UPDATE pengajuan_penawaran SET status_penawaran = 'DITARIK' WHERE id_penawaran = ?",
    ).run(idPenawaran);
    return { ok: true, penawaran: cari(idPenawaran)! } as const;
  });
}

/** I-32: pelamar satu lowongan (kecuali yang ditarik), yang masih menunggu lebih dulu. */
export function pelamar(idLowongan: string): PelamarItem[] {
  const rows = db
    .prepare(
      `SELECT p.id_penawaran AS idPenawaran, u.id_pengguna AS idPengguna, u.nama, u.akumulasi_rating AS akumulasiRating,
         u.jumlah_ulasan AS jumlahUlasan, p.harga_penawaran AS hargaPenawaran, p.ketersediaan,
         p.pesan_penawaran AS pesan, p.status_penawaran AS status, p.created_at AS createdAt
       FROM pengajuan_penawaran p
       JOIN tenaga_kerja t ON t.id_tenaga_kerja = p.id_tenaga_kerja
       JOIN pengguna u ON u.id_pengguna = t.id_pengguna
       WHERE p.id_lowongan = ? AND p.status_penawaran <> 'DITARIK'
       ORDER BY p.status_penawaran = 'MENUNGGU' DESC, p.created_at, p.id_penawaran`,
    )
    .all(idLowongan) as (Omit<PelamarItem, "tenagaKerja" | "createdAt"> & {
    idPengguna: string;
    nama: string;
    akumulasiRating: number;
    jumlahUlasan: number;
    createdAt: string;
  })[];
  return rows.map(
    ({ idPengguna, nama, akumulasiRating, jumlahUlasan, createdAt, ...r }) => ({
      ...r,
      tenagaKerja: { id: idPengguna, nama, akumulasiRating, jumlahUlasan },
      createdAt: keIso(createdAt),
    }),
  );
}

export type HasilTerima =
  | {
      ok: true;
      idTransaksi: string;
      statusLowongan: "OPEN" | "CLOSED_FULL";
      sisaKuota: number;
      idPenggunaTK: string;
      judul: string;
    }
  | {
      ok: false;
      alasan: "TIDAK_ADA" | "BUKAN_PEMILIK" | "BUKAN_MENUNGGU" | "KUOTA_PENUH";
    };

/**
 * KF12, KF13, KNF07. Seluruh cek dan tulis dalam satu tx() (BEGIN IMMEDIATE): penulis lain antre,
 * jadi sisa kuota yang dibaca di sini tidak bisa berubah sebelum commit.
 */
export function terima(idPenawaran: string, idPK: string): HasilTerima {
  return tx(() => {
    const p = db
      .prepare(
        `SELECT p.status_penawaran AS statusPenawaran, p.id_lowongan AS idLowongan, p.id_tenaga_kerja AS idTK,
           p.harga_penawaran AS harga, l.id_penyedia_kerja AS idPemilik, l.status_lowongan AS statusLowongan,
           l.kuota, l.jumlah_diterima AS diterima, l.judul, t.id_pengguna AS idPenggunaTK
         FROM pengajuan_penawaran p
         JOIN lowongan_pekerjaan l USING (id_lowongan)
         JOIN tenaga_kerja t ON t.id_tenaga_kerja = p.id_tenaga_kerja
         WHERE p.id_penawaran = ?`,
      )
      .get(idPenawaran) as
      | {
          statusPenawaran: string;
          idLowongan: string;
          idTK: string;
          harga: number;
          idPemilik: string;
          statusLowongan: string;
          kuota: number;
          diterima: number;
          judul: string;
          idPenggunaTK: string;
        }
      | undefined;
    if (!p) return { ok: false, alasan: "TIDAK_ADA" } as const;
    if (p.idPemilik !== idPK)
      return { ok: false, alasan: "BUKAN_PEMILIK" } as const;
    if (p.statusLowongan !== "OPEN" || p.diterima >= p.kuota)
      return { ok: false, alasan: "KUOTA_PENUH" } as const;
    if (
      !transisiDiizinkan(
        "penawaran",
        p.statusPenawaran as StatusPenawaran,
        "DITERIMA",
      )
    )
      return { ok: false, alasan: "BUKAN_MENUNGGU" } as const;

    const penuh = p.diterima + 1 >= p.kuota;
    db.prepare(
      "UPDATE pengajuan_penawaran SET status_penawaran = 'DITERIMA' WHERE id_penawaran = ?",
    ).run(idPenawaran);
    // Lapis kedua KNF07: UPDATE bersyarat; 0 baris berubah = kuota sudah penuh.
    const u = db
      .prepare(
        `UPDATE lowongan_pekerjaan SET jumlah_diterima = jumlah_diterima + 1,
           status_lowongan = CASE WHEN jumlah_diterima + 1 >= kuota THEN 'CLOSED_FULL' ELSE status_lowongan END
         WHERE id_lowongan = ? AND status_lowongan = 'OPEN' AND jumlah_diterima < kuota`,
      )
      .run(p.idLowongan);
    if (u.changes !== 1) throw new Error("Kuota berubah di dalam transaksi");

    const idTransaksi = randomUUID();
    db.prepare(
      `INSERT INTO transaksi_pekerjaan (id_transaksi, id_lowongan, id_penawaran, id_tenaga_kerja, id_penyedia_kerja, nominal_upah)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(idTransaksi, p.idLowongan, idPenawaran, p.idTK, idPK, p.harga);
    if (penuh)
      db.prepare(
        `UPDATE pengajuan_penawaran SET status_penawaran = 'DITOLAK_OTOMATIS'
         WHERE id_lowongan = ? AND status_penawaran = 'MENUNGGU'`,
      ).run(p.idLowongan);
    return {
      ok: true,
      idTransaksi,
      statusLowongan: penuh ? "CLOSED_FULL" : "OPEN",
      sisaKuota: p.kuota - p.diterima - 1,
      idPenggunaTK: p.idPenggunaTK,
      judul: p.judul,
    } as const;
  });
}
