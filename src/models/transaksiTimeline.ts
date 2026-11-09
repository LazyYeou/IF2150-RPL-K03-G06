import { labelStatus, type StatusPekerjaan } from "./statusMachine";

type Riwayat = {
  statusSebelumSengketa?: StatusPekerjaan | null;
  pernahDibayar?: boolean;
  pernahMenyerahkanBukti?: boolean;
};

const ALUR: readonly StatusPekerjaan[] = [
  "MENUNGGU_PEMBAYARAN",
  "IN_PROGRESS",
  "SUBMITTED",
  "COMPLETED",
];

/** Tanda tercapai menunjukkan riwayat, sedangkan aktif menunjukkan status saat ini. */
export function timeline(status: StatusPekerjaan, riwayat: Riwayat = {}) {
  const pernahMenyerahkan = Boolean(
    riwayat.pernahMenyerahkanBukti ||
    status === "SUBMITTED" ||
    riwayat.statusSebelumSengketa === "SUBMITTED",
  );
  const pernahMulai = Boolean(
    riwayat.pernahDibayar ||
    pernahMenyerahkan ||
    ["IN_PROGRESS", "SUBMITTED", "COMPLETED", "DISENGKETAKAN"].includes(
      status,
    ) ||
    riwayat.statusSebelumSengketa === "IN_PROGRESS",
  );
  const tercapai: Record<string, boolean> = {
    MENUNGGU_PEMBAYARAN: true,
    IN_PROGRESS: pernahMulai,
    SUBMITTED: pernahMenyerahkan,
    COMPLETED: status === "COMPLETED",
  };
  const urutan =
    status === "DISENGKETAKAN" || status === "DIBATALKAN"
      ? [...ALUR, status]
      : ALUR;
  return urutan.map((item) => ({
    status: item,
    label: labelStatus(item),
    aktif: item === status,
    tercapai: item === status || (tercapai[item] ?? false),
  }));
}
