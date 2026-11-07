"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { roleLabels } from "@/lib/navigation";
import {
  PerbaruiProfilInput,
  ProfilResponse,
  type PerbaruiProfil,
  type Profil,
} from "@/lib/validation/profil";

export default function ProfilForm({ awal }: { awal: Profil }) {
  const [profil, setProfil] = useState(awal);
  const [pesan, setPesan] = useState("");
  const router = useRouter();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting, isReady, isDirty },
  } = useForm<PerbaruiProfil>({
    resolver: zodResolver(PerbaruiProfilInput),
    defaultValues: {
      nama: awal.nama,
      areaLayanan: awal.areaLayanan ?? "",
      bio: awal.bio ?? "",
    },
  });
  async function simpan(input: PerbaruiProfil) {
    setPesan("");
    try {
      const response = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await response.json();
      if (!response.ok) {
        setPesan(json.error?.message ?? "Profil belum dapat disimpan.");
        for (const field of ["nama", "areaLayanan", "bio"] as const)
          if (json.error?.fields?.[field])
            setError(field, {
              type: "server",
              message: json.error.fields[field],
            });
        return;
      }
      const baru = ProfilResponse.parse(json);
      setProfil(baru);
      reset({
        nama: baru.nama,
        areaLayanan: baru.areaLayanan ?? "",
        bio: baru.bio ?? "",
      });
      toast("Profil berhasil disimpan.");
      router.refresh();
    } catch {
      setPesan("Profil belum tersimpan. Periksa koneksi dan coba lagi.");
    }
  }
  const inputClass =
    "mt-2 min-h-12 w-full rounded-lg border bg-background px-3 py-3 text-sm focus-visible:outline-ring aria-invalid:border-destructive";
  return (
    <>
      <p className="text-xs text-muted-foreground">Akun Kerja-In</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Profil saya
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Kenalkan dirimu dan pastikan informasi akun tetap sesuai.
      </p>
      <section
        aria-label="Ringkasan profil"
        className="mt-8 grid grid-cols-[64px_minmax(0,1fr)] items-center gap-5 rounded-xl border bg-muted/50 p-6 sm:grid-cols-[64px_minmax(0,1fr)_auto]"
      >
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-800">
          <UserRound className="size-7" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="break-words text-xl font-semibold">{profil.nama}</h2>
          <p className="mt-1 break-all text-sm text-muted-foreground">
            {profil.email}
          </p>
          <p className="mt-2 text-xs">{roleLabels[profil.peran]}</p>
        </div>
        <div className="col-span-2 space-y-3 text-sm sm:col-span-1">
          {profil.statusVerifikasi && (
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4" aria-hidden="true" />
              <StatusBadge status={profil.statusVerifikasi} />
            </div>
          )}
          <p className="flex items-center gap-2">
            <Star className="size-4 text-orange-600" aria-hidden="true" />
            {profil.jumlahUlasan
              ? `${profil.akumulasiRating.toLocaleString("id-ID", { maximumFractionDigits: 1 })} / 5 · ${profil.jumlahUlasan} ulasan`
              : "Belum ada ulasan"}
          </p>
        </div>
      </section>
      <form
        onSubmit={handleSubmit(simpan)}
        className="mt-8 max-w-2xl space-y-6"
      >
        {pesan && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive"
          >
            {pesan}
          </p>
        )}
        <fieldset
          disabled={isSubmitting || !isReady}
          className="space-y-6 disabled:opacity-60"
        >
          <legend className="sr-only">Edit informasi profil</legend>
          <div>
            <label htmlFor="profil-nama" className="text-sm font-medium">
              Nama lengkap
            </label>
            <input
              id="profil-nama"
              {...register("nama")}
              className={inputClass}
              maxLength={80}
              required
              autoComplete="name"
              aria-invalid={Boolean(errors.nama)}
              aria-describedby="nama-info"
            />
            <p id="nama-info" className="mt-1 text-xs text-muted-foreground">
              {errors.nama?.message ?? "Maksimal 80 karakter."}
            </p>
          </div>
          <div>
            <label htmlFor="profil-area" className="text-sm font-medium">
              Area layanan
            </label>
            <input
              id="profil-area"
              {...register("areaLayanan")}
              className={inputClass}
              maxLength={150}
              placeholder="Misalnya Bandung dan sekitarnya"
              aria-invalid={Boolean(errors.areaLayanan)}
              aria-describedby="area-info"
            />
            <p id="area-info" className="mt-1 text-xs text-muted-foreground">
              {errors.areaLayanan?.message ??
                "Kota atau wilayah layanan, maksimal 150 karakter."}
            </p>
          </div>
          <div>
            <label htmlFor="profil-bio" className="text-sm font-medium">
              Tentang saya
            </label>
            <textarea
              id="profil-bio"
              {...register("bio")}
              className={inputClass + " min-h-36 resize-y"}
              maxLength={1000}
              rows={5}
              placeholder="Ceritakan keahlian, pengalaman, atau kebutuhan pekerjaanmu."
              aria-invalid={Boolean(errors.bio)}
              aria-describedby="bio-info"
            />
            <p id="bio-info" className="mt-1 text-xs text-muted-foreground">
              {errors.bio?.message ??
                `${watch("bio")?.length ?? 0}/1.000 karakter`}
            </p>
          </div>
          <p className="text-xs leading-6 text-muted-foreground">
            Email, peran, rating, dan status verifikasi dikelola terpisah dari
            informasi profil.
          </p>
          <Button type="submit" disabled={!isDirty} className="px-6">
            {isSubmitting ? "Menyimpan…" : "Simpan perubahan"}
          </Button>
        </fieldset>
      </form>
    </>
  );
}
