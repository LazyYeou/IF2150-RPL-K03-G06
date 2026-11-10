import Link from "next/link";
import { HowItWorks } from "@/components/site";
import { JobCard } from "@/components/job-card";
import { SearchBar } from "@/components/search-bar";
import { CategoryIcon } from "@/components/category-icon";
import { jobCategories, jobs } from "@/lib/jobs";

export default function HomePage() {
  const latestJobs = [...jobs]
    .sort((first, second) => first.date.localeCompare(second.date))
    .slice(0, 4);

  return (
    <main>
      <section className="home-hero">
        <div className="shell">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="hero-kicker"><span aria-hidden="true">✦</span> Peluang baik, dekat dari rumah.</p>
              <h1>Keahlianmu berarti.<br />Temukan kerja<br className="desktop-break" /> yang cocok.</h1>
              <p className="hero-description">
                Dari bantu pindahan sampai perbaikan rumah.<br className="desktop-break" />
                Temukan pekerjaan harian di sekitarmu, dengan<br className="desktop-break" />
                lingkup jelas dan upah yang disepakati.
              </p>
              <ul className="hero-promises">
                <li>Upah transparan</li><li>Pilihan kerja lokal</li><li>Tanpa ribet</li>
              </ul>
            </div>
            <div className="hero-visual">
              <div className="hero-image" role="img" aria-label="Tangan terampil. Peluang yang lebih baik. Kerja nyata, di dekatmu." />
            </div>
          </div>
          <SearchBar />
          <nav aria-label="Pencarian kategori populer" className="popular-searches">
            <span>Sering dicari:</span>
            <Link className="category-chip" href="/jobs?category=kebersihan">Bersih-bersih <span aria-hidden="true">↗</span></Link>
            <Link className="category-chip" href="/jobs?category=pertukangan">Tukang <span aria-hidden="true">↗</span></Link>
            <Link className="category-chip" href="/jobs?category=angkut-barang">Pindahan <span aria-hidden="true">↗</span></Link>
          </nav>
        </div>
      </section>

      <section aria-labelledby="categories-heading" className="category-section shell">
        <div className="section-heading">
          <div><p className="eyebrow">Mulai dari yang kamu bisa</p><h2 id="categories-heading">Ada peluang untuk setiap keahlian.</h2></div>
          <Link className="section-link" href="/jobs">Semua kategori <span aria-hidden="true">→</span></Link>
        </div>
        <div className="category-grid">
          {jobCategories.map((category) => (
            <Link className="category-tile" href={`/jobs?category=${category.slug}`} key={category.slug}>
              <span className={`category-icon tone-${category.tone}`}>
                <CategoryIcon category={category.slug} />
              </span>
              <span>{category.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="latest-heading" className="latest-section">
        <div className="shell">
          <div className="section-heading latest-heading">
            <div>
              <p className="eyebrow eyebrow-dot">Papan pekerjaan</p>
              <h2 id="latest-heading">Pekerjaan dekat. Peluang baru.</h2>
              <p className="muted-copy">Cari yang sesuai dengan keahlian dan harimu.</p>
            </div>
            <Link className="section-link" href="/jobs">Lihat semua pekerjaan <span aria-hidden="true">→</span></Link>
          </div>
          <p className="locality"><span aria-hidden="true">⌖</span> Bandung dan sekitarnya</p>
          <p className="list-hint">Temukan yang sesuai dengan keahlianmu</p>
          <div className="job-list">
            {latestJobs.map((job) => <JobCard job={job} key={job.id} />)}
          </div>
          <Link className="button button-outline home-more" href="/jobs">
            Temukan pekerjaan lainnya <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <HowItWorks />
    </main>
  );
}
