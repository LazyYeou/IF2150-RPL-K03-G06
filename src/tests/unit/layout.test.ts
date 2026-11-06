import { describe, expect, it } from "vitest";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { menuAktif, roleMenus } from "@/lib/navigation";
describe("navigasi per peran (#19)", () => {
  it("memisahkan menu TK, PK, CS tanpa tautan lintas peran", () => {
    for (const [role, menus] of Object.entries(roleMenus)) {
      expect(new Set(menus.map((item) => item.href)).size).toBe(menus.length);
      for (const menu of menus)
        expect(
          menu.href === "/profil" ||
            menu.href.startsWith(`/${role.toLowerCase()}`),
        ).toBe(true);
    }
    expect(roleMenus.CS.map((item) => item.href)).toEqual([
      "/cs/verifikasi",
      "/cs/tiket",
    ]);
  });
  it("menandai halaman aktif tanpa menandai dashboard pada semua subhalaman", () => {
    expect(menuAktif("/tk/lamaran", "/tk")).toBe(false);
    expect(menuAktif("/tk/lamaran", "/tk/lamaran")).toBe(true);
    expect(menuAktif("/cs/tiket/123", "/cs/tiket")).toBe(true);
    expect(menuAktif("/cs/tiket-lain", "/cs/tiket")).toBe(false);
  });
});
describe("format tampilan Indonesia", () => {
  it("rupiah tanpa desimal", () => {
    expect(formatRupiah(180000).replace(/\s/g, "")).toBe("Rp180.000");
  });
  it("tanggal menggunakan WIB termasuk pergantian hari UTC", () => {
    expect(formatTanggal("2026-11-06")).toBe("6 November 2026");
    expect(formatTanggal("2026-11-05T18:00:00Z")).toBe("6 November 2026");
    expect(formatTanggal("rusak")).toBe("Tanggal belum tersedia");
  });
});
