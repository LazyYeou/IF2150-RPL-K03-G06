"use client";

import { useSavedJobs } from "@/components/saved-jobs-provider";

export function SavedJobButton({ jobId }: { jobId: string }) {
  const { savedIds, toggleSaved } = useSavedJobs();
  const isSaved = savedIds.includes(jobId);

  return (
    <button
      aria-label={isSaved ? "Hapus dari pekerjaan tersimpan" : "Simpan pekerjaan"}
      aria-pressed={isSaved}
      className={isSaved ? "save-button is-saved" : "save-button"}
      onClick={() => toggleSaved(jobId)}
      title={isSaved ? "Hapus dari tersimpan" : "Simpan pekerjaan"}
      type="button"
    >
      <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
        <path d="M6.5 4.75h11v15l-5.5-3.5-5.5 3.5v-15Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      </svg>
    </button>
  );
}
