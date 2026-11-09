"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Layers,
  ShieldAlert,
  Building2,
  Smartphone,
  X,
} from "lucide-react";
import type { DompetResponse } from "@/lib/validation/dompet";

interface Props {
  dompet: DompetResponse;
  statusVerifikasi?: string;
}

export default function DompetUI({
  dompet,
  statusVerifikasi = "BELUM_TERVERIFIKASI",
}: Props) {
  const [tabAktif, setTabAktif] = useState<"mutasi" | "pencairan">("mutasi");
  const [bukaModal, setBukaModal] = useState(false);

  // Form pencairan state
  const [tipeRekening, setTipeRekening] = useState<"BANK" | "EWALLET">("BANK");
  const [nomorRekening, setNomorRekening] = useState("");
  const [nominalTarik, setNominalTarik] = useState<number | "">("");
  const [loadingTarik, setLoadingTarik] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);

  const terverifikasi = statusVerifikasi === "TERVERIFIKASI";

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

  const previewMasked = () => {
    const digits = nomorRekening.replace(/\D/g, "");
    if (!digits) return "–";
    if (digits.length >= 4) return `****${digits.slice(-4)}`;
    return `****${digits}`;
  };

  const handleAjukanPencairan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanError(null);
    setPesanSukses(null);

    const nominalAngka = Number(nominalTarik);
    if (!nominalAngka || nominalAngka < 10000) {
      setPesanError("Nominal pencairan minimal Rp 10.000");
      return;
    }

    if (nominalAngka > dompet.saldoTersedia) {
      setPesanError(
        `Nominal penarikan melebihi saldo tersedia (${formatRupiah(dompet.saldoTersedia)})`,
      );
      return;
    }

    const digits = nomorRekening.trim().replace(/\D/g, "");
    if (tipeRekening === "BANK") {
      if (digits.length < 10 || digits.length > 16) {
        setPesanError("Nomor rekening bank harus terdiri dari 10–16 digit angka");
        return;
      }
    } else {
      if (!digits.startsWith("08") || digits.length < 10 || digits.length > 13) {
        setPesanError("Nomor e-wallet harus diawali 08 dan memiliki panjang 10–13 digit");
        return;
      }
    }

    const rekeningTujuan = `${tipeRekening}:${digits}`;

    setLoadingTarik(true);
    try {
      const res = await fetch("/api/pencairan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nominal: nominalAngka,
          rekeningTujuan,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error?.message ||
            data.message ||
            "Gagal mengajukan pencairan dana",
        );
      }

      setPesanSukses(
        `Pengajuan pencairan dana sebesar ${formatRupiah(
          nominalAngka,
        )} berhasil diajukan dan sedang diproses.`,
      );
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setPesanError(msg);
      setLoadingTarik(false);
    }
  };

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

      {/* Peringatan jika TK belum terverifikasi */}
      {!terverifikasi && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5 flex items-start gap-3 text-amber-900">
          <ShieldAlert className="size-5 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
          <div className="text-sm">
            <h3 className="font-semibold">Akun Belum Terverifikasi</h3>
            <p className="mt-0.5">
              Identitas Anda belum terverifikasi oleh tim Customer Service. Untuk dapat
              mengajukan penarikan dana ke rekening bank atau e-wallet, silakan lengkapi
              verifikasi identitas Anda.
            </p>
            <Link
              href="/profil"
              className="mt-2 inline-flex items-center text-xs font-semibold text-amber-950 underline hover:no-underline"
            >
              Lengkapi Verifikasi di Profil &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Hero Card Saldo (Navy Card sesuai rancangan I-20) */}
      <section
        className="rounded-xl bg-[#0b1e41] p-6 text-white sm:p-7 shadow-xs space-y-4"
        aria-labelledby="saldo-title"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

          <div>
            {terverifikasi ? (
              <button
                type="button"
                onClick={() => {
                  setPesanError(null);
                  setPesanSukses(null);
                  setBukaModal(true);
                }}
                disabled={dompet.saldoTersedia < 10000}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUpRight className="size-4" aria-hidden="true" />
                Tarik Dana
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-2 text-xs font-medium text-slate-300">
                <ShieldAlert className="size-4 text-amber-400" aria-hidden="true" />
                Perlu Verifikasi KTP
              </span>
            )}
          </div>
        </div>

        {/* Informasi Breakdown jika ada dana tertahan dalam pencairan */}
        {selisihTertahan > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-300 border border-white/10">
            <span>
              Total saldo:{" "}
              <strong className="text-white font-semibold">
                {formatRupiah(dompet.saldo)}
              </strong>
            </span>
            <span>•</span>
            <span className="text-amber-300">
              Sedang dicairkan (DIPROSES):{" "}
              <strong className="font-semibold">{formatRupiah(selisihTertahan)}</strong>
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

      {/* Modal / Dialog Form Pencairan Dana (UC10) */}
      {bukaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-pencairan-title"
        >
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl space-y-5 animate-in fade-in-50 zoom-in-95">
            {/* Header Dialog */}
            <div className="flex items-center justify-between border-b pb-3">
              <h2
                id="modal-pencairan-title"
                className="text-lg font-bold text-foreground flex items-center gap-2"
              >
                <ArrowUpRight className="size-5 text-brand-orange" aria-hidden="true" />
                Tarik Dana ke Rekening / E-Wallet
              </h2>
              <button
                type="button"
                onClick={() => setBukaModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Tutup dialog"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            {/* Alert Error / Sukses */}
            {pesanError && (
              <div
                className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 border border-rose-200 flex items-start gap-2"
                role="alert"
              >
                <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{pesanError}</span>
              </div>
            )}

            {pesanSukses && (
              <div
                className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-200 flex items-start gap-2"
                role="alert"
              >
                <CheckCircle2 className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{pesanSukses}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAjukanPencairan} className="space-y-4">
              {/* Info Saldo Tersedia */}
              <div className="rounded-lg bg-muted/60 p-3 text-xs flex justify-between items-center">
                <span className="text-muted-foreground">Saldo Tersedia:</span>
                <span className="font-bold text-foreground text-sm">
                  {formatRupiah(dompet.saldoTersedia)}
                </span>
              </div>

              {/* Pilihan Jenis Tujuan */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                  Tipe Rekening Tujuan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTipeRekening("BANK");
                      setPesanError(null);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-all ${
                      tipeRekening === "BANK"
                        ? "border-brand-orange bg-orange-50 text-orange-950 font-bold"
                        : "border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    <Building2 className="size-4 text-brand-orange" aria-hidden="true" />
                    Rekening Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTipeRekening("EWALLET");
                      setPesanError(null);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-all ${
                      tipeRekening === "EWALLET"
                        ? "border-brand-orange bg-orange-50 text-orange-950 font-bold"
                        : "border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    <Smartphone className="size-4 text-brand-orange" aria-hidden="true" />
                    E-Wallet (GoPay/DANA)
                  </button>
                </div>
              </div>

              {/* Input Nomor Rekening / E-Wallet */}
              <div>
                <label
                  htmlFor="nomorRekening"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  {tipeRekening === "BANK"
                    ? "Nomor Rekening Bank (10–16 digit)"
                    : "Nomor E-Wallet (Diawali 08, 10–13 digit)"}
                </label>
                <input
                  id="nomorRekening"
                  type="text"
                  required
                  placeholder={tipeRekening === "BANK" ? "Contoh: 1234567890" : "Contoh: 08123456789"}
                  value={nomorRekening}
                  onChange={(e) => setNomorRekening(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand-orange"
                />
                <p className="mt-1 text-xs text-muted-foreground flex justify-between">
                  <span>Pratinjau tampilan:</span>
                  <span className="font-mono font-semibold">{previewMasked()}</span>
                </p>
              </div>

              {/* Input Nominal Pencairan */}
              <div>
                <label
                  htmlFor="nominalTarik"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  Nominal Penarikan (Rp)
                </label>
                <input
                  id="nominalTarik"
                  type="number"
                  min={10000}
                  max={dompet.saldoTersedia}
                  step={1000}
                  required
                  placeholder="Minimal 10.000"
                  value={nominalTarik}
                  onChange={(e) =>
                    setNominalTarik(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand-orange font-semibold"
                />
                {/* Chip Pilihan Cepat */}
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {[50000, 100000, 200000].map((nominal) => (
                    <button
                      key={nominal}
                      type="button"
                      disabled={dompet.saldoTersedia < nominal}
                      onClick={() => setNominalTarik(nominal)}
                      className="rounded-md border border-border px-2.5 py-1 text-muted-foreground hover:bg-muted disabled:opacity-40"
                    >
                      {formatRupiah(nominal)}
                    </button>
                  ))}
                  {dompet.saldoTersedia >= 10000 && (
                    <button
                      type="button"
                      onClick={() => setNominalTarik(dompet.saldoTersedia)}
                      className="rounded-md border border-brand-orange bg-orange-50 px-2.5 py-1 text-brand-orange font-semibold hover:bg-orange-100"
                    >
                      Tarik Semua
                    </button>
                  )}
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setBukaModal(false)}
                  disabled={loadingTarik}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingTarik || dompet.saldoTersedia < 10000}
                  className="rounded-lg bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {loadingTarik ? "Memproses..." : "Ajukan Pencairan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
