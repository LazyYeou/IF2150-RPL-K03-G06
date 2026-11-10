"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ControlledDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AjukanPenawaranInput, Penawaran } from "@/lib/validation/penawaran";
import type { LowonganDetail } from "@/lib/validation/lowongan";
import type { Peran } from "@/lib/auth/session";
import { formatRupiah } from "@/lib/format";
import { kelasInput, kesalahanAPI } from "./api";

type Props = {
  lowongan: Pick<
    LowonganDetail,
    | "id"
    | "judul"
    | "upah"
    | "status"
    | "kuota"
    | "jumlahDiterima"
    | "penawaranSaya"
  >;
  peran: Peran | null;
  terverifikasi: boolean;
};
export default function DialogPenawaran({
  lowongan,
  peran,
  terverifikasi,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "review">("form");
  const [harga, setHarga] = useState(String(lowongan.upah));
  const [ketersediaan, setKetersediaan] = useState("");
  const [pesan, setPesan] = useState("");
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [berhasil, setBerhasil] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const successRef = useRef<HTMLAnchorElement>(null);
  const inFlight = useRef(false);
  const aktif =
    berhasil ||
    lowongan.penawaranSaya?.status === "MENUNGGU" ||
    lowongan.penawaranSaya?.status === "DITERIMA";
  const login = `/masuk?next=${encodeURIComponent(`/lowongan/${lowongan.id}`)}`;
  const terbuka =
    lowongan.status === "OPEN" && lowongan.jumlahDiterima < lowongan.kuota;

  useEffect(() => {
    if (open)
      (step === "form" ? inputRef.current : summaryRef.current)?.focus();
  }, [open, step]);
  function ubahOpen(value: boolean) {
    setOpen(value);
    if (
      !value &&
      [
        "PENAWARAN_GANDA",
        "KUOTA_PENUH",
        "NOT_VERIFIED",
        "UNAUTHENTICATED",
      ].includes(code)
    )
      router.refresh();
  }
  function tinjau(event: FormEvent) {
    event.preventDefault();
    const parsed = AjukanPenawaranInput.safeParse({
      idLowongan: lowongan.id,
      hargaPenawaran: Number(harga),
      ketersediaan,
      pesan: pesan.trim() || undefined,
    });
    if (!parsed.success) {
      setFields(
        Object.fromEntries(
          parsed.error.issues.map((i) => [i.path.join("."), i.message]),
        ),
      );
      setError("Periksa isian penawaran sebelum melanjutkan.");
      return;
    }
    setFields({});
    setError("");
    setCode("");
    setStep("review");
  }
  async function kirim() {
    if (inFlight.current) return;
    const parsed = AjukanPenawaranInput.safeParse({
      idLowongan: lowongan.id,
      hargaPenawaran: Number(harga),
      ketersediaan,
      pesan: pesan.trim() || undefined,
    });
    if (!parsed.success) {
      setStep("form");
      setError("Isian penawaran tidak valid.");
      return;
    }
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/penawaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        const err = kesalahanAPI(
          data,
          "Penawaran belum dapat dikirim. Silakan coba lagi.",
        );
        setError(err.message);
        setCode(response.status === 401 ? "UNAUTHENTICATED" : err.code);
        setFields(err.fields ?? {});
        if (response.status === 400) setStep("form");
        return;
      }
      const result = Penawaran.parse(data);
      if (result.lowongan.id !== lowongan.id)
        throw new Error("Respons penawaran tidak sesuai lowongan.");
      setBerhasil(true);
      setOpen(false);
      router.refresh();
    } catch {
      setError(
        "Koneksi terputus atau respons tidak valid. Periksa Lamaran saya sebelum mencoba kembali.",
      );
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }
  const fieldError = (name: string) =>
    fields[name] ? (
      <p id={`penawaran-${name}-error`} className="mt-1 text-sm text-red-700">
        {fields[name]}
      </p>
    ) : null;
  return (
    <div className="mt-6 space-y-3">
      {aktif ? (
        <div
          role="status"
          className="rounded-lg bg-teal-50 p-4 text-sm text-teal-900"
        >
          <strong>Penawaran sudah diajukan</strong>
          <Link
            ref={successRef}
            href="/tk/lamaran"
            className="mt-2 flex min-h-11 items-center font-semibold underline"
          >
            Lihat lamaran saya
          </Link>
        </div>
      ) : !terbuka ? (
        <p className="text-sm text-muted-foreground">
          Lowongan sudah penuh atau ditutup.
        </p>
      ) : !peran ? (
        <Link
          href={login}
          className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Masuk untuk mengajukan penawaran
        </Link>
      ) : peran !== "TK" ? (
        <p className="text-sm text-muted-foreground">
          Penawaran hanya dapat diajukan oleh akun tenaga kerja.
        </p>
      ) : !terverifikasi ? (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
          Identitas harus terverifikasi sebelum mengajukan penawaran.
          <Link
            href="/profil"
            className="mt-2 flex min-h-11 items-center font-semibold underline"
          >
            Lihat profil dan status verifikasi
          </Link>
        </div>
      ) : (
        <Button
          ref={triggerRef}
          disabled={pending}
          onClick={() => {
            setStep("form");
            setError("");
            setCode("");
            setOpen(true);
          }}
          className="w-full"
        >
          Ajukan Penawaran
        </Button>
      )}
      <ControlledDialog
        open={open}
        onOpenChange={ubahOpen}
        title={step === "form" ? "Ajukan penawaran" : "Tinjau penawaranmu"}
        description={lowongan.judul}
        initialFocus={inputRef}
        finalFocus={() => successRef.current ?? triggerRef.current}
      >
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
            {code === "UNAUTHENTICATED" && (
              <Link href={login} className="mt-2 block underline">
                Masuk kembali
              </Link>
            )}
            {code === "NOT_VERIFIED" && (
              <Link href="/profil" className="mt-2 block underline">
                Lihat status verifikasi
              </Link>
            )}
            {code === "PENAWARAN_GANDA" && (
              <Link href="/tk/lamaran" className="mt-2 block underline">
                Lihat lamaran saya
              </Link>
            )}
          </div>
        )}
        {step === "form" ? (
          <form onSubmit={tinjau} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="penawaran-harga"
                className="mb-2 block text-sm font-medium"
              >
                Upah penawaran (Rp)
              </label>
              <input
                ref={inputRef}
                id="penawaran-harga"
                className={kelasInput}
                type="number"
                min={1000}
                max={100000000}
                step={1}
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                aria-invalid={!!fields.hargaPenawaran}
                aria-describedby={
                  fields.hargaPenawaran
                    ? "penawaran-hargaPenawaran-error"
                    : undefined
                }
              />
              {fieldError("hargaPenawaran")}
            </div>
            <div>
              <label
                htmlFor="penawaran-ketersediaan"
                className="mb-2 block text-sm font-medium"
              >
                Kapan kamu tersedia?
              </label>
              <input
                id="penawaran-ketersediaan"
                className={kelasInput}
                maxLength={120}
                value={ketersediaan}
                onChange={(e) => setKetersediaan(e.target.value)}
                aria-invalid={!!fields.ketersediaan}
                aria-describedby={
                  fields.ketersediaan
                    ? "penawaran-ketersediaan-error"
                    : undefined
                }
              />
              {fieldError("ketersediaan")}
              <p className="mt-1 text-xs text-muted-foreground">
                {ketersediaan.length}/120 karakter
              </p>
            </div>
            <div>
              <label
                htmlFor="penawaran-pesan"
                className="mb-2 block text-sm font-medium"
              >
                Pesan untuk penyedia (opsional)
              </label>
              <textarea
                id="penawaran-pesan"
                className={kelasInput + " min-h-28"}
                rows={4}
                maxLength={1000}
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                aria-invalid={!!fields.pesan}
                aria-describedby={
                  fields.pesan ? "penawaran-pesan-error" : undefined
                }
              />
              {fieldError("pesan")}
              <p className="mt-1 text-xs text-muted-foreground">
                {pesan.length}/1000 karakter
              </p>
            </div>
            <Button type="submit" className="w-full">
              Tinjau penawaran
            </Button>
          </form>
        ) : (
          <div className="space-y-5">
            <div
              ref={summaryRef}
              tabIndex={-1}
              aria-label="Ringkasan penawaran"
              className="rounded-lg bg-muted p-4 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <dl className="divide-y text-sm">
                <div className="pb-3">
                  <dt className="text-muted-foreground">Penawaranmu</dt>
                  <dd className="mt-1 font-semibold">
                    {formatRupiah(Number(harga))}
                  </dd>
                </div>
                <div className="py-3">
                  <dt className="text-muted-foreground">Ketersediaan</dt>
                  <dd className="mt-1">{ketersediaan.trim()}</dd>
                </div>
                <div className="pt-3">
                  <dt className="text-muted-foreground">Pesan</dt>
                  <dd className="mt-1 whitespace-pre-wrap break-words">
                    {pesan.trim() || "Tidak ada pesan"}
                  </dd>
                </div>
              </dl>
            </div>
            <p className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
              Pastikan nominal dan jadwal sesuai. Penawaran dapat ditarik selama
              masih menunggu tanggapan.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                disabled={pending}
                onClick={() => {
                  setError("");
                  setStep("form");
                }}
              >
                Ubah
              </Button>
              <Button disabled={pending} onClick={kirim}>
                {pending ? "Mengirim..." : "Ajukan penawaran"}
              </Button>
            </div>
          </div>
        )}
      </ControlledDialog>
    </div>
  );
}
