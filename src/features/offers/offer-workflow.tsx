"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { formatRupiah, type Job } from "@/lib/jobs";
import { useOfferStore, type JobOffer } from "@/components/offer-store";

type OfferDialogProps = {
  job: Job;
};

export function OfferDialog({ job }: OfferDialogProps) {
  const { offers, submitOffer } = useOfferStore();
  const activeOffer = offers.find(
    (offer) => offer.jobId === job.id && offer.status === "PENDING",
  );
  const dialogRef = useRef<HTMLDialogElement>(null);
  const wageRef = useRef<HTMLInputElement>(null);
  const reviewHeadingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<"form" | "review" | null>(null);
  const [wage, setWage] = useState(String(job.pay));
  const [availability, setAvailability] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!step || !dialog) return;
    if (!dialog.open) dialog.showModal();
    requestAnimationFrame(() => {
      if (step === "form") wageRef.current?.focus();
      else reviewHeadingRef.current?.focus();
    });
  }, [step]);

  function closeDialog() {
    dialogRef.current?.close();
    setStep(null);
    setError("");
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) closeDialog();
  }

  function reviewOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!availability.trim()) {
      setError("Isi waktu ketersediaan sebelum meninjau penawaran.");
      return;
    }
    setError("");
    setStep("review");
  }

  function sendOffer() {
    setError("");
    try {
      const result = submitOffer({
        jobId: job.id,
        wage: Number(wage),
        availability: availability.trim(),
        message: message.trim(),
      });
      if (!result.ok) {
        setError("Kamu sudah mengajukan penawaran untuk lowongan ini dan masih menunggu tanggapan.");
        return;
      }
      closeDialog();
    } catch (cause) {
      console.error("Could not save offer to browser storage.", cause);
      setError("Penawaran belum dapat disimpan. Coba lagi.");
    }
  }

  return (
    <>
      {activeOffer ? (
        <div className="offer-submitted" role="status">
          <strong>Penawaran sudah diajukan</strong>
          <Link className="text-link" href="/tk/lamaran">Lihat lamaran saya</Link>
        </div>
      ) : (
        <button className="button button-primary offer-apply" onClick={() => setStep("form")} type="button">
          Ajukan Penawaran <span aria-hidden="true">↗</span>
        </button>
      )}

      <dialog
        aria-labelledby="offer-dialog-title"
        className="workflow-dialog"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeDialog();
          }
        }}
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        onClick={handleBackdropClick}
        ref={dialogRef}
      >
        <div className="dialog-card">
          <button
            aria-label="Tutup dialog"
            className="dialog-close"
            onClick={closeDialog}
            type="button"
          >
            ×
          </button>
          {step === "form" && (
            <form onSubmit={reviewOffer}>
              <h2 id="offer-dialog-title">Ajukan penawaran</h2>
              <p className="dialog-job-title">{job.title}</p>
              <label className="dialog-field">
                <span>Upah penawaran (Rp)</span>
                <input
                  max="100000000"
                  min="1000"
                  onChange={(event) => setWage(event.target.value)}
                  ref={wageRef}
                  required
                  step="1000"
                  type="number"
                  value={wage}
                />
              </label>
              <label className="dialog-field">
                <span>Kapan kamu tersedia?</span>
                <input
                  maxLength={120}
                  onChange={(event) => setAvailability(event.target.value)}
                  required
                  type="text"
                  value={availability}
                />
                <span className="field-counter">{availability.length}/120</span>
              </label>
              <label className="dialog-field">
                <span>Pesan untuk penyedia (opsional)</span>
                <textarea
                  maxLength={1000}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={4}
                  value={message}
                />
                <span className="field-counter">{message.length}/1000</span>
              </label>
              {error && <p className="dialog-error" role="alert">{error}</p>}
              <button className="button button-primary dialog-submit" type="submit">
                Tinjau penawaran <span aria-hidden="true">→</span>
              </button>
            </form>
          )}
          {step === "review" && (
            <div>
              <h2 id="offer-dialog-title" ref={reviewHeadingRef} tabIndex={-1}>Tinjau penawaranmu</h2>
              <p className="dialog-job-title">{job.title}</p>
              <dl className="offer-review">
                <div><dt>Penawaranmu</dt><dd>{formatRupiah(Number(wage))} / {job.payUnit}</dd></div>
                <div><dt>Ketersediaan</dt><dd>{availability.trim()}</dd></div>
                <div><dt>Pesan</dt><dd>{message.trim() || "Tidak ada pesan"}</dd></div>
              </dl>
              <p className="review-notice">
                Pastikan nominal dan jadwal sudah sesuai. Kamu dapat menarik penawaran sebelum ada kesepakatan.
              </p>
              {error && <p className="dialog-error" role="alert">{error}</p>}
              <div className="dialog-actions">
                <button className="button button-outline" onClick={() => { setError(""); setStep("form"); }} type="button">
                  Ubah
                </button>
                <button className="button button-primary" onClick={sendOffer} type="button">
                  Ajukan penawaran
                </button>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}

export function WithdrawOfferButton({ offer }: { offer: JobOffer }) {
  const { withdrawOffer } = useOfferStore();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && dialog && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => confirmRef.current?.focus());
    }
  }, [isOpen]);

  function closeDialog() {
    dialogRef.current?.close();
    setIsOpen(false);
    setError("");
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) closeDialog();
  }

  function confirmWithdrawal() {
    try {
      withdrawOffer(offer.id);
      closeDialog();
    } catch (cause) {
      console.error("Could not withdraw offer from browser storage.", cause);
      setError("Penawaran belum dapat ditarik. Coba lagi.");
    }
  }

  return (
    <>
      <button className="button button-outline" onClick={() => setIsOpen(true)} type="button">
        Tarik penawaran
      </button>
      <dialog
        aria-labelledby={`withdraw-title-${offer.id}`}
        className="workflow-dialog"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeDialog();
          }
        }}
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        onClick={handleBackdropClick}
        ref={dialogRef}
      >
        <div className="dialog-card withdraw-card">
          <button aria-label="Tutup dialog" className="dialog-close" onClick={closeDialog} type="button">×</button>
          <h2 id={`withdraw-title-${offer.id}`}>Tarik penawaran?</h2>
          <p>Penawaran ini tidak akan dilanjutkan. Kamu dapat mengajukan penawaran baru jika pekerjaan masih terbuka.</p>
          {error && <p className="dialog-error" role="alert">{error}</p>}
          <div className="dialog-actions">
            <button className="button button-outline" onClick={closeDialog} type="button">Batal</button>
            <button className="button button-primary" onClick={confirmWithdrawal} ref={confirmRef} type="button">
              Tarik penawaran
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
