"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getManagedJob,
  JobManagementApiError,
  type ManagedJob,
} from "@/features/jobs/management-api";

function rupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function dateLabel(value: string): string {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(dateOnly ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return "Tanggal belum tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
}

export function ManagedJobDetail({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<ManagedJob | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getManagedJob(jobId, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setJob(result);
          setError("");
        }
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        if (cause instanceof JobManagementApiError && cause.statusCode === 404) {
          setError("Lowongan tidak ditemukan atau sudah tidak tersedia.");
        } else {
          setError(
            cause instanceof Error
              ? cause.message
              : "Detail lowongan tidak dapat dimuat.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [jobId, retry]);

  return (
    <main className="managed-job-page shell">
      <Link className="back-link" href="/pk/lowongan">
        <span aria-hidden="true">←</span> Kembali ke lowongan saya
      </Link>
      {isLoading ? (
        <p aria-live="polite" className="muted-copy">Memuat detail lowongan...</p>
      ) : error ? (
        <section className="managed-job-error" role="alert">
          <span aria-hidden="true">!</span>
          <h1>Detail belum dapat ditampilkan</h1>
          <p>{error}</p>
          <div>
            <button
              className="button button-outline"
              onClick={() => {
                setIsLoading(true);
                setRetry((current) => current + 1);
              }}
              type="button"
            >
              Coba lagi
            </button>
            <Link className="button button-primary" href="/pk/lowongan">
              Ke lowongan saya
            </Link>
          </div>
        </section>
      ) : job ? (
        <>
          <div className="managed-job-success" role="status">
            <span aria-hidden="true">✓</span>
            <p>Lowongan berhasil diterbitkan dan kini dapat dilihat oleh tenaga kerja.</p>
          </div>
          <div className="managed-job-detail-layout">
            <article className="managed-job-content">
              <span className={`managed-job-status status-${job.status.toLowerCase()}`}>
                {job.status === "OPEN"
                  ? "Terbuka"
                  : job.status === "CLOSED_FULL"
                    ? "Kuota terpenuhi"
                    : "Dibatalkan"}
              </span>
              <p className="eyebrow">{job.kategori}</p>
              <h1>{job.judul}</h1>
              <p className="managed-job-meta">
                {job.lokasi} · {dateLabel(job.tanggalPekerjaan)} · {job.estimasiDurasi}
              </p>
              <section className="managed-job-section">
                <h2>Deskripsi pekerjaan</h2>
                <p>{job.deskripsi}</p>
                <h3>Ruang lingkup</h3>
                <p>{job.ruangLingkup}</p>
                <h3>Kriteria hasil</h3>
                <p>{job.kriteriaHasil}</p>
              </section>
            </article>
            <aside className="managed-job-summary">
              <span className="job-wizard-field-help">Upah yang ditawarkan</span>
              <strong>{rupiah(job.upah)}</strong>
              <span className="managed-job-summary-unit">
                / {job.satuanUpah === "PER_HARI" ? "hari" : "tugas"}
              </span>
              <dl>
                <div><dt>Kuota tenaga kerja</dt><dd>{job.kuota}</dd></div>
                <div><dt>Telah dipilih</dt><dd>{job.jumlahDiterima}</dd></div>
              </dl>
              <Link
                className="button button-primary"
                href={`/pk/lowongan/${encodeURIComponent(job.id)}/pelamar`}
              >
                Lihat pelamar
              </Link>
              <Link className="managed-job-secondary-link" href="/pk/lowongan">
                Kembali ke daftar lowongan
              </Link>
            </aside>
          </div>
        </>
      ) : null}
    </main>
  );
}
