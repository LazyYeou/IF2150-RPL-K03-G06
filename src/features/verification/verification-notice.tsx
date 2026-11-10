"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getVerificationStatus, type VerificationStatusResponse } from "@/features/verification/verification-api";

export function VerificationNotice() {
  const [status, setStatus] = useState<VerificationStatusResponse["status"] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getVerificationStatus(controller.signal)
      .then((result) => setStatus(result.status))
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, []);

  if (status === "TERVERIFIKASI") return null;

  return (
    <div className="verification-notice" role={error ? "alert" : "status"}>
      <p>
        {error
          ? "Status verifikasi tidak dapat diperiksa. Coba muat ulang halaman."
          : status === null
            ? "Memeriksa status verifikasi..."
            : "Identitas perlu diverifikasi sebelum mengajukan penawaran."}
      </p>
      {status && <Link className="text-link" href="/tk/verifikasi">Verifikasi identitas</Link>}
    </div>
  );
}
