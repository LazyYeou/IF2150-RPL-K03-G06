import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/50">
      <div className="site-container py-12">
        <div className="grid gap-10 sm:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label="Kerja-In — beranda">
              <Image
                src="/logo-icon.png"
                width={80}
                height={62}
                alt="Kerja-In"
                className="h-16 w-auto"
              />
            </Link>
            <p className="mt-5 text-sm text-muted-foreground">
              Kerja jelas. Orang tepat. Upah transparan.
            </p>
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden="true" />
              Peluang baik dimulai dari sekitarmu.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold">Temukan peluang</h2>
            <Link className="footer-link" href="/lowongan">
              Cari pekerjaan
            </Link>
            <Link className="footer-link" href="/daftar">
              Bergabung dengan Kerja-In
            </Link>
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold">Kenali Kerja-In</h2>
            <Link className="footer-link" href="/#cara-kerja">
              Cara kerja
            </Link>
            <Link className="footer-link" href="/bantuan">
              Pusat bantuan
            </Link>
          </div>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-3 border-t pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© 2026 Kerja-In. Dibuat untuk kerja yang berarti.</p>
          <div className="flex gap-5">
            <Link
              className="inline-flex min-h-11 items-center hover:underline"
              href="/privasi"
            >
              Kebijakan privasi
            </Link>
            <Link
              className="inline-flex min-h-11 items-center hover:underline"
              href="/syarat"
            >
              Syarat & ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
