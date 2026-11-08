"use client";

import { useState } from "react";
import type { MetodePembayaran, StatusTagihan } from "@/lib/validation/tagihan";

export interface TagihanData {
  id: string;
  idTransaksi: string;
  nominalUpah: number;
  commissionFee: number;
  totalBayar: number;
  metode: string | null;
  expiry: string;
  status: StatusTagihan;
  createdAt: string;
}

export interface TagihanPembayaranUIProps {
  transaksi: {
    id: string;
    judul: string;
    namaTenagaKerja: string;
    nominalUpah: number;
    status: string;
  };
  tagihan: TagihanData;
}

const DAFTAR_METODE: Array<{
  id: MetodePembayaran;
  nama: string;
  deskripsi: string;
  tipe: "VA" | "QRIS" | "EWALLET";
}> = [
  {
    id: "VA_BCA",
    nama: "BCA Virtual Account",
    deskripsi: "Bayar otomatis melalui ATM, m-BCA, atau KlikBCA",
    tipe: "VA",
  },
  {
    id: "VA_BNI",
    nama: "BNI Virtual Account",
    deskripsi: "Bayar melalui BNI Mobile Banking atau ATM BNI",
    tipe: "VA",
  },
  {
    id: "QRIS",
    nama: "QRIS",
    deskripsi: "Pindai kode QR dari aplikasi e-wallet atau mobile banking apa saja",
    tipe: "QRIS",
  },
  {
    id: "EWALLET",
    nama: "Dompet Digital (E-Wallet)",
    deskripsi: "Pembayaran instan melalui saldo dompet digital mitra",
    tipe: "EWALLET",
  },
];

export default function TagihanPembayaranUI({
  transaksi,
  tagihan,
}: TagihanPembayaranUIProps) {
  const [metodeDipilih, setMetodeDipilih] = useState<MetodePembayaran>(
    (tagihan.metode as MetodePembayaran) || "VA_BCA",
  );
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const formatRupiah = (nilai: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(nilai);

  const formatWaktu = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
      }).format(d);
    } catch {
      return isoStr;
    }
  };

  const isKedaluwarsa =
    tagihan.status === "KEDALUWARSA" ||
    (tagihan.status === "MENUNGGU_PEMBAYARAN" &&
      new Date(tagihan.expiry).getTime() <= Date.now());

  const handleBayar = async () => {
    if (isKedaluwarsa) {
      setPesanError("Tagihan ini telah kedaluwarsa. Silakan muat ulang halaman.");
      return;
    }
    if (!metodeDipilih) {
      setPesanError("Silakan pilih metode pembayaran terlebih dahulu.");
      return;
    }

    setLoading(true);
    setPesanError(null);

    try {
      // Mengarahkan ke pemrosesan pembayaran atau instruksi
      const res = await fetch(`/api/tagihan/${tagihan.id}/bayar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metode: metodeDipilih }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Gagal memproses pembayaran");
      }

      // Redirect ke halaman instruksi / status
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setPesanError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6" aria-labelledby="invoice-title">
      <div className="border-b pb-4">
        <h1 id="invoice-title" className="text-2xl font-bold text-navy">
          Tagihan Pembayaran Pekerjaan
        </h1>
        <p className="text-sm text-muted-foreground">
          Selesaikan pembayaran untuk memulai pengerjaan lowongan
        </p>
      </div>

      {/* Ringkasan Transaksi */}
      <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold">Ringkasan Pekerjaan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Judul Pekerjaan:</span>
            <p className="font-medium text-foreground">{transaksi.judul}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Tenaga Kerja Terpilih:</span>
            <p className="font-medium text-foreground">{transaksi.namaTenagaKerja}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Nomor Invoice:</span>
            <p className="font-mono text-xs text-foreground mt-0.5">{tagihan.id}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Status Tagihan:</span>
            <p className="mt-0.5">
              <span
                className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                  isKedaluwarsa
                    ? "bg-red-100 text-red-700"
                    : tagihan.status === "BERHASIL"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {isKedaluwarsa ? "KEDALUWARSA" : tagihan.status.replace("_", " ")}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Rincian Biaya */}
      <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold">Rincian Pembayaran</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1 border-b">
            <span className="text-muted-foreground">Nominal Upah Pekerja</span>
            <span className="font-medium">{formatRupiah(tagihan.nominalUpah)}</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <span className="text-muted-foreground">Biaya Layanan &amp; Administrasi</span>
            <span className="font-medium">{formatRupiah(tagihan.commissionFee)}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-bold text-navy">
            <span>Total Pembayaran</span>
            <span className="text-lg text-brand-orange">{formatRupiah(tagihan.totalBayar)}</span>
          </div>
        </div>
      </div>

      {/* Batas Waktu Pembayaran */}
      <div
        className={`rounded-xl border p-5 ${
          isKedaluwarsa ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
        }`}
      >
        <h2 className="text-base font-semibold text-foreground">Batas Waktu Pembayaran</h2>
        <p className="text-sm mt-1">
          {isKedaluwarsa ? (
            <span className="text-red-700 font-medium">
              Tagihan ini telah melewati batas waktu pembayaran ({formatWaktu(tagihan.expiry)}).
            </span>
          ) : (
            <span className="text-amber-800">
              Harap selesaikan pembayaran sebelum{" "}
              <strong>{formatWaktu(tagihan.expiry)}</strong>
            </span>
          )}
        </p>
      </div>

      {/* Pilihan Metode Pembayaran */}
      {!isKedaluwarsa && tagihan.status === "MENUNGGU_PEMBAYARAN" && (
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Pilih Metode Pembayaran</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Metode Pembayaran">
            {DAFTAR_METODE.map((m) => {
              const isSelected = metodeDipilih === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setMetodeDipilih(m.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setMetodeDipilih(m.id);
                    }
                  }}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  className={`cursor-pointer rounded-lg border p-4 transition-all ${
                    isSelected
                      ? "border-brand-orange bg-orange-50/40 ring-2 ring-brand-orange"
                      : "border-border hover:border-gray-400 bg-background"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{m.nama}</p>
                      <p className="text-xs text-muted-foreground mt-1">{m.deskripsi}</p>
                    </div>
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? "border-brand-orange bg-brand-orange"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {pesanError && (
            <div
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200"
              role="alert"
            >
              {pesanError}
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleBayar}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-brand-orange hover:bg-orange-600 text-white font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Memproses..." : `Bayar ${formatRupiah(tagihan.totalBayar)} Sekarang`}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
