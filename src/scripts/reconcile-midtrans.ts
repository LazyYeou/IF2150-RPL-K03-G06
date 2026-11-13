import { db, tx } from "../lib/db";
import { cariPencairanBerdasarkanId } from "../models/PencairanDana";
import {
  irisUrl,
  midtransRequest,
  rupiah,
  bankPayout,
} from "../lib/payment/midtrans-http";
import { AppError } from "../lib/errors";

/** Operator mengambil reference_no dari dashboard Iris, lalu CLI memverifikasinya
 * melalui API sebelum mengaitkan ke instruksi yang responsnya hilang. Tidak POST payout. */
export async function rekonsiliasiPayout(id: string, reference: string) {
  const { response, data } = await midtransRequest(
    `${irisUrl()}/payouts/${encodeURIComponent(reference)}`,
    process.env.MIDTRANS_IRIS_API_KEY ?? "",
  );
  const payout = cariPencairanBerdasarkanId(id);
  if (
    !response.ok ||
    !payout ||
    data.reference_no !== reference ||
    rupiah(data.amount) !== payout.nominal ||
    payout.rekeningTujuan !==
      `BANK:${bankPayout(data)}:${data.beneficiary_account}` ||
    data.notes !== `kerjain:${id}`
  )
    throw new AppError(
      "GATEWAY_MISMATCH",
      409,
      "Referensi Iris tidak cocok dengan instruksi pencairan",
    );
  tx(() => {
    const updated = db
      .prepare(
        "UPDATE operasi_midtrans SET referensi_provider=?, status='BELUM_PASTI',klaim=NULL,batas_klaim=0 WHERE jenis='DISBURSEMENT' AND kunci=? AND status IN ('BELUM_PASTI','MENGIRIM') AND referensi_provider IS NULL AND batas_klaim <= ?",
      )
      .run(reference, id, Date.now());
    if (updated.changes !== 1)
      throw new AppError(
        "STATUS_TIDAK_VALID",
        409,
        "Operasi masih berjalan, telah direkonsiliasi, atau tidak ditemukan",
      );
  });
}
