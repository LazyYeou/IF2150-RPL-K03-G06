"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  getVerificationStatus,
  submitVerification,
  VerificationApiError,
  type VerificationStatusResponse,
} from "@/features/verification/verification-api";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const statusLabels = {
  BELUM_TERVERIFIKASI: "Belum terverifikasi",
  MENUNGGU_VERIFIKASI: "Menunggu verifikasi",
  TERVERIFIKASI: "Terverifikasi",
  DITOLAK: "Pengajuan ditolak",
} satisfies Record<VerificationStatusResponse["status"], string>;

function formatSubmissionDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function apiFieldError(error: unknown, field: string): string | undefined {
  if (!(error instanceof VerificationApiError)) return undefined;
  return error.fields?.[field];
}

export function VerificationPage() {
  const [status, setStatus] = useState<VerificationStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [fileError, setFileError] = useState("");
  const [consentError, setConsentError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getVerificationStatus(controller.signal)
      .then((currentStatus) => {
        if (controller.signal.aborted) return;
        setStatus(currentStatus);
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "Status verifikasi tidak dapat dimuat.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function retryStatus() {
    setIsLoading(true);
    setLoadError("");
    try {
      setStatus(await getVerificationStatus());
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Status verifikasi tidak dapat dimuat.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function chooseFile(selected: File | null) {
    setFile(selected);
    setFileError("");
    setSubmitError("");
    setSuccessMessage("");
    if (!selected) return;
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setFileError("Format berkas harus PDF, JPG, atau PNG.");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFileError("Ukuran berkas tidak boleh melebihi 5 MB.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFileError("");
    setConsentError("");
    setSubmitError("");
    setSuccessMessage("");

    let hasError = false;
    if (!file) {
      setFileError("Pilih dokumen identitas terlebih dahulu.");
      hasError = true;
    } else if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Format berkas harus PDF, JPG, atau PNG.");
      hasError = true;
    } else if (file.size > MAX_FILE_SIZE) {
      setFileError("Ukuran berkas tidak boleh melebihi 5 MB.");
      hasError = true;
    }
    if (!consent) {
      setConsentError("Persetujuan wajib dicentang sebelum mengirim.");
      hasError = true;
    }
    if (hasError || !file) return;

    setIsSubmitting(true);
    try {
      const result = await submitVerification(file);
      setStatus((current) => ({
        status: result.status,
        waktuPengajuan: result.waktuPengajuan,
        alasanPenolakan:
          result.status === "DITOLAK" ? current?.alasanPenolakan ?? null : null,
      }));
      setFile(null);
      setConsent(false);
      setSuccessMessage("Dokumen berhasil dikirim untuk diverifikasi.");
    } catch (error) {
      const serverFileError = apiFieldError(error, "berkas");
      const serverConsentError = apiFieldError(error, "persetujuan");
      if (serverFileError) setFileError(serverFileError);
      if (serverConsentError) setConsentError(serverConsentError);
      if (!serverFileError && !serverConsentError) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Dokumen belum dapat dikirim. Coba lagi.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit =
    status?.status === "BELUM_TERVERIFIKASI" || status?.status === "DITOLAK";

  return (
    <main className="verification-page shell">
      <Link className="back-link" href="/jobs">
        <span aria-hidden="true">←</span> Kembali ke pekerjaan
      </Link>
      <header className="verification-intro">
        <p className="eyebrow">Verifikasi identitas tenaga kerja</p>
        <h1>Verifikasi identitas</h1>
        <p className="muted-copy">
          Unggah dokumen identitas agar kamu dapat mengakses fitur tenaga kerja.
        </p>
      </header>

      <section aria-labelledby="verification-status-title" className="verification-card">
        <h2 id="verification-status-title">Status verifikasi</h2>
        {isLoading ? (
          <p aria-live="polite" className="muted-copy">Memuat status verifikasi...</p>
        ) : loadError ? (
          <div className="verification-error" role="alert">
            <p>{loadError}</p>
            <button
              className="button button-outline"
              onClick={() => void retryStatus()}
              type="button"
            >
              Coba lagi
            </button>
          </div>
        ) : status ? (
          <div className={`verification-status status-${status.status.toLowerCase()}`} role="status">
            <strong>{statusLabels[status.status]}</strong>
            {status.waktuPengajuan && (
              <p>
                Diajukan {formatSubmissionDate(status.waktuPengajuan)}
              </p>
            )}
            {status.status === "DITOLAK" && status.alasanPenolakan && (
              <p className="verification-rejection">
                Alasan penolakan: {status.alasanPenolakan}
              </p>
            )}
          </div>
        ) : null}
      </section>

      {canSubmit && !loadError && !isLoading && (
        <section aria-labelledby="verification-form-title" className="verification-card">
          <h2 id="verification-form-title">
            {status?.status === "DITOLAK" ? "Unggah ulang dokumen" : "Kirim dokumen identitas"}
          </h2>
          <p className="muted-copy">
            Berkas PDF, JPG, atau PNG dengan ukuran maksimal 5 MB.
          </p>
          <form className="verification-form" onSubmit={handleSubmit} noValidate>
            <label className="verification-file-field">
              <span>Dokumen identitas</span>
              <input
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                aria-describedby={fileError ? "verification-file-error" : "verification-file-help"}
                aria-invalid={Boolean(fileError)}
                onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
                required
                type="file"
              />
            </label>
            <p className="verification-field-help" id="verification-file-help">
              Dokumen hanya dikirim saat kamu menekan tombol kirim.
            </p>
            {file && !fileError && (
              <p className="verification-file-name">
                {file.name} · {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
            {fileError && (
              <p className="verification-field-error" id="verification-file-error" role="alert">
                {fileError}
              </p>
            )}
            <label className="verification-consent">
              <input
                aria-describedby={consentError ? "verification-consent-error" : undefined}
                aria-invalid={Boolean(consentError)}
                checked={consent}
                onChange={(event) => {
                  setConsent(event.target.checked);
                  setConsentError("");
                  setSubmitError("");
                }}
                required
                type="checkbox"
              />
              <span>
                Saya menyatakan dokumen yang diunggah adalah benar dan milik saya.
              </span>
            </label>
            {consentError && (
              <p className="verification-field-error" id="verification-consent-error" role="alert">
                {consentError}
              </p>
            )}
            {submitError && <p className="verification-error" role="alert">{submitError}</p>}
            {successMessage && <p className="verification-success" role="status">{successMessage}</p>}
            <button
              className="button button-primary"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Mengirim..." : "Kirim untuk verifikasi"}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
