import { describe, expect, it } from "vitest";
import {
  BuatLowonganInput,
  CariLowonganQuery,
  DaftarLowonganResponse,
  LowonganDetail,
  LowonganSayaResponse,
} from "@/lib/validation/lowongan";
import {
  AjukanPenawaranInput,
  PelamarResponse,
  PenawaranSayaResponse,
  TerimaPenawaranResponse,
} from "@/lib/validation/penawaran";
import {
  AntreanVerifikasiResponse,
  TolakVerifikasiInput,
  VerifikasiStatusResponse,
} from "@/lib/validation/verifikasi";
import {
  BuatTiketInput,
  DaftarTiketResponse,
  Tiket,
} from "@/lib/validation/sengketa";
import lowonganList from "@/views/__fixtures__/lowongan-list.json";
import lowonganDetail from "@/views/__fixtures__/lowongan-detail.json";
import lowonganSaya from "@/views/__fixtures__/lowongan-saya.json";
import pelamar from "@/views/__fixtures__/pelamar.json";
import penawaranSaya from "@/views/__fixtures__/penawaran-saya.json";
import terimaPenawaran from "@/views/__fixtures__/terima-penawaran.json";
import verifikasiStatus from "@/views/__fixtures__/verifikasi-status.json";
import antreanVerifikasi from "@/views/__fixtures__/antrean-verifikasi.json";
import tiket from "@/views/__fixtures__/tiket.json";
import tiketList from "@/views/__fixtures__/tiket-list.json";

describe("fixture sesuai skema respons", () => {
  it.each([
    ["lowongan-list", DaftarLowonganResponse, lowonganList],
    ["lowongan-detail", LowonganDetail, lowonganDetail],
    ["lowongan-saya", LowonganSayaResponse, lowonganSaya],
    ["pelamar", PelamarResponse, pelamar],
    ["penawaran-saya", PenawaranSayaResponse, penawaranSaya],
    ["terima-penawaran", TerimaPenawaranResponse, terimaPenawaran],
    ["verifikasi-status", VerifikasiStatusResponse, verifikasiStatus],
    ["antrean-verifikasi", AntreanVerifikasiResponse, antreanVerifikasi],
    ["tiket", Tiket, tiket],
    ["tiket-list", DaftarTiketResponse, tiketList],
  ])("%s", (_nama, skema, data) => {
    expect(skema.safeParse(data).success).toBe(true);
  });
});

const lowonganValid = {
  judul: "Bersih rumah",
  deskripsi: "Membersihkan rumah dua lantai setelah pindahan.",
  ruangLingkup: "Lantai 1 dan 2",
  kriteriaHasil: "Bersih dan kering",
  kategori: "Kebersihan",
  lokasi: "Coblong, Bandung",
  tanggalPekerjaan: "2026-11-12",
  estimasiDurasi: "4 jam",
  upah: 350000,
  satuanUpah: "PER_TUGAS",
  kuota: 2,
  pernyataanRisiko: false,
};

describe("BuatLowonganInput (KF08, KNF09)", () => {
  it("menerima data valid", () => {
    expect(BuatLowonganInput.safeParse(lowonganValid).success).toBe(true);
  });
  it.each([
    ["judul 7 karakter", { judul: "1234567" }],
    ["upah di bawah 1.000", { upah: 999 }],
    ["upah di atas 100 juta", { upah: 100_000_001 }],
    ["kuota 0", { kuota: 0 }],
    ["kuota 51", { kuota: 51 }],
    ["kategori tidak dikenal", { kategori: "Lain-lain" }],
  ])("menolak %s", (_nama, ubah) => {
    expect(
      BuatLowonganInput.safeParse({ ...lowonganValid, ...ubah }).success,
    ).toBe(false);
  });
  it("menolak field tak dikenal (.strict)", () => {
    expect(
      BuatLowonganInput.safeParse({ ...lowonganValid, idPenyediaKerja: "x" })
        .success,
    ).toBe(false);
  });
  it("kategori berisiko wajib pernyataan risiko", () => {
    const r = BuatLowonganInput.safeParse({
      ...lowonganValid,
      kategori: "Kelistrikan",
    });
    expect(r.success).toBe(false);
    expect(
      BuatLowonganInput.safeParse({
        ...lowonganValid,
        kategori: "Kelistrikan",
        pernyataanRisiko: true,
      }).success,
    ).toBe(true);
  });
});

describe("CariLowonganQuery", () => {
  it("memberi default dan mengubah string menjadi angka", () => {
    expect(
      CariLowonganQuery.parse({ upahMin: "100000", page: "2" }),
    ).toMatchObject({ upahMin: 100000, page: 2, urut: "terbaru" });
    expect(CariLowonganQuery.parse({}).page).toBe(1);
  });
  it("menolak page 0", () => {
    expect(CariLowonganQuery.safeParse({ page: "0" }).success).toBe(false);
  });
});

describe("AjukanPenawaranInput (KF10)", () => {
  const valid = {
    idLowongan: "aaaaaaaa-0000-4000-8000-000000000001",
    hargaPenawaran: 330000,
    ketersediaan: "Kamis pagi",
  };
  it("menerima data valid, pesan opsional", () => {
    expect(AjukanPenawaranInput.safeParse(valid).success).toBe(true);
  });
  it("menolak harga di luar batas dan id pelaku dari body", () => {
    expect(
      AjukanPenawaranInput.safeParse({ ...valid, hargaPenawaran: 999 }).success,
    ).toBe(false);
    expect(
      AjukanPenawaranInput.safeParse({ ...valid, idTenagaKerja: "x" }).success,
    ).toBe(false);
  });
});

describe("input lain", () => {
  it("TolakVerifikasiInput: alasan 5–500", () => {
    expect(TolakVerifikasiInput.safeParse({ alasan: "buram" }).success).toBe(
      true,
    );
    expect(TolakVerifikasiInput.safeParse({ alasan: "abcd" }).success).toBe(
      false,
    );
  });
  it("BuatTiketInput: deskripsi minimal 20 karakter, idTransaksi opsional (bantuan umum)", () => {
    const dasar = { kategoriMasalah: "Pembayaran", deskripsi: "x".repeat(20) };
    expect(BuatTiketInput.safeParse(dasar).success).toBe(true);
    expect(
      BuatTiketInput.safeParse({ ...dasar, deskripsi: "x".repeat(19) }).success,
    ).toBe(false);
  });
});
