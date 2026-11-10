"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { JobCard } from "@/components/job-card";
import { SearchBar } from "@/components/search-bar";
import { useSavedJobs } from "@/components/saved-jobs-provider";
import { categoryLabel, filterJobs, jobCategories, jobs } from "@/lib/jobs";

const PAGE_SIZE = 4;

export function JobSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { savedIds } = useSavedJobs();
  const queryString = searchParams.toString();
  const params = new URLSearchParams(queryString);

  const keyword = params.get("q") ?? "";
  const location = params.get("location") ?? "";
  const categories = params.getAll("category");
  const requestedMinWage = Number(params.get("minWage") ?? 0);
  const minWage = requestedMinWage === 150_000 || requestedMinWage === 200_000
    ? requestedMinWage
    : 0;
  const savedOnly = params.get("saved") === "1";
  const sort = params.get("sort") === "pay" ? "pay" : "recent";
  const parsedLimit = Number(params.get("limit") ?? PAGE_SIZE);
  const visibleCount = Number.isFinite(parsedLimit)
    ? Math.max(PAGE_SIZE, Math.min(jobs.length, parsedLimit))
    : PAGE_SIZE;
  const filteredJobs = filterJobs(jobs, {
    keyword,
    location,
    categories,
    minWage,
    savedOnly,
    savedIds,
    sort,
  });
  const displayedJobs = filteredJobs.slice(0, visibleCount);

  function updateQuery(updates: Record<string, string | null>, nextCategories = categories) {
    const next = new URLSearchParams(queryString);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    next.delete("category");
    nextCategories.forEach((category) => next.append("category", category));
    if (!Object.hasOwn(updates, "limit")) next.delete("limit");
    const query = next.toString();
    router.push(`/jobs${query ? `?${query}` : ""}`, { scroll: false });
  }

  function submitSearch(nextKeyword: string, nextLocation: string) {
    updateQuery({ q: nextKeyword || null, location: nextLocation || null });
  }

  function toggleCategory(slug: string) {
    const next = categories.includes(slug)
      ? categories.filter((item) => item !== slug)
      : [...categories, slug];
    updateQuery({}, next);
  }

  function resetFilters() {
    router.push("/jobs", { scroll: false });
  }

  function removeCategory(slug: string) {
    const next = categories.filter((category) => category !== slug);
    updateQuery({}, next);
  }

  function loadMore() {
    const nextLimit = Math.min(jobs.length, visibleCount + PAGE_SIZE);
    updateQuery({ limit: String(nextLimit) });
  }

  const hasFilters =
    Boolean(keyword || location || categories.length || minWage || savedOnly);

  return (
    <main className="search-page">
      <section className="search-intro shell">
        <p className="eyebrow">Peluang baru dimulai di sini</p>
        <h1>Temukan pekerjaan</h1>
        <p className="muted-copy">Keahlianmu dibutuhkan. Cari pekerjaan yang pas untukmu.</p>
        <SearchBar
          key={queryString}
          initialKeyword={keyword}
          initialLocation={location}
          onSearch={submitSearch}
        />
      </section>

      <section aria-label="Hasil pencarian pekerjaan" className="shell results-layout">
        <aside aria-label="Filter pekerjaan" className="filter-panel">
          <div className="filter-heading">
            <h2>Filter pekerjaan</h2>
            <button className="text-button" onClick={resetFilters} type="button">Reset</button>
          </div>
          <fieldset className="filter-group">
            <legend>Kategori pekerjaan</legend>
            {jobCategories.map((category) => (
              <label className="checkbox-row" key={category.slug}>
                <input
                  checked={categories.includes(category.slug)}
                  onChange={() => toggleCategory(category.slug)}
                  type="checkbox"
                />
                <span>{category.label}</span>
              </label>
            ))}
          </fieldset>
          <div className="filter-group">
            <label className="select-label" htmlFor="minimum-wage">Upah minimum</label>
            <select
              id="minimum-wage"
              onChange={(event) => updateQuery({ minWage: event.target.value || null })}
              value={minWage || ""}
            >
              <option value="">Semua upah</option>
              <option value="150000">Rp150.000</option>
              <option value="200000">Rp200.000</option>
            </select>
          </div>
          <label className="checkbox-row saved-filter">
            <input
              checked={savedOnly}
              onChange={(event) => updateQuery({ saved: event.target.checked ? "1" : null })}
              type="checkbox"
            />
            <span aria-hidden="true" className="saved-mark">♧</span>
            <span>Tersimpan ({savedIds.length})</span>
          </label>
          <div className="filter-tip">
            <span aria-hidden="true">✦</span>
            <p>Kerja dekat rumah,<br />lebih banyak waktu untukmu.</p>
          </div>
        </aside>

        <div className="results-main">
          <div className="results-toolbar">
            <p aria-live="polite" className="results-count">
              <strong>{filteredJobs.length} pekerjaan</strong> tersedia
            </p>
            <label className="visually-hidden" htmlFor="job-sort">Urutkan hasil</label>
            <select
              className="sort-select"
              id="job-sort"
              onChange={(event) => updateQuery({ sort: event.target.value === "recent" ? null : event.target.value })}
              value={sort}
            >
              <option value="recent">Terbaru</option>
              <option value="pay">Upah tertinggi</option>
            </select>
          </div>

          {hasFilters && (
            <div aria-label="Filter aktif" className="active-filters">
              {keyword && <span className="filter-chip">Kata kunci: {keyword}</span>}
              {location && <span className="filter-chip">Lokasi: {location}</span>}
              {categories.map((category) => (
                <button className="filter-chip chip-removable" key={category} onClick={() => removeCategory(category)} type="button">
                  {categoryLabel(category) ?? category} <span aria-hidden="true">×</span>
                </button>
              ))}
              {minWage > 0 && <span className="filter-chip">Min. Rp{new Intl.NumberFormat("id-ID").format(minWage)}</span>}
              {savedOnly && <span className="filter-chip">Tersimpan</span>}
              <button className="text-button clear-filter-button" onClick={resetFilters} type="button">Hapus filter</button>
            </div>
          )}

          {filteredJobs.length > 0 ? (
            <>
              <div className="job-list">
                {displayedJobs.map((job) => <JobCard job={job} key={job.id} />)}
              </div>
              {filteredJobs.length > visibleCount && (
                <button className="button button-outline load-more" onClick={loadMore} type="button">
                  Muat lebih banyak <span aria-hidden="true">⌄</span>
                </button>
              )}
              <p className="results-disclaimer">Pastikan ruang lingkup, jadwal, dan upah sudah disepakati sebelum mulai bekerja.</p>
            </>
          ) : (
            <div className="empty-state">
              <span aria-hidden="true" className="empty-icon">⌕</span>
              <h2>Tidak ada lowongan yang sesuai dengan pencarian Anda</h2>
              <p>Coba ubah kata kunci atau hapus beberapa filter untuk melihat lebih banyak pekerjaan.</p>
              <button className="button button-primary" onClick={resetFilters} type="button">Atur ulang filter</button>
              <Link className="text-link" href="/">Kembali ke beranda</Link>
            </div>
          )}
        </div>
      </section>

    </main>
  );
}
