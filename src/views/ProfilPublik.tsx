import Link from "next/link";
import { Star, UserRound } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ProfilPublik as ProfilPublikData } from "@/lib/validation/profil";
import DaftarUlasanProfil from "@/views/DaftarUlasanProfil";

export default function ProfilPublik({
  profil,
}: {
  profil: ProfilPublikData;
}) {
  return (
    <main className="site-container py-12">
      <Link
        href="/lowongan"
        className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline underline-offset-2"
      >
        Kembali
      </Link>
      <section
        aria-label="Ringkasan profil"
        className="mt-6 grid grid-cols-[64px_minmax(0,1fr)] items-center gap-5 rounded-xl border bg-muted/50 p-6 sm:grid-cols-[64px_minmax(0,1fr)_auto]"
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-teal-50 text-teal-800">
          <UserRound className="size-7" aria-hidden="true" />
        </div>
        <div>
          <h1 className="break-words text-2xl font-semibold">{profil.nama}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {profil.peran === "TK" ? "Tenaga Kerja" : "Penyedia Kerja"}
          </p>
          {profil.areaLayanan && (
            <p className="mt-2 text-sm">{profil.areaLayanan}</p>
          )}
        </div>
        <div className="col-span-2 space-y-3 text-sm sm:col-span-1">
          {profil.peran === "TK" && profil.statusVerifikasi && (
            <StatusBadge status={profil.statusVerifikasi} />
          )}
          <p className="flex items-center gap-2">
            <Star className="size-4 text-amber-500" aria-hidden="true" />
            {profil.jumlahUlasan
              ? `${profil.akumulasiRating.toLocaleString("id-ID", { maximumFractionDigits: 1 })} / 5 · ${profil.jumlahUlasan} ulasan`
              : "Belum ada ulasan"}
          </p>
        </div>
      </section>
      {profil.bio && (
        <section className="mt-8 max-w-3xl">
          <h2 className="text-lg font-semibold">Tentang saya</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {profil.bio}
          </p>
        </section>
      )}
      <DaftarUlasanProfil ulasan={profil.ulasan} />
    </main>
  );
}
