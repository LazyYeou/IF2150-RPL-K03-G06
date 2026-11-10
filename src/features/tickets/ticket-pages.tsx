"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  cancelTicket,
  createTicket,
  decideTicket,
  getCsTicket,
  getCsTickets,
  getTicket,
  rejectTicket,
  requestTicketEvidence,
  ticketStatuses,
  TicketApiError,
  type Ticket,
  type TicketDecision,
  type TicketListResponse,
  type TicketStatus,
  uploadTicketEvidence,
} from "@/features/tickets/ticket-api";

const ticketStatusLabels: Record<TicketStatus, string> = {
  DIAJUKAN: "Diajukan",
  DITINJAU: "Sedang ditinjau",
  MENUNGGU_BALASAN: "Menunggu balasan",
  DIPROSES: "Sedang diproses",
  DITUTUP: "Selesai",
  DITOLAK: "Ditolak",
  DIBATALKAN: "Dibatalkan",
};

const finalTicketStatuses: TicketStatus[] = ["DITUTUP", "DITOLAK", "DIBATALKAN"];
const maximumEvidenceBytes = 10 * 1024 * 1024;
const allowedEvidenceTypes = ["application/pdf", "image/jpeg", "image/png"];
const allowedEvidenceExtensions = [".pdf", ".jpg", ".jpeg", ".png"];

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Waktu tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatTicketError(error: unknown): string {
  if (error instanceof TicketApiError) {
    if (error.statusCode === 401) {
      return "Silakan masuk terlebih dahulu untuk mengakses tiket.";
    }
    if (error.statusCode === 403) {
      return "Akun Anda tidak memiliki akses ke tiket ini.";
    }
    if (error.statusCode === 404) {
      return "Tiket tidak ditemukan atau sudah tidak tersedia.";
    }
    return error.message;
  }
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan. Silakan coba lagi.";
}

function validateEvidence(file: File): string {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (
    !allowedEvidenceExtensions.includes(extension) ||
    (file.type !== "" && !allowedEvidenceTypes.includes(file.type))
  ) {
    return "Pilih bukti berformat JPG, PNG, atau PDF.";
  }
  if (file.size > maximumEvidenceBytes) {
    return "Ukuran berkas melebihi batas maksimal 10 MB.";
  }
  if (file.size === 0) return "Berkas yang dipilih kosong.";
  return "";
}

function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`ticket-status ticket-status-${status.toLowerCase()}`}>
      {ticketStatusLabels[status]}
    </span>
  );
}

const faqs = [
  {
    question: "Kapan saya dapat mengajukan keluhan?",
    answer:
      "Ajukan laporan saat ada kendala terkait pekerjaan atau transaksi. Jika laporan dikaitkan dengan transaksi, sistem akan memeriksa kelayakannya.",
  },
  {
    question: "Informasi apa yang perlu saya siapkan?",
    answer:
      "Pilih kategori yang sesuai, jelaskan kronologi dengan lengkap (minimal 20 karakter), dan lampirkan bukti pendukung bila tersedia.",
  },
  {
    question: "Bukti apa yang dapat saya unggah?",
    answer:
      "Bukti dapat berupa JPG, PNG, atau PDF dengan ukuran maksimal 10 MB. Bukti juga dapat ditambahkan kemudian selama tiket belum final.",
  },
  {
    question: "Bagaimana saya mengetahui perkembangan laporan?",
    answer:
      "Gunakan nomor tiket yang ditampilkan setelah laporan berhasil dikirim. Status dan riwayat penanganan tiket dapat dilihat pada halaman detailnya.",
  },
];

