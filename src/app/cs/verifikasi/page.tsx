import { ambilAntreanVerifikasi } from "@/controllers/CustomerServiceController";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog } from "@/components/ui/dialog";
import { formatTanggal } from "@/lib/format";
import { ShieldCheck, ExternalLink } from "lucide-react";
export default async function Verifikasi() {
  const { items } = await ambilAntreanVerifikasi();
  return (
    <>
      <p className="text-xs text-muted-foreground">Ruang Customer Service</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Verifikasi identitas
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Tinjau identitas tenaga kerja agar kesempatan kerja dimulai dengan aman.
      </p>
      <section className="my-8 flex items-center gap-4 rounded-xl bg-[#0b1e41] p-6 text-white">
        <ShieldCheck className="size-7 text-brand-orange" aria-hidden="true" />
        <div>
          <p className="text-sm text-slate-300">Menunggu pemeriksaan</p>
          <p className="mt-1 text-2xl font-semibold">
            {items.length} pengajuan
          </p>
        </div>
      </section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Antrean verifikasi</h2>
        <p className="text-xs text-muted-foreground">
          Pengajuan terlama ditampilkan lebih dulu
        </p>
      </div>
      {items.length === 0 ? (
        <EmptyState title="Antrean sudah tertangani">
          Pengajuan identitas baru akan muncul di sini.
        </EmptyState>
      ) : (
        <ul className="divide-y rounded-xl border">
          {items.map((item) => (
            <li
              key={item.idTenagaKerja}
              className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <StatusBadge status="MENUNGGU_VERIFIKASI" />
                <h3 className="mt-3 font-semibold">{item.nama}</h3>
                <p className="mt-1 break-all text-sm text-muted-foreground">
                  {item.email}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Diajukan {formatTanggal(item.waktuPengajuan)}
                </p>
              </div>
              <Dialog
                trigger="Tinjau pengajuan"
                title={`Pengajuan ${item.nama}`}
                description="Periksa kecocokan identitas dan kelengkapan dokumen sebelum menetapkan hasil verifikasi."
              >
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="break-all">{item.email}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Waktu pengajuan</dt>
                    <dd>{formatTanggal(item.waktuPengajuan)}</dd>
                  </div>
                </dl>
                <a
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm text-white"
                  href={`/api/cs/verifikasi/${item.idTenagaKerja}/dokumen`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buka dokumen
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
                <p className="mt-3 text-xs leading-6 text-muted-foreground">
                  Dokumen hanya dapat diakses petugas yang berwenang. Jika
                  dokumen tidak tersedia, lakukan pemeriksaan kelengkapan
                  terlebih dahulu.
                </p>
              </Dialog>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
