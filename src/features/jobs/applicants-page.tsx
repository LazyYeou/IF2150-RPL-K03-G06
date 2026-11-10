"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ApplicantsApiError,
  getApplicants,
  selectApplicant,
  type Applicant,
  type ApplicantsResponse,
} from "@/features/jobs/applicants-api";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

const applicantStatusLabels: Record<Applicant["status"], string> = {
  MENUNGGU: "Menunggu",
  DITERIMA: "Dipilih",
  DITOLAK: "Ditolak",
  DITARIK: "Ditarik",
  DITOLAK_OTOMATIS: "Tidak terpilih",
};

function apiErrorMessage(error: unknown): string {
  if (!(error instanceof ApplicantsApiError)) {
    return error instanceof Error
      ? error.message
      : "Terjadi kesalahan. Silakan coba lagi.";
  }
  if (error.code === "KUOTA_PENUH") {
    return "Kuota pekerjaan sudah penuh. Muat ulang daftar untuk melihat status terbaru.";
  }
  if (error.statusCode === 401) {
    return "Silakan masuk sebagai penyedia kerja untuk melihat daftar pelamar.";
  }
  if (error.statusCode === 403) {
    return "Daftar pelamar hanya dapat dilihat oleh pemilik lowongan.";
  }
  return error.message;
}

