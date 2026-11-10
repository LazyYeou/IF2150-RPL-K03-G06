import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  ChargeParams,
  DisburseParams,
  PaymentGatewayAdapter,
  RefundParams,
} from "./adapter";
import { tx } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { ambilLog, catatLog } from "@/models/LogGateway";

export class MockPaymentGateway implements PaymentGatewayAdapter {
  async charge(p: ChargeParams): Promise<{ redirectUrl: string }> {
    catatLog(
      "CHARGE",
      p.idTagihan,
      {
        idTagihan: p.idTagihan,
        total: p.total,
        metode: p.metode,
        idempotencyKey: p.idTagihan,
      },
      "MOCK",
    );

    return {
      redirectUrl: `/mock-gateway/${encodeURIComponent(p.idTagihan)}`,
    };
  }

  /**
   * Mensimulasikan instruksi pencairan dana (disbursement) ke rekening tujuan.
   */
  async disburse(p: DisburseParams): Promise<{ status: "DITERIMA" | "GAGAL" }> {
    return tx(() => {
      const existing = ambilLog(p.idPencairan).find(
        (log) => log.jenis === "DISBURSEMENT",
      );
      if (existing) {
        const payload = existing.payload as DisburseParams;
        if (payload.nominal !== p.nominal || payload.rekening !== p.rekening) {
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
        "MOCK",
      );
      return { status: "DITERIMA" as const };
    });
  }

  async refund(p: RefundParams): Promise<{ status: "BERHASIL" | "GAGAL" }> {
    const idempotencyKey = p.idempotencyKey || `refund:${p.idTagihan}`;

    // Cek idempotensi pada log: jika sudah pernah direfund dengan idempotencyKey ini, jangan catat log ganda
    const existingLogs = ambilLog(p.idTagihan);
    const sudahAda = existingLogs.find(
      (l) =>
        l.jenis === "REFUND" &&
        typeof l.payload === "object" &&
        l.payload !== null &&
        (l.payload as { idempotencyKey?: string }).idempotencyKey ===
          idempotencyKey,
    );

    if (sudahAda) {
      return { status: "BERHASIL" };
    }

    catatLog(
      "REFUND",
      p.idTagihan,
      {
        idTagihan: p.idTagihan,
        nominal: p.nominal,
        idempotencyKey,
      },
      "MOCK",
    );

    return { status: "BERHASIL" };
  }

  /**
   * Memvalidasi signature webhook menggunakan HMAC-SHA256 dengan timingSafeEqual
   * untuk mencegah serangan timing attack.
   */
  verifikasiWebhook(body: string, signature: string): boolean {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (!secret || !signature || typeof body !== "string") {
      return false;
    }

    try {
      const expectedSig = createHmac("sha256", secret)
        .update(body)
        .digest("hex");
      const expectedBuf = Buffer.from(expectedSig, "hex");
      const signatureBuf = Buffer.from(signature, "hex");

      if (expectedBuf.length !== signatureBuf.length) {
        return false;
      }

      return timingSafeEqual(expectedBuf, signatureBuf);
    } catch {
      return false;
    }
  }
}

export function tandaTanganiWebhook(
  payload: Record<string, unknown> | string,
  secretOverride?: string,
): { rawBody: string; signature: string } {
  const secret = secretOverride ?? process.env.PAYMENT_WEBHOOK_SECRET ?? "";
  const rawBody =
    typeof payload === "string" ? payload : JSON.stringify(payload);
  const signature = createHmac("sha256", secret).update(rawBody).digest("hex");
  return { rawBody, signature };
}
