export type Role = "TK" | "PK" | "CS";
export const roleLabels: Record<Role, string> = {
  TK: "Tenaga kerja",
  PK: "Penyedia kerja",
  CS: "Customer Service",
};
export const roleHome: Record<Role, string> = {
  TK: "/tk",
  PK: "/pk",
  CS: "/cs",
};
export const roleMenus = {
  TK: [
    { label: "Dashboard", href: "/tk", icon: "dashboard" },
    { label: "Lamaran saya", href: "/tk/lamaran", icon: "file" },
    { label: "Pekerjaan saya", href: "/tk/pekerjaan", icon: "briefcase" },
    { label: "Dompet", href: "/tk/dompet", icon: "wallet" },
    { label: "Profil saya", href: "/profil", icon: "user" },
  ],
  PK: [
    { label: "Dashboard", href: "/pk", icon: "dashboard" },
    { label: "Lowongan saya", href: "/pk/lowongan", icon: "file" },
    { label: "Transaksi", href: "/pk/transaksi", icon: "wallet" },
    { label: "Profil saya", href: "/profil", icon: "user" },
  ],
  CS: [
    { label: "Verifikasi identitas", href: "/cs/verifikasi", icon: "shield" },
    { label: "Tiket & sengketa", href: "/cs/tiket", icon: "ticket" },
  ],
} as const;
export function menuAktif(pathname: string, href: string) {
  return (
    pathname === href ||
    (!Object.values(roleHome).includes(href) && pathname.startsWith(href + "/"))
  );
}
