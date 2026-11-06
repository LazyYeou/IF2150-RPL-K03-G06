"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Ticket,
  UserRound,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { menuAktif, roleLabels, roleMenus, type Role } from "@/lib/navigation";
import LogoutButton from "@/views/LogoutButton";
const icons = {
  dashboard: LayoutDashboard,
  briefcase: BriefcaseBusiness,
  file: FileText,
  shield: ShieldCheck,
  ticket: Ticket,
  user: UserRound,
  wallet: Wallet,
};
export default function WorkspaceShell({
  peran,
  nama,
  children,
}: {
  peran: Role;
  nama: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  function menu(mobile = false) {
    return (
      <>
        <p className="text-xs text-muted-foreground">Ruang kerja</p>
        <h2 className="mt-2 text-lg font-semibold">{roleLabels[peran]}</h2>
        <nav
          aria-label={
            mobile ? "Navigasi ruang kerja mobile" : "Navigasi ruang kerja"
          }
          className="mt-6 space-y-2"
        >
          {roleMenus[peran].map((item) => {
            const Icon = icons[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  menuAktif(pathname, item.href) ? "page" : undefined
                }
                className="workspace-link"
              >
                <Icon className="size-[18px]" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 border-t pt-5">
          <p
            className="mb-3 truncate text-sm text-muted-foreground"
            title={nama}
          >
            {nama}
          </p>
          <LogoutButton />
        </div>
      </>
    );
  }
  return (
    <div className="site-container py-7 md:py-11">
      <div className="mb-6 flex items-center justify-between md:hidden">
        <span className="text-sm font-semibold">{roleLabels[peran]}</span>
        <Dialog
          key={pathname}
          trigger={
            <>
              <Menu className="mr-2 inline size-4" aria-hidden="true" />
              Menu ruang kerja
            </>
          }
          title="Ruang kerjamu"
          description={`Navigasi ${roleLabels[peran]}.`}
        >
          {menu(true)}
        </Dialog>
      </div>
      <div className="grid min-h-[550px] gap-10 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden border-r pr-6 md:block">{menu()}</aside>
        <main id="main-content" tabIndex={-1} className="min-w-0 outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
