import "server-only";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import type {
  ChargeParams,
  DisburseParams,
  PaymentGatewayAdapter,
  RefundParams,
} from "./adapter";
import { sidikRekening } from "@/lib/rekening";
import { db, tx } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { catatLog } from "@/models/LogGateway";
import {
  coreUrl,
  irisUrl,
  gatewayError,
  midtransRequest,
  rupiah,
} from "./midtrans-http";

type Operation = {
  jenis: "REFUND" | "DISBURSEMENT";
  kunci: string;
  referensi_id: string;
  sidik: string;
  status: string;
  referensi_provider: string | null;
  dikirim: number;
  klaim: string | null;
  batas_klaim: number;
};

export function validasiPencairanMidtrans(rekening: string) {
  if (!process.env.MIDTRANS_IRIS_API_KEY)
    throw new AppError(
      "GATEWAY_CONFIG",
      503,
      "MIDTRANS_IRIS_API_KEY wajib diisi untuk pencairan",
    );
  const parts = /^BANK:([a-z0-9_]{2,30}):(\d{10,16})$/.exec(rekening);
  if (!parts)
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "Midtrans Iris mendukung rekening bank dengan kode bank eksplisit; e-wallet belum didukung",
    );
  return parts;
}

function claim(
  jenis: Operation["jenis"],
  key: string,
  id: string,
  fingerprint: string,
) {
  return tx(() => {
    let row = db
      .prepare(
        "SELECT * FROM operasi_midtrans WHERE jenis = ? AND (kunci = ? OR referensi_id = ?)",
      )
      .get(jenis, key, id) as Operation | undefined;
    if (
      row &&
      (row.kunci !== key ||
        row.referensi_id !== id ||
        row.sidik !== fingerprint)
    )
      throw new AppError(
        "IDEMPOTENCY_CONFLICT",
        409,
        "Instruksi gateway berbeda untuk operasi yang sama",
      );
    if (row?.status === "BERHASIL" || row?.status === "GAGAL")
      return { row, token: null };
    if (row?.klaim && row.batas_klaim > Date.now()) return gatewayError();
    const token = randomUUID();
    if (!row) {
      db.prepare(
        "INSERT INTO operasi_midtrans(jenis,kunci,referensi_id,sidik,status,klaim,batas_klaim) VALUES (?,?,?,?,'MENGIRIM',?,?)",
      ).run(jenis, key, id, fingerprint, token, Date.now() + 30000);
      row = db
        .prepare("SELECT * FROM operasi_midtrans WHERE jenis = ? AND kunci = ?")
        .get(jenis, key) as Operation;
      return { row, token, baru: true };
    }
    db.prepare(
      "UPDATE operasi_midtrans SET klaim = ?, batas_klaim = ? WHERE jenis = ? AND kunci = ?",
    ).run(token, Date.now() + 30000, jenis, key);
    return { row, token, baru: false };
  });
}

function finish(
  row: Operation,
  token: string,
  status: string,
  reference?: string,
) {
  db.prepare(
    "UPDATE operasi_midtrans SET status = ?, referensi_provider = COALESCE(?,referensi_provider), klaim = NULL, batas_klaim = 0 WHERE jenis = ? AND kunci = ? AND klaim = ?",
  ).run(status, reference ?? null, row.jenis, row.kunci, token);
}

export class MidtransPaymentGateway implements PaymentGatewayAdapter {
  private readonly serverKey: string;
  constructor() {
    this.serverKey = process.env.MIDTRANS_SERVER_KEY ?? "";
    if (!this.serverKey)
      throw new Error(
        "MIDTRANS_SERVER_KEY wajib diisi untuk provider midtrans",
      );
  }

