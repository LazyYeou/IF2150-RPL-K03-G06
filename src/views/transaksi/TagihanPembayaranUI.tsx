"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, ShieldCheck, AlertCircle, RotateCcw } from "lucide-react";
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
}> = [
  {
    id: "VA_BCA",
    nama: "BCA Virtual Account",
    deskripsi: "Bayar otomatis melalui ATM, m-BCA, atau KlikBCA",
  },
  {
    id: "VA_BNI",
    nama: "BNI Virtual Account",
    deskripsi: "Bayar melalui BNI Mobile Banking atau ATM BNI",
  },
  {
    id: "QRIS",
    nama: "QRIS",
    deskripsi: "Pindai kode QR dari GoPay, OVO, Dana, BCA, atau bank apa saja",
  },
  {
    id: "EWALLET",
    nama: "Dompet Digital (E-Wallet)",
    deskripsi: "Pembayaran langsung terhubung dengan dompet digital mitra",
  },
];

function formatLabelStatus(status: string): string {
  const map: Record<string, string> = {
    MENUNGGU_PEMBAYARAN: "Menunggu Pembayaran",
    DIPROSES: "Sedang Diproses",
    BERHASIL: "Berhasil",
    GAGAL: "Gagal",
    KEDALUWARSA: "Kedaluwarsa",
    DIKEMBALIKAN: "Dikembalikan",
  };
  return map[status] ?? status.replace(/_/g, " ");
}

