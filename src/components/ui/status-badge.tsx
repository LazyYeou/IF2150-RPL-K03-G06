import { cn } from "@/lib/utils";
const statuses: Record<string, { label: string; tone: string }> = {
  OPEN: { label: "Terbuka", tone: "bg-teal-50 text-teal-800" },
  BELUM_TERVERIFIKASI: {
    label: "Belum terverifikasi",
    tone: "bg-muted text-muted-foreground",
  },
  MENUNGGU: {
    label: "Menunggu tanggapan",
    tone: "bg-muted text-muted-foreground",
  },
  MENUNGGU_VERIFIKASI: {
    label: "Menunggu verifikasi",
    tone: "bg-amber-50 text-amber-900",
  },
  TERVERIFIKASI: { label: "Terverifikasi", tone: "bg-teal-50 text-teal-800" },
  DITERIMA: { label: "Diterima", tone: "bg-teal-50 text-teal-800" },
  DITARIK: { label: "Ditarik", tone: "bg-muted text-muted-foreground" },
  DITOLAK_OTOMATIS: {
    label: "Ditolak otomatis",
    tone: "bg-red-50 text-red-800",
  },
  DITOLAK: { label: "Ditolak", tone: "bg-red-50 text-red-800" },
  MENUNGGU_PEMBAYARAN: {
    label: "Menunggu pembayaran",
    tone: "bg-amber-50 text-amber-900",
  },
  IN_PROGRESS: { label: "Sedang dikerjakan", tone: "bg-blue-50 text-blue-900" },
  SUBMITTED: {
    label: "Menunggu pemeriksaan",
    tone: "bg-amber-50 text-amber-900",
  },
  COMPLETED: { label: "Selesai", tone: "bg-teal-50 text-teal-800" },
  DISENGKETAKAN: {
    label: "Dalam peninjauan CS",
    tone: "bg-amber-50 text-amber-900",
  },
  DIBATALKAN: { label: "Dibatalkan", tone: "bg-muted text-muted-foreground" },
};
export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const info = statuses[status] ?? {
    label: status,
    tone: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium",
        info.tone,
        className,
      )}
    >
      {info.label}
    </span>
  );
}
