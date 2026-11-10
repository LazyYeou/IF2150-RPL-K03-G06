import "server-only";
import { db, tx } from "@/lib/db";
import { requireCS, requireUser } from "@/lib/auth/guards";
import { AppError } from "@/lib/errors";
import {
  buatTagihan,
  cariTagihanBerdasarkanId,
  cariTagihanTerakhir,
  periksaKedaluwarsaLazy,
  ubahStatusTagihan,
  type TagihanDTO,
} from "@/models/TagihanPembayaran";
import { refundSengketa } from "@/models/RefundSengketa";
import { z } from "zod";
import { MetodePembayaran } from "@/lib/validation/tagihan";
import { getPaymentAdapter } from "@/lib/payment/adapter";

export interface TransaksiInfo {
  idTransaksi: string;
  idPenyediaKerja: string;
  idTenagaKerja: string;
  statusPekerjaan: string;
  nominalUpah: number;
  idPenggunaPK: string;
  idPenggunaTK: string;
  judulLowongan: string;
  namaTenagaKerja: string;
}

export function ambilInfoTransaksi(idTransaksi: string): TransaksiInfo | null {
  const row = db
    .prepare(
      `SELECT t.id_transaksi AS idTransaksi,
              t.id_penyedia_kerja AS idPenyediaKerja,
              t.id_tenaga_kerja AS idTenagaKerja,
              t.status_pekerjaan AS statusPekerjaan,
              t.nominal_upah AS nominalUpah,
              pk.id_pengguna AS idPenggunaPK,
              tk.id_pengguna AS idPenggunaTK,
              l.judul AS judulLowongan,
              utk.nama AS namaTenagaKerja
       FROM transaksi_pekerjaan t
       JOIN lowongan_pekerjaan l ON l.id_lowongan = t.id_lowongan
       JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = t.id_penyedia_kerja
       JOIN tenaga_kerja tk ON tk.id_tenaga_kerja = t.id_tenaga_kerja
       JOIN pengguna utk ON utk.id_pengguna = tk.id_pengguna
       WHERE t.id_transaksi = ?`,
    )
    .get(idTransaksi) as TransaksiInfo | undefined;

  return row ?? null;
}

export async function buatTagihanTransaksi(
  idTransaksi: string,
): Promise<{ tagihan: TagihanDTO; baru: boolean }> {
  const user = await requireUser();

  const trx = ambilInfoTransaksi(idTransaksi);
  if (!trx) {
    throw new AppError("NOT_FOUND", 404, "Transaksi tidak ditemukan");
  }

  if (user.peran === "PK" && trx.idPenggunaPK !== user.id) {
    throw new AppError("FORBIDDEN", 403, "Anda bukan pemilik transaksi ini");
  }
  if (user.peran !== "PK" && user.peran !== "CS") {
    throw new AppError(
      "FORBIDDEN",
      403,
      "Hanya penyedia kerja yang dapat membuat tagihan",
    );
  }

  if (trx.statusPekerjaan !== "MENUNGGU_PEMBAYARAN") {
    throw new AppError(
      "STATUS_TIDAK_VALID",
      409,
      "Transaksi tidak sedang menunggu pembayaran",
    );
  }

  return tx(() => buatTagihan(idTransaksi, trx.nominalUpah));
}

export async function ambilDetailTagihan(
  idTagihan: string,
): Promise<TagihanDTO> {
  const user = await requireUser();

  const tagihan = cariTagihanBerdasarkanId(idTagihan);
  if (!tagihan) {
    throw new AppError("NOT_FOUND", 404, "Tagihan tidak ditemukan");
  }

  const trx = ambilInfoTransaksi(tagihan.idTransaksi);
  if (user.peran === "PK" && trx && trx.idPenggunaPK !== user.id) {
    throw new AppError("FORBIDDEN", 403, "Anda bukan pemilik tagihan ini");
  }
  if (user.peran === "TK" && trx && trx.idPenggunaTK !== user.id) {
    throw new AppError("FORBIDDEN", 403, "Anda bukan peserta transaksi ini");
  }

  return periksaKedaluwarsaLazy(tagihan);
}

