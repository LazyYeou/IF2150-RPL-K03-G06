import { Suspense } from "react";
import { JobSearchPage } from "@/features/jobs/search-page";

export default function JobsPage() {
  return (
    <Suspense fallback={<main className="shell page-loading">Memuat pekerjaan…</main>}>
      <JobSearchPage />
    </Suspense>
  );
}
