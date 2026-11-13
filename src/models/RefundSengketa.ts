import "server-only";
import { randomUUID } from "node:crypto";
import { db, tx } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { getPaymentAdapter } from "@/lib/payment/adapter";
import { transisiDiizinkan } from "@/models/statusMachine";
import * as Notifikasi from "@/models/Notifikasi";

type Operasi = {
  id_tagihan: string;
  id_transaksi: string;
  id_tiket: string;
  status: string;
  klaim: string | null;
  batas_klaim: number;
};
const konflik = () =>
  new AppError(
    "STATUS_TIDAK_VALID",
    409,
    "Tiket atau transaksi tidak memenuhi prasyarat refund",
  );
const catat = (id: string, cs: string, pesan: string) =>
  db
    .prepare(
      "INSERT INTO riwayat_sengketa (id_tiket, id_aktor, log_aktivitas) VALUES (?, ?, ?)",
    )
    .run(id, cs, pesan);

/** Dipanggil controller setelah requireCS. Keputusan dikunci sebelum panggilan jaringan. */
export async function refundSengketa(
  idTransaksi: string,
  idTiket: string,
  idCS: string,
  catatan: string,
) {
  const adapter = getPaymentAdapter();
  const token = randomUUID();
  const persiapan = tx(() => {
    const trx = db
      .prepare(
        "SELECT status_pekerjaan status FROM transaksi_pekerjaan WHERE id_transaksi = ?",
      )
      .get(idTransaksi) as { status: string } | undefined;
    if (!trx) throw new AppError("NOT_FOUND", 404, "Transaksi tidak ditemukan");
    const tiket = db
      .prepare(
        "SELECT id_transaksi trx, status_tiket status, keputusan FROM tiket_sengketa WHERE id_tiket = ?",
      )
      .get(idTiket) as
      | { trx: string | null; status: string; keputusan: string | null }
      | undefined;
    if (!tiket) throw new AppError("NOT_FOUND", 404, "Tiket tidak ditemukan");
    if (tiket.trx !== idTransaksi) throw konflik();
    const cs = db
      .prepare("SELECT 1 FROM pengguna WHERE id_pengguna = ? AND peran = 'CS'")
      .get(idCS);
    if (!cs)
      throw new AppError("FORBIDDEN", 403, "Keputusan refund hanya oleh CS");
    const operasi = db
      .prepare("SELECT * FROM operasi_refund WHERE id_transaksi = ?")
      .get(idTransaksi) as Operasi | undefined;
    if (operasi && operasi.id_tiket !== idTiket) throw konflik();
    const tagihan = db
      .prepare(
        `SELECT id_tagihan id, total_bayar nominal, status_pembayaran status
      FROM tagihan_pembayaran WHERE id_transaksi = ? AND status_pembayaran IN ('BERHASIL','DIKEMBALIKAN')
      ORDER BY created_at DESC, rowid DESC LIMIT 1`,
      )
      .get(idTransaksi) as
      { id: string; nominal: number; status: string } | undefined;
    if (operasi?.status === "BERHASIL") {
      if (
        tagihan?.id !== operasi.id_tagihan ||
        tagihan.status !== "DIKEMBALIKAN" ||
        trx.status !== "DIBATALKAN" ||
        tiket.status !== "DITUTUP" ||
        tiket.keputusan !== "REFUND"
      )
        throw konflik();
      return { tagihan, kirim: false, selesai: true };
    }
    if (
      !tagihan ||
      tagihan.status !== "BERHASIL" ||
      trx.status !== "DISENGKETAKAN" ||
      ["DITUTUP", "DITOLAK", "DIBATALKAN"].includes(tiket.status) ||
      (tiket.keputusan !== null && tiket.keputusan !== "REFUND") ||
      db
        .prepare("SELECT 1 FROM mutasi_saldo WHERE kunci_operasi = ?")
        .get(`upah:${idTransaksi}`)
    )
      throw konflik();
    if (!operasi) {
      // CS meninjau tiket sebelum memutuskan; jangan melompati state DITINJAU.
      if (tiket.status === "DIAJUKAN" || tiket.status === "MENUNGGU_BALASAN") {
        if (!transisiDiizinkan("tiket", tiket.status, "DITINJAU"))
          throw konflik();
        db.prepare(
          "UPDATE tiket_sengketa SET status_tiket = 'DITINJAU' WHERE id_tiket = ?",
        ).run(idTiket);
        catat(idTiket, idCS, "Tiket ditinjau CS sebelum keputusan refund");
      } else if (
        tiket.status !== "DITINJAU" &&
        !(tiket.status === "DIPROSES" && tiket.keputusan === "REFUND")
      ) {
        throw konflik();
      }
      // Ubah tiket sebelum memasang kunci DB; semua perubahan tetap atomik.
      db.prepare(
        "UPDATE tiket_sengketa SET status_tiket = 'DIPROSES', keputusan = 'REFUND' WHERE id_tiket = ?",
      ).run(idTiket);
      db.prepare(
        `INSERT INTO operasi_refund (id_tagihan,id_transaksi,id_tiket,id_cs,catatan,status,klaim,batas_klaim)
        VALUES (?,?,?,?,?,'MENGIRIM',?,?)`,
      ).run(
        tagihan.id,
        idTransaksi,
        idTiket,
        idCS,
        catatan,
        token,
        Date.now() + 30000,
      );
      catat(idTiket, idCS, `Keputusan REFUND diproses: ${catatan}`);
    } else {
      if (
        operasi.id_tagihan !== tagihan.id ||
        tiket.status !== "DIPROSES" ||
        tiket.keputusan !== "REFUND"
      )
        throw konflik();
      if (operasi.status === "MENGIRIM" && operasi.batas_klaim > Date.now()) {
        return { tagihan, kirim: false, selesai: false };
      }
      db.prepare(
        "UPDATE operasi_refund SET status = 'MENGIRIM', klaim = ?, batas_klaim = ? WHERE id_tagihan = ?",
      ).run(token, Date.now() + 30000, tagihan.id);
    }
    return { tagihan, kirim: true, selesai: false };
  });
  const respons = (selesai: boolean, idempotent = false) => ({
    ok: selesai,
    status: selesai ? "DIKEMBALIKAN" : "DIPROSES",
    idTagihan: persiapan.tagihan.id,
    nominal: persiapan.tagihan.nominal,
    idTiket,
    ...(idempotent ? { idempotent: true } : {}),
  });
  if (!persiapan.kirim) return respons(persiapan.selesai, true);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let hasil: "BERHASIL" | "GAGAL" | "BELUM_PASTI";
  try {
    const r = await Promise.race([
      adapter.refund({
        idempotencyKey: `refund:${idTiket}`,
        idTagihan: persiapan.tagihan.id,
        nominal: persiapan.tagihan.nominal,
      }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Gateway timeout")), 10000);
      }),
    ]);
    hasil =
      r.status === "BERHASIL"
        ? "BERHASIL"
        : r.status === "GAGAL"
          ? "GAGAL"
          : "BELUM_PASTI";
  } catch {
    hasil = "BELUM_PASTI";
  } finally {
    if (timer) clearTimeout(timer);
  }
  const selesai = tx(() => {
    const operasi = db
      .prepare("SELECT * FROM operasi_refund WHERE id_tagihan = ?")
      .get(persiapan.tagihan.id) as Operasi;
    if (operasi.klaim !== token) return operasi.status === "BERHASIL";
    if (hasil !== "BERHASIL") {
      db.prepare(
        "UPDATE operasi_refund SET status = ?, klaim = NULL, batas_klaim = 0 WHERE id_tagihan = ?",
      ).run(hasil, persiapan.tagihan.id);
      return false;
    }
    if (
      db
        .prepare("SELECT 1 FROM mutasi_saldo WHERE kunci_operasi = ?")
        .get(`upah:${idTransaksi}`)
    )
      throw konflik();
    db.prepare(
      "UPDATE operasi_refund SET status = 'BERHASIL', klaim = NULL, batas_klaim = 0 WHERE id_tagihan = ?",
    ).run(persiapan.tagihan.id);
    const invoice = db
      .prepare(
        "UPDATE tagihan_pembayaran SET status_pembayaran = 'DIKEMBALIKAN' WHERE id_tagihan = ? AND status_pembayaran = 'BERHASIL'",
      )
      .run(persiapan.tagihan.id);
    const trx = db
      .prepare(
        "UPDATE transaksi_pekerjaan SET status_pekerjaan = 'DIBATALKAN', status_sebelum_sengketa = NULL WHERE id_transaksi = ? AND status_pekerjaan = 'DISENGKETAKAN'",
      )
      .run(idTransaksi);
    const tiket = db
      .prepare(
        "UPDATE tiket_sengketa SET status_tiket = 'DITUTUP' WHERE id_tiket = ? AND status_tiket = 'DIPROSES' AND keputusan = 'REFUND'",
      )
      .run(idTiket);
    if (invoice.changes !== 1 || trx.changes !== 1 || tiket.changes !== 1)
      throw konflik();
    catat(idTiket, idCS, "Refund berhasil, tiket ditutup");
    const peserta = db
      .prepare(
        `SELECT tk.id_pengguna tk, pk.id_pengguna pk FROM transaksi_pekerjaan x
      JOIN tenaga_kerja tk USING(id_tenaga_kerja) JOIN penyedia_kerja pk USING(id_penyedia_kerja) WHERE x.id_transaksi = ?`,
      )
      .get(idTransaksi) as { tk: string; pk: string };
    for (const user of [peserta.tk, peserta.pk])
      Notifikasi.buat(
        user,
        `Pengembalian dana (refund) sebesar Rp ${persiapan.tagihan.nominal.toLocaleString("id-ID")} berhasil. Sengketa ditutup.`,
        `/tiket/${idTiket}`,
      );
    return true;
  });
  if (!selesai)
    throw new AppError(
      "BAD_GATEWAY",
      502,
      "Refund belum berhasil dikonfirmasi. Ulangi keputusan yang sama; tiket tetap terkunci.",
    );
  return respons(true);
}
