import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  MapPin,
  Search,
} from "lucide-react";
import { prosesCariLowongan } from "@/controllers/LowonganPekerjaanController";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { KATEGORI } from "@/lib/validation/common";
import { formatRupiah, formatTanggal } from "@/lib/format";

function CategoryMark({ category }: { category: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
  };

  switch (category) {
    case "Kebersihan":
      return (
        <svg {...common} aria-hidden="true">
          <path d="m15 3-9 12" />
          <path d="m6 15 7 5" />
          <path d="m4 18 2-2m1 4 2-2m1 3 2-2" />
        </svg>
      );
    case "Perbaikan Rumah":
      return (
        <svg {...common} aria-hidden="true">
          <path d="m14 4 6 6" />
          <path d="m11 7 6-4 4 4-4 6" />
          <path d="m14 10-9 10" />
        </svg>
      );
    case "Angkut Barang":
      return (
        <svg {...common} aria-hidden="true">
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
          <path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v8.5M8 5.3l8 4.5" />
        </svg>
      );
    case "Acara & Katering":
      return (
        <svg {...common} aria-hidden="true">
          <path d="m5 15 10-10 4 4L9 19l-4-4Z" />
          <path d="m5 15 4 4M15 5l4 4M18 14l.7 1.5 1.6.7-1.6.7L18 18.5l-.7-1.6-1.6-.7 1.6-.7L18 14ZM5 4v3m-1.5-1.5h3" />
        </svg>
      );
    case "Pertukangan":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M3 13a9 9 0 0 1 18 0H3Z" />
          <path d="M8 13v3m8-3v3m-10 0h12v3H6v-3ZM12 4v3" />
        </svg>
      );
    case "Kelistrikan":
      return (
        <svg {...common} aria-hidden="true">
          <path d="m13 2-3 8h6l-5 12 1-9H7l6-11Z" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

export default async function Home() {
  const { items } = await prosesCariLowongan({ urut: "terbaru", page: 1 });
  const latest = items.slice(0, 4);

  return (
    <main id="main-content" className="site-container py-10 outline-none sm:py-16">
      <section className="grid gap-8 rounded-2xl bg-[#f3f7fc] p-6 sm:p-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,.7fr)] lg:items-center lg:p-14">
        <div>
          <p className="text-sm font-semibold text-orange-700">
            Peluang baik, dekat dari rumah
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Keahlianmu berarti. Temukan kerja yang cocok.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            Temukan pekerjaan harian dengan lingkup yang jelas, jadwal yang
            disepakati, dan upah yang transparan.
          </p>
          <form action="/lowongan" className="mt-7 flex flex-col gap-3 sm:flex-row">
            <label className="flex min-h-12 flex-1 items-center gap-3 rounded-lg border bg-white px-4">
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Kata kunci pekerjaan</span>
              <input
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                name="q"
                placeholder="Cari pekerjaan atau keahlian"
                type="search"
              />
            </label>
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
              type="submit"
            >
              Cari lowongan <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Filter lokasi belum tersedia; hasil mengikuti kata kunci dan filter
            yang didukung sistem.
          </p>
        </div>
        <div className="hidden min-h-60 items-center justify-center rounded-xl bg-white p-8 text-center lg:flex">
          <div className="max-w-xs">
            <BriefcaseBusiness className="mx-auto size-12 text-primary" aria-hidden="true" />
            <p className="mt-4 text-lg font-semibold">Temukan kesempatanmu</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Jelajahi pekerjaan terbaru dari penyedia kerja di platform ini.
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14" aria-labelledby="categories-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Mulai dari keahlianmu</p>
            <h2 id="categories-title" className="mt-2 text-2xl font-semibold">
              Jelajahi kategori pekerjaan
            </h2>
          </div>
          <Link className="text-sm font-medium text-primary hover:underline" href="/lowongan">
            Lihat semua lowongan
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {KATEGORI.map((category) => (
            <Link
              className="flex min-h-28 flex-col items-center justify-center gap-3 rounded-xl border bg-white p-3 text-center text-xs font-medium transition-colors hover:border-primary hover:bg-muted sm:text-sm"
              href={`/lowongan?kategori=${encodeURIComponent(category)}`}
              key={category}
            >
              <span className="grid size-11 place-items-center rounded-lg bg-muted text-primary [&_svg]:size-6">
                <CategoryMark category={category} />
              </span>
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t py-10 sm:py-14" aria-labelledby="latest-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Diperbarui secara berkala</p>
            <h2 id="latest-title" className="mt-2 text-2xl font-semibold">
              Empat lowongan terbaru
            </h2>
          </div>
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline" href="/lowongan">
            Cari pekerjaan <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        {latest.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="Belum ada lowongan terbaru">
              Lowongan baru akan tampil di sini setelah diterbitkan.
            </EmptyState>
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {latest.map((job) => (
              <li key={job.id}>
                <Link
                  className="block h-full rounded-xl border bg-white p-5 transition-shadow hover:shadow-md"
                  href={`/lowongan/${encodeURIComponent(job.id)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{job.kategori}</p>
                      <h3 className="mt-2 font-semibold">{job.judul}</h3>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                    {job.lokasi} · {formatTanggal(job.tanggalPekerjaan)}
                  </p>
                  <p className="mt-4 text-sm font-semibold">
                    {formatRupiah(job.upah)}
                    <span className="ml-1 font-normal text-muted-foreground">
                      /{job.satuanUpah === "PER_HARI" ? "hari" : "tugas"}
                    </span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