export function HelpCenterPage({ transactionId = "" }: { transactionId?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function submitComplaint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const form = event.currentTarget;
    const file = form.elements.namedItem("berkas");
    const evidence = file instanceof HTMLInputElement ? file.files?.[0] : undefined;
    if (evidence) {
      const fileError = validateEvidence(evidence);
      if (fileError) {
        setError(fileError);
        return;
      }
    }

    setIsSubmitting(true);
    setError("");
    try {
      const formData = new FormData(form);
      if (transactionId) formData.set("idTransaksi", transactionId);
      const ticket = await createTicket(formData);
      setCreatedTicket(ticket);
      setSelectedFile(null);
    } catch (cause: unknown) {
      setError(formatTicketError(cause));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="ticket-page shell">
      <header className="ticket-page-header">
        <p className="eyebrow">Bantuan Kerja-In</p>
        <h1>Pusat bantuan</h1>
        <p className="muted-copy">
          Temukan jawaban atau sampaikan kendala kepada tim kami.
        </p>
      </header>

      <section aria-labelledby="ticket-faq-title" className="ticket-panel ticket-faq">
        <div className="ticket-section-heading">
          <div>
            <p className="eyebrow">Pertanyaan umum</p>
            <h2 id="ticket-faq-title">Ada yang bisa kami bantu?</h2>
          </div>
          <span aria-hidden="true" className="ticket-section-icon">?</span>
        </div>
        <div className="ticket-faq-list">
          {faqs.map((faq) => (
            <details className="ticket-faq-item" key={faq.question}>
              <summary>{faq.question}<span aria-hidden="true">⌄</span></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="ticket-create-title" className="ticket-panel ticket-create">
        {createdTicket ? (
          <div className="ticket-created-state" role="status">
            <span className="ticket-created-icon" aria-hidden="true">✓</span>
            <p className="eyebrow">Laporan berhasil dikirim</p>
            <h2 id="ticket-create-title">Simpan nomor tiket Anda</h2>
            <p>
              Tim Customer Service akan meninjau laporan Anda. Gunakan nomor
              berikut untuk melihat perkembangan penanganan.
            </p>
            <strong className="ticket-number">{createdTicket.nomorTiket}</strong>
            <Link className="button button-primary" href={`/tiket/${encodeURIComponent(createdTicket.id)}`}>
              Lihat detail dan riwayat
            </Link>
            <button
              className="ticket-text-button"
              onClick={() => {
                setCreatedTicket(null);
                setError("");
              }}
              type="button"
            >
              Kirim laporan lain
            </button>
          </div>
        ) : (
          <>
            <div className="ticket-section-heading">
              <div>
                <p className="eyebrow">Kami siap membantu</p>
                <h2 id="ticket-create-title">Ajukan keluhan</h2>
                <p className="muted-copy">
                  Ceritakan kendala agar tim kami dapat meninjaunya.
                </p>
              </div>
              <span aria-hidden="true" className="ticket-section-icon">✉</span>
            </div>
            {transactionId && (
              <div className="ticket-context-note" role="status">
                <span aria-hidden="true">↗</span>
                Laporan ini terkait transaksi{" "}
                <strong>{transactionId}</strong>.
              </div>
            )}
            {error && <p className="ticket-form-error" role="alert">{error}</p>}
            <form className="ticket-form" onSubmit={(event) => void submitComplaint(event)}>
              {transactionId && (
                <input name="idTransaksi" type="hidden" value={transactionId} />
              )}
              <label className="ticket-field" htmlFor="complaint-category">
                <span>Kategori masalah <b>*</b></span>
                <input
                  autoComplete="off"
                  list="complaint-categories"
                  id="complaint-category"
                  maxLength={100}
                  name="kategoriMasalah"
                  placeholder="Pilih atau tulis kategori masalah"
                  required
                />
                <datalist id="complaint-categories">
                  <option value="Hasil pekerjaan" />
                  <option value="Pembayaran" />
                  <option value="Komunikasi dengan pengguna" />
                  <option value="Lainnya" />
                </datalist>
              </label>
              <label className="ticket-field" htmlFor="complaint-description">
                <span>Deskripsi keluhan <b>*</b></span>
                <textarea
                  id="complaint-description"
                  maxLength={1000}
                  minLength={20}
                  name="deskripsi"
                  placeholder="Jelaskan kendala dan kronologi yang terjadi (20–1.000 karakter)."
                  required
                  rows={5}
                />
                <small>Ceritakan kronologi secara jelas, minimal 20 karakter.</small>
              </label>
              <label className="ticket-field" htmlFor="complaint-evidence">
                <span>Bukti pendukung <small>(opsional)</small></span>
                <input
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  id="complaint-evidence"
                  name="berkas"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setSelectedFile(file);
                    setError(file ? validateEvidence(file) : "");
                  }}
                  type="file"
                />
                <small>
                  Format JPG, PNG, atau PDF. Maksimal 10 MB.
                  {selectedFile ? ` Dipilih: ${selectedFile.name}` : ""}
                </small>
              </label>
              <div className="ticket-form-footer">
                <p>Informasi laporan hanya digunakan untuk penanganan kendala.</p>
                <button className="button button-primary" disabled={isSubmitting || Boolean(selectedFile && validateEvidence(selectedFile))} type="submit">
                  {isSubmitting ? "Mengirim laporan..." : "Kirim laporan"}
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

function TicketListCard({ ticket }: { ticket: TicketListResponse["items"][number] }) {
  return (
    <article className="ticket-list-card">
      <div className="ticket-list-card-content">
        <div className="ticket-list-card-meta">
          <TicketStatusBadge status={ticket.status} />
          <time dateTime={ticket.createdAt}>{formatDate(ticket.createdAt)}</time>
        </div>
        <h2>
          <Link href={`/cs/tiket/${encodeURIComponent(ticket.id)}`}>
            {ticket.nomorTiket} · {ticket.kategoriMasalah}
          </Link>
        </h2>
        <p>{ticket.deskripsi}</p>
        <span className="ticket-reporter">
          Dilaporkan oleh <strong>{ticket.pelapor.nama}</strong>
          {ticket.idTransaksi && <span> · Tiket transaksi</span>}
        </span>
      </div>
      <Link
        aria-label={`Buka tiket ${ticket.nomorTiket}`}
        className="ticket-list-open"
        href={`/cs/tiket/${encodeURIComponent(ticket.id)}`}
      >
        Buka <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

export function CsTicketListPage() {
  const [result, setResult] = useState<TicketListResponse | null>(null);
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getCsTickets(status, page, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) {
          setResult(response);
          setError("");
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(formatTicketError(cause));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [status, page, retry]);

  const totalPages = result
    ? Math.max(1, Math.ceil(result.total / result.pageSize))
    : 1;

  return (
    <main className="ticket-page shell">
      <header className="ticket-page-header ticket-list-header">
        <div>
          <p className="eyebrow">Ruang Customer Service</p>
          <h1>Tiket &amp; keluhan</h1>
          <p className="muted-copy">Tinjau laporan dan ikuti riwayat penanganan.</p>
        </div>
        <Link className="ticket-back-link" href="/bantuan">Pusat bantuan <span aria-hidden="true">↗</span></Link>
      </header>

      <section aria-label="Filter daftar tiket" className="ticket-filter-bar">
        <label htmlFor="ticket-status-filter">Status tiket</label>
        <select
          id="ticket-status-filter"
          onChange={(event) => {
            setIsLoading(true);
            setPage(1);
            setStatus(event.target.value as TicketStatus | "");
          }}
          value={status}
        >
          <option value="">Semua status</option>
          {ticketStatuses.map((value) => (
            <option key={value} value={value}>{ticketStatusLabels[value]}</option>
          ))}
        </select>
        {result && !isLoading && !error && (
          <span>{result.total} tiket</span>
        )}
      </section>

      {isLoading ? (
        <div aria-live="polite" className="ticket-loading">
          <span className="loading-spinner" aria-hidden="true" />
          <p>Memuat daftar tiket...</p>
        </div>
      ) : error ? (
        <TicketErrorState
          description={error}
          onRetry={() => {
            setIsLoading(true);
            setRetry((current) => current + 1);
          }}
          title="Daftar tiket belum dapat dimuat"
        />
      ) : result?.items.length ? (
        <>
          <div className="ticket-list">
            {result.items.map((ticket) => (
              <TicketListCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
          {totalPages > 1 && (
            <nav aria-label="Navigasi daftar tiket" className="ticket-pagination">
              <button
                className="button button-outline"
                disabled={page <= 1 || isLoading}
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
                disabled={page >= totalPages || isLoading}
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
        <section className="ticket-empty-state" role="status">
          <span aria-hidden="true">▤</span>
          <h2>{status ? "Tidak ada tiket dengan status ini" : "Belum ada tiket masuk"}</h2>
          <p>Tiket yang dikirim pengguna akan muncul di sini untuk ditinjau.</p>
        </section>
      )}
    </main>
  );
}

type TicketViewMode = "reporter" | "cs";
type TicketDialogAction = "upload" | "cancel" | "decide" | "request" | "reject";

function TicketErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry: () => void;
}) {
  return (
    <section className="ticket-error-state" role="alert">
      <span aria-hidden="true">!</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <button className="button button-outline" onClick={onRetry} type="button">
        Coba lagi
      </button>
    </section>
  );
}

function EvidenceList({ evidence }: { evidence: Ticket["bukti"] }) {
  return (
    <section aria-labelledby="ticket-evidence-title" className="ticket-detail-section">
      <div className="ticket-detail-section-heading">
        <div>
          <p className="eyebrow">Lampiran</p>
          <h2 id="ticket-evidence-title">Bukti pendukung</h2>
        </div>
        <span className="ticket-count">{evidence.length}</span>
      </div>
      {evidence.length ? (
        <ul className="ticket-evidence-list">
          {evidence.map((item, index) => (
            <li className="ticket-evidence-item" key={item.id}>
              <span aria-hidden="true" className="ticket-evidence-icon">▧</span>
              <div>
                <strong>Bukti {index + 1}</strong>
                <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
              </div>
              <a href={item.urlBerkas} rel="noreferrer" target="_blank">
                Buka bukti <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="ticket-section-empty">Belum ada bukti yang dilampirkan.</p>
      )}
    </section>
  );
}

function TicketTimeline({ history }: { history: Ticket["riwayat"] }) {
  return (
    <section aria-labelledby="ticket-history-title" className="ticket-detail-section">
      <div className="ticket-detail-section-heading">
        <div>
          <p className="eyebrow">Pembaruan</p>
          <h2 id="ticket-history-title">Riwayat penanganan</h2>
        </div>
        <span className="ticket-count">{history.length}</span>
      </div>
      {history.length ? (
        <ol className="ticket-timeline">
          {history.map((item, index) => (
            <li className="ticket-timeline-item" key={`${item.timestamp}-${index}`}>
              <span aria-hidden="true" className="ticket-timeline-marker" />
              <div>
                <p>{item.log}</p>
                <span>{item.aktor ?? "Sistem"} · {formatDate(item.timestamp)}</span>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="ticket-section-empty">Belum ada riwayat penanganan.</p>
      )}
    </section>
  );
}

function ticketDecisionLabel(decision: TicketDecision): string {
  return decision === "REFUND" ? "Pengembalian dana" : "Pencairan upah";
}

export function TicketDetailPage({
  ticketId,
  mode,
}: {
  ticketId: string;
  mode: TicketViewMode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [reload, setReload] = useState(0);
  const [action, setAction] = useState<TicketDialogAction | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceError, setEvidenceError] = useState("");
  const [decision, setDecision] = useState<TicketDecision>("PENCAIRAN");
  const [decisionNote, setDecisionNote] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [decisionConfirmationStep, setDecisionConfirmationStep] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const load = mode === "cs" ? getCsTicket : getTicket;
    load(ticketId, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setTicket(result);
          setLoadError("");
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setLoadError(formatTicketError(cause));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [mode, ticketId, reload]);

  function openAction(nextAction: TicketDialogAction) {
    setAction(nextAction);
    setActionError("");
    setEvidenceError("");
    setEvidenceFile(null);
    setDecisionConfirmationStep(false);
    dialogRef.current?.showModal();
  }

  function closeAction() {
    if (isProcessing) return;
    dialogRef.current?.close();
    setAction(null);
    setActionError("");
    setDecisionConfirmationStep(false);
  }

  async function performAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ticket || !action || isProcessing) return;

    if (action === "upload") {
      if (!evidenceFile) {
        setEvidenceError("Pilih berkas bukti yang akan diunggah.");
        return;
      }
      const fileError = validateEvidence(evidenceFile);
      if (fileError) {
        setEvidenceError(fileError);
        return;
      }
    }
    if (
      action === "decide" &&
      !decisionConfirmationStep
    ) {
      setDecisionConfirmationStep(true);
      return;
    }

    setIsProcessing(true);
    setActionError("");
    try {
      if (action === "upload" && evidenceFile) {
        await uploadTicketEvidence(ticket.id, evidenceFile);
      } else if (action === "cancel") {
        await cancelTicket(ticket.id);
      } else if (action === "decide") {
        await decideTicket(ticket.id, decision, decisionNote);
      } else if (action === "request") {
        await requestTicketEvidence(ticket.id, requestMessage);
      } else if (action === "reject") {
        await rejectTicket(ticket.id, rejectionReason);
      }
      dialogRef.current?.close();
      setAction(null);
      setIsLoading(true);
      setReload((current) => current + 1);
    } catch (cause: unknown) {
      setActionError(formatTicketError(cause));
    } finally {
      setIsProcessing(false);
    }
  }

  const isFinal = ticket ? finalTicketStatuses.includes(ticket.status) : true;
  const backHref = mode === "cs" ? "/cs/tiket" : "/bantuan";
  const canCancel = mode === "reporter" && ticket?.status === "DIAJUKAN";
  const canUploadEvidence = mode === "reporter" && ticket !== null && !isFinal;
  const canProcessAsCs = mode === "cs" && ticket !== null && !isFinal;

  return (
    <main className="ticket-page shell">
      <Link className="back-link" href={backHref}>
        <span aria-hidden="true">←</span>{" "}
        {mode === "cs" ? "Kembali ke daftar tiket" : "Kembali ke pusat bantuan"}
      </Link>
      {isLoading ? (
        <div aria-live="polite" className="ticket-loading">
          <span className="loading-spinner" aria-hidden="true" />
          <p>Memuat detail tiket...</p>
        </div>
      ) : loadError ? (
        <TicketErrorState
          description={loadError}
          onRetry={() => {
            setIsLoading(true);
            setReload((current) => current + 1);
          }}
          title="Detail tiket belum dapat dimuat"
        />
      ) : ticket ? (
        <>
          <header className="ticket-detail-header">
            <div>
              <p className="eyebrow">
                {mode === "cs" ? "Ruang Customer Service" : "Detail keluhan"}
              </p>
              <div className="ticket-detail-title-row">
                <h1>{ticket.nomorTiket}</h1>
                <TicketStatusBadge status={ticket.status} />
              </div>
              <p className="muted-copy">
                Diajukan {formatDate(ticket.createdAt)}
                {ticket.idTransaksi && (
                  <> · Transaksi <span className="ticket-transaction-id">{ticket.idTransaksi}</span></>
                )}
              </p>
            </div>
            {ticket.keputusan && (
              <div className="ticket-decision-result">
                <span>Keputusan</span>
                <strong>{ticketDecisionLabel(ticket.keputusan)}</strong>
              </div>
            )}
          </header>

          <div className="ticket-detail-layout">
            <div className="ticket-detail-main">
              <section className="ticket-detail-section ticket-summary">
                <div className="ticket-detail-section-heading">
                  <div>
                    <p className="eyebrow">Laporan</p>
                    <h2>{ticket.kategoriMasalah}</h2>
                  </div>
                </div>
                <p className="ticket-description">{ticket.deskripsi}</p>
                <p className="ticket-reporter">
                  Dilaporkan oleh <strong>{ticket.pelapor.nama}</strong>
                </p>
              </section>
              <EvidenceList evidence={ticket.bukti} />
              {canUploadEvidence && (
                <button
                  className="button button-outline ticket-add-evidence-button"
                  onClick={() => openAction("upload")}
                  type="button"
                >
                  <span aria-hidden="true">＋</span> Unggah bukti
                </button>
              )}
              <TicketTimeline history={ticket.riwayat} />
            </div>

            <aside className="ticket-detail-sidebar">
              <section className="ticket-action-card">
                <p className="eyebrow">Status laporan</p>
                <TicketStatusBadge status={ticket.status} />
                <p>{isFinal
                  ? "Penanganan tiket ini telah selesai."
                  : "Periksa status dan riwayat untuk mengikuti perkembangan laporan."}</p>
                {canCancel && (
                  <button
                    className="button button-outline ticket-cancel-button"
                    disabled={isProcessing}
                    onClick={() => openAction("cancel")}
                    type="button"
                  >
                    Batalkan laporan
                  </button>
                )}
              </section>
              {canProcessAsCs && (
                <section className="ticket-action-card ticket-cs-action-card">
                  <p className="eyebrow">Tindakan Customer Service</p>
                  <h2>Tinjau laporan</h2>
                  <p>Pilih tindakan setelah meninjau laporan dan bukti yang tersedia.</p>
                  <button
                    className="button button-primary"
                    disabled={isProcessing}
                    onClick={() => openAction("decide")}
                    type="button"
                  >
                    Putuskan
                  </button>
                  <button
                    className="button button-outline"
                    disabled={isProcessing}
                    onClick={() => openAction("request")}
                    type="button"
                  >
                    Minta bukti
                  </button>
                  <button
                    className="button button-outline ticket-cancel-button"
                    disabled={isProcessing}
                    onClick={() => openAction("reject")}
                    type="button"
                  >
                    Tolak laporan
                  </button>
                </section>
              )}
            </aside>
          </div>
        </>
      ) : null}

      <dialog
        aria-labelledby="ticket-action-title"
        className="ticket-dialog"
        onClose={() => {
          if (!isProcessing) {
            setAction(null);
            setDecisionConfirmationStep(false);
          }
        }}
        ref={dialogRef}
      >
        <form className="ticket-dialog-content" onSubmit={(event) => void performAction(event)}>
          <div className="ticket-dialog-heading">
            <div>
              <p className="eyebrow">
                {mode === "cs" ? "Tindakan penanganan" : "Kelola laporan"}
              </p>
              <h2 id="ticket-action-title">
                {action === "upload" && "Unggah bukti pendukung"}
                {action === "cancel" && "Batalkan laporan?"}
                {action === "decide" && (decisionConfirmationStep ? "Konfirmasi keputusan" : "Putuskan tiket")}
                {action === "request" && "Minta bukti tambahan"}
                {action === "reject" && "Tolak laporan"}
              </h2>
            </div>
            <button
              aria-label="Tutup dialog"
              className="ticket-dialog-close"
              disabled={isProcessing}
              onClick={closeAction}
              type="button"
            >
              ×
            </button>
          </div>
          {action === "upload" && (
            <label className="ticket-field" htmlFor="ticket-new-evidence">
              <span>Pilih bukti <b>*</b></span>
              <input
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                id="ticket-new-evidence"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setEvidenceFile(file);
                  setEvidenceError(file ? validateEvidence(file) : "");
                }}
                type="file"
              />
              <small>JPG, PNG, atau PDF · Maksimal 10 MB</small>
              {evidenceError && <span className="ticket-field-error">{evidenceError}</span>}
            </label>
          )}
          {action === "cancel" && (
            <p className="ticket-dialog-copy">
              Laporan <strong>{ticket?.nomorTiket}</strong> akan dibatalkan.
              Tindakan ini tidak dapat diurungkan.
            </p>
          )}
          {action === "decide" && !decisionConfirmationStep && (
            <>
              <label className="ticket-field" htmlFor="ticket-decision">
                <span>Keputusan <b>*</b></span>
                <select
                  id="ticket-decision"
                  onChange={(event) => setDecision(event.target.value as TicketDecision)}
                  value={decision}
                >
                  <option value="PENCAIRAN">Cairkan upah kepada Tenaga Kerja</option>
                  <option value="REFUND">Kembalikan dana kepada Penyedia Kerja</option>
                </select>
              </label>
              <label className="ticket-field" htmlFor="ticket-decision-note">
                <span>Catatan keputusan <b>*</b></span>
                <textarea
                  id="ticket-decision-note"
                  maxLength={1000}
                  minLength={10}
                  onChange={(event) => setDecisionNote(event.target.value)}
                  placeholder="Jelaskan dasar keputusan (10–1.000 karakter)."
                  required
                  rows={4}
                  value={decisionNote}
                />
              </label>
              <div className="ticket-dialog-warning">
                Setelah dikonfirmasi, keputusan tidak dapat diubah.
              </div>
            </>
          )}
          {action === "decide" && decisionConfirmationStep && (
            <div className="ticket-decision-confirmation" role="alert">
              <span aria-hidden="true">!</span>
              <div>
                <strong>Pastikan keputusan sudah benar.</strong>
                <p>
                  Tiket {ticket?.nomorTiket} akan diputuskan:{" "}
                  <b>{ticketDecisionLabel(decision)}</b>. Tindakan ini bersifat final.
                </p>
                <p className="ticket-confirmation-note">{decisionNote}</p>
              </div>
            </div>
          )}
          {action === "request" && (
            <label className="ticket-field" htmlFor="ticket-request-message">
              <span>Pesan untuk pelapor <b>*</b></span>
              <textarea
                id="ticket-request-message"
                maxLength={1000}
                minLength={10}
                onChange={(event) => setRequestMessage(event.target.value)}
                placeholder="Jelaskan bukti tambahan yang diperlukan (10–1.000 karakter)."
                required
                rows={4}
                value={requestMessage}
              />
            </label>
          )}
          {action === "reject" && (
            <label className="ticket-field" htmlFor="ticket-rejection-reason">
              <span>Alasan penolakan <b>*</b></span>
              <textarea
                id="ticket-rejection-reason"
                maxLength={1000}
                minLength={10}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Jelaskan alasan laporan ditolak (10–1.000 karakter)."
                required
                rows={4}
                value={rejectionReason}
              />
            </label>
          )}
          {actionError && <p className="ticket-form-error" role="alert">{actionError}</p>}
          <div className="ticket-dialog-actions">
            <button className="button button-outline" disabled={isProcessing} onClick={closeAction} type="button">
              Kembali
            </button>
            {action === "decide" && decisionConfirmationStep ? (
              <button className="button button-primary" disabled={isProcessing} type="submit">
                {isProcessing ? "Memproses..." : "Ya, putuskan tiket"}
              </button>
            ) : (
              <button
                className={`button ${action === "cancel" || action === "reject" ? "button-danger" : "button-primary"}`}
                disabled={isProcessing}
                type="submit"
              >
                {isProcessing
                  ? "Memproses..."
                  : action === "upload"
                    ? "Unggah bukti"
                    : action === "cancel"
                      ? "Ya, batalkan"
                      : action === "decide"
                        ? "Lanjutkan konfirmasi"
                        : action === "request"
                          ? "Kirim permintaan"
                          : "Tolak laporan"}
              </button>
            )}
          </div>
        </form>
      </dialog>
    </main>
  );
}
