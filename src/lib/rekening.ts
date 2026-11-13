import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  hkdfSync,
  randomBytes,
} from "node:crypto";

const PREFIX = "enc:rekening:v1:";
function kunci(tujuan: string) {
  const hex = process.env.FILE_ENCRYPTION_KEY ?? "";
  if (!/^[a-f0-9]{64}$/i.test(hex))
    throw new Error("FILE_ENCRYPTION_KEY harus 64 karakter hex (32 byte)");
  return Buffer.from(
    hkdfSync(
      "sha256",
      Buffer.from(hex, "hex"),
      Buffer.from("kerjain-rekening-v1"),
      Buffer.from(tujuan),
      32,
    ),
  );
}
export const terenkripsi = (value: string) => value.startsWith(PREFIX);
export function masker(value: string) {
  return `****${value.replace(/\D/g, "").slice(-4)}`;
}
export function enkripsiRekening(value: string, konteks: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", kunci("enkripsi"), iv);
  cipher.setAAD(Buffer.from(konteks));
  const isi = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return (
    PREFIX + Buffer.concat([iv, cipher.getAuthTag(), isi]).toString("base64url")
  );
}
export function dekripsiRekening(value: string, konteks: string): string {
  // Kompatibilitas baca sebelum administrator menjalankan db:protect-accounts.
  if (!terenkripsi(value)) return value;
  const data = Buffer.from(value.slice(PREFIX.length), "base64url");
  if (data.length < 29)
    throw new Error("Data rekening terenkripsi tidak valid");
  const cipher = createDecipheriv(
    "aes-256-gcm",
    kunci("enkripsi"),
    data.subarray(0, 12),
  );
  cipher.setAAD(Buffer.from(konteks));
  cipher.setAuthTag(data.subarray(12, 28));
  return Buffer.concat([
    cipher.update(data.subarray(28)),
    cipher.final(),
  ]).toString("utf8");
}
export const sidikRekening = (value: string) =>
  createHmac("sha256", kunci("sidik")).update(value).digest("hex");

/** Log hanya menyimpan last-four dan HMAC, bukan rekening yang bisa dipakai transfer. */
export function sanitasiLog(value: unknown): unknown {
  if (typeof value === "string")
    return value.replace(
      /(?:BANK(?::[a-z0-9_]{2,30})?|EWALLET|BCA|BNI|BRI|MANDIRI|GOPAY|DANA):\d{8,20}/gi,
      (r) => masker(r),
    );
  if (Array.isArray(value)) return value.map(sanitasiLog);
  if (!value || typeof value !== "object") return value;
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (
      [
        "rekening",
        "rekeningtujuan",
        "nomorrekening",
        "account",
        "accountnumber",
        "bankaccount",
        "bankaccountnumber",
      ].includes(key.replace(/[^a-z]/gi, "").toLowerCase())
    ) {
      if (typeof item === "string") {
        result.rekeningMasked = masker(item);
        result.rekeningFingerprint = sidikRekening(item);
      }
    } else if (/password|secret|authorization|token/i.test(key))
      result[key] = "[REDACTED]";
    else result[key] = sanitasiLog(item);
  }
  return result;
}
