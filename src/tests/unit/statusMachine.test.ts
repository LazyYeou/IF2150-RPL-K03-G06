import { describe, expect, it } from "vitest";
import { labelStatus, transisiDiizinkan } from "@/models/statusMachine";

describe("transisiDiizinkan", () => {
  it("mengizinkan SUBMITTED ke COMPLETED untuk pekerjaan", () => {
    expect(transisiDiizinkan("pekerjaan", "SUBMITTED", "COMPLETED")).toBe(true);
  });

  it("menolak MENUNGGU_PEMBAYARAN ke SUBMITTED untuk pekerjaan", () => {
    expect(
      transisiDiizinkan(
        "pekerjaan",
        "MENUNGGU_PEMBAYARAN",
        "SUBMITTED",
      ),
    ).toBe(false);
  });

  it.each([
    ["pembayaran", "MENUNGGU_PEMBAYARAN", "DIPROSES"],
    ["pembayaran", "DIPROSES", "BERHASIL"],
    ["pencairan", "MENUNGGU_PROSES", "DIPROSES"],
    ["penawaran", "MENUNGGU", "DITERIMA"],
    ["tiket", "DIAJUKAN", "DITINJAU"],
    ["verifikasi", "MENUNGGU_VERIFIKASI", "TERVERIFIKASI"],
  ] as const)("mengizinkan %s dari %s ke %s", (jenis, dari, ke) => {
    expect(transisiDiizinkan(jenis, dari, ke)).toBe(true);
  });

  it("menolak transisi lintas jenis", () => {
    expect(transisiDiizinkan("pekerjaan", "DIPROSES", "BERHASIL")).toBe(false);
  });

  it("menolak transisi keluar dari status terminal", () => {
    expect(transisiDiizinkan("pekerjaan", "COMPLETED", "IN_PROGRESS")).toBe(false);
    expect(transisiDiizinkan("penawaran", "DITERIMA", "MENUNGGU")).toBe(false);
  });
});

describe("labelStatus", () => {
  it.each([
    ["MENUNGGU_PEMBAYARAN", "Menunggu pembayaran"],
    ["IN_PROGRESS", "Sedang dikerjakan"],
    ["SUBMITTED", "Menunggu pemeriksaan"],
    ["COMPLETED", "Selesai"],
    ["TERVERIFIKASI", "Terverifikasi"],
  ] as const)("memberi label %s sebagai %s", (status, label) => {
    expect(labelStatus(status)).toBe(label);
  });
});