export default function TagihanPembayaranUI({
  transaksi,
  tagihan,
}: TagihanPembayaranUIProps) {
  const [metodeDipilih, setMetodeDipilih] = useState<MetodePembayaran>(
    (tagihan.metode as MetodePembayaran) || "VA_BCA",
  );
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [membuatUlang, setMembuatUlang] = useState(false);

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
    ((tagihan.status === "MENUNGGU_PEMBAYARAN" || tagihan.status === "DIPROSES") &&
      new Date(tagihan.expiry).getTime() <= Date.now());

  const isGagal = tagihan.status === "GAGAL";

  const handleBayar = async () => {
    if (isKedaluwarsa) {
      setPesanError("Tagihan ini telah kedaluwarsa. Silakan buat tagihan baru.");
      return;
    }
    if (isGagal) {
      setPesanError("Tagihan ini telah gagal. Silakan buat tagihan baru.");
      return;
    }
    if (!metodeDipilih) {
      setPesanError("Silakan pilih metode pembayaran terlebih dahulu.");
      return;
    }

    setLoading(true);
    setPesanError(null);

    try {
      const res = await fetch(`/api/tagihan/${tagihan.id}/bayar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metode: metodeDipilih }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || "Gagal memproses pembayaran");
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        window.location.reload();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setPesanError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBuatTagihanBaru = async () => {
    setMembuatUlang(true);
    setPesanError(null);

    try {
      const res = await fetch(`/api/transaksi/${transaksi.id}/tagihan`, {
        method: "POST",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || "Gagal membuat tagihan baru");
      }

      // Berhasil membuat tagihan baru, muat ulang halaman untuk menampilkan tagihan baru
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat tagihan baru";
      setPesanError(msg);
      setMembuatUlang(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tombol Kembali */}
      <Link
        href={`/pk/transaksi/${transaksi.id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kembali ke detail transaksi
      </Link>

      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Tagihan Pembayaran Pekerjaan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Selesaikan pembayaran untuk memulai pengerjaan lowongan secara aman.
        </p>
      </div>

      {/* Ringkasan Transaksi */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-base font-semibold text-foreground">
            Ringkasan Pekerjaan
          </h2>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              isKedaluwarsa
                ? "bg-rose-50 text-rose-800 border-rose-200"
                : isGagal
                ? "bg-rose-50 text-rose-800 border-rose-200"
                : tagihan.status === "BERHASIL"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            {isKedaluwarsa
              ? "Kedaluwarsa"
              : isGagal
              ? "Gagal"
              : formatLabelStatus(tagihan.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-muted-foreground block">Judul Lowongan:</span>
            <span className="font-medium text-foreground">{transaksi.judul}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Tenaga Kerja Terpilih:</span>
            <span className="font-medium text-foreground">{transaksi.namaTenagaKerja}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Nomor Invoice:</span>
            <span className="font-mono text-xs text-muted-foreground">{tagihan.id}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">ID Transaksi:</span>
            <span className="font-mono text-xs text-muted-foreground">{transaksi.id}</span>
          </div>
        </div>
      </div>

      {/* Rincian Biaya */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Rincian Pembayaran
        </h2>
        <div className="divide-y divide-border text-sm">
          <div className="flex justify-between py-2.5">
            <span className="text-muted-foreground">Upah Tenaga Kerja</span>
            <span className="font-medium text-foreground">{formatRupiah(tagihan.nominalUpah)}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-muted-foreground">Biaya Layanan &amp; Pemrosesan</span>
            <span className="font-medium text-foreground">{formatRupiah(tagihan.commissionFee)}</span>
          </div>
          <div className="flex justify-between pt-3 pb-1 text-base font-bold text-navy">
            <span>Total Pembayaran</span>
            <span className="text-xl font-semibold text-brand-orange">{formatRupiah(tagihan.totalBayar)}</span>
          </div>
        </div>
      </div>

      {/* Batas Waktu Pembayaran */}
      <div
        className={`rounded-xl border p-4 sm:p-5 flex items-start gap-3 ${
          isKedaluwarsa || isGagal
            ? "bg-rose-50 border-rose-200 text-rose-900"
            : "bg-amber-50 border-amber-200 text-amber-900"
        }`}
      >
        {isKedaluwarsa || isGagal ? (
          <AlertCircle className="size-5 shrink-0 text-rose-600 mt-0.5" aria-hidden="true" />
        ) : (
          <Clock className="size-5 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
        )}
        <div className="text-sm">
          <h3 className="font-semibold">
            {isKedaluwarsa
              ? "Batas Waktu Telah Berakhir"
              : isGagal
              ? "Status Pembayaran Gagal"
              : "Batas Waktu Pembayaran"}
          </h3>
          <p className="mt-0.5">
            {isKedaluwarsa ? (
              <span>Tagihan ini telah kedaluwarsa pada {formatWaktu(tagihan.expiry)}.</span>
            ) : isGagal ? (
              <span>Pembayaran tagihan ini dinyatakan gagal oleh sistem gateway pembayaran.</span>
            ) : (
              <span>
                Harap selesaikan pembayaran sebelum{" "}
                <strong>{formatWaktu(tagihan.expiry)}</strong> agar pekerjaan dapat dimulai.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Pesan UI dan Tombol Buat Tagihan Baru untuk Gagal / Kedaluwarsa (UC07 alt1/alt2) */}
      {(isKedaluwarsa || isGagal) && (
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isGagal ? "Coba Pembayaran Kembali" : "Perbarui Tagihan"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isGagal
                ? "Pembayaran sebelumnya tidak berhasil. Anda dapat membuat tagihan baru untuk mencoba metode pembayaran lain atau mengulang proses pembayaran."
                : "Karena batas waktu pembayaran telah lewat, silakan buat tagihan baru dengan batas waktu 24 jam ke depan."}
            </p>
          </div>

          {pesanError && (
            <div
              className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 border border-rose-200"
              role="alert"
            >
              {pesanError}
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleBuatTagihanBaru}
              disabled={membuatUlang}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              {membuatUlang ? "Membuat Tagihan Baru..." : "Buat Tagihan Baru / Bayar Ulang"}
            </button>
          </div>
        </div>
      )}

      {/* Pilihan Metode Pembayaran jika Masih Aktif */}
      {!isKedaluwarsa && !isGagal && tagihan.status === "MENUNGGU_PEMBAYARAN" && (
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-base font-semibold text-foreground">
            Pilih Metode Pembayaran
          </h2>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            role="radiogroup"
            aria-label="Metode Pembayaran"
          >
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
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-brand-orange bg-orange-50/50 ring-2 ring-brand-orange/40"
                      : "border-border hover:border-gray-400 bg-background"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{m.nama}</p>
                      <p className="text-xs text-muted-foreground mt-1">{m.deskripsi}</p>
                    </div>
                    <div
                      className={`size-4 shrink-0 mt-0.5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? "border-brand-orange bg-brand-orange"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {pesanError && (
            <div
              className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 border border-rose-200"
              role="alert"
            >
              {pesanError}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>Dana Anda disimpan aman dalam rekening penampung (Escrow).</span>
            </div>

            <button
              type="button"
              onClick={handleBayar}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Memproses..." : `Bayar ${formatRupiah(tagihan.totalBayar)} Sekarang`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
