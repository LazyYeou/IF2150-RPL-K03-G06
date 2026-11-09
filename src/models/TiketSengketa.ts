import "server-only";
import { randomInt, randomUUID } from "node:crypto";
import { db, tx } from "@/lib/db";
import { keIso } from "@/lib/http";
import type { Tiket } from "@/lib/validation/sengketa";
import { transisiDiizinkan } from "./statusMachine";

// C12, C13. UC12, KF24, KF26. Riwayat append-only (trigger 0002): hanya INSERT.
export const UKURAN_HALAMAN = 12;

const FINAL = "('DITUTUP', 'DITOLAK', 'DIBATALKAN')";

type Baris = Omit<Tiket, "createdAt" | "pelapor" | "bukti" | "riwayat"> & {
  createdAt: string;
  idPelapor: string;
  namaPelapor: string;
};

const SELECT = `SELECT t.id_tiket AS id, t.nomor_tiket AS nomorTiket, t.id_transaksi AS idTransaksi,
    t.kategori_masalah AS kategoriMasalah, t.deskripsi_komplain AS deskripsi, t.status_tiket AS status,
    t.keputusan, t.created_at AS createdAt, u.id_pengguna AS idPelapor, u.nama AS namaPelapor
  FROM tiket_sengketa t JOIN pengguna u ON u.id_pengguna = t.id_pelapor`;

function dasar({ idPelapor, namaPelapor, createdAt, ...r }: Baris) {
  return {
    ...r,
    createdAt: keIso(createdAt),
    pelapor: { id: idPelapor, nama: namaPelapor },
  };
}

function bukti(idTiket: string) {
  return (
    db
      .prepare(
        `SELECT id_bukti AS id, created_at AS createdAt FROM bukti_sengketa WHERE id_tiket = ?
         ORDER BY created_at, id_bukti`,
      )
      .all(idTiket) as { id: string; createdAt: string }[]
  ).map((b) => ({
    id: b.id,
    urlBerkas: `/api/berkas/sengketa/${b.id}`,
    createdAt: keIso(b.createdAt),
  }));
}

function riwayat(idTiket: string) {
  return (
    db
      .prepare(
        `SELECT u.nama AS aktor, r.log_aktivitas AS log, r.timestamp FROM riwayat_sengketa r
         LEFT JOIN pengguna u ON u.id_pengguna = r.id_aktor WHERE r.id_tiket = ? ORDER BY r.id_riwayat`,
      )
      .all(idTiket) as {
      aktor: string | null;
      log: string;
      timestamp: string;
    }[]
  ).map((r) => ({ ...r, timestamp: keIso(r.timestamp) }));
}

const catat = (idTiket: string, idAktor: string | null, log: string) =>
  db
    .prepare(
      "INSERT INTO riwayat_sengketa (id_tiket, id_aktor, log_aktivitas) VALUES (?, ?, ?)",
    )
    .run(idTiket, idAktor, log);

/** Tiket lengkap dengan bukti dan riwayat kronologis. */
export function detail(id: string): Tiket | null {
  const r = db.prepare(`${SELECT} WHERE t.id_tiket = ?`).get(id) as
    Baris | undefined;
  return r ? { ...dasar(r), bukti: bukti(id), riwayat: riwayat(id) } : null;
}

/** Pelapor dan, untuk tiket transaksi, TK + PK transaksi itu (pengguna.id_pengguna). */
export function pesertaTiket(id: string): string[] | null {
  const r = db
    .prepare(
      `SELECT t.id_pelapor AS pelapor, tk.id_pengguna AS tk, pk.id_pengguna AS pk
       FROM tiket_sengketa t
       LEFT JOIN transaksi_pekerjaan x ON x.id_transaksi = t.id_transaksi
       LEFT JOIN tenaga_kerja tk ON tk.id_tenaga_kerja = x.id_tenaga_kerja
       LEFT JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = x.id_penyedia_kerja
       WHERE t.id_tiket = ?`,
    )
    .get(id) as
    { pelapor: string; tk: string | null; pk: string | null } | undefined;
  return r ? [r.pelapor, r.tk, r.pk].filter((x): x is string => !!x) : null;
}

