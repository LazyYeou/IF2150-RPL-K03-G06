"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  approveCSVerification,
  getCSVerificationDocument,
  getCSVerificationQueue,
  rejectCSVerification,
  VerificationApiError,
  type CSVerificationQueueItem,
} from "@/features/verification/verification-api";

function formatSubmissionDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function redirectIfUnauthorized(error: unknown, replace: (path: string) => void): boolean {
  if (
    error instanceof VerificationApiError &&
    (error.statusCode === 401 || error.statusCode === 403)
  ) {
    replace("/");
    return true;
  }
  return false;
}

function DocumentPreview({ idTenagaKerja }: { idTenagaKerja: string }) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;
    getCSVerificationDocument(idTenagaKerja, controller.signal)
      .then((document) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(document);
        setDocumentUrl(objectUrl);
        setDocumentType(document.type);
        setError("");
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        if (redirectIfUnauthorized(cause, router.replace)) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Dokumen tidak dapat dimuat.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [idTenagaKerja, reload, router]);

  if (isLoading) {
    return <p aria-live="polite" className="muted-copy">Memuat pratinjau dokumen...</p>;
  }
  if (error) {
    return (
      <div className="cs-verification-error" role="alert">
        <p>{error}</p>
        <button
          className="button button-outline"
          onClick={() => {
            setIsLoading(true);
            setError("");
            setDocumentUrl(null);
            setReload((current) => current + 1);
          }}
          type="button"
        >
          Coba lagi
        </button>
      </div>
    );
  }
  if (!documentUrl) return null;

  return (
    <div className={`cs-document-preview ${documentType === "application/pdf" ? "is-pdf" : ""}`}>
      {documentType === "application/pdf" ? (
        <iframe title="Pratinjau dokumen identitas PDF" src={documentUrl} />
      ) : (
        // The API contract returns image/* or application/pdf only.
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="Pratinjau dokumen identitas" src={documentUrl} />
      )}
    </div>
  );
}

