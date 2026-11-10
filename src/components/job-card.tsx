import Link from "next/link";
import { formatIndonesianDate, formatRupiah, type Job } from "@/lib/jobs";
import { SavedJobButton } from "@/components/saved-job-button";
import { CategoryIcon } from "@/components/category-icon";

const categoryTone: Record<string, string> = {
  Kebersihan: "mint",
  "Perbaikan Rumah": "peach",
  "Angkut Barang": "orange",
  "Acara & Katering": "peach",
  Pertukangan: "yellow",
  Lainnya: "blue",
};

export function JobCard({ job }: { job: Job }) {
  const initials = job.provider
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toLocaleUpperCase("id-ID");

  return (
    <article className="job-card">
      <div className={`job-icon tone-${categoryTone[job.category]}`} aria-hidden="true">
        <CategoryIcon category={job.categorySlug} />
      </div>
      <div className="job-card-main">
        <div className="job-meta">
          <span>{job.category}</span>
          <span className="status-dot" aria-hidden="true" />
          <span className="job-status">Terbuka</span>
          {job.demoOnly && <span className="demo-badge">Demo</span>}
        </div>
        <Link className="job-title" href={`/jobs/${job.id}`}>{job.title}</Link>
        <div className="job-details">
          <span><span aria-hidden="true">⌖</span>{job.location}</span>
          <span><span aria-hidden="true">▦</span>{formatIndonesianDate(job.date)}</span>
        </div>
        <div className="provider-line">
          <span aria-hidden="true" className="avatar">{initials}</span>
          <span>{job.provider}</span>
        </div>
      </div>
      <div className="job-card-actions">
        <SavedJobButton jobId={job.id} />
        <p className="job-pay">{formatRupiah(job.pay)}<span> / {job.payUnit}</span></p>
        <Link className="detail-link" href={`/jobs/${job.id}`}>Lihat Detail <span aria-hidden="true">↗</span></Link>
      </div>
    </article>
  );
}
