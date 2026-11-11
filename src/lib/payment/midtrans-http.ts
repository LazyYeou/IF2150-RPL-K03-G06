import "server-only";
import { AppError } from "@/lib/errors";

export const coreUrl = () =>
  process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://api.midtrans.com/v2"
    : "https://api.sandbox.midtrans.com/v2";
export const irisUrl = () =>
  process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/iris/api/v1"
    : "https://app.sandbox.midtrans.com/iris/api/v1";

export function gatewayError(): never {
  // Respons provider bisa memuat rekening/kunci; jangan bocorkan ke respons API/log.
  throw new AppError(
    "GATEWAY_UNCERTAIN",
    502,
    "Hasil gateway belum dapat dipastikan. Rekonsiliasi diperlukan sebelum mengulangi operasi.",
  );
}

export async function midtransRequest(
  url: string,
  key: string,
  init: RequestInit = {},
) {
  if (!key)
    throw new AppError(
      "GATEWAY_CONFIG",
      503,
      "Konfigurasi kunci gateway belum lengkap",
    );
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(8000),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(`${key}:`).toString("base64")}`,
        ...init.headers,
      },
    });
  } catch {
    // Network/abort errors are uncertain, not evidence that money did not move.
    return gatewayError();
  }
  let data: Record<string, unknown>;
  try {
    data = await response.json();
  } catch {
    return gatewayError();
  }
  if (!data || typeof data !== "object" || Array.isArray(data))
    return gatewayError();
  return { response, data };
}

export function rupiah(value: unknown): number {
  if (typeof value !== "string" || !/^\d+(?:\.00)?$/.test(value))
    return gatewayError();
  const result = Number(value);
  if (!Number.isSafeInteger(result) || result <= 0) return gatewayError();
  return result;
}

/** GET Iris payout detail uses `bank`; retain the earlier field as an alias.
 * Reject contradictory fields instead of choosing a potentially wrong bank. */
export function bankPayout(data: Record<string, unknown>): string {
  const bank = data.bank ?? data.beneficiary_bank;
  if (
    typeof bank !== "string" ||
    !bank ||
    (data.bank !== undefined &&
      data.beneficiary_bank !== undefined &&
      data.bank !== data.beneficiary_bank)
  )
    return gatewayError();
  return bank;
}
