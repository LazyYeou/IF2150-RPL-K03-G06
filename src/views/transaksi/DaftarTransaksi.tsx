import Link from "next/link";

type Item = {
  id: string;
  judul: string;
  status: string;
  nominalUpah: number;
  createdAt: string;
};

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    MENUNGGU_PEMBAYARAN: "Menunggu pembayaran",
    IN_PROGRESS: "Sedang dikerjakan",
    SUBMITTED: "Menunggu pemeriksaan",
    COMPLETED: "Selesai",
    DISENGKETAKAN: "Disengketakan",
    DIBATALKAN: "Dibatalkan",
    DIPROSES: "Diproses",
    BERHASIL: "Berhasil",
    GAGAL: "Gagal",
    KEDALUWARSA: "Kedaluwarsa",
    DIKEMBALIKAN: "Dikembalikan",
  };
  return map[status] ?? status.replace(/_/g, " ");
}

function badgeClass(status: string): string {
  switch (status) {
    case "MENUNGGU_PEMBAYARAN":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-800 border-blue-200";
    case "SUBMITTED":
      return "bg-purple-50 text-purple-800 border-purple-200";
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "DISENGKETAKAN":
      return "bg-rose-50 text-rose-800 border-rose-200";
    case "DIBATALKAN":
    case "KEDALUWARSA":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-50 text-gray-800 border-gray-200";
  }
}

export default function DaftarTransaksi({
  items,
  detailPath,
}: {
  items: Item[];
  detailPath: "tk" | "pk";
}) {
  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Belum ada transaksi pekerjaan.
      </div>
    );
  }

  return (
    <div className="grid gap-3.5">
      {items.map((item) => {
        const linkDetail = `/${detailPath}/${detailPath === "tk" ? "pekerjaan" : "transaksi"}/${item.id}`;
        const linkBayar = `/${detailPath}/transaksi/${item.id}/bayar`;
        const perluBayar = detailPath === "pk" && item.status === "MENUNGGU_PEMBAYARAN";

        return (
          <div
            key={item.id}
            className="group rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs transition hover:border-gray-400"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <Link href={linkDetail} className="space-y-1 block flex-1">
                <h3 className="text-base font-semibold text-foreground group-hover:text-brand-orange transition-colors">
                  {item.judul}
                </h3>
                <p className="text-sm font-medium text-navy">
                  {formatRupiah(item.nominalUpah)}
                </p>
              </Link>

              <div className="flex items-center gap-2.5 shrink-0">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass(
                    item.status,
                  )}`}
                >
                  {formatStatus(item.status)}
                </span>

                {perluBayar && (
                  <Link
                    href={linkBayar}
                    className="inline-flex items-center rounded-lg bg-brand-orange px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-orange-600 transition-colors"
                  >
                    Bayar
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
