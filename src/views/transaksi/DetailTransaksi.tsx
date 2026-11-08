"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";

type Props = {
  transaksi: {
    id?: string;
    judul: string;
    status: string;
    labelStatus: string;
    nominalUpah: number;
    commissionFee?: number;
    totalBayar?: number;
    tenagaKerja: string;
    penyediaKerja: string;
    timeline: Array<{ status: string; label: string; aktif: boolean; tercapai: boolean }>;
  };
};

export default function DetailTransaksi({ transaksi }: Props) {
  const rupiah = (nilai: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(nilai);

  const statusLabelBersih = transaksi.labelStatus.replace(/_/g, " ");
  const perluBayar = transaksi.status === "MENUNGGU_PEMBAYARAN";

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Ringkasan Transaksi
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {transaksi.judul}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-sm">
          <div>
            <span className="text-muted-foreground block text-xs">Status saat ini:</span>
            <span className="inline-block mt-1 font-semibold text-brand-orange bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 text-xs">
              {statusLabelBersih}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">Tenaga Kerja:</span>
            <span className="font-medium text-foreground">{transaksi.tenagaKerja}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">Penyedia Kerja:</span>
            <span className="font-medium text-foreground">{transaksi.penyediaKerja}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Rincian Biaya</h2>
          {perluBayar && transaksi.id && (
            <Link
              href={`/pk/transaksi/${transaksi.id}/bayar`}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-orange-600 transition-colors"
            >
              <CreditCard className="size-4" aria-hidden="true" />
              Bayar Sekarang
            </Link>
          )}
        </div>
        <div className="divide-y divide-border text-sm pt-2">
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Upah Tenaga Kerja</span>
            <span className="font-medium">{rupiah(transaksi.nominalUpah)}</span>
          </div>
          {transaksi.commissionFee !== undefined && (
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Biaya Layanan Platform</span>
              <span className="font-medium">{rupiah(transaksi.commissionFee)}</span>
            </div>
          )}
          {transaksi.totalBayar !== undefined && (
            <div className="flex justify-between py-2.5 text-base font-bold text-navy">
              <span>Total Pembayaran</span>
              <span className="text-brand-orange">{rupiah(transaksi.totalBayar)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Status Pengerjaan</h2>
        <ol className="space-y-3 pt-2">
          {transaksi.timeline.map((item) => (
            <li
              key={item.status}
              className={`flex items-center gap-3 text-sm ${
                item.aktif ? "font-semibold text-foreground" : "text-muted-foreground"
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  item.tercapai
                    ? "bg-emerald-100 text-emerald-700"
                    : item.aktif
                    ? "bg-brand-orange text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {item.tercapai ? "✓" : "○"}
              </span>
              <span>{item.label.replace(/_/g, " ")}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
