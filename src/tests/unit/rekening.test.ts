import { describe, expect, it } from "vitest";
import {
  dekripsiRekening,
  enkripsiRekening,
  sanitasiLog,
  sidikRekening,
} from "@/lib/rekening";
const rekening = "BANK:123456789012";
describe("Perlindungan rekening KNF17", () => {
  it("AES-GCM memakai nonce acak dan hanya dapat dibuka pada konteks asal", () => {
    const a = enkripsiRekening(rekening, "pencairan:a");
    const b = enkripsiRekening(rekening, "pencairan:a");
    expect(a).not.toBe(b);
    expect(a).not.toContain("123456789012");
    expect(dekripsiRekening(a, "pencairan:a")).toBe(rekening);
    expect(() => dekripsiRekening(a, "pencairan:b")).toThrow();
    const encoded = a.slice("enc:rekening:v1:".length);
    const tampered = Buffer.from(encoded, "base64url");
    tampered[tampered.length - 1] ^= 1;
    expect(() =>
      dekripsiRekening(
        "enc:rekening:v1:" + tampered.toString("base64url"),
        "pencairan:a",
      ),
    ).toThrow();
  });
  it("kunci hilang, tidak valid atau berubah ditolak tanpa fallback produksi", () => {
    const a = enkripsiRekening(rekening, "uji");
    const old = process.env.FILE_ENCRYPTION_KEY;
    try {
      delete process.env.FILE_ENCRYPTION_KEY;
      expect(() => enkripsiRekening(rekening, "uji")).toThrow(
        /FILE_ENCRYPTION_KEY/,
      );
      process.env.FILE_ENCRYPTION_KEY = "invalid";
      expect(() => dekripsiRekening(a, "uji")).toThrow();
      process.env.FILE_ENCRYPTION_KEY = "ee".repeat(32);
      expect(() => dekripsiRekening(a, "uji")).toThrow();
    } finally {
      process.env.FILE_ENCRYPTION_KEY = old;
    }
  });
  it("log nested disamarkan dan fingerprint stabil tidak memuat nomor rekening", () => {
    const aman = sanitasiLog({
      rekening,
      nominal: 10000,
      nested: [{ rekeningTujuan: rekening, token: "secret" }],
      info: `Transfer ke ${rekening}`,
    });
    expect(JSON.stringify(aman)).not.toContain("123456789012");
    expect(aman).toMatchObject({
      rekeningMasked: "****9012",
      rekeningFingerprint: sidikRekening(rekening),
      nominal: 10000,
      nested: [{ token: "[REDACTED]" }],
    });
    expect(sanitasiLog(aman)).toEqual(aman);
  });
});
