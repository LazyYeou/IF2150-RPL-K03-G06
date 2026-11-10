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
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal pengajuan tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function redirectIfUnauthorized(
  error: unknown,
  replace: (path: string) => void,
): boolean {
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
    setIsLoading(true);
    setError("");

    getCSVerificationDocument(idTenagaKerja, controller.signal)
      .then((document) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(document);
        setDocumentUrl(objectUrl);
        setDocumentType(document.type);
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
    return (
      <p aria-live="polite" className="p-6 text-sm text-muted-foreground">
        Memuat pratinjau dokumen...
      </p>
    );
  }

  if (error) {
    return (
      <div className="space-y-3 p-6" role="alert">
        <p className="text-sm text-destructive">{error}</p>
        <button
          className="min-h-11 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
          onClick={() => {
            setDocumentUrl(null);
            setIsLoading(true);
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

  return documentType === "application/pdf" ? (
    <iframe
      className="h-[min(65vh,44rem)] w-full bg-muted"
      title="Pratinjau dokumen identitas PDF"
      src={documentUrl}
    />
  ) : (
    // The document endpoint only serves image files or PDFs.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt="Pratinjau dokumen identitas"
      className="mx-auto max-h-[65vh] max-w-full object-contain"
      src={documentUrl}
    />
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
  const [rejectTarget, setRejectTarget] =
    useState<CSVerificationQueueItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonError, setRejectReasonError] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const selectedItem =
    items.find((item) => item.idTenagaKerja === selectedId) ?? null;

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
          : (queue[0]?.idTenagaKerja ?? null),
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

  function removeFromQueue(item: CSVerificationQueueItem) {
    const remaining = items.filter(
      (entry) => entry.idTenagaKerja !== item.idTenagaKerja,
    );
    setItems(remaining);
    setSelectedId((current) =>
      current === item.idTenagaKerja
        ? (remaining[0]?.idTenagaKerja ?? null)
        : current,
    );
  }

  async function approve(item: CSVerificationQueueItem) {
    setProcessingId(item.idTenagaKerja);
    setActionError("");
    setNotice("");
    try {
      await approveCSVerification(item.idTenagaKerja);
      removeFromQueue(item);
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
      setRejectReasonError(
        "Alasan penolakan harus terdiri dari 5–500 karakter.",
      );
      return;
    }

    const target = rejectTarget;
    setProcessingId(target.idTenagaKerja);
    setRejectReasonError("");
    setActionError("");
    try {
      await rejectCSVerification(target.idTenagaKerja, reason);
      removeFromQueue(target);
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
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Ruang kerja Customer Service
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Antrean verifikasi identitas
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Tinjau dokumen tenaga kerja sebelum menyetujui atau menolak
            pengajuan.
          </p>
        </div>
        <button
          className="min-h-11 rounded-lg border px-4 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading || isProcessing}
          onClick={() => void reloadQueue()}
          type="button"
        >
          Muat ulang
        </button>
      </header>

      <section
        aria-label="Pengajuan verifikasi"
        className="mt-7 grid gap-5 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.5fr)]"
      >
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold">Pengajuan menunggu</h2>
            {!isLoading && !loadError && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-sm font-medium">
                {items.length}
              </span>
            )}
          </div>

          {isLoading ? (
            <p aria-live="polite" className="p-5 text-sm text-muted-foreground">
              Memuat antrean...
            </p>
          ) : loadError ? (
            <div className="space-y-3 p-5" role="alert">
              <p className="text-sm text-destructive">{loadError}</p>
              <button
                className="min-h-11 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
                onClick={() => void reloadQueue()}
                type="button"
              >
                Coba lagi
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="p-7 text-center" role="status">
              <p className="text-2xl text-emerald-700" aria-hidden="true">
                ✓
              </p>
              <p className="mt-2 font-semibold">Antrean sudah kosong</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tidak ada pengajuan verifikasi yang menunggu saat ini.
              </p>
            </div>
          ) : (
            <ul className="max-h-[38rem] divide-y overflow-y-auto">
              {items.map((item) => (
                <li key={item.idTenagaKerja}>
                  <button
                    aria-current={
                      selectedId === item.idTenagaKerja ? "true" : undefined
                    }
                    className={`flex min-h-20 w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted ${
                      selectedId === item.idTenagaKerja ? "bg-muted" : ""
                    }`}
                    onClick={() => {
                      setSelectedId(item.idTenagaKerja);
                      setActionError("");
                    }}
                    type="button"
                  >
                    <span
                      aria-hidden="true"
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 font-semibold text-primary"
                    >
                      {item.nama.trim().charAt(0).toLocaleUpperCase("id-ID")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {item.nama}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.email}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        Diajukan {formatSubmissionDate(item.waktuPengajuan)}
                      </span>
                    </span>
                    <span aria-hidden="true" className="text-lg text-muted-foreground">
                      ›
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <section
          aria-label="Pratinjau pengajuan"
          className="min-h-72 overflow-hidden rounded-xl border bg-card"
        >
          {selectedItem && !loadError ? (
            <>
              <header className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Dokumen identitas
                  </p>
                  <h2 className="mt-1 truncate text-lg font-semibold">
                    {selectedItem.nama}
                  </h2>
                  <p className="truncate text-sm text-muted-foreground">
                    {selectedItem.email}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
                  Menunggu
                </span>
              </header>

              <div className="grid min-h-64 place-items-center bg-muted/40 p-4">
                <DocumentPreview
                  idTenagaKerja={selectedItem.idTenagaKerja}
                />
              </div>

              <div className="space-y-4 border-t p-5">
                {actionError && (
                  <p className="text-sm text-destructive" role="alert">
                    {actionError}
                  </p>
                )}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    className="min-h-11 rounded-lg border border-destructive/40 px-4 text-sm font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-60"
                    disabled={isProcessing}
                    onClick={() => openRejectDialog(selectedItem)}
                    type="button"
                  >
                    Tolak pengajuan
                  </button>
                  <button
                    className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isProcessing}
                    onClick={() => void approve(selectedItem)}
                    type="button"
                  >
                    {processingId === selectedItem.idTenagaKerja
                      ? "Memproses..."
                      : "Setujui pengajuan"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="grid min-h-72 place-items-center p-6 text-center text-sm text-muted-foreground">
              {isLoading
                ? "Pilih pengajuan setelah antrean dimuat."
                : "Pilih pengajuan dari antrean untuk meninjau dokumennya."}
            </div>
          )}
        </section>
      </section>

      {notice && (
        <p
          className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
          role="status"
        >
          {notice}
        </p>
      )}

      <dialog
        aria-labelledby="reject-verification-title"
        className="fixed inset-0 m-auto w-[min(100%-2rem,30rem)] rounded-2xl border bg-card p-0 text-foreground shadow-xl backdrop:bg-black/50"
        onClose={() => {
          setRejectTarget(null);
          setRejectReasonError("");
        }}
        ref={dialogRef}
      >
        <form className="space-y-5 p-6" onSubmit={(event) => void reject(event)}>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tinjau pengajuan
            </p>
            <h2
              className="mt-1 text-xl font-semibold"
              id="reject-verification-title"
            >
              Tolak verifikasi?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {rejectTarget
                ? `Berikan alasan penolakan untuk ${rejectTarget.nama}.`
                : "Berikan alasan penolakan."}
            </p>
          </div>
          <label className="block text-sm font-medium" htmlFor="reject-reason">
            Alasan penolakan
            <textarea
              aria-describedby={
                rejectReasonError ? "reject-reason-error" : undefined
              }
              aria-invalid={Boolean(rejectReasonError)}
              className="mt-2 min-h-28 w-full rounded-lg border bg-background p-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="reject-reason"
              maxLength={500}
              minLength={5}
              onChange={(event) => setRejectReason(event.target.value)}
              required
              value={rejectReason}
            />
          </label>
          {rejectReasonError && (
            <p
              className="text-sm text-destructive"
              id="reject-reason-error"
              role="alert"
            >
              {rejectReasonError}
            </p>
          )}
          {actionError && (
            <p className="text-sm text-destructive" role="alert">
              {actionError}
            </p>
          )}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              className="min-h-11 rounded-lg border px-4 text-sm font-medium hover:bg-muted disabled:opacity-60"
              disabled={isProcessing}
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              Batal
            </button>
            <button
              className="min-h-11 rounded-lg bg-destructive px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
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