export function CSVerificationPage() {
  const router = useRouter();
  const [items, setItems] = useState<CSVerificationQueueItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [rejectTarget, setRejectTarget] = useState<CSVerificationQueueItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonError, setRejectReasonError] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    getCSVerificationQueue(controller.signal)
      .then(({ items: queue }) => {
        if (controller.signal.aborted) return;
        setItems(queue);
        setSelectedId(queue[0]?.idTenagaKerja ?? null);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        if (redirectIfUnauthorized(cause, router.replace)) return;
        setLoadError(
          cause instanceof Error
            ? cause.message
            : "Antrean verifikasi tidak dapat dimuat.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [router]);

  const selectedItem = items.find((item) => item.idTenagaKerja === selectedId) ?? null;

  async function reloadQueue() {
    setIsLoading(true);
    setLoadError("");
    setActionError("");
    try {
      const { items: queue } = await getCSVerificationQueue();
      setItems(queue);
      setSelectedId((current) =>
        queue.some((item) => item.idTenagaKerja === current)
          ? current
          : queue[0]?.idTenagaKerja ?? null,
      );
    } catch (cause) {
      if (!redirectIfUnauthorized(cause, router.replace)) {
        setLoadError(
          cause instanceof Error
            ? cause.message
            : "Antrean verifikasi tidak dapat dimuat.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function approve(item: CSVerificationQueueItem) {
    setProcessingId(item.idTenagaKerja);
    setActionError("");
    setNotice("");
    try {
      await approveCSVerification(item.idTenagaKerja);
      setItems((current) =>
        current.filter((entry) => entry.idTenagaKerja !== item.idTenagaKerja),
      );
      setSelectedId((current) =>
        current === item.idTenagaKerja
          ? items.find((entry) => entry.idTenagaKerja !== item.idTenagaKerja)
              ?.idTenagaKerja ?? null
          : current,
      );
      setNotice(`Pengajuan ${item.nama} berhasil disetujui.`);
    } catch (cause) {
      if (!redirectIfUnauthorized(cause, router.replace)) {
        setActionError(
          cause instanceof Error
            ? cause.message
            : "Pengajuan belum dapat disetujui. Coba lagi.",
        );
      }
    } finally {
      setProcessingId(null);
    }
  }

  function openRejectDialog(item: CSVerificationQueueItem) {
    setRejectTarget(item);
    setRejectReason("");
    setRejectReasonError("");
    setActionError("");
    setNotice("");
    dialogRef.current?.showModal();
  }

  async function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rejectTarget) return;

    const reason = rejectReason.trim();
    if (reason.length < 5 || reason.length > 500) {
      setRejectReasonError("Alasan penolakan harus terdiri dari 5–500 karakter.");
      return;
    }

    const target = rejectTarget;
    setProcessingId(target.idTenagaKerja);
    setRejectReasonError("");
    setActionError("");
    try {
      await rejectCSVerification(target.idTenagaKerja, reason);
      setItems((current) =>
        current.filter((entry) => entry.idTenagaKerja !== target.idTenagaKerja),
      );
      setSelectedId((current) =>
        current === target.idTenagaKerja
          ? items.find((entry) => entry.idTenagaKerja !== target.idTenagaKerja)
              ?.idTenagaKerja ?? null
          : current,
      );
      setNotice(`Pengajuan ${target.nama} ditolak.`);
      dialogRef.current?.close();
    } catch (cause) {
      if (!redirectIfUnauthorized(cause, router.replace)) {
        setActionError(
          cause instanceof Error
            ? cause.message
            : "Pengajuan belum dapat ditolak. Coba lagi.",
        );
      }
    } finally {
      setProcessingId(null);
    }
  }

  const isProcessing = processingId !== null;

  return (
    <main className="cs-verification-page shell">
      <header className="cs-verification-header">
        <div>
          <p className="eyebrow">Ruang kerja Customer Service</p>
          <h1>Antrean verifikasi identitas</h1>
          <p className="muted-copy">
            Tinjau dokumen tenaga kerja sebelum menyetujui atau menolak pengajuan.
          </p>
        </div>
        <button
          className="button button-outline"
          disabled={isLoading}
          onClick={() => void reloadQueue()}
          type="button"
        >
          Muat ulang
        </button>
      </header>

      <section aria-label="Pengajuan verifikasi" className="cs-verification-workspace">
        <div className="cs-verification-queue">
          <div className="cs-queue-heading">
            <h2>Pengajuan menunggu</h2>
            {!isLoading && !loadError && (
              <span className="cs-queue-count">{items.length}</span>
            )}
          </div>

          {isLoading ? (
            <p aria-live="polite" className="muted-copy">Memuat antrean...</p>
          ) : loadError ? (
            <div className="cs-verification-error" role="alert">
              <p>{loadError}</p>
              <button
                className="button button-outline"
                onClick={() => void reloadQueue()}
                type="button"
              >
                Coba lagi
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="cs-verification-empty" role="status">
              <span aria-hidden="true">✓</span>
              <strong>Antrean sudah kosong</strong>
              <p>Tidak ada pengajuan verifikasi yang menunggu saat ini.</p>
            </div>
          ) : (
            <ul className="cs-queue-list">
              {items.map((item) => (
                <li key={item.idTenagaKerja}>
                  <button
                    aria-current={selectedId === item.idTenagaKerja ? "true" : undefined}
                    className={`cs-queue-item${selectedId === item.idTenagaKerja ? " is-selected" : ""}`}
                    onClick={() => {
                      setSelectedId(item.idTenagaKerja);
                      setActionError("");
                    }}
                    type="button"
                  >
                    <span aria-hidden="true" className="cs-queue-avatar">
                      {item.nama.trim().charAt(0).toLocaleUpperCase("id-ID")}
                    </span>
                    <span className="cs-queue-person">
                      <strong>{item.nama}</strong>
                      <span>{item.email}</span>
                      <time dateTime={item.waktuPengajuan}>
                        Diajukan {formatSubmissionDate(item.waktuPengajuan)}
                      </time>
                    </span>
                    <span aria-hidden="true" className="cs-queue-chevron">›</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <section aria-label="Pratinjau pengajuan" className="cs-verification-detail">
          {selectedItem && !loadError && (
            <>
              <header className="cs-detail-heading">
                <div>
                  <p className="eyebrow">Dokumen identitas</p>
                  <h2>{selectedItem.nama}</h2>
                  <p className="muted-copy">{selectedItem.email}</p>
                </div>
                <span className="cs-pending-badge">Menunggu</span>
              </header>

              <DocumentPreview
                idTenagaKerja={selectedItem.idTenagaKerja}
              />

              {actionError && <p className="cs-action-error" role="alert">{actionError}</p>}
              <div className="cs-verification-actions">
                <button
                  className="button button-outline cs-reject-button"
                  disabled={isProcessing}
                  onClick={() => openRejectDialog(selectedItem)}
                  type="button"
                >
                  Tolak pengajuan
                </button>
                <button
                  className="button button-primary cs-approve-button"
                  disabled={isProcessing}
                  onClick={() => void approve(selectedItem)}
                  type="button"
                >
                  {processingId === selectedItem.idTenagaKerja
                    ? "Memproses..."
                    : "Setujui pengajuan"}
                </button>
              </div>
            </>
          )}
          {!isLoading && !loadError && items.length === 0 && (
            <div className="cs-preview-placeholder">
              Pilih pengajuan dari antrean untuk meninjau dokumennya.
            </div>
          )}
        </section>
      </section>

      {notice && <p className="cs-verification-notice" role="status">{notice}</p>}

      <dialog
        aria-labelledby="reject-verification-title"
        className="cs-reject-dialog"
        onClose={() => {
          setRejectTarget(null);
          setRejectReasonError("");
        }}
        ref={dialogRef}
      >
        <form className="cs-reject-form" onSubmit={(event) => void reject(event)}>
          <div className="cs-dialog-heading">
            <div>
              <p className="eyebrow">Tinjau pengajuan</p>
              <h2 id="reject-verification-title">Tolak verifikasi?</h2>
            </div>
            <button
              aria-label="Tutup dialog"
              className="cs-dialog-close"
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              ×
            </button>
          </div>
          <p className="muted-copy">
            Pengajuan {rejectTarget?.nama ?? ""} akan ditolak. Tulis alasan yang jelas agar
            tenaga kerja mengetahui dokumen yang perlu diperbaiki.
          </p>
          <label className="cs-reject-label" htmlFor="reject-reason">
            Alasan penolakan
          </label>
          <textarea
            aria-describedby={rejectReasonError ? "reject-reason-error" : "reject-reason-help"}
            aria-invalid={Boolean(rejectReasonError)}
            id="reject-reason"
            maxLength={500}
            onChange={(event) => {
              setRejectReason(event.target.value);
              setRejectReasonError("");
            }}
            placeholder="Contoh: Foto identitas buram, mohon unggah ulang dengan teks yang terbaca."
            required
            value={rejectReason}
          />
          {rejectReasonError ? (
            <p className="cs-action-error" id="reject-reason-error" role="alert">
              {rejectReasonError}
            </p>
          ) : (
            <p className="cs-reject-help" id="reject-reason-help">
              Minimal 5 dan maksimal 500 karakter.
            </p>
          )}
          {actionError && <p className="cs-action-error" role="alert">{actionError}</p>}
          <div className="cs-dialog-actions">
            <button
              className="button button-outline"
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              Batal
            </button>
            <button
              className="button button-primary"
              disabled={isProcessing}
              type="submit"
            >
              {isProcessing ? "Memproses..." : "Tolak pengajuan"}
            </button>
          </div>
        </form>
      </dialog>
    </main>
  );
}
