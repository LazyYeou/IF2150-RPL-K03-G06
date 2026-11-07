"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { roleHome, type Role } from "@/lib/navigation";
export default function SiteHeader({ peran }: { peran?: Role }) {
  const pathname = usePathname();
  const links = [
    { href: "/lowongan", label: "Cari pekerjaan" },
    { href: "/#cara-kerja", label: "Cara kerja" },
    { href: "/bantuan", label: "Bantuan" },
    {
      href: peran ? roleHome[peran] : "/masuk",
      label: peran ? "Ruang kerja" : "Masuk",
    },
  ];
  const cta =
    peran === "TK"
      ? { href: "/lowongan", label: "Cari pekerjaan" }
      : peran === "CS"
        ? { href: "/cs/verifikasi", label: "Antrean verifikasi" }
        : {
            href: peran ? "/pk/lowongan" : "/daftar",
            label: "Pasang pekerjaan",
          };
  function nav(mobile = false) {
    return (
      <nav
        aria-label={mobile ? "Navigasi publik mobile" : "Navigasi utama"}
        className={mobile ? "flex flex-col gap-1" : "flex items-center gap-6"}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? "page" : undefined}
            className="flex min-h-11 items-center rounded-lg px-2 text-sm font-medium hover:bg-muted aria-[current=page]:text-orange-700"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href={cta.href}
          className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg bg-brand-orange px-5 text-sm font-semibold text-navy hover:bg-orange-400"
        >
          {cta.label}
          <Plus size={18} aria-hidden="true" />
        </Link>
      </nav>
    );
  }
  return (
    <header className="border-b bg-background">
      <div className="site-container flex min-h-[88px] items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="Kerja-In — beranda"
          className="flex min-h-11 items-center"
        >
          <Image
            src="/logo-icon.png"
            alt="Kerja-In"
            width={80}
            height={62}
            priority
            className="h-14 w-auto object-contain"
          />
        </Link>
        <div className="hidden md:block">{nav()}</div>
        <div className="md:hidden">
          <Dialog
            key={pathname}
            trigger={
              <>
                <Menu className="mr-2 inline size-5" aria-hidden="true" />
                Menu utama
              </>
            }
            title="Jelajahi Kerja-In"
            description="Temukan pekerjaan dan akses ruang kerjamu."
          >
            {nav(true)}
          </Dialog>
        </div>
      </div>
    </header>
  );
}
