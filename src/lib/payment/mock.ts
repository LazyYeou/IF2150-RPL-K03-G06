import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  ChargeParams,
  DisburseParams,
  PaymentGatewayAdapter,
  RefundParams,
} from "./adapter";
import { catatLog } from "@/models/LogGateway";

/**
 * Implementasi Mock Payment Gateway (C15, C45).
 * Digunakan untuk lingkungan pengujian dan pengembangan lokal.
 */
export class MockPaymentGateway implements PaymentGatewayAdapter {
  /**
   * Mensimulasikan pemrosesan charge/tagihan.
   * Mengembalikan redirect URL ke halaman mock gateway lokal.
   */
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
    catatLog(
      "DISBURSEMENT",
      p.idPencairan,
      {
        idPencairan: p.idPencairan,
        rekening: p.rekening,
        nominal: p.nominal,
        idempotencyKey: p.idPencairan,
      },
      "MOCK",
    );

    return { status: "DITERIMA" };
  }

  /**
   * Mensimulasikan pengembalian dana (refund) dari sengketa yang disetujui.
   */
  async refund(p: RefundParams): Promise<{ status: "BERHASIL" | "GAGAL" }> {
    catatLog(
      "REFUND",
      p.idTagihan,
      {
        idTagihan: p.idTagihan,
        nominal: p.nominal,
        idempotencyKey: p.idempotencyKey,
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

/**
 * Menghasilkan rawBody dan signature HMAC-SHA256 untuk webhook payload.
 * Digunakan oleh halaman mock gateway dan pengujian integrasi.
 */
export function tandaTanganiWebhook(
  payload: Record<string, unknown> | string,
  secretOverride?: string,
): { rawBody: string; signature: string } {
  const secret = secretOverride ?? process.env.PAYMENT_WEBHOOK_SECRET ?? "";
  const rawBody = typeof payload === "string" ? payload : JSON.stringify(payload);
  const signature = createHmac("sha256", secret).update(rawBody).digest("hex");
  return { rawBody, signature };
}
