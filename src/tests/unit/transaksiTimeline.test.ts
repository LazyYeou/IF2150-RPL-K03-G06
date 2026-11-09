import { describe, expect, it } from "vitest";
import { timeline } from "@/models/transaksiTimeline";

describe("timeline berdasarkan riwayat", () => {
  it("pembatalan sebelum pembayaran tidak menandai pekerjaan pernah berjalan", () => {
    const hasil = timeline("DIBATALKAN");
    expect(
      hasil.filter((item) => item.tercapai).map((item) => item.status),
    ).toEqual(["MENUNGGU_PEMBAYARAN", "DIBATALKAN"]);
  });
  it("sengketa setelah penyerahan tetap menampilkan tahap SUBMITTED", () => {
    const hasil = timeline("DISENGKETAKAN", {
      statusSebelumSengketa: "SUBMITTED",
    });
    expect(hasil.find((item) => item.status === "SUBMITTED")).toMatchObject({
      tercapai: true,
      aktif: false,
    });
    expect(
      hasil.filter((item) => item.aktif).map((item) => item.status),
    ).toEqual(["DISENGKETAKAN"]);
  });
  it("sengketa saat pengerjaan tidak menandai SUBMITTED tanpa bukti", () => {
    const hasil = timeline("DISENGKETAKAN", {
      statusSebelumSengketa: "IN_PROGRESS",
    });
    expect(hasil.find((item) => item.status === "IN_PROGRESS")?.tercapai).toBe(
      true,
    );
    expect(hasil.find((item) => item.status === "SUBMITTED")?.tercapai).toBe(
      false,
    );
  });
  it("riwayat bukti tetap tampil setelah permintaan revisi", () => {
    expect(
      timeline("IN_PROGRESS", { pernahMenyerahkanBukti: true }).find(
        (item) => item.status === "SUBMITTED",
      )?.tercapai,
    ).toBe(true);
  });
  it("pembatalan setelah pembayaran mempertahankan tahap pengerjaan", () => {
    expect(
      timeline("DIBATALKAN", { pernahDibayar: true }).find(
        (item) => item.status === "IN_PROGRESS",
      )?.tercapai,
    ).toBe(true);
  });
  it("penyelesaian melalui CS tidak mengarang penyerahan yang belum terjadi", () => {
    expect(
      timeline("COMPLETED").find((item) => item.status === "SUBMITTED")
        ?.tercapai,
    ).toBe(false);
    expect(
      timeline("COMPLETED", { pernahMenyerahkanBukti: true }).find(
        (item) => item.status === "SUBMITTED",
      )?.tercapai,
    ).toBe(true);
  });
});
