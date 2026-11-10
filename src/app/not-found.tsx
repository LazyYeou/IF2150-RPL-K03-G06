import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell not-found">
      <span aria-hidden="true" className="empty-icon">⌕</span>
      <h1>Pekerjaan tidak ditemukan</h1>
      <p>Lowongan ini tidak tersedia. Coba lihat pekerjaan lainnya.</p>
      <Link className="button button-primary" href="/jobs">Lihat semua pekerjaan</Link>
    </main>
  );
}
