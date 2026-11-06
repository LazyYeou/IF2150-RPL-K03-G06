import "server-only";
import { randomUUID } from "node:crypto";
import { db, tx } from "@/lib/db";
import { keIso } from "@/lib/http";
import type {
  AjukanPenawaranInput,
  Penawaran,
} from "@/lib/validation/penawaran";

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