  async charge(p: ChargeParams): Promise<{ redirectUrl: string }> {
    const url =
      process.env.MIDTRANS_IS_PRODUCTION === "true"
        ? "https://app.midtrans.com/snap/v1/transactions"
        : "https://app.sandbox.midtrans.com/snap/v1/transactions";
    const { response, data } = await midtransRequest(url, this.serverKey, {
      method: "POST",
      body: JSON.stringify({
        transaction_details: { order_id: p.idTagihan, gross_amount: p.total },
      }),
    });
    if (!response.ok || typeof data.redirect_url !== "string")
      return gatewayError();
    const redirect = new URL(data.redirect_url);
    if (
      redirect.protocol !== "https:" ||
      redirect.hostname !== new URL(url).hostname
    )
      return gatewayError();
    catatLog(
      "CHARGE",
      p.idTagihan,
      {
        idTagihan: p.idTagihan,
        total: p.total,
        metode: p.metode,
        idempotencyKey: p.idTagihan,
      },
      "MIDTRANS",
    );
    return { redirectUrl: data.redirect_url };
  }

  async disburse(p: DisburseParams): Promise<{ status: "DITERIMA" | "GAGAL" }> {
    const parts = validasiPencairanMidtrans(p.rekening);
    const irisKey = process.env.MIDTRANS_IRIS_API_KEY!;
    const [, bank, account] = parts;
    const fingerprint = sidikRekening(JSON.stringify([p.nominal, p.rekening]));
    const operation = claim(
      "DISBURSEMENT",
      p.idPencairan,
      p.idPencairan,
      fingerprint,
    );
    if (!operation.token)
      return {
        status: operation.row.status === "BERHASIL" ? "DITERIMA" : "GAGAL",
      };
    const { row, token } = operation;
    try {
      if (!operation.baru && (row.dikirim || row.referensi_provider)) {
        // Tanpa reference_no, respons POST mungkin hilang. Iris tidak menjamin
        // deduplikasi lintas retry: jangan mengirim payout kedua secara buta.
        if (!row.referensi_provider) return gatewayError();
        const detail = await midtransRequest(
          `${irisUrl()}/payouts/${encodeURIComponent(row.referensi_provider)}`,
          irisKey,
        );
        if (
          !detail.response.ok ||
          detail.data.reference_no !== row.referensi_provider ||
          rupiah(detail.data.amount) !== p.nominal ||
          detail.data.beneficiary_account !== account ||
          detail.data.beneficiary_bank !== bank
        )
          return gatewayError();
        if (["failed", "rejected"].includes(String(detail.data.status))) {
          finish(row, token, "GAGAL");
          return { status: "GAGAL" };
        }
        if (
          !["queued", "processed", "completed", "approved", "success"].includes(
            String(detail.data.status),
          )
        )
          return gatewayError();
        finish(row, token, "BERHASIL");
        return { status: "DITERIMA" };
      }
      const validation = await midtransRequest(
        `${irisUrl()}/account_validation?${new URLSearchParams({ bank, account })}`,
        irisKey,
      );
      if (
        !validation.response.ok ||
        validation.data.account_no !== account ||
        typeof validation.data.account_name !== "string" ||
        !validation.data.account_name.trim()
      ) {
        finish(row, token, "GAGAL");
        return { status: "GAGAL" };
      }
      // Jaringan di luar tx. Nama pemilik berasal dari validasi bank, bukan placeholder.
      // Tandai tepat sebelum POST; timeout validasi GET masih aman untuk dicoba ulang.
      const marked = db
        .prepare(
          "UPDATE operasi_midtrans SET dikirim=1 WHERE jenis='DISBURSEMENT' AND kunci=? AND klaim=?",
        )
        .run(row.kunci, token);
      if (marked.changes !== 1) return gatewayError();
      const { response, data } = await midtransRequest(
        `${irisUrl()}/payouts`,
        irisKey,
        {
          method: "POST",
          body: JSON.stringify({
            payouts: [
              {
                beneficiary_name: validation.data.account_name,
                beneficiary_account: account,
                beneficiary_bank: bank,
                amount: String(p.nominal),
                notes: `kerjain:${p.idPencairan}`,
              },
            ],
          }),
        },
      );
      const payout =
        Array.isArray(data.payouts) && data.payouts.length === 1
          ? data.payouts[0]
          : null;
      if (
        !response.ok ||
        !payout ||
        typeof payout.reference_no !== "string" ||
        !payout.reference_no
      )
        return gatewayError();
      if (["failed", "rejected"].includes(payout.status)) {
        finish(row, token, "GAGAL", payout.reference_no);
        return { status: "GAGAL" };
      }
      // Sebagian respons create Iris hanya memuat reference_no, tanpa status.
      if (
        payout.status !== undefined &&
        !["queued", "approved", "processed", "completed"].includes(
          payout.status,
        )
      )
        return gatewayError();
      tx(() => {
        catatLog(
          "DISBURSEMENT",
          p.idPencairan,
          {
            nominal: p.nominal,
            rekening: p.rekening,
            referenceNo: payout.reference_no,
            idempotencyKey: p.idPencairan,
          },
          "MIDTRANS",
        );
        finish(row, token, "BERHASIL", payout.reference_no);
      });
      // DITERIMA berarti instruksi dibuat di Iris. Approval mengikuti dashboard Iris;
      // saldo baru didebit setelah status akhir diverifikasi lewat GET payout detail.
      return { status: "DITERIMA" };
    } catch (error) {
      finish(row, token, "BELUM_PASTI");
      throw error;
    }
  }

