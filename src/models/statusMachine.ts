import { LABEL_STATUS_PEKERJAAN } from "@/lib/validation/common";

export type JenisStatus =
  | "pekerjaan"
  | "pembayaran"
  | "pencairan"
  | "penawaran"
  | "tiket"
  | "verifikasi";

export type Status =
  | StatusPekerjaan
  | StatusPembayaran
  | StatusPencairan
  | StatusPenawaran
  | StatusTiket
  | StatusVerifikasi;

export type StatusPekerjaan =
  | "MENUNGGU_PEMBAYARAN"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "COMPLETED"
  | "DISENGKETAKAN"
  | "DIBATALKAN";

export type StatusPembayaran =
  | "MENUNGGU_PEMBAYARAN"
  | "DIPROSES"
  | "BERHASIL"
  | "GAGAL"
  | "KEDALUWARSA"
  | "DIKEMBALIKAN";

export type StatusPencairan =
  "MENUNGGU_PROSES" | "DIPROSES" | "BERHASIL" | "GAGAL" | "DITOLAK";

export type StatusPenawaran =
  "MENUNGGU" | "DITERIMA" | "DITOLAK" | "DITARIK" | "DITOLAK_OTOMATIS";

export type StatusTiket =
  | "DIAJUKAN"
  | "DITINJAU"
  | "MENUNGGU_BALASAN"
  | "DIPROSES"
  | "DITUTUP"
  | "DITOLAK"
  | "DIBATALKAN";

export type StatusVerifikasi =
  "BELUM_TERVERIFIKASI" | "MENUNGGU_VERIFIKASI" | "TERVERIFIKASI" | "DITOLAK";

const TRANSISI_STATUS: Record<
  JenisStatus,
  Readonly<Record<string, readonly string[]>>
> = {
  pekerjaan: {
    MENUNGGU_PEMBAYARAN: ["IN_PROGRESS"],
    IN_PROGRESS: ["SUBMITTED", "DISENGKETAKAN"],
    SUBMITTED: ["COMPLETED", "IN_PROGRESS", "DISENGKETAKAN"],
    COMPLETED: [],
    DISENGKETAKAN: ["COMPLETED", "IN_PROGRESS", "SUBMITTED", "DIBATALKAN"],
    DIBATALKAN: [],
  },
  pembayaran: {
    MENUNGGU_PEMBAYARAN: ["DIPROSES", "KEDALUWARSA"],
    DIPROSES: ["BERHASIL", "GAGAL", "KEDALUWARSA"],
    BERHASIL: ["DIKEMBALIKAN"],
    GAGAL: [],
    KEDALUWARSA: [],
    DIKEMBALIKAN: [],
  },
  pencairan: {
    MENUNGGU_PROSES: ["DIPROSES", "DITOLAK"],
    DIPROSES: ["BERHASIL", "GAGAL"],
    BERHASIL: [],
    GAGAL: [],
    DITOLAK: [],
  },
  penawaran: {
    MENUNGGU: ["DITERIMA", "DITOLAK", "DITARIK", "DITOLAK_OTOMATIS"],
    DITERIMA: [],
    DITOLAK: [],
    DITARIK: [],
    DITOLAK_OTOMATIS: [],
  },
  tiket: {
    DIAJUKAN: ["DITINJAU", "MENUNGGU_BALASAN", "DIBATALKAN", "DITOLAK"],
    DITINJAU: ["MENUNGGU_BALASAN", "DIPROSES", "DITOLAK"],
    MENUNGGU_BALASAN: ["DITINJAU"],
    DIPROSES: ["DITUTUP"],
    DITUTUP: [],
    DITOLAK: [],
    DIBATALKAN: [],
  },
  verifikasi: {
    BELUM_TERVERIFIKASI: ["MENUNGGU_VERIFIKASI"],
    MENUNGGU_VERIFIKASI: ["TERVERIFIKASI", "DITOLAK"],
    TERVERIFIKASI: [],
    DITOLAK: ["MENUNGGU_VERIFIKASI"],
  },
};

const LABEL_STATUS: Readonly<Record<Status, string>> = {
  ...LABEL_STATUS_PEKERJAAN,
  DIPROSES: "Diproses",
  BERHASIL: "Berhasil",
  GAGAL: "Gagal",
  KEDALUWARSA: "Kedaluwarsa",
  DIKEMBALIKAN: "Dikembalikan",
  MENUNGGU_PROSES: "Menunggu proses",
  DITOLAK: "Ditolak",
  MENUNGGU: "Menunggu",
  DITERIMA: "Diterima",
  DITARIK: "Ditarik",
  DITOLAK_OTOMATIS: "Ditolak otomatis",
  DIAJUKAN: "Diajukan",
  DITINJAU: "Ditinjau",
  MENUNGGU_BALASAN: "Menunggu balasan",
  DITUTUP: "Ditutup",
  BELUM_TERVERIFIKASI: "Belum terverifikasi",
  MENUNGGU_VERIFIKASI: "Menunggu verifikasi",
  TERVERIFIKASI: "Terverifikasi",
};

export function transisiDiizinkan(
  jenis: JenisStatus,
  dari: Status,
  ke: Status,
): boolean {
  return TRANSISI_STATUS[jenis][dari]?.includes(ke) ?? false;
}

export function labelStatus(status: Status): string {
  return LABEL_STATUS[status] ?? status;
}