export async function ambilDataHalamanBayar(idTransaksi: string) {
  const user = await requireUser();

  const trx = ambilInfoTransaksi(idTransaksi);
  if (!trx) {
    throw new AppError("NOT_FOUND", 404, "Transaksi tidak ditemukan");
  }

  if (user.peran === "PK" && trx.idPenggunaPK !== user.id) {
    throw new AppError("FORBIDDEN", 403, "Anda bukan pemilik transaksi ini");
  }

  if (trx.statusPekerjaan !== "MENUNGGU_PEMBAYARAN") {
    throw new AppError(
      "STATUS_TIDAK_VALID",
      409,
      "Transaksi tidak sedang menunggu pembayaran",
    );
  }

  const hasilTagihan = tx(() => {
    const terakhir = cariTagihanTerakhir(idTransaksi);
    if (!terakhir) {
      return buatTagihan(idTransaksi, trx.nominalUpah).tagihan;
    }
    return periksaKedaluwarsaLazy(terakhir);
  });

  return {
    transaksi: {
      id: trx.idTransaksi,
      judul: trx.judulLowongan,
      namaTenagaKerja: trx.namaTenagaKerja,
      nominalUpah: trx.nominalUpah,
      status: trx.statusPekerjaan,
    },
    tagihan: hasilTagihan,
  };
}

export async function bayarTagihan(
  idTagihan: string,
  metodeInput: unknown,
): Promise<{ redirectUrl: string; status: string }> {
  const user = await requireUser();
  const metode = MetodePembayaran.parse(metodeInput);

  const tagihan = cariTagihanBerdasarkanId(idTagihan);
  if (!tagihan) {
    throw new AppError("NOT_FOUND", 404, "Tagihan tidak ditemukan");
  }

  const trx = ambilInfoTransaksi(tagihan.idTransaksi);
  if (user.peran === "PK" && trx && trx.idPenggunaPK !== user.id) {
    throw new AppError("FORBIDDEN", 403, "Anda bukan pemilik tagihan ini");
  }

  // Idempoten jika tagihan sudah selesai dibayar
  if (tagihan.status === "BERHASIL") {
    return {
      redirectUrl: `/pk/transaksi/${tagihan.idTransaksi}`,
      status: "BERHASIL",
    };
  }

  // Cek kedaluwarsa lazy
  const tagihanCek = periksaKedaluwarsaLazy(tagihan);
  if (tagihanCek.status === "KEDALUWARSA") {
    throw new AppError(
      "STATUS_TIDAK_VALID",
      409,
      "Tagihan telah kedaluwarsa dan tidak dapat dibayar. Silakan buat tagihan baru.",
    );
  }

  if (tagihanCek.status === "GAGAL") {
    throw new AppError(
      "STATUS_TIDAK_VALID",
      409,
      "Tagihan telah gagal diproses. Silakan buat tagihan baru.",
    );
  }

  if (
    tagihanCek.status !== "MENUNGGU_PEMBAYARAN" &&
    tagihanCek.status !== "DIPROSES"
  ) {
    throw new AppError(
      "STATUS_TIDAK_VALID",
      409,
      `Tagihan dengan status ${tagihanCek.status} tidak dapat diproses. Silakan buat tagihan baru.`,
    );
  }

  // Update status menjadi DIPROSES dan simpan metode
  tx(() => {
    ubahStatusTagihan(idTagihan, "DIPROSES", metode);
  });

  // Panggil adapter payment gateway
  const adapter = getPaymentAdapter();
  const chargeRes = await adapter.charge({
    idTagihan: tagihan.id,
    total: tagihan.totalBayar,
    metode,
  });

  return {
    redirectUrl: chargeRes.redirectUrl,
    status: "DIPROSES",
  };
}

export async function ambilDataMockGateway(idTagihan: string) {
  const tagihan = cariTagihanBerdasarkanId(idTagihan);
  if (!tagihan) {
    throw new AppError("NOT_FOUND", 404, "Tagihan tidak ditemukan");
  }

  const trx = ambilInfoTransaksi(tagihan.idTransaksi);
  if (!trx) {
    throw new AppError("NOT_FOUND", 404, "Transaksi tidak ditemukan");
  }

  return { tagihan, transaksi: trx };
}

/** Integrasi #39: pemanggil memilih REFUND secara eksplisit; otorisasi tetap diperiksa di sini. */
export async function prosesRefundTagihan(
  idTransaksi: string,
  idTiket: string,
  catatan: string = "Pengembalian dana sesuai keputusan CS",
) {
  const user = await requireCS();
  const alasan = z.string().trim().min(10).max(1000).parse(catatan);
  return refundSengketa(idTransaksi, idTiket, user.id, alasan);
}
