import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, BriefcaseBusiness, MapPin } from "lucide-react";
import { prosesCariLowongan } from "@/controllers/LowonganPekerjaanController";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchFilters } from "@/features/jobs/search-filters";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { KATEGORI } from "@/lib/validation/common";
import { CariLowonganQuery } from "@/lib/validation/lowongan";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function pageHref(
  page: number,
  filters: {
    keyword: string;
    category: string;
    minimumWage: string;
    sort: string;
  },
) {
  const params = new URLSearchParams();
  if (filters.keyword) params.set("q", filters.keyword);
  if (filters.category) params.set("kategori", filters.category);
  if (filters.minimumWage) params.set("upahMin", filters.minimumWage);
  if (filters.sort) params.set("urut", filters.sort);
  params.set("page", String(page));
  return `/lowongan?${params.toString()}`;
}

export default async function Lowongan({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const keyword = firstValue(params.q);
  const requestedCategory = firstValue(params.kategori);
  const category = KATEGORI.find((item) => item === requestedCategory);
  const minimumWage = firstValue(params.upahMin);
  const requestedSort = firstValue(params.urut);
  const sort = requestedSort === "upah_tertinggi" ? requestedSort : "terbaru";
  const requestedPage = firstValue(params.page);
  const query = {
    q: keyword || undefined,
    kategori: category,
    upahMin: minimumWage || undefined,
    urut: sort,
    page: requestedPage || undefined,
  };
  // Parameter URL tidak valid (page=0, upahMin=abc, q > 100): kembali ke pencarian tanpa filter, bukan 500.
  if (!CariLowonganQuery.safeParse(query).success) redirect("/lowongan");
  const result = await prosesCariLowongan(query);
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const firstItem = result.total ? (result.page - 1) * result.pageSize + 1 : 0;
  const lastItem = Math.min(result.page * result.pageSize, result.total);
  const filters = { keyword, category: category ?? "", minimumWage, sort };

  return (
    <main id="main-content" className="site-container py-10 outline-none sm:py-14">
      <header className="mb-8">
        <p className="text-xs font-medium text-muted-foreground">
          Peluang baru dimulai di sini
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Temukan pekerjaan
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Cari berdasarkan judul atau deskripsi, pilih kategori, lalu atur upah
          minimum dan urutan hasil.
        </p>
      </header>

      <div className="grid items-start gap-7 lg:grid-cols-[270px_minmax(0,1fr)]">
        <aside aria-label="Filter pencarian" className="lg:sticky lg:top-6">
          <SearchFilters
            category={category}
            keyword={keyword}
            minimumWage={minimumWage}
            sort={sort}
          />
        </aside>

        <section aria-labelledby="job-results-title" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="job-results-title" className="text-lg font-semibold">
                Hasil pencarian
              </h2>
              <p aria-live="polite" className="mt-1 text-sm text-muted-foreground">
                {result.items.length === 0
                  ? `0 lowongan${result.total ? " di halaman ini" : ""}`
                  : `Menampilkan ${firstItem}–${lastItem} dari ${result.total} lowongan`}
              </p>
            </div>
          </div>

          {result.items.length === 0 ? (
            <EmptyState
              title="Tidak ada lowongan yang sesuai dengan pencarian Anda"
              action={
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                  href="/lowongan"
                >
                  Reset filter
                </Link>
              }
            >
              Coba ubah kata kunci atau hapus sebagian filter untuk melihat
              lowongan lainnya.
            </EmptyState>
          ) : (
            <>
              <ul className="divide-y rounded-xl border bg-white">
                {result.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      className="flex min-h-32 flex-col gap-4 p-5 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between"
                      href={`/lowongan/${encodeURIComponent(item.id)}`}
                    >
                      <div className="flex min-w-0 gap-4">
                        <BriefcaseBusiness
                          className="mt-1 size-9 shrink-0 rounded-lg bg-teal-50 p-1.5 text-teal-800"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {item.kategori}
                            <StatusBadge status={item.status} />
                          </p>
                          <h3 className="font-semibold">{item.judul}</h3>
                          <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="size-3.5" aria-hidden="true" />
                            {item.lokasi} · {formatTanggal(item.tanggalPekerjaan)}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-sm sm:text-right">
                        <strong className="text-lg">{formatRupiah(item.upah)}</strong>
                        <span className="ml-1 text-xs text-muted-foreground">
                          /{item.satuanUpah === "PER_HARI" ? "hari" : "tugas"}
                        </span>
                        <p className="mt-2 inline-flex items-center gap-2 text-xs">
                          Lihat detail
                          <ArrowUpRight className="size-4" aria-hidden="true" />
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              {totalPages > 1 && (
                <nav
                  aria-label="Halaman hasil pencarian"
                  className="mt-6 flex items-center justify-between gap-3"
                >
                  <Link
                    aria-disabled={result.page <= 1}
                    className={`inline-flex min-h-11 items-center rounded-lg border px-4 text-sm ${
                      result.page <= 1 ? "pointer-events-none opacity-50" : ""
                    }`}
                    href={pageHref(Math.max(1, result.page - 1), filters)}
                  >
                    Sebelumnya
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    Halaman {result.page} dari {totalPages}
                  </span>
                  <Link
                    aria-disabled={result.page >= totalPages}
                    className={`inline-flex min-h-11 items-center rounded-lg border px-4 text-sm ${
                      result.page >= totalPages ? "pointer-events-none opacity-50" : ""
                    }`}
                    href={pageHref(Math.min(totalPages, result.page + 1), filters)}
                  >
                    Berikutnya
                  </Link>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
