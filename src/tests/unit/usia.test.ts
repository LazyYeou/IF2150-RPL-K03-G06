import { describe, expect, it } from "vitest";
import { validasiBatasUsia } from "@/lib/validation/auth";

// Hitung usia penuh diuji lewat fungsi produksi; kalender mengikuti Asia/Jakarta.
describe("validasiBatasUsia / usia penuh (#40, KF02)", () => {
  it.each([
    [
      "sehari sebelum ulang tahun ke-17",
      "2009-11-07",
      "2026-11-06T05:00:00Z",
      false,
    ],
    ["tepat ulang tahun ke-17", "2009-11-06", "2026-11-06T05:00:00Z", true],
    [
      "sehari setelah ulang tahun ke-17",
      "2009-11-05",
      "2026-11-06T05:00:00Z",
      true,
    ],
    [
      "sebelum pergantian hari WIB",
      "2009-11-06",
      "2026-11-05T16:59:59Z",
      false,
    ],
    ["tepat tengah malam WIB", "2009-11-06", "2026-11-05T17:00:00Z", true],
    [
      "lahir 29 Feb: 28 Feb tahun nonkabisat masih 16",
      "2008-02-29",
      "2025-02-28T05:00:00Z",
      false,
    ],
    [
      "lahir 29 Feb: 1 Maret tahun nonkabisat sudah 17",
      "2008-02-29",
      "2025-03-01T05:00:00Z",
      true,
    ],
    [
      "29 Feb yang valid pada tahun kabisat",
      "2004-02-29",
      "2024-02-29T05:00:00Z",
      true,
    ],
    [
      "ulang tahun di 1 Januari, belum 17",
      "2010-01-01",
      "2026-12-31T05:00:00Z",
      false,
    ],
    [
      "ulang tahun di 1 Januari, sudah 17",
      "2010-01-01",
      "2026-12-31T17:00:00Z",
      true,
    ],
    ["tahun 2000 kabisat", "2000-02-29", "2026-11-06T05:00:00Z", true],
    ["tahun 1900 bukan kabisat", "1900-02-29", "2026-11-06T05:00:00Z", false],
  ])("%s", (_nama, lahir, hariIni, boleh) => {
    expect(validasiBatasUsia(lahir, new Date(hariIni))).toBe(boleh);
  });
  it.each([
    "",
    "invalid",
    "2009-02-29",
    "2000-02-30",
    "2000-04-31",
    "2000-13-01",
    "2000-00-01",
    "2000-01-00",
    "06-11-2009",
    "2009-1-1",
    "2009-11-06T00:00:00Z",
    "2027-01-01",
  ])("tanggal tidak valid/masa depan ditolak: %s", (lahir) => {
    expect(validasiBatasUsia(lahir, new Date("2026-11-06T05:00:00Z"))).toBe(
      false,
    );
  });
});
