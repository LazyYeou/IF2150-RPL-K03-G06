import Link from "next/link";
import { ArrowUpRight, MapPin, BriefcaseBusiness } from "lucide-react";
import { prosesCariLowongan } from "@/controllers/LowonganPekerjaanController";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
export default async function Lowongan() {
  const { items } = await prosesCariLowongan({});
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="site-container py-12 outline-none"
    >
      <p className="text-xs text-muted-foreground">
        Peluang baru dimulai di sini
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">
        Temukan pekerjaan
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Keahlianmu dibutuhkan. Cari pekerjaan yang pas untukmu.
      </p>
      <div className="mt-10 divide-y rounded-xl border">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/lowongan/${item.id}`}
            className="flex min-h-32 flex-col gap-4 p-5 hover:bg-muted sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex gap-4">
              <BriefcaseBusiness
                className="mt-1 size-8 shrink-0 rounded bg-teal-50 p-1 text-teal-800"
                aria-hidden="true"
              />
              <div>
                <p className="mb-2 text-xs text-muted-foreground">
                  {item.kategori} · <StatusBadge status={item.status} />
                </p>
                <h2 className="font-semibold">{item.judul}</h2>
                <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {item.lokasi} · {formatTanggal(item.tanggalPekerjaan)}
                </p>
              </div>
            </div>
            <div className="text-sm sm:text-right">
              <strong className="text-lg">{formatRupiah(item.upah)}</strong>
              <span className="text-xs text-muted-foreground">
                /{item.satuanUpah === "PER_HARI" ? "hari" : "tugas"}
              </span>
              <p className="mt-2 inline-flex items-center gap-2 text-xs">
                Lihat detail
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </p>
            </div>
          </Link>
        ))}
      </div>
      {items.length === 0 && (
        <EmptyState title="Belum ada pekerjaan terbuka">
          Peluang baru akan muncul setelah penyedia kerja memasang lowongan.
        </EmptyState>
      )}
    </main>
  );
}