export type HasilBuat =
  | { ok: true; id: string }
  | {
      ok: false;
      alasan:
        | "TRANSAKSI_TIDAK_ADA"
        | "BUKAN_PESERTA"
        | "TIKET_AKTIF"
        | "STATUS_TIDAK_VALID";
    };

/**
 * Q-101: tiket transaksi hanya dari peserta, tanpa tiket aktif dan sebelum upah dikredit; pekerjaan menjadi
 * DISENGKETAKAN dan status asalnya disimpan. Semua dalam satu tx().
 */
export function buat(
  idPelapor: string,
  v: { idTransaksi?: string; kategoriMasalah: string; deskripsi: string },
  berkas?: { path: string },
): HasilBuat {
  return tx(() => {
    if (v.idTransaksi) {
      const x = db
        .prepare(
          `SELECT x.status_pekerjaan AS status, tk.id_pengguna AS tk, pk.id_pengguna AS pk,
             EXISTS (SELECT 1 FROM tiket_sengketa WHERE id_transaksi = x.id_transaksi AND status_tiket NOT IN ${FINAL}) AS aktif
           FROM transaksi_pekerjaan x
           JOIN tenaga_kerja tk ON tk.id_tenaga_kerja = x.id_tenaga_kerja
           JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = x.id_penyedia_kerja
           WHERE x.id_transaksi = ?`,
        )
        .get(v.idTransaksi) as
        { status: string; tk: string; pk: string; aktif: number } | undefined;
      if (!x) return { ok: false, alasan: "TRANSAKSI_TIDAK_ADA" } as const;
      if (idPelapor !== x.tk && idPelapor !== x.pk)
        return { ok: false, alasan: "BUKAN_PESERTA" } as const;
      // COMPLETED = upah sudah dikredit; DISENGKETAKAN = sudah ada tiket aktif.
      if (x.aktif || x.status === "COMPLETED" || x.status === "DISENGKETAKAN")
        return { ok: false, alasan: "TIKET_AKTIF" } as const;
      if (
        !transisiDiizinkan(
          "pekerjaan",
          x.status as "IN_PROGRESS",
          "DISENGKETAKAN",
        )
      )
        return { ok: false, alasan: "STATUS_TIDAK_VALID" } as const;
      db.prepare(
        "UPDATE transaksi_pekerjaan SET status_sebelum_sengketa = status_pekerjaan, status_pekerjaan = 'DISENGKETAKAN' WHERE id_transaksi = ?",
      ).run(v.idTransaksi);
    }

    // BEGIN IMMEDIATE: cek keunikan nomor aman dari penulis lain.
    let nomor: string;
    do nomor = `KIN-${String(randomInt(0, 1_000_000)).padStart(6, "0")}`;
    while (
      db
        .prepare("SELECT 1 FROM tiket_sengketa WHERE nomor_tiket = ?")
        .get(nomor)
    );

    const id = randomUUID();
    db.prepare(
      `INSERT INTO tiket_sengketa (id_tiket, nomor_tiket, id_transaksi, id_pelapor, kategori_masalah, deskripsi_komplain)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      nomor,
      v.idTransaksi ?? null,
      idPelapor,
      v.kategoriMasalah,
      v.deskripsi,
    );
    catat(id, idPelapor, "Tiket diajukan");
    if (berkas) {
      db.prepare(
        "INSERT INTO bukti_sengketa (id_bukti, id_tiket, id_pengunggah, file_path) VALUES (?, ?, ?, ?)",
      ).run(randomUUID(), id, idPelapor, berkas.path);
      catat(id, idPelapor, "Bukti diunggah");
    }
    return { ok: true, id } as const;
  });
}

export type HasilUbah =
  | { ok: true }
  | {
      ok: false;
      alasan: "TIDAK_ADA" | "FINAL" | "BUKAN_DIAJUKAN" | "BUKAN_PELAPOR";
    };

/** Peserta menambah bukti selama tiket belum final; tiket yang menunggu balasan kembali ditinjau. */
export function tambahBukti(
  idTiket: string,
  idPengunggah: string,
  path: string,
): HasilUbah {
  return tx(() => {
    const t = db
      .prepare(
        "SELECT status_tiket AS status FROM tiket_sengketa WHERE id_tiket = ?",
      )
      .get(idTiket) as { status: string } | undefined;
    if (!t) return { ok: false, alasan: "TIDAK_ADA" } as const;
    if (["DITUTUP", "DITOLAK", "DIBATALKAN"].includes(t.status))
      return { ok: false, alasan: "FINAL" } as const;
    db.prepare(
      "INSERT INTO bukti_sengketa (id_bukti, id_tiket, id_pengunggah, file_path) VALUES (?, ?, ?, ?)",
    ).run(randomUUID(), idTiket, idPengunggah, path);
    catat(idTiket, idPengunggah, "Bukti diunggah");
    if (t.status === "MENUNGGU_BALASAN") {
      db.prepare(
        "UPDATE tiket_sengketa SET status_tiket = 'DITINJAU' WHERE id_tiket = ?",
      ).run(idTiket);
      catat(idTiket, null, "Bukti diterima, tiket kembali ditinjau");
    }
    return { ok: true } as const;
  });
}

/** Pelapor membatalkan tiket DIAJUKAN; pekerjaan kembali ke status sebelum sengketa. */
export function batal(idTiket: string, idPelapor: string): HasilUbah {
  return tx(() => {
    const t = db
      .prepare(
        "SELECT status_tiket AS status, id_pelapor AS pelapor, id_transaksi AS idTransaksi FROM tiket_sengketa WHERE id_tiket = ?",
      )
      .get(idTiket) as
      | { status: string; pelapor: string; idTransaksi: string | null }
      | undefined;
    if (!t) return { ok: false, alasan: "TIDAK_ADA" } as const;
    if (t.pelapor !== idPelapor)
      return { ok: false, alasan: "BUKAN_PELAPOR" } as const;
    if (
      t.status !== "DIAJUKAN" ||
      !transisiDiizinkan("tiket", "DIAJUKAN", "DIBATALKAN")
    )
      return { ok: false, alasan: "BUKAN_DIAJUKAN" } as const;
    db.prepare(
      "UPDATE tiket_sengketa SET status_tiket = 'DIBATALKAN' WHERE id_tiket = ?",
    ).run(idTiket);
    if (t.idTransaksi)
      db.prepare(
        `UPDATE transaksi_pekerjaan SET status_pekerjaan = status_sebelum_sengketa, status_sebelum_sengketa = NULL
         WHERE id_transaksi = ? AND status_pekerjaan = 'DISENGKETAKAN' AND status_sebelum_sengketa IS NOT NULL`,
      ).run(t.idTransaksi);
    catat(idTiket, idPelapor, "Tiket dibatalkan oleh pelapor");
    return { ok: true } as const;
  });
}

/** Antrean CS: semua tiket (tanpa riwayat), opsional per status, terbaru dulu. */
export function daftarCS(status: string | undefined, page: number) {
  const p = { status: status ?? null };
  const where = "(@status IS NULL OR t.status_tiket = @status)";
  const items = (
    db
      .prepare(
        `${SELECT} WHERE ${where} ORDER BY t.created_at DESC, t.id_tiket LIMIT @limit OFFSET @offset`,
      )
      .all({
        ...p,
        limit: UKURAN_HALAMAN,
        offset: (page - 1) * UKURAN_HALAMAN,
      }) as Baris[]
  ).map((r) => ({ ...dasar(r), bukti: bukti(r.id) }));
  const { total } = db
    .prepare(`SELECT COUNT(*) AS total FROM tiket_sengketa t WHERE ${where}`)
    .get(p) as { total: number };
  return { items, total, page, pageSize: UKURAN_HALAMAN };
}
