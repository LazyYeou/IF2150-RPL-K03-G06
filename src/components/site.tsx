"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link aria-label="Kerja-In, beranda" className="wordmark" href="/">
          <Image
            alt="Kerja-In"
            className="brand-logo brand-logo-header"
            height={420}
            priority
            src="/images/kerja-in-logo.png"
            width={610}
          />
        </Link>
        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
        <nav aria-label="Navigasi utama" className={menuOpen ? "main-nav is-open" : "main-nav"}>
          <Link href="/jobs" onClick={() => setMenuOpen(false)}>Cari Pekerjaan</Link>
          <Link href="/#how-it-works" onClick={() => setMenuOpen(false)}>Cara Kerja</Link>
          <Link className="button button-primary nav-search" href="/jobs" onClick={() => setMenuOpen(false)}>
            Cari Pekerjaan <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-main">
        <div>
          <Link aria-label="Kerja-In, beranda" className="wordmark footer-wordmark" href="/">
            <Image
              alt="Kerja-In"
              className="brand-logo brand-logo-footer"
              height={420}
              src="/images/kerja-in-logo.png"
              width={610}
            />
          </Link>
          <p>Kerja jelas. Orang tepat. Upah transparan.</p>
          <p className="footer-note">Peluang baik dimulai dari sekitarmu.</p>
        </div>
        <div className="footer-links">
          <div>
            <strong>Temukan peluang</strong>
            <Link href="/jobs">Cari pekerjaan</Link>
            <Link href="/jobs">Lihat semua pekerjaan</Link>
          </div>
          <div>
            <strong>Kenali Kerja-In</strong>
            <Link href="/#how-it-works">Cara kerja</Link>
            <Link href="/">Beranda</Link>
          </div>
        </div>
      </div>
      <div className="shell footer-legal">
        <span>© 2026 Kerja-In. Dibuat untuk kerja yang berarti.</span>
        <span>Data lowongan pada halaman ini adalah contoh.</span>
      </div>
    </footer>
  );
}

const stepsByMode = {
  worker: [
    { title: "Temukan yang cocok", description: "Pilih pekerjaan sesuai keahlian, lokasi, dan waktumu." },
    { title: "Ajukan penawaran", description: "Sepakati lingkup kerja dan upah sebelum mulai." },
    { title: "Kerja tuntas, upah jelas", description: "Selesaikan pekerjaan sesuai kesepakatan." },
  ],
  provider: [
    { title: "Jelaskan kebutuhan", description: "Tuliskan pekerjaan, lokasi, jadwal, dan upah dengan jelas." },
    { title: "Pilih tenaga yang sesuai", description: "Tinjau penawaran dan sepakati lingkup pekerjaan." },
    { title: "Selesaikan bersama", description: "Periksa hasil pekerjaan dan pastikan kesepakatan terpenuhi." },
  ],
};

export function HowItWorks() {
  const [mode, setMode] = useState<keyof typeof stepsByMode>("worker");

  return (
    <section className="how-section" id="how-it-works">
      <div className="shell how-grid">
        <div>
          <p className="eyebrow">Dari ketemu sampai kerja</p>
          <h2>Langkah sederhana.<br />Kesepakatan yang jelas.</h2>
          <p className="muted-copy">Kamu fokus pada pekerjaan.<br />Kami bantu merapikan prosesnya.</p>
          <div aria-label="Pilih cara kerja" className="segmented-control" role="group">
            <button
              aria-pressed={mode === "worker"}
              className={mode === "worker" ? "is-active" : ""}
              onClick={() => setMode("worker")}
              type="button"
            >
              Saya mencari kerja
            </button>
            <button
              aria-pressed={mode === "provider"}
              className={mode === "provider" ? "is-active" : ""}
              onClick={() => setMode("provider")}
              type="button"
            >
              Saya butuh tenaga
            </button>
          </div>
        </div>
        <ol className="step-list">
          {stepsByMode[mode].map((step, index) => (
            <li key={step.title}>
              <span className="step-number">{index + 1}</span>
              <div><h3>{step.title}</h3><p>{step.description}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
