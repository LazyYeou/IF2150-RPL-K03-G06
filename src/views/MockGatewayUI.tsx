"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  tagihan: {
    id: string;
    idTransaksi: string;
    nominalUpah: number;
    commissionFee: number;
    totalBayar: number;
    metode: string | null;
    status: string;
  };
  transaksi: {
    idTransaksi: string;
    judulLowongan: string;
    namaTenagaKerja: string;
    statusPekerjaan: string;
  };
}

export default function MockGatewayUI({ tagihan, transaksi }: Props) {
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState<{ tipe: "sukses" | "error"; teks: string } | null>(null);

  const formatRupiah = (nilai: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(nilai);

  const handleSimulasi = async (status: "BERHASIL" | "GAGAL" | "KEDALUWARSA") => {
    setLoading(true);
    setPesan(null);

    try {
      const res = await fetch("/api/mock-gateway/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idTagihan: tagihan.id, status }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Gagal memproses simulasi webhook");
      }

      setPesan({
        tipe: "sukses",
        teks: `Simulasi webhook '${status}' berhasil diproses! Mengalihkan ke transaksi...`,
      });

      setTimeout(() => {
        window.location.href = data.redirectUrl || `/pk/transaksi/${tagihan.idTransaksi}`;
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setPesan({ tipe: "error", teks: msg });
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-10 px-4 sm:px-6 space-y-6">
      <Link
        href={`/pk/transaksi/${tagihan.idTransaksi}/bayar`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kembali ke halaman pembayaran
      </Link>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              SIMULATOR PAYMENT GATEWAY
            </span>
            <h1 className="mt-2 text-2xl font-bold text-foreground">
              Simulasi Gateway Pembayaran (I-34)
            </h1>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Halaman ini mensimulasikan gerbang pembayaran eksternal (seperti Midtrans/Xendit) untuk
          lingkungan pengujian lokal. Menekan salah satu tombol di bawah akan menandatangani
          payload dengan HMAC-SHA256 dan mengirim callback webhook resmi ke{" "}
          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
            /api/webhooks/payment
          </code>
          .
        </p>

        {/* Info Tagihan */}
        <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2 border">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID Tagihan:</span>
            <span className="font-mono text-xs font-medium">{tagihan.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pekerjaan:</span>
            <span className="font-medium text-foreground">{transaksi.judulLowongan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tenaga Kerja:</span>
            <span className="font-medium text-foreground">{transaksi.namaTenagaKerja}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Metode Pembayaran:</span>
            <span className="font-medium text-foreground">
              {tagihan.metode ? tagihan.metode.replace(/_/g, " ") : "Belum ditentukan"}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t font-semibold">
            <span>Total yang Harus Dibayar:</span>
            <span className="text-brand-orange text-base">{formatRupiah(tagihan.totalBayar)}</span>
          </div>
        </div>

        {/* Pesan Feedback */}
        {pesan && (
          <div
            className={`rounded-lg p-3 text-sm border ${
              pesan.tipe === "sukses"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
            role="alert"
          >
            {pesan.teks}
          </div>
        )}

        {/* Tombol-tombol Simulasi */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-semibold text-foreground">
            Pilih Hasil Simulasi Gateway:
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSimulasi("BERHASIL")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
              Bayar Berhasil
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSimulasi("GAGAL")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors disabled:opacity-50"
            >
              <XCircle className="size-4 shrink-0" aria-hidden="true" />
              Simulasi Gagal
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSimulasi("KEDALUWARSA")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-xs hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
              Kedaluwarsa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