  async refund(p: RefundParams): Promise<{ status: "BERHASIL" | "GAGAL" }> {
    const key = p.idempotencyKey || `refund:${p.idTagihan}`;
    const operation = claim(
      "REFUND",
      key,
      p.idTagihan,
      createHash("sha256")
        .update(JSON.stringify([p.idTagihan, p.nominal, key]))
        .digest("hex"),
    );
    if (!operation.token)
      return {
        status: operation.row.status === "BERHASIL" ? "BERHASIL" : "GAGAL",
      };
    const { row, token } = operation;
    try {
      // GET memulihkan hasil setelah timeout/restart dan memverifikasi refund_key.
      const check = await midtransRequest(
        `${coreUrl()}/${encodeURIComponent(p.idTagihan)}/status`,
        this.serverKey,
      );
      if (
        !check.response.ok ||
        check.data.order_id !== p.idTagihan ||
        check.data.status_code !== "200"
      )
        return gatewayError();
      const entries = Array.isArray(check.data.refunds)
        ? (check.data.refunds as Record<string, unknown>[])
        : [];
      const existing = entries.find((r) => r.refund_key === key);
      let success = false;
      if (existing) {
        if (
          rupiah(existing.refund_amount) !== p.nominal ||
          !["refund", "partial_refund"].includes(
            String(check.data.transaction_status),
          )
        )
          return gatewayError();
        success = true;
      } else {
        if (
          !["settlement", "capture"].includes(
            String(check.data.transaction_status),
          )
        )
          return gatewayError();
        const { response, data } = await midtransRequest(
          `${coreUrl()}/${encodeURIComponent(p.idTagihan)}/refund`,
          this.serverKey,
          {
            method: "POST",
            body: JSON.stringify({
              refund_key: key,
              amount: p.nominal,
              reason: "Keputusan sengketa",
            }),
          },
        );
        // HTTP 200 juga dapat berisi status_code penolakan/pending. Jangan finalisasi.
        if (
          !response.ok ||
          data.status_code !== "200" ||
          data.order_id !== p.idTagihan ||
          data.refund_key !== key ||
          !["refund", "partial_refund"].includes(
            String(data.transaction_status),
          ) ||
          rupiah(data.refund_amount) !== p.nominal
        )
          return gatewayError();
        success = true;
      }
      if (success)
        tx(() => {
          catatLog(
            "REFUND",
            p.idTagihan,
            { idTagihan: p.idTagihan, nominal: p.nominal, idempotencyKey: key },
            "MIDTRANS",
          );
          finish(row, token, "BERHASIL");
        });
      return { status: "BERHASIL" };
    } catch (error) {
      finish(row, token, "BELUM_PASTI");
      throw error;
    }
  }

  verifikasiWebhook(body: string, signature: string): boolean {
    if (!/^[a-f0-9]{128}$/i.test(signature ?? "")) return false;
    try {
      const p = JSON.parse(body);
      if (
        typeof p.order_id !== "string" ||
        typeof p.status_code !== "string" ||
        typeof p.gross_amount !== "string"
      )
        return false;
      const expected = createHash("sha512")
        .update(p.order_id + p.status_code + p.gross_amount + this.serverKey)
        .digest();
      return timingSafeEqual(expected, Buffer.from(signature, "hex"));
    } catch {
      return false;
    }
  }
}
