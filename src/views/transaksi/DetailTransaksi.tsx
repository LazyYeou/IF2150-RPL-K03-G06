"use client";
import { useState } from "react";
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
      const response = await fetch(`/api/transaksi/${idTransaksi}/bukti`, {
        method: "POST",
        body: form,
      });
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
      <div className="card">
        <p className="text-sm">Ringkasan transaksi</p>
        <h1>{transaksi.judul}</h1>
        <p>
          Status saat ini: <strong>{transaksi.labelStatus}</strong>
        </p>
        <p>Tenaga kerja: {transaksi.tenagaKerja.nama}</p>
        <p>Penyedia kerja: {transaksi.penyediaKerja.nama}</p>
      </div>

      {idTransaksi && transaksi.status === "IN_PROGRESS" && (
        <form
          className="card space-y-4"
          action={async (form) => kirimBukti(form)}
        >
          <h2>Kirim bukti penyelesaian</h2>
          {pesan && <p role="alert">{pesan}</p>}
          <label htmlFor="deskripsi" className="block text-sm font-medium">
            Deskripsi pengerjaan
          </label>
          <textarea
            id="deskripsi"
            name="deskripsi"
            minLength={10}
            maxLength={1000}
            required
            className="min-h-28 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-muted-foreground">
            Deskripsi 10–1000 karakter.
          </p>
          <label htmlFor="berkas" className="block text-sm font-medium">
            Berkas bukti (JPG, PNG, atau PDF; maksimal 10 MB)
          </label>
          <input
            id="berkas"
            name="berkas"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            required
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

      <div className="card">
        <h2>Rincian biaya</h2>
        <p>Upah: {rupiah(transaksi.nominalUpah)}</p>
        {transaksi.commissionFee !== undefined && (
          <p>Biaya layanan: {rupiah(transaksi.commissionFee)}</p>
        )}
        {transaksi.totalBayar !== undefined && (
          <p>
            <strong>Total: {rupiah(transaksi.totalBayar)}</strong>
          </p>
        )}
      </div>

      <div className="card">
        <h2>Status transaksi</h2>
        <ol className="space-y-3">
          {transaksi.timeline.map((item) => (
            <li key={item.status} className={item.aktif ? "font-bold" : ""}>
              {item.tercapai ? "✓" : "○"} {item.label}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
