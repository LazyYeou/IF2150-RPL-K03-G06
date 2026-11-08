import "server-only";
import { db, tx } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { AppError } from "@/lib/errors";
import {
  buatTagihan,
  cariTagihanAktif,
  cariTagihanBerdasarkanId,
  periksaKedaluwarsaLazy,
  type TagihanDTO,
} from "@/models/TagihanPembayaran";

interface TransaksiInfo {
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

function ambilInfoTransaksi(idTransaksi: string): TransaksiInfo | null {
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
    throw new AppError("FORBIDDEN", 403, "Hanya penyedia kerja yang dapat membuat tagihan");
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

export async function ambilDetailTagihan(idTagihan: string): Promise<TagihanDTO> {
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
    const aktif = cariTagihanAktif(idTransaksi);
    if (aktif) return periksaKedaluwarsaLazy(aktif);
    return buatTagihan(idTransaksi, trx.nominalUpah).tagihan;
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
