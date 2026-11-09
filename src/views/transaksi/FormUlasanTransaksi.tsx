"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Star } from "lucide-react";

export default function FormUlasanTransaksi({
  idTransaksi,
  judul,
  namaPenerima,
  peran,
  sudahDiulas,
}: {
  idTransaksi: string;
  judul: string;
  namaPenerima: string;
  peran: "PK" | "TK";
  sudahDiulas: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [nilai, setNilai] = useState<number | null>(null);
  const [pesan, setPesan] = useState("");
  const [mengirim, setMengirim] = useState(false);
  const [terkunci, setTerkunci] = useState(sudahDiulas);
  const tujuanTransaksi =
    peran === "PK" ? `/pk/transaksi/${idTransaksi}` : `/tk/pekerjaan/${idTransaksi}`;

  async function kirimUlasan(form: FormData) {
    setMengirim(true);
    setPesan("");
    try {
      const response = await fetch(`/api/transaksi/${idTransaksi}/ulasan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nilai: Number(form.get("nilai")),
          deskripsi: form.get("deskripsi"),
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        if (json.error?.code === "ULASAN_GANDA") setTerkunci(true);
        setPesan(json.error?.message ?? "Ulasan belum dapat disimpan.");
        return;
      }
      toast("Ulasan berhasil dikirim.");
      router.push(tujuanTransaksi);
    } catch {
      setPesan("Ulasan belum dapat disimpan. Periksa koneksi dan coba lagi.");
    } finally {
      setMengirim(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-5 rounded-xl border border-border bg-card p-5 shadow-xs sm:p-7">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Ulasan pekerjaan
        </p>
        <h1 className="mt-2 text-2xl font-semibold">{judul}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Berikan penilaian untuk {namaPenerima}.
        </p>
      </div>
      {terkunci ? (
        <div className="space-y-4">
          <p role="status" className="text-sm text-emerald-700">
            Anda sudah memberikan ulasan untuk transaksi ini.
          </p>
          <Link
            href={tujuanTransaksi}
            className="text-sm font-medium underline underline-offset-2"
          >
            Kembali ke transaksi
          </Link>
        </div>
      ) : (
        <form action={kirimUlasan} className="space-y-5">
          {pesan && (
            <p role="alert" className="text-sm text-rose-600">
              {pesan}
            </p>
          )}
          <fieldset>
            <legend className="text-sm font-medium">Penilaian (wajib)</legend>
            <div
              role="radiogroup"
              aria-label="Penilaian bintang"
              className="mt-2 flex gap-2"
            >
              {[5, 4, 3, 2, 1].map((bintang) => (
                <label key={bintang} className="cursor-pointer">
                  <input
                    className="peer sr-only"
                    type="radio"
                    name="nilai"
                    value={bintang}
                    checked={nilai === bintang}
                    onChange={() => setNilai(bintang)}
                    required
                    aria-label={`${bintang} dari 5 bintang`}
                  />
                  <span className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-transparent text-amber-500 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-ring peer-checked:border-amber-300 peer-checked:bg-amber-50">
                    <Star
                      aria-hidden="true"
                      className="size-6"
                      fill={nilai !== null && bintang <= nilai ? "currentColor" : "none"}
                    />
                    <span className="sr-only">{bintang} bintang</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block space-y-2 text-sm font-medium">
            <span>Ulasan (opsional)</span>
            <textarea
              name="deskripsi"
              maxLength={1000}
              rows={5}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 font-normal"
              placeholder="Ceritakan pengalaman bekerja dengan tenaga kerja ini."
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={mengirim}>
              {mengirim ? "Mengirim..." : "Kirim ulasan"}
            </Button>
            <Link
              href={tujuanTransaksi}
              className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
            >
              Nanti saja
            </Link>
          </div>
        </form>
      )}
    </section>
  );
}
