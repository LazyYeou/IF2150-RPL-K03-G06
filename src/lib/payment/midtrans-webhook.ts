import "server-only";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { cariPencairanBerdasarkanId } from "@/models/PencairanDana";
import { MidtransPaymentGateway } from "./midtrans";
import {
  coreUrl,
  irisUrl,
  gatewayError,
  midtransRequest,
  rupiah,
  bankPayout,
} from "./midtrans-http";

type Notification = {
  referensiId: string;
  nominal: number;
  status: string;
  jenis: string;
};

export async function normalisasiMidtrans(
  raw: string,
): Promise<Notification | null> {
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new AppError("BAD_REQUEST", 400, "Payload JSON tidak valid");
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload))
    throw new AppError(
      "BAD_REQUEST",
      400,
      "Payload webhook harus berupa objek",
    );
  if (typeof payload.reference_no === "string") {
    // Notifikasi Iris dipakai sebagai pemicu GET terautentikasi, bukan bukti sukses.
    const operation = db
      .prepare(
        "SELECT referensi_id FROM operasi_midtrans WHERE jenis = 'DISBURSEMENT' AND referensi_provider = ?",
      )
      .get(payload.reference_no) as { referensi_id: string } | undefined;
    if (!operation)
      throw new AppError("NOT_FOUND", 404, "Referensi payout tidak dikenal");
    const { response, data } = await midtransRequest(
      `${irisUrl()}/payouts/${encodeURIComponent(payload.reference_no)}`,
      process.env.MIDTRANS_IRIS_API_KEY ?? "",
    );
    const payout = cariPencairanBerdasarkanId(operation.referensi_id);
    if (
      !response.ok ||
      !payout ||
      data.reference_no !== payload.reference_no ||
      payout.rekeningTujuan !==
        `BANK:${bankPayout(data)}:${data.beneficiary_account}` ||
      rupiah(data.amount) !== payout.nominal
    )
      return gatewayError();
    const statuses: Record<string, string> = {
      completed: "BERHASIL",
      success: "BERHASIL",
      failed: "GAGAL",
      rejected: "DITOLAK",
      queued: "DIPROSES",
      approved: "DIPROSES",
      processed: "DIPROSES",
    };
    const status = statuses[String(data.status)];
    if (!status) return gatewayError();
    return {
      referensiId: payout.id,
      nominal: payout.nominal,
      status,
      jenis: "PENCAIRAN",
    };
  }
  const adapter = new MidtransPaymentGateway();
  if (
    typeof payload.signature_key !== "string" ||
    !adapter.verifikasiWebhook(raw, payload.signature_key)
  )
    throw new AppError("UNAUTHORIZED", 401, "Signature webhook tidak valid");
  const id = String(payload.order_id);
  // Signature Midtrans tidak mencakup transaction_status/fraud_status. Konfirmasi
  // GET status mencegah field tersebut diubah dengan signature yang masih valid.
  const { response, data } = await midtransRequest(
    `${coreUrl()}/${encodeURIComponent(id)}/status`,
    process.env.MIDTRANS_SERVER_KEY ?? "",
  );
  if (
    !response.ok ||
    data.order_id !== id ||
    rupiah(data.gross_amount) !== rupiah(payload.gross_amount)
  )
    return gatewayError();
  const rawStatus = String(data.transaction_status);
  const statuses: Record<string, string> = {
    settlement: "BERHASIL",
    capture: "BERHASIL",
    pending: "DIPROSES",
    authorize: "DIPROSES",
    deny: "GAGAL",
    cancel: "GAGAL",
    failure: "GAGAL",
    expire: "KEDALUWARSA",
  };
  let status = statuses[rawStatus];
  if (["refund", "partial_refund"].includes(rawStatus)) return null; // Finalisasi refund tetap melalui operasi sengketa.
  if (!status) return gatewayError();
  if (
    status === "BERHASIL" &&
    (data.status_code !== "200" ||
      (data.fraud_status !== undefined && data.fraud_status !== "accept"))
  )
    status = data.fraud_status === "deny" ? "GAGAL" : "DIPROSES";
  return {
    referensiId: id,
    nominal: rupiah(data.gross_amount),
    status,
    jenis: "PEMBAYARAN",
  };
}
