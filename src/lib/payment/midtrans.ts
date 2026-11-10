import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type {
  ChargeParams,
  DisburseParams,
  PaymentGatewayAdapter,
  RefundParams,
} from "./adapter";
import { sidikRekening } from "@/lib/rekening";
import { tx } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { ambilLog, catatLog } from "@/models/LogGateway";

const SANDBOX_SNAP = "https://app.sandbox.midtrans.com/snap/v1/transactions";
const PROD_SNAP = "https://app.midtrans.com/snap/v1/transactions";

const SANDBOX_CORE = "https://api.sandbox.midtrans.com/v2";
const PROD_CORE = "https://api.midtrans.com/v2";

const SANDBOX_IRIS = "https://app.sandbox.midtrans.com/iris/api/v1";
const PROD_IRIS = "https://app.midtrans.com/iris/api/v1";

function authHeader(serverKey: string): string {
  return "Basic " + Buffer.from(serverKey + ":").toString("base64");
}

export class MidtransPaymentGateway implements PaymentGatewayAdapter {
  private readonly serverKey: string;
  private readonly isProduction: boolean;

  constructor() {
    const key = process.env.MIDTRANS_SERVER_KEY ?? "";
    if (!key) {
      throw new Error(
        "MIDTRANS_SERVER_KEY wajib diisi untuk provider midtrans",
      );
    }
    this.serverKey = key;
    this.isProduction =
      process.env.MIDTRANS_IS_PRODUCTION?.toLowerCase() === "true";
  }

  private snapUrl(): string {
    return this.isProduction ? PROD_SNAP : SANDBOX_SNAP;
  }

  private coreUrl(): string {
    return this.isProduction ? PROD_CORE : SANDBOX_CORE;
  }

  private irisUrl(): string {
    return this.isProduction ? PROD_IRIS : SANDBOX_IRIS;
  }

  async charge(p: ChargeParams): Promise<{ redirectUrl: string }> {
    const body = {
      transaction_details: {
        order_id: p.idTagihan,
        gross_amount: Math.round(p.total),
      },
    };

    const response = await fetch(this.snapUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader(this.serverKey),
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as {
      redirect_url?: string;
      token?: string;
      error_messages?: string[];
    };

    if (!response.ok || !data.redirect_url) {
      const pesan =
        data.error_messages?.join("; ") ?? `HTTP ${response.status}`;
      throw new AppError(
        "GATEWAY_ERROR",
        502,
        `Midtrans charge gagal: ${pesan}`,
      );
    }

    catatLog(
      "CHARGE",
      p.idTagihan,
      {
        idTagihan: p.idTagihan,
        total: p.total,
        metode: p.metode,
        idempotencyKey: p.idTagihan,
        snapToken: data.token,
      },
      "MIDTRANS",
    );

    return { redirectUrl: data.redirect_url };
  }

  async disburse(
    p: DisburseParams,
  ): Promise<{ status: "DITERIMA" | "GAGAL" }> {
    return tx(() => {
      // Idempotency: cek log DISBURSEMENT yang sudah ada
      const existing = ambilLog(p.idPencairan).find(
        (log) => log.jenis === "DISBURSEMENT",
      );
      if (existing) {
        const payload = existing.payload as {
          nominal: number;
          rekeningFingerprint: string;
        };
        if (
          payload.nominal !== p.nominal ||
          payload.rekeningFingerprint !== sidikRekening(p.rekening)
        ) {
          throw new AppError(
            "IDEMPOTENCY_CONFLICT",
            409,
            "Instruksi pencairan berbeda untuk ID yang sama",
          );
        }
        return { status: "DITERIMA" as const };
      }

      catatLog(
        "DISBURSEMENT",
        p.idPencairan,
        {
          ...p,
          idempotencyKey: p.idPencairan,
        },
        "MIDTRANS",
      );
      return { status: "DITERIMA" as const };
    });
  }

  async _kirimDisbursement(p: DisburseParams): Promise<void> {
    const [jenis, nomor] = p.rekening.split(":");
    const body = {
      payouts: [
        {
          beneficiary_name: "Tenaga Kerja",
          beneficiary_account: nomor,
          beneficiary_bank: jenis,
          amount: p.nominal.toString(),
          notes: `Pencairan ${p.idPencairan}`,
        },
      ],
    };

    const response = await fetch(`${this.irisUrl()}/payouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader(this.serverKey),
        "X-Idempotency-Key": p.idPencairan,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new AppError(
        "GATEWAY_ERROR",
        502,
        `Midtrans disburse gagal: ${text}`,
      );
    }
  }

  async refund(p: RefundParams): Promise<{ status: "BERHASIL" | "GAGAL" }> {
    const idempotencyKey = p.idempotencyKey || `refund:${p.idTagihan}`;

    return tx(() => {
      const existing = ambilLog(p.idTagihan).find(
        (log) => log.jenis === "REFUND",
      );
      if (existing) {
        const payload = existing.payload as {
          idempotencyKey: string;
          nominal: number;
        };
        if (
          payload.idempotencyKey !== idempotencyKey ||
          payload.nominal !== p.nominal
        ) {
          throw new AppError(
            "IDEMPOTENCY_CONFLICT",
            409,
            "Tagihan sudah direfund dengan instruksi berbeda",
          );
        }
        return { status: "BERHASIL" as const };
      }

      catatLog(
        "REFUND",
        p.idTagihan,
        { idTagihan: p.idTagihan, nominal: p.nominal, idempotencyKey },
        "MIDTRANS",
      );
      return { status: "BERHASIL" as const };
    });
  }

  async _kirimRefund(p: RefundParams): Promise<void> {
    const idempotencyKey = p.idempotencyKey || `refund:${p.idTagihan}`;
    const body = {
      refund_key: idempotencyKey,
      amount: p.nominal,
      reason: "Keputusan sengketa",
    };

    const response = await fetch(
      `${this.coreUrl()}/${p.idTagihan}/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader(this.serverKey),
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new AppError(
        "GATEWAY_ERROR",
        502,
        `Midtrans refund gagal: ${text}`,
      );
    }
  }

  verifikasiWebhook(body: string, signature: string): boolean {
    if (!signature || typeof body !== "string") {
      return false;
    }

    try {
      const payload = JSON.parse(body) as Record<string, unknown>;
      const orderId = String(payload.order_id ?? payload.idTagihan ?? payload.referensiId ?? "");
      const statusCode = String(payload.status_code ?? (payload.status === "BERHASIL" ? "200" : "400"));
      const grossAmount = String(payload.gross_amount ?? payload.nominal ?? "");

      if (signature.length === 128 && orderId && statusCode && grossAmount) {
        const expectedSig = createHash("sha512")
          .update(orderId + statusCode + grossAmount + this.serverKey)
          .digest("hex");

        const expectedBuf = Buffer.from(expectedSig, "hex");
        const signatureBuf = Buffer.from(signature, "hex");

        if (expectedBuf.length === signatureBuf.length && timingSafeEqual(expectedBuf, signatureBuf)) {
          return true;
        }
      }

      const secret = process.env.PAYMENT_WEBHOOK_SECRET;
      if (secret && signature.length === 64) {
        const expectedSig = createHmac("sha256", secret).update(body).digest("hex");
        const expectedBuf = Buffer.from(expectedSig, "hex");
        const signatureBuf = Buffer.from(signature, "hex");

        if (expectedBuf.length === signatureBuf.length && timingSafeEqual(expectedBuf, signatureBuf)) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }
}