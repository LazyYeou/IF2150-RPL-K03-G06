"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getManagedJobs,
  JobManagementApiError,
  type ManagedJob,
  type ManagedJobsResponse,
} from "@/features/jobs/management-api";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string): string {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(dateOnly ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return "Tanggal belum tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function statusLabel(status: ManagedJob["status"]): string {
  if (status === "OPEN") return "Terbuka";
  if (status === "CLOSED_FULL") return "Kuota terpenuhi";
  return "Dibatalkan";
}

function errorMessage(error: unknown): string {
  if (error instanceof JobManagementApiError) {
    if (error.statusCode === 401) {
      return "Silakan masuk sebagai penyedia kerja untuk melihat lowongan Anda.";
    }
    if (error.statusCode === 403) {
      return "Halaman ini hanya dapat diakses oleh penyedia kerja.";
    }
    return error.message;
  }
  return error instanceof Error
    ? error.message
    : "Lowongan belum dapat dimuat. Silakan coba lagi.";
}

export function ManagedJobsPage() {
  const [result, setResult] = useState<ManagedJobsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getManagedJobs(page, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) {
          setResult(response);
          setError("");
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(errorMessage(cause));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [page, retry]);

  const totalPages = result
    ? Math.max(1, Math.ceil(result.total / result.pageSize))
    : 1;
  const firstItem = result?.total ? (result.page - 1) * result.pageSize + 1 : 0;
  const lastItem = result
    ? Math.min(result.page * result.pageSize, result.total)
    : 0;

  return (
    <div className="managed-jobs-page shell">
      <header className="managed-jobs-header">
        <div>
          <p className="eyebrow">Kelola kebutuhan pekerjaan</p>
          <h1>Lowongan saya</h1>
          <p className="muted-copy">
            Pantau lowongan yang Anda terbitkan dan kelola pelamarnya.
          </p>
        </div>
        <Link className="button button-primary managed-jobs-create" href="/pk/lowongan/pasang">
          <span aria-hidden="true">＋</span> Pasang pekerjaan
        </Link>
      </header>

      {isLoading ? (
        <div aria-live="polite" className="managed-jobs-loading">
          <span className="loading-spinner" aria-hidden="true" />
          <p>Memuat lowongan Anda...</p>
        </div>
      ) : error ? (
        <section className="managed-jobs-state" role="alert">
          <span aria-hidden="true">!</span>
          <h2>Lowongan belum dapat ditampilkan</h2>
          <p>{error}</p>
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
        </section>
      ) : result?.items.length ? (
        <>
          <div className="managed-jobs-list-heading">
            <p>
              Menampilkan <strong>{firstItem}–{lastItem}</strong> dari{" "}
              <strong>{result.total}</strong> lowongan
            </p>
            <span>Halaman {result.page} dari {totalPages}</span>
          </div>
          <div className="managed-jobs-list">
            {result.items.map((job) => (
              <article className="managed-job-card" key={job.id}>
                <div className="managed-job-card-main">
                  <div className="managed-job-card-heading">
                    <span className={`managed-job-status status-${job.status.toLowerCase()}`}>
                      {statusLabel(job.status)}
                    </span>
                    <span className="managed-job-category">{job.kategori}</span>
                  </div>
                  <h2>
                    <Link href={`/pk/lowongan/${encodeURIComponent(job.id)}`}>
                      {job.judul}
                    </Link>
                  </h2>
                  <p className="managed-job-card-location">
                    <span aria-hidden="true">⌖</span> {job.lokasi}
                    <span aria-hidden="true">·</span> {formatDate(job.tanggalPekerjaan)}
                  </p>
                  <div className="managed-job-card-meta">
                    <span>
                      <strong>{formatRupiah(job.upah)}</strong> /{" "}
                      {job.satuanUpah === "PER_HARI" ? "hari" : "tugas"}
                    </span>
                    <span>{job.jumlahDiterima} dari {job.kuota} pekerja dipilih</span>
                    {job.jumlahPelamarMenunggu !== undefined && (
                      <span>{job.jumlahPelamarMenunggu} pelamar menunggu</span>
                    )}
                  </div>
                </div>
                <div className="managed-job-card-actions">
                  <Link
                    className="button button-outline"
                    href={`/pk/lowongan/${encodeURIComponent(job.id)}/pelamar`}
                  >
                    Lihat pelamar
                  </Link>
                  <Link
                    aria-label={`Lihat detail ${job.judul}`}
                    className="managed-job-card-detail"
                    href={`/pk/lowongan/${encodeURIComponent(job.id)}`}
                  >
                    Detail <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
          {totalPages > 1 && (
            <nav aria-label="Navigasi halaman lowongan" className="managed-jobs-pagination">
              <button
                className="button button-outline"
                disabled={result.page <= 1 || isLoading}
                onClick={() => {
                  setIsLoading(true);
                  setPage((current) => Math.max(1, current - 1));
                }}
                type="button"
              >
                ← Sebelumnya
              </button>
              <span>Halaman {result.page} dari {totalPages}</span>
              <button
                className="button button-outline"
                disabled={result.page >= totalPages || isLoading}
                onClick={() => {
                  setIsLoading(true);
                  setPage((current) => Math.min(totalPages, current + 1));
                }}
                type="button"
              >
                Berikutnya →
              </button>
            </nav>
          )}
        </>
      ) : (
        <section className="managed-jobs-state managed-jobs-empty">
          <span aria-hidden="true">▤</span>
          <h2>Belum ada lowongan</h2>
          <p>
            Lowongan yang Anda terbitkan akan muncul di sini. Mulai dengan
            menjelaskan pekerjaan yang sedang Anda butuhkan.
          </p>
          <Link className="button button-primary" href="/pk/lowongan/pasang">
            Pasang pekerjaan pertama
          </Link>
        </section>
      )}
    </div>
  );
}
