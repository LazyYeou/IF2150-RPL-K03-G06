import { MockPaymentGateway } from "./mock";

export interface ChargeParams {
  idTagihan: string;
  total: number;
  metode: string;
}

export interface DisburseParams {
  idPencairan: string;
  rekening: string;
  nominal: number;
}

export interface RefundParams {
  idempotencyKey: string;
  idTagihan: string;
  nominal: number;
}

export interface PaymentGatewayAdapter {
  charge(p: ChargeParams): Promise<{ redirectUrl: string }>;
  disburse(p: DisburseParams): Promise<{ status: "DITERIMA" | "GAGAL" }>;
  refund(p: RefundParams): Promise<{ status: "BERHASIL" | "GAGAL" }>;
  verifikasiWebhook(body: string, signature: string): boolean;
}

/**
 * Factory untuk mendapatkan adapter payment gateway sesuai konfigurasi env.
 * Default provider adalah 'mock'.
 */
export function getPaymentAdapter(): PaymentGatewayAdapter {
  const provider = (process.env.PAYMENT_PROVIDER ?? "mock").toLowerCase();
  if (provider === "mock") {
    return new MockPaymentGateway();
  }
  if (provider === "midtrans") {
    throw new Error("Adapter Midtrans belum dikonfigurasi (Issue #53)");
  }
  throw new Error(`Payment provider '${provider}' tidak didukung`);
}

