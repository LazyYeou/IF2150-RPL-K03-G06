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
    ["pekerjaan", "MENUNGGU_PEMBAYARAN", "IN_PROGRESS"],
    ["pekerjaan", "MENUNGGU_PEMBAYARAN", "DIBATALKAN"],
    ["pekerjaan", "IN_PROGRESS", "SUBMITTED"],
    ["pekerjaan", "IN_PROGRESS", "DISENGKETAKAN"],
    ["pekerjaan", "IN_PROGRESS", "DIBATALKAN"],
    ["pekerjaan", "SUBMITTED", "COMPLETED"],
    ["pekerjaan", "SUBMITTED", "IN_PROGRESS"],
    ["pekerjaan", "SUBMITTED", "DISENGKETAKAN"],
    ["pekerjaan", "SUBMITTED", "DIBATALKAN"],
    ["pekerjaan", "COMPLETED", "DISENGKETAKAN"],
    ["pekerjaan", "DISENGKETAKAN", "COMPLETED"],
    ["pekerjaan", "DISENGKETAKAN", "IN_PROGRESS"],
    ["pekerjaan", "DISENGKETAKAN", "DIBATALKAN"],
    ["pembayaran", "MENUNGGU_PEMBAYARAN", "DIPROSES"],
    ["pembayaran", "MENUNGGU_PEMBAYARAN", "KEDALUWARSA"],
    ["pembayaran", "MENUNGGU_PEMBAYARAN", "GAGAL"],
    ["pembayaran", "DIPROSES", "BERHASIL"],
    ["pembayaran", "DIPROSES", "GAGAL"],
    ["pembayaran", "DIPROSES", "KEDALUWARSA"],
    ["pembayaran", "BERHASIL", "DIKEMBALIKAN"],
    ["pembayaran", "GAGAL", "DIPROSES"],
    ["pembayaran", "GAGAL", "KEDALUWARSA"],
    ["pencairan", "MENUNGGU_PROSES", "DIPROSES"],
    ["pencairan", "MENUNGGU_PROSES", "DITOLAK"],
    ["pencairan", "DIPROSES", "BERHASIL"],
    ["pencairan", "DIPROSES", "GAGAL"],
    ["pencairan", "DIPROSES", "DITOLAK"],
    ["pencairan", "GAGAL", "MENUNGGU_PROSES"],
    ["penawaran", "MENUNGGU", "DITERIMA"],
    ["penawaran", "MENUNGGU", "DITOLAK"],
    ["penawaran", "MENUNGGU", "DITARIK"],
    ["penawaran", "MENUNGGU", "DITOLAK_OTOMATIS"],
    ["tiket", "DIAJUKAN", "DITINJAU"],
    ["tiket", "DIAJUKAN", "DITOLAK"],
    ["tiket", "DIAJUKAN", "DIBATALKAN"],
    ["tiket", "DITINJAU", "MENUNGGU_BALASAN"],
    ["tiket", "DITINJAU", "DIPROSES"],
    ["tiket", "DITINJAU", "DITUTUP"],
    ["tiket", "DITINJAU", "DITOLAK"],
    ["tiket", "MENUNGGU_BALASAN", "DITINJAU"],
    ["tiket", "MENUNGGU_BALASAN", "DIPROSES"],
    ["tiket", "MENUNGGU_BALASAN", "DITUTUP"],
    ["tiket", "MENUNGGU_BALASAN", "DITOLAK"],
    ["tiket", "DIPROSES", "MENUNGGU_BALASAN"],
    ["tiket", "DIPROSES", "DITUTUP"],
    ["tiket", "DIPROSES", "DITOLAK"],
    ["verifikasi", "BELUM_TERVERIFIKASI", "MENUNGGU_VERIFIKASI"],
    ["verifikasi", "BELUM_TERVERIFIKASI", "DITOLAK"],
    ["verifikasi", "MENUNGGU_VERIFIKASI", "TERVERIFIKASI"],
    ["verifikasi", "MENUNGGU_VERIFIKASI", "DITOLAK"],
    ["verifikasi", "MENUNGGU_VERIFIKASI", "BELUM_TERVERIFIKASI"],
    ["verifikasi", "DITOLAK", "BELUM_TERVERIFIKASI"],
    ["verifikasi", "DITOLAK", "MENUNGGU_VERIFIKASI"],
  ] as const)("mengizinkan %s dari %s ke %s", (jenis, dari, ke) => {
    expect(transisiDiizinkan(jenis, dari, ke)).toBe(true);
  });

  it.each([
    ["pekerjaan", "MENUNGGU_PEMBAYARAN", "SUBMITTED"],
    ["pekerjaan", "COMPLETED", "IN_PROGRESS"],
    ["pembayaran", "BERHASIL", "DIPROSES"],
    ["pembayaran", "KEDALUWARSA", "DIPROSES"],
    ["pencairan", "BERHASIL", "DIPROSES"],
    ["pencairan", "DITOLAK", "BERHASIL"],
    ["penawaran", "DITERIMA", "MENUNGGU"],
    ["penawaran", "DITOLAK", "DITERIMA"],
    ["tiket", "DITUTUP", "DIPROSES"],
    ["tiket", "DITOLAK", "DITINJAU"],
    ["verifikasi", "TERVERIFIKASI", "DITOLAK"],
    ["verifikasi", "BELUM_TERVERIFIKASI", "TERVERIFIKASI"],
  ] as const)("menolak %s dari %s ke %s", (jenis, dari, ke) => {
    expect(transisiDiizinkan(jenis, dari, ke)).toBe(false);
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