export function ApplicantsPage({ jobId }: { jobId: string }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [result, setResult] = useState<ApplicantsResponse | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getApplicants(jobId, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) {
          setResult(response);
          setLoadError("");
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setLoadError(apiErrorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [jobId, refreshVersion]);

  function openConfirmation(applicant: Applicant) {
    setSelectedApplicant(applicant);
    setActionError("");
    dialogRef.current?.showModal();
  }

  async function confirmSelection() {
    if (!selectedApplicant || isSelecting) return;

    setIsSelecting(true);
    setActionError("");
    try {
      const { idTransaksi } = await selectApplicant(selectedApplicant.idPenawaran);
      dialogRef.current?.close();
      router.push(`/pk/transaksi/${encodeURIComponent(idTransaksi)}`);
    } catch (error) {
      setActionError(apiErrorMessage(error));
      if (error instanceof ApplicantsApiError && error.code === "KUOTA_PENUH") {
        dialogRef.current?.close();
        setResult((current) =>
          current
            ? {
                ...current,
                lowongan: { ...current.lowongan, status: "CLOSED_FULL" },
                sisaKuota: 0,
              }
            : current,
        );
        setIsLoading(true);
        setLoadError("");
        setRefreshVersion((version) => version + 1);
      }
    } finally {
      setIsSelecting(false);
    }
  }

  const quotaFull =
    result !== null &&
    (result.sisaKuota <= 0 || result.lowongan.status === "CLOSED_FULL");
  const jobCancelled = result?.lowongan.status === "DIBATALKAN";
  const selectionUnavailable = quotaFull || jobCancelled;

  return (
    <main className="applicants-page shell">
      <Link className="back-link" href="/pk/lowongan">
        <span aria-hidden="true">←</span> Kembali ke lowongan saya
      </Link>

      <header className="applicants-header">
        <div>
          <p className="eyebrow">Kelola lowongan</p>
          <h1>Daftar pelamar</h1>
          {result && (
            <p className="muted-copy">
              {result.lowongan.judul} · {result.lowongan.lokasi}
            </p>
          )}
        </div>
        <button
          className="button button-outline"
          disabled={isLoading}
          onClick={() => {
            setIsLoading(true);
            setLoadError("");
            setRefreshVersion((version) => version + 1);
          }}
          type="button"
        >
          Muat ulang
        </button>
      </header>

      {result && (
        <section aria-label="Ringkasan kuota" className="applicants-summary">
          <div className="applicants-job-summary">
            <span className="applicants-summary-icon" aria-hidden="true">▣</span>
            <div>
              <span className="applicants-summary-label">Lowongan</span>
              <strong>{result.lowongan.judul}</strong>
              <span className="applicants-summary-meta">
                {result.lowongan.kategori} · {result.lowongan.lokasi} ·{" "}
                {formatDate(result.lowongan.tanggalPekerjaan)}
              </span>
            </div>
          </div>
          <div className={`applicants-quota${quotaFull ? " is-full" : ""}`}>
            <span className="applicants-summary-label">Sisa kuota</span>
            <strong>{result.sisaKuota}</strong>
            <span>dari {result.lowongan.kuota} pekerja</span>
          </div>
        </section>
      )}

      {actionError && (
        <div className="applicants-alert" role="alert">
          <span aria-hidden="true">!</span>
          <p>{actionError}</p>
          {actionError.includes("Kuota") && (
            <button
              className="text-button"
              onClick={() => {
                setIsLoading(true);
                setLoadError("");
                setRefreshVersion((version) => version + 1);
              }}
              type="button"
            >
              Muat ulang
            </button>
          )}
        </div>
      )}
      {!actionError && selectionUnavailable && (
        <div className="applicants-alert" role="status">
          <span aria-hidden="true">!</span>
          <p>
            {jobCancelled
              ? "Lowongan ini telah dibatalkan dan tidak menerima pemilihan pelamar."
              : "Kuota lowongan sudah penuh. Pelamar tidak dapat dipilih lagi."}
          </p>
        </div>
      )}

      <section aria-labelledby="applicants-list-title" className="applicants-list-section">
        <div className="applicants-list-heading">
          <div>
            <h2 id="applicants-list-title">Pelamar masuk</h2>
            {!isLoading && !loadError && result && (
              <p>{result.items.length} orang mengajukan penawaran</p>
            )}
          </div>
          {result && <span className="applicants-count">{result.items.length}</span>}
        </div>

        {isLoading ? (
          <p aria-live="polite" className="applicants-loading">Memuat daftar pelamar...</p>
        ) : loadError ? (
          <div className="applicants-empty" role="alert">
            <span aria-hidden="true">!</span>
            <h2>Daftar pelamar belum dapat dimuat</h2>
            <p>{loadError}</p>
            <button
              className="button button-outline"
              onClick={() => {
                setIsLoading(true);
                setLoadError("");
                setRefreshVersion((version) => version + 1);
              }}
              type="button"
            >
              Coba lagi
            </button>
          </div>
        ) : result?.items.length ? (
          <div className="applicants-list">
            {result.items.map((applicant) => {
              const canSelect =
                applicant.status === "MENUNGGU" && !selectionUnavailable;
              const initials = applicant.tenagaKerja.nama
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toLocaleUpperCase("id-ID");

              return (
                <article className="applicant-card" key={applicant.idPenawaran}>
                  <div className="applicant-card-main">
                    <span aria-hidden="true" className="applicant-avatar">{initials}</span>
                    <div className="applicant-identity">
                      <div className="applicant-name-row">
                        <h3>{applicant.tenagaKerja.nama}</h3>
                        <span className={`applicant-status status-${applicant.status.toLowerCase()}`}>
                          {applicantStatusLabels[applicant.status]}
                        </span>
                      </div>
                      <p className="applicant-rating">
                        <span aria-hidden="true">★</span>
                        {applicant.tenagaKerja.akumulasiRating.toFixed(1)}
                        <span className="applicant-review-count">
                          ({applicant.tenagaKerja.jumlahUlasan} ulasan)
                        </span>
                      </p>
                      <p className="applicant-price">
                        Penawaran {formatRupiah(applicant.hargaPenawaran)}
                      </p>
                      <p className="applicant-availability">
                        Tersedia: {applicant.ketersediaan}
                      </p>
                      <p className="applicant-message">
                        {applicant.pesan
                          ? `“${applicant.pesan}”`
                          : "Pelamar tidak menambahkan pesan."}
                      </p>
                    </div>
                    <button
                      className="button button-primary applicant-select-button"
                      disabled={!canSelect || isSelecting}
                      onClick={() => openConfirmation(applicant)}
                      type="button"
                    >
                      Pilih
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="applicants-empty" role="status">
            <span aria-hidden="true">✉</span>
            <h2>Belum ada pelamar</h2>
            <p>Pelamar yang mengajukan penawaran untuk lowongan ini akan muncul di sini.</p>
          </div>
        )}
      </section>

      <dialog
        aria-labelledby="select-applicant-title"
        className="applicant-confirm-dialog"
        onClose={() => {
          if (!isSelecting) setSelectedApplicant(null);
        }}
        ref={dialogRef}
      >
        {selectedApplicant && (
          <div className="applicant-confirm-content">
            <div className="applicant-dialog-heading">
              <div>
                <p className="eyebrow">Konfirmasi pilihan</p>
                <h2 id="select-applicant-title">Pilih tenaga kerja ini?</h2>
              </div>
              <button
                aria-label="Tutup dialog"
                className="applicant-dialog-close"
                disabled={isSelecting}
                onClick={() => dialogRef.current?.close()}
                type="button"
              >
                ×
              </button>
            </div>
            <p className="muted-copy">
              Kamu akan memilih <strong>{selectedApplicant.tenagaKerja.nama}</strong> untuk
              pekerjaan <strong>{result?.lowongan.judul}</strong> dengan penawaran{" "}
              <strong>{formatRupiah(selectedApplicant.hargaPenawaran)}</strong>.
            </p>
            <p className="applicant-confirm-note">
              Setelah dipilih, kamu akan diarahkan ke transaksi untuk menyelesaikan pembayaran.
            </p>
            {actionError && <p className="applicants-dialog-error" role="alert">{actionError}</p>}
            <div className="applicant-dialog-actions">
              <button
                className="button button-outline"
                disabled={isSelecting}
                onClick={() => dialogRef.current?.close()}
                type="button"
              >
                Batal
              </button>
              <button
                className="button button-primary"
                disabled={isSelecting}
                onClick={() => void confirmSelection()}
                type="button"
              >
                {isSelecting ? "Memproses..." : "Ya, pilih pelamar"}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </main>
  );
}
