"use client";

import Link from "next/link";
import { SavedJobButton } from "@/components/saved-job-button";
import { formatIndonesianDate, formatRupiah, type Job } from "@/lib/jobs";
import { VerificationNotice } from "@/features/verification/verification-notice";

export function JobDetail({ job }: { job: Job }) {
  const initials = job.provider
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toLocaleUpperCase("id-ID");

  return (
    <main className="detail-page shell">
      <Link className="back-link" href="/jobs"><span aria-hidden="true">←</span> Semua pekerjaan</Link>
      <div className="detail-layout">
        <article className="detail-content">
          <span className="status-badge"><span className="status-dot" aria-hidden="true" />Terbuka</span>
          {job.demoOnly && <span className="demo-badge detail-demo-badge">Data contoh demo</span>}
          <h1>{job.title}</h1>
          <div className="detail-meta">
            <span><span aria-hidden="true">⌖</span>{job.location}</span>
            <span><span aria-hidden="true">▦</span>{formatIndonesianDate(job.date)}</span>
            <span><span aria-hidden="true">◷</span>{job.duration ?? "Durasi belum tersedia"}</span>
          </div>

          <section className="detail-section">
            <h2>Deskripsi pekerjaan</h2>
            <p>{job.description ?? "Deskripsi belum tersedia dalam fixture."}</p>
            <h3>Ruang lingkup</h3>
            {job.scope?.length ? (
              <ul className="scope-list">
                {job.scope.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}
              </ul>
            ) : <p>Ruang lingkup belum tersedia dalam fixture.</p>}
            <h3>Kriteria keberhasilan</h3>
            <p>{job.successCriteria ?? "Kriteria keberhasilan belum tersedia dalam fixture."}</p>
          </section>

          <section className="detail-section">
            <h2>Lokasi &amp; jadwal</h2>
            <p>
              {job.location} · {formatIndonesianDate(job.date)} ·{" "}
              {job.duration ? `Estimasi ${job.duration}.` : "Durasi belum tersedia."}
            </p>
            <p>Alamat lengkap dibagikan setelah kesepakatan untuk menjaga privasi penyedia kerja.</p>
          </section>

          <section className="detail-section provider-section">
            <h2>Tentang penyedia</h2>
            <div className="provider-identity">
              <span aria-hidden="true" className="avatar avatar-large">{initials}</span>
              <div>
                <strong>{job.provider}</strong>
                <span>
                  {job.providerVerified === undefined
                    ? "Status identitas belum tersedia dalam fixture"
                    : job.providerVerified
                      ? "Identitas terverifikasi"
                      : "Identitas belum diverifikasi"}
                </span>
              </div>
            </div>
          </section>
        </article>

        <aside aria-label="Ringkasan pekerjaan" className="offer-panel">
          <p className="offer-label">Upah yang ditawarkan</p>
          <p className="offer-price">{formatRupiah(job.pay)} <span>/ {job.payUnit}</span></p>
          <p className="muted-copy">Nominal penawaranmu dapat berbeda. Sepakati upah sebelum mulai bekerja.</p>
          <dl className="offer-facts">
            <div><dt>Kategori</dt><dd>{job.category}</dd></div>
            <div><dt>Durasi</dt><dd>{job.duration ?? "Belum tersedia"}</dd></div>
          </dl>
          <button className="button button-primary offer-apply" disabled type="button">
            Ajukan Penawaran <span aria-hidden="true">↗</span>
          </button>
          <VerificationNotice />
          <div className="offer-save"><SavedJobButton jobId={job.id} /><span>Simpan pekerjaan</span></div>
          <p className="offer-reminder"><span aria-hidden="true">♢</span>Tinjau ruang lingkup dan sepakati upah sebelum mulai bekerja.</p>
        </aside>
      </div>
    </main>
  );
}
