import { describe, expect, it } from "vitest";
import {
  labelStatus,
  transisiDiizinkan,
  type JenisStatus,
  type Status,
} from "@/models/statusMachine";

// Daftar pasangan dari docs/contracts/modules.md §2, termasuk status final.
const kontrak: Record<
  JenisStatus,
  { status: Status[]; boleh: [Status, Status][] }
> = {
  pekerjaan: {
    status: [
      "MENUNGGU_PEMBAYARAN",
      "IN_PROGRESS",
      "SUBMITTED",
      "COMPLETED",
      "DISENGKETAKAN",
      "DIBATALKAN",
    ],
    boleh: [
      ["MENUNGGU_PEMBAYARAN", "IN_PROGRESS"],
      ["IN_PROGRESS", "SUBMITTED"],
      ["SUBMITTED", "IN_PROGRESS"],
      ["SUBMITTED", "COMPLETED"],
      ["IN_PROGRESS", "DISENGKETAKAN"],
      ["SUBMITTED", "DISENGKETAKAN"],
      ["DISENGKETAKAN", "COMPLETED"],
      ["DISENGKETAKAN", "DIBATALKAN"],
      ["DISENGKETAKAN", "IN_PROGRESS"],
      ["DISENGKETAKAN", "SUBMITTED"],
    ],
  },
  pembayaran: {
    status: [
      "MENUNGGU_PEMBAYARAN",
      "DIPROSES",
      "BERHASIL",
      "GAGAL",
      "KEDALUWARSA",
      "DIKEMBALIKAN",
    ],
    boleh: [
      ["MENUNGGU_PEMBAYARAN", "DIPROSES"],
      ["MENUNGGU_PEMBAYARAN", "KEDALUWARSA"],
      ["DIPROSES", "BERHASIL"],
      ["DIPROSES", "GAGAL"],
      ["DIPROSES", "KEDALUWARSA"],
      ["BERHASIL", "DIKEMBALIKAN"],
    ],
  },
  pencairan: {
    status: ["MENUNGGU_PROSES", "DIPROSES", "BERHASIL", "GAGAL", "DITOLAK"],
    boleh: [
      ["MENUNGGU_PROSES", "DIPROSES"],
      ["MENUNGGU_PROSES", "DITOLAK"],
      ["DIPROSES", "BERHASIL"],
      ["DIPROSES", "GAGAL"],
    ],
  },
  penawaran: {
    status: ["MENUNGGU", "DITERIMA", "DITOLAK", "DITARIK", "DITOLAK_OTOMATIS"],
    boleh: [
      ["MENUNGGU", "DITERIMA"],
      ["MENUNGGU", "DITOLAK"],
      ["MENUNGGU", "DITARIK"],
      ["MENUNGGU", "DITOLAK_OTOMATIS"],
    ],
  },
  tiket: {
    status: [
      "DIAJUKAN",
      "DITINJAU",
      "MENUNGGU_BALASAN",
      "DIPROSES",
      "DITUTUP",
      "DITOLAK",
      "DIBATALKAN",
    ],
    boleh: [
      ["DIAJUKAN", "DITINJAU"],
      ["DIAJUKAN", "MENUNGGU_BALASAN"],
      ["MENUNGGU_BALASAN", "DITINJAU"],
      ["DITINJAU", "MENUNGGU_BALASAN"],
      ["DITINJAU", "DIPROSES"],
      ["DIPROSES", "DITUTUP"],
      ["DIAJUKAN", "DITOLAK"],
      ["DITINJAU", "DITOLAK"],
      ["DIAJUKAN", "DIBATALKAN"],
    ],
  },
  verifikasi: {
    status: [
      "BELUM_TERVERIFIKASI",
      "MENUNGGU_VERIFIKASI",
      "TERVERIFIKASI",
      "DITOLAK",
    ],
    boleh: [
      ["BELUM_TERVERIFIKASI", "MENUNGGU_VERIFIKASI"],
      ["DITOLAK", "MENUNGGU_VERIFIKASI"],
      ["MENUNGGU_VERIFIKASI", "TERVERIFIKASI"],
      ["MENUNGGU_VERIFIKASI", "DITOLAK"],
    ],
  },
};

describe("transisi sesuai kontrak modul", () => {
  for (const jenis of Object.keys(kontrak) as JenisStatus[]) {
    it(`${jenis}: seluruh pasangan valid diizinkan dan pasangan lainnya ditolak`, () => {
      const { status, boleh } = kontrak[jenis];
      for (const dari of status)
        for (const ke of status) {
          expect(
            transisiDiizinkan(jenis, dari, ke),
            `${jenis}: ${dari} → ${ke}`,
          ).toBe(
            boleh.some(([asal, tujuan]) => asal === dari && tujuan === ke),
          );
        }
    });
  }
  it("pemulihan sengketa ke SUBMITTED dan IN_PROGRESS diizinkan", () => {
    for (const sebelum of ["SUBMITTED", "IN_PROGRESS"] as const)
      expect(transisiDiizinkan("pekerjaan", "DISENGKETAKAN", sebelum)).toBe(
        true,
      );
  });
  it("pekerjaan selesai tidak dapat disengketakan dan tidak boleh melewati pembayaran", () => {
    expect(transisiDiizinkan("pekerjaan", "COMPLETED", "DISENGKETAKAN")).toBe(
      false,
    );
    expect(
      transisiDiizinkan("pekerjaan", "MENUNGGU_PEMBAYARAN", "SUBMITTED"),
    ).toBe(false);
  });
  it("menolak transisi lintas jenis", () => {
    expect(transisiDiizinkan("pekerjaan", "DIPROSES", "BERHASIL")).toBe(false);
  });
});

it("label pekerjaan sesuai §2.8", () => {
  expect(labelStatus("DISENGKETAKAN")).toBe("Dalam peninjauan CS");
  expect(labelStatus("SUBMITTED")).toBe("Menunggu pemeriksaan");
});
