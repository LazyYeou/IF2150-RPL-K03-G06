import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="site-container flex min-h-[65dvh] flex-col items-center justify-center py-16 text-center outline-none"
    >
      <p className="text-sm font-semibold tracking-[0.3em] text-orange-700">
        404
      </p>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
        Alamat yang kamu buka mungkin sudah dipindahkan atau tidak tersedia.
        Kamu tetap bisa menemukan peluang berikutnya.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-white"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke beranda
        </Link>
        <Link
          href="/lowongan"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-5 text-sm font-medium"
        >
          <Search className="size-4" aria-hidden="true" />
          Cari pekerjaan
        </Link>
      </div>
    </main>
  );
}
