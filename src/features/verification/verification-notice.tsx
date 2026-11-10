"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getVerificationStatus, type VerificationStatusResponse } from "@/features/verification/verification-api";

export function VerificationNotice() {
  const [status, setStatus] = useState<VerificationStatusResponse["status"] | null>(null);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    getVerificationStatus(controller.signal)
      .then((result) => setStatus(result.status))
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function retryStatus() {
    setIsLoading(true);
    setError(false);
    try {
      const result = await getVerificationStatus();
      setStatus(result.status);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  if (status === "TERVERIFIKASI") return null;

  return (
    <div className="verification-notice" role={error ? "alert" : "status"}>
      <p>
        {error
          ? "Status verifikasi tidak dapat diperiksa."
          : isLoading || status === null
            ? "Memeriksa status verifikasi..."
            : "Identitas perlu diverifikasi sebelum mengajukan penawaran."}
      </p>
      {error && (
        <button
          className="text-button"
          disabled={isLoading}
          onClick={() => void retryStatus()}
          type="button"
        >
          Coba lagi
        </button>
      )}
      {(status || error) && (
        <Link className="text-link" href="/tk/verifikasi">Verifikasi identitas</Link>
      )}
    </div>
  );
}
