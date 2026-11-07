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
  | "MENUNGGU_PROSES"
  | "DIPROSES"
  | "BERHASIL"
  | "GAGAL"
  | "DITOLAK";

export type StatusPenawaran =
  | "MENUNGGU"
  | "DITERIMA"
  | "DITOLAK"
  | "DITARIK"
  | "DITOLAK_OTOMATIS";

export type StatusTiket =
  | "DIAJUKAN"
  | "DITINJAU"
  | "MENUNGGU_BALASAN"
  | "DIPROSES"
  | "DITUTUP"
  | "DITOLAK"
  | "DIBATALKAN";

export type StatusVerifikasi =
  | "BELUM_TERVERIFIKASI"
  | "MENUNGGU_VERIFIKASI"
  | "TERVERIFIKASI"
  | "DITOLAK";

const TRANSISI_STATUS: Record<JenisStatus, Readonly<Record<string, readonly string[]>>> =
  {
    pekerjaan: {
      MENUNGGU_PEMBAYARAN: ["IN_PROGRESS", "DIBATALKAN"],
      IN_PROGRESS: ["SUBMITTED", "DISENGKETAKAN", "DIBATALKAN"],
      SUBMITTED: ["COMPLETED", "IN_PROGRESS", "DISENGKETAKAN", "DIBATALKAN"],
      COMPLETED: ["DISENGKETAKAN"],
      DISENGKETAKAN: ["COMPLETED", "IN_PROGRESS", "DIBATALKAN"],
      DIBATALKAN: [],
    },
    pembayaran: {
      MENUNGGU_PEMBAYARAN: ["DIPROSES", "KEDALUWARSA", "GAGAL"],
      DIPROSES: ["BERHASIL", "GAGAL", "KEDALUWARSA"],
      BERHASIL: ["DIKEMBALIKAN"],
      GAGAL: ["DIPROSES", "KEDALUWARSA"],
      KEDALUWARSA: [],
      DIKEMBALIKAN: [],
    },
    pencairan: {
      MENUNGGU_PROSES: ["DIPROSES", "DITOLAK"],
      DIPROSES: ["BERHASIL", "GAGAL", "DITOLAK"],
      BERHASIL: [],
      GAGAL: ["MENUNGGU_PROSES"],
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
      DIAJUKAN: ["DITINJAU", "DIBATALKAN", "DITOLAK"],
      DITINJAU: ["MENUNGGU_BALASAN", "DIPROSES", "DITUTUP", "DITOLAK"],
      MENUNGGU_BALASAN: ["DITINJAU", "DIPROSES", "DITUTUP", "DITOLAK"],
      DIPROSES: ["MENUNGGU_BALASAN", "DITUTUP", "DITOLAK"],
      DITUTUP: [],
      DITOLAK: [],
      DIBATALKAN: [],
    },
    verifikasi: {
      BELUM_TERVERIFIKASI: ["MENUNGGU_VERIFIKASI", "DITOLAK"],
      MENUNGGU_VERIFIKASI: ["TERVERIFIKASI", "DITOLAK", "BELUM_TERVERIFIKASI"],
      TERVERIFIKASI: [],
      DITOLAK: ["BELUM_TERVERIFIKASI", "MENUNGGU_VERIFIKASI"],
    },
  };

const LABEL_STATUS: Readonly<Record<Status, string>> = {
  MENUNGGU_PEMBAYARAN: "Menunggu pembayaran",
  IN_PROGRESS: "Sedang dikerjakan",
  SUBMITTED: "Menunggu pemeriksaan",
  COMPLETED: "Selesai",
  DISENGKETAKAN: "Disengketakan",
  DIBATALKAN: "Dibatalkan",
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

