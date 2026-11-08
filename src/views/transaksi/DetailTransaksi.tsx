"use client";
import { useState } from "react";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Props = {
  idTransaksi?: string;
  transaksi: {
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
    if (!(input instanceof File)) {
      setPesan("Pilih berkas bukti pekerjaan.");
      return;
    }
    setMengirim(true);
    setPesan("");
    try {
      let berkas = input;
      if (input.type.startsWith("image/")) {
        berkas = await imageCompression(input, {
          maxSizeMB: 9,
          maxWidthOrHeight: 2400,
          useWebWorker: true,
          fileType: input.type,
        });
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
        <p>Status saat ini: <strong>{transaksi.labelStatus}</strong></p>
        <p>Tenaga kerja: {transaksi.tenagaKerja}</p>
        <p>Penyedia kerja: {transaksi.penyediaKerja}</p>
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
            maxLength={2000}
            required
            className="min-h-28 w-full rounded border px-3 py-2"
          />
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
          <Button type="submit" disabled={mengirim}>
            {mengirim ? "Mengirim..." : "Kirim bukti"}
          </Button>
        </form>
      )}

      <div className="card">
        <h2>Rincian biaya</h2>
        <p>Upah: {rupiah(transaksi.nominalUpah)}</p>
        {transaksi.commissionFee !== undefined && (
          <p>Biaya layanan: {rupiah(transaksi.commissionFee)}</p>
        )}
        {transaksi.totalBayar !== undefined && (
          <p><strong>Total: {rupiah(transaksi.totalBayar)}</strong></p>
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
