"use client";
import { useState } from "react";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { z } from "zod";
import type { TransaksiDetail } from "@/lib/validation/transaksi";

type Props = {
  idTransaksi?: string;
  transaksi: z.infer<typeof TransaksiDetail>;
};

export default function DetailTransaksi({ transaksi, idTransaksi }: Props) {
  const toast = useToast();
  const [pesan, setPesan] = useState("");
  const [mengirim, setMengirim] = useState(false);

  const rupiah = (nilai: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(nilai);

  const statusLabelBersih = transaksi.labelStatus.replace(/_/g, " ");
  const perluBayar = !idTransaksi && transaksi.status === "MENUNGGU_PEMBAYARAN";
  const targetIdTransaksi = transaksi.id || idTransaksi;

  async function kirimBukti(form: FormData) {
    const input = form.get("berkas");
    if (!(input instanceof File) || input.size === 0) {
      setPesan("Pilih berkas bukti pekerjaan.");
      return;
    }
    setMengirim(true);
    setPesan("");
    try {
      let berkas = input;
      if (input.type.startsWith("image/")) {
        berkas = await imageCompression(input, {
          maxSizeMB: 2,
          maxWidthOrHeight: 2400,
          useWebWorker: true,
          fileType: input.type,
        });
        if (berkas.size > 2 * 1024 * 1024) {
          setPesan(
            "Gambar belum dapat dikompres hingga 2 MB. Pilih gambar yang lebih kecil.",
          );
          return;
        }
      }
      if (berkas.size > 10 * 1024 * 1024) {
        setPesan("Ukuran berkas maksimal 10 MB.");
        return;
      }
      form.set("berkas", berkas, berkas.name || input.name);
      const response = await fetch(
        `/api/transaksi/${targetIdTransaksi}/bukti`,
        {
          method: "POST",
          body: form,
        },
      );
      const json = await response.json();
      if (!response.ok) {
        setPesan(json.error?.message ?? "Bukti belum dapat dikirim.");
        return;
      }
      toast("Bukti pekerjaan berhasil dikirim.");
      window.location.reload();
    } catch {
      setPesan("Bukti belum dapat dikirim. Periksa koneksi dan coba lagi.");
    } finally {
      setMengirim(false);
    }
  }

  return (
    <section className="space-y-6">
      {/* Ringkasan Transaksi */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Ringkasan Transaksi
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {transaksi.judul}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-sm">
          <div>
            <span className="text-muted-foreground block text-xs">
              Status saat ini:
            </span>
            <span className="inline-block mt-1 font-semibold text-brand-orange bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 text-xs">
              {statusLabelBersih}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">
              Tenaga Kerja:
            </span>
            <span className="font-medium text-foreground">
              {transaksi.tenagaKerja.nama}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">
              Penyedia Kerja:
            </span>
            <span className="font-medium text-foreground">
              {transaksi.penyediaKerja.nama}
            </span>
          </div>
        </div>
      </div>

      {/* Form Kirim Bukti jika Tenaga Kerja & status IN_PROGRESS */}
      {idTransaksi && transaksi.status === "IN_PROGRESS" && (
        <form
          className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4"
          action={async (form) => kirimBukti(form)}
        >
          <h2 className="text-lg font-semibold text-foreground">
            Kirim bukti penyelesaian
          </h2>
          {pesan && (
            <p role="alert" className="text-sm text-rose-600">
              {pesan}
            </p>
          )}
          <label
            htmlFor="deskripsi"
            className="block text-sm font-medium text-foreground"
          >
            Deskripsi pengerjaan
          </label>
          <textarea
            id="deskripsi"
            name="deskripsi"
            minLength={10}
            maxLength={1000}
            required
            className="min-h-28 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          <p className="text-sm text-muted-foreground">
            Deskripsi 10–1000 karakter.
          </p>
          <label
            htmlFor="berkas"
            className="block text-sm font-medium text-foreground"
          >
            Berkas bukti (JPG, PNG, atau PDF; maksimal 10 MB)
          </label>
          <input
            id="berkas"
            name="berkas"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            required
            className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
          />
          <p className="text-sm text-muted-foreground">
            Gambar dikompres hingga maksimal 2 MB sebelum dikirim.
          </p>
          <Button type="submit" disabled={mengirim}>
            {mengirim ? "Mengirim..." : "Kirim bukti"}
          </Button>
        </form>
      )}

      <section
        className="rounded-lg border p-5"
        aria-labelledby="bukti-heading"
      >
        <h2 id="bukti-heading" className="text-lg font-semibold">
          Bukti pekerjaan
        </h2>
        {transaksi.bukti.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Belum ada bukti pekerjaan yang dikirim.
          </p>
        ) : (
          <ol className="mt-4 space-y-4">
            {transaksi.bukti.map((bukti, index) => (
              <li key={bukti.id} className="rounded-lg border p-4">
                <h3 className="font-medium">Bukti {index + 1}</h3>
                <time
                  dateTime={bukti.waktu}
                  className="text-sm text-muted-foreground"
                >
                  {new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "long",
                    timeStyle: "short",
                    timeZone: "Asia/Jakarta",
                  }).format(new Date(bukti.waktu))}{" "}
                  WIB
                </time>
                <p className="mt-3 whitespace-pre-wrap break-words">
                  {bukti.deskripsi}
                </p>
                <a
                  href={bukti.urlBerkas}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-11 items-center rounded px-3 font-medium text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Buka berkas bukti {index + 1} (tab baru)
                </a>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Rincian Biaya */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Rincian Biaya
          </h2>
          {perluBayar && targetIdTransaksi && (
            <Link
              href={`/pk/transaksi/${targetIdTransaksi}/bayar`}
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
              <span className="text-muted-foreground">
                Biaya Layanan Platform
              </span>
              <span className="font-medium">
                {rupiah(transaksi.commissionFee)}
              </span>
            </div>
          )}
          {transaksi.totalBayar !== undefined && (
            <div className="flex justify-between py-2.5 text-base font-bold text-navy">
              <span>Total Pembayaran</span>
              <span className="text-brand-orange">
                {rupiah(transaksi.totalBayar)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Status Pengerjaan */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Status Pengerjaan
        </h2>
        <ol className="space-y-3 pt-2">
          {transaksi.timeline.map((item) => (
            <li
              key={item.status}
              aria-current={item.aktif ? "step" : undefined}
              className={`flex items-center gap-3 text-sm ${
                item.aktif
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <span
                role="img"
                aria-label={
                  item.tercapai
                    ? "Tahap sudah tercapai"
                    : "Tahap belum tercapai"
                }
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
