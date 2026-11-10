"use client";

import Link from "next/link";
import { useOfferStore } from "@/components/offer-store";
import { formatIndonesianDate, formatRupiah, getJobById } from "@/lib/jobs";
import { WithdrawOfferButton } from "@/features/offers/offer-workflow";

export function MyOffersPage() {
  const { offers } = useOfferStore();
  const orderedOffers = [...offers].sort((first, second) =>
    second.submittedAt.localeCompare(first.submittedAt),
  );

  return (
    <main className="workspace-page shell">
      <aside className="workspace-sidebar">
        <p className="eyebrow">Ruang kerja</p>
        <h2>Tenaga kerja</h2>
        <nav aria-label="Navigasi ruang kerja">
          <Link href="/tk">Dashboard</Link>
          <Link aria-current="page" className="workspace-nav-active" href="/tk/lamaran">Lamaran saya</Link>
        </nav>
      </aside>
      <section aria-labelledby="my-offers-title" className="workspace-content">
        <h1 id="my-offers-title">Lamaran saya</h1>
        <p className="muted-copy">Pantau penawaran dan perkembangan lamaranmu di satu tempat.</p>
        {orderedOffers.length > 0 ? (
          <div className="application-list">
            {orderedOffers.map((offer) => {
              const job = getJobById(offer.jobId);

              return (
                <article className="application-card" key={offer.id}>
                  <div className="application-main">
                    <span className={`application-status ${offer.status === "PENDING" ? "status-pending" : "status-withdrawn"}`}>
                      {offer.status === "PENDING" ? "Menunggu tanggapan" : "Ditarik"}
                    </span>
                    {job
                      ? <Link className="application-title" href={`/jobs/${job.id}`}>{job.title}</Link>
                      : <span className="application-title">Lowongan tidak tersedia</span>}
                    <p>{formatRupiah(offer.wage)} · {offer.availability}</p>
                    {offer.message && <p className="application-message">{offer.message}</p>}
                    <span className="application-date">Diajukan {formatIndonesianDate(offer.submittedAt.slice(0, 10))}</span>
                  </div>
                  {offer.status === "PENDING" && <WithdrawOfferButton offer={offer} />}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state application-empty">
            <span aria-hidden="true" className="empty-icon">⌕</span>
            <h2>Belum ada penawaran</h2>
            <p>Penawaran pekerjaan yang kamu ajukan akan muncul di sini.</p>
            <Link className="button button-primary" href="/jobs">Cari pekerjaan</Link>
          </div>
        )}
      </section>
    </main>
  );
}
