"use client";

import { useState } from "react";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Layers,
} from "lucide-react";
import type { DompetResponse } from "@/lib/validation/dompet";

interface Props {
  dompet: DompetResponse;
}

export default function DompetUI({ dompet }: Props) {
  const [tabAktif, setTabAktif] = useState<"mutasi" | "pencairan">("mutasi");

  const formatRupiah = (nilai: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(nilai);

  const formatWaktu = (iso: string) => {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return iso;
    }
  };

  const parseKunciOperasi = (kunci: string) => {
    if (kunci.startsWith("upah:")) {
      return {
        judul: "Kredit Upah Pekerjaan",
        tipe: "KREDIT",
        ref: kunci.replace("upah:", ""),
      };
    }
    if (kunci.startsWith("cair:")) {
      return {
        judul: "Pencairan Saldo",
        tipe: "DEBIT",
        ref: kunci.replace("cair:", ""),
      };
    }
    return {
      judul: "Penyesuaian Saldo",
      tipe: kunci.includes("seed") ? "KREDIT" : "MUTASI",
      ref: kunci,
    };
  };

  const formatStatusPencairan = (status: string) => {
    switch (status) {
      case "BERHASIL":
        return {
          label: "Berhasil",
          warna: "bg-emerald-50 text-emerald-800 border-emerald-200",
          ikon: CheckCircle2,
        };
      case "DIPROSES":
      case "MENUNGGU_PROSES":
        return {
          label: "Diproses",
          warna: "bg-amber-50 text-amber-800 border-amber-200",
          ikon: Clock,
        };
      case "DITOLAK":
        return {
          label: "Ditolak",
          warna: "bg-rose-50 text-rose-800 border-rose-200",
          ikon: XCircle,
        };
      case "GAGAL":
        return {
          label: "Gagal",
          warna: "bg-rose-50 text-rose-800 border-rose-200",
          ikon: AlertCircle,
        };
      default:
        return {
          label: status.replace(/_/g, " "),
          warna: "bg-muted text-muted-foreground border-border",
          ikon: Clock,
        };
    }
  };

  const selisihTertahan = Math.max(0, dompet.saldo - dompet.saldoTersedia);

  return (
    <div className="space-y-6">
      {/* Header Halaman (Sesuai I-20) */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Pekerjaan & pembayaran
        </p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Dompet
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pantau pendapatan, riwayat mutasi, dan kelola pencairan upahmu.
        </p>
      </div>

      {/* Hero Card Saldo (Navy Card sesuai rancangan I-20) */}
      <section
        className="rounded-xl bg-[#0b1e41] p-6 text-white sm:p-7 shadow-xs space-y-4"
        aria-labelledby="saldo-title"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-white/10 text-brand-orange">
              <Wallet className="size-6" aria-hidden="true" />
            </div>
            <div>
              <p id="saldo-title" className="text-xs font-medium text-slate-300">
                Saldo tersedia
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
                {formatRupiah(dompet.saldoTersedia)}
              </h2>
            </div>
          </div>
        </div>

        {/* Informasi Breakdown jika ada dana tertahan dalam pencairan */}
        {selisihTertahan > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-300 border border-white/10">
            <span>
              Total saldo: <strong className="text-white font-semibold">{formatRupiah(dompet.saldo)}</strong>
            </span>
            <span>•</span>
            <span className="text-amber-300">
              Sedang dicairkan: <strong className="font-semibold">{formatRupiah(selisihTertahan)}</strong>
            </span>
          </div>
        )}

        <p className="text-xs leading-relaxed text-slate-300 pt-1">
          Penghasilan dapat dicairkan setelah pekerjaan selesai dan pembayaran dikonfirmasi.
        </p>
      </section>

      {/* Navigasi Tab Riwayat */}
      <div className="border-b border-border">
        <nav className="flex space-x-6" aria-label="Tabs Riwayat">
          <button
            type="button"
            onClick={() => setTabAktif("mutasi")}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              tabAktif === "mutasi"
                ? "border-brand-orange text-brand-orange"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="size-4" aria-hidden="true" />
            Riwayat Mutasi Saldo
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground font-normal">
              {dompet.mutasi.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTabAktif("pencairan")}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              tabAktif === "pencairan"
                ? "border-brand-orange text-brand-orange"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowUpRight className="size-4" aria-hidden="true" />
            Riwayat Pencairan
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground font-normal">
              {dompet.pencairan.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Konten Tab 1: Riwayat Mutasi Saldo (Buku Besar) */}
      {tabAktif === "mutasi" && (
        <section
          className="rounded-xl border border-border bg-card shadow-xs overflow-hidden"
          aria-labelledby="mutasi-heading"
        >
          <div className="p-4 sm:p-5 border-b border-border">
            <h2 id="mutasi-heading" className="text-base font-semibold text-foreground">
              Riwayat Mutasi Saldo
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Catatan transaksi buku besar pendapatan dan penarikan saldo Anda.
            </p>
          </div>

          {dompet.mutasi.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Belum ada riwayat mutasi saldo.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {dompet.mutasi.map((m) => {
                const info = parseKunciOperasi(m.kunciOperasi);
                const isKredit = m.nominal > 0;
                return (
                  <li
                    key={m.kunciOperasi}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                          isKredit
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {isKredit ? (
                          <ArrowDownLeft className="size-5" aria-hidden="true" />
                        ) : (
                          <ArrowUpRight className="size-5" aria-hidden="true" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {info.judul}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatWaktu(m.createdAt)} • Ref:{" "}
                          <span className="font-mono text-[11px]">{m.kunciOperasi}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm sm:text-base font-bold ${
                          isKredit ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isKredit ? "+" : ""}
                        {formatRupiah(m.nominal)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* Konten Tab 2: Riwayat Pencairan Dana */}
      {tabAktif === "pencairan" && (
        <section
          className="rounded-xl border border-border bg-card shadow-xs overflow-hidden"
          aria-labelledby="pencairan-heading"
        >
          <div className="p-4 sm:p-5 border-b border-border">
            <h2 id="pencairan-heading" className="text-base font-semibold text-foreground">
              Riwayat Pengajuan Pencairan
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daftar penarikan dana ke rekening bank atau e-wallet Anda.
            </p>
          </div>

          {dompet.pencairan.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Belum ada riwayat pencairan dana.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {dompet.pencairan.map((p) => {
                const statusInfo = formatStatusPencairan(p.status);
                const StatusIcon = statusInfo.ikon;
                return (
                  <li
                    key={p.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground mt-0.5">
                        <ArrowUpRight className="size-5" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            Pencairan ke {p.rekeningMasked}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusInfo.warna}`}
                          >
                            <StatusIcon className="size-3" aria-hidden="true" />
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Diajukan pada {formatWaktu(p.waktuPengajuan)} • ID:{" "}
                          <span className="font-mono text-[11px]">{p.id}</span>
                        </p>
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-sm sm:text-base font-bold text-foreground">
                        {formatRupiah(p.nominal)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
