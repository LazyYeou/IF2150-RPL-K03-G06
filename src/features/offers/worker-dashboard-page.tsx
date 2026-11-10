"use client";

import Link from "next/link";
import { useOfferStore } from "@/components/offer-store";

export function WorkerDashboardPage() {
  const { offers } = useOfferStore();
  const activeCount = offers.filter((offer) => offer.status === "PENDING").length;

  return (
    <main className="workspace-page shell">
      <aside className="workspace-sidebar">
        <p className="eyebrow">Ruang kerja</p>
        <h2>Tenaga kerja</h2>
        <nav aria-label="Navigasi ruang kerja">
          <Link aria-current="page" className="workspace-nav-active" href="/tk">Dashboard</Link>
          <Link href="/tk/lamaran">Lamaran saya</Link>
        </nav>
      </aside>
      <section aria-labelledby="dashboard-title" className="workspace-content">
        <p className="eyebrow">Ruang tenaga kerja</p>
        <h1 id="dashboard-title">Dashboard</h1>
        <div className="dashboard-panels">
          <Link aria-label={`${activeCount} penawaran aktif, lihat lamaran saya`} className="dashboard-summary" href="/tk/lamaran">
            <span>Penawaran aktif</span>
            <strong aria-live="polite">{activeCount}</strong>
            <span>Lihat lamaran saya <span aria-hidden="true">→</span></span>
          </Link>
          <div className="dashboard-action">
            <h2>Langkah berikutnya</h2>
            <p>Temukan pekerjaan yang sesuai dengan keahlian dan waktumu.</p>
            <Link className="button button-primary" href="/jobs">Lihat pekerjaan</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
