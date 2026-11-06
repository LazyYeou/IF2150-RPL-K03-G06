import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, FileText, Wallet } from "lucide-react";
import { penggunaHalaman } from "@/controllers/LayoutController";
import { ambilPenawaranSaya } from "@/controllers/PengajuanPenawaranController";
import { ambilLowonganSaya } from "@/controllers/LowonganPekerjaanController";
import type { Peran } from "@/lib/auth/session";
import { EmptyState } from "@/components/ui/empty-state";

export default async function RoleHome({ peran }: { peran: Peran }) {
  const pengguna = await penggunaHalaman(peran);
  const tk = peran === "TK";
  const total = tk
    ? (await ambilPenawaranSaya({ status: "MENUNGGU" })).total
    : (await ambilLowonganSaya({})).total;
  const aktivitas = tk ? "/tk/lamaran" : "/pk/lowongan";
  const keuangan = tk ? "/tk/dompet" : "/pk/transaksi";
  return (
    <>
      <p className="text-xs text-muted-foreground">
        Ruang {tk ? "tenaga kerja" : "penyedia kerja"}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-[34px]">
        Selamat datang, {pengguna.nama.split(" ")[0]}.
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Satu langkah lagi untuk pekerjaan yang berarti.
      </p>
      <section
        className="mt-8 flex flex-col gap-6 rounded-xl bg-[#0b1e41] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-7"
        aria-labelledby="langkah-title"
      >
        <div className="flex items-start gap-4">
          <BriefcaseBusiness
            className="mt-1 size-7 shrink-0 text-brand-orange"
            aria-hidden="true"
          />
          <div>
            <p className="text-xs text-slate-300">Langkah berikutnya</p>
            <h2 id="langkah-title" className="mt-2 text-xl font-semibold">
              {tk
                ? "Temukan kesempatan berikutnya."
                : "Mulai dari kebutuhan yang jelas."}
            </h2>
            <p className="mt-2 text-xs leading-6 text-slate-300">
              {tk
                ? "Pantau pekerjaan dan bangun kesepakatan yang baik."
                : "Tetapkan lingkup, jadwal, dan upah pekerjaanmu."}
            </p>
          </div>
        </div>
        <Link
          href={tk ? "/tk/pekerjaan" : aktivitas}
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-lg bg-brand-orange px-4 text-sm font-semibold text-navy"
        >
          {tk ? "Lihat pekerjaan" : "Kelola lowongan"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
      <div className="my-8 grid gap-5 sm:grid-cols-2">
        <Link
          href={aktivitas}
          className="flex min-h-16 items-center gap-3 border-b py-4"
        >
          <FileText className="size-6" aria-hidden="true" />
          <strong className="text-xl">{total}</strong>
          <span className="flex-1 text-sm">
            {tk ? "Penawaran menunggu" : "Lowongan saya"}
          </span>
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link
          href={keuangan}
          className="flex min-h-16 items-center gap-3 border-b py-4"
        >
          <Wallet className="size-6" aria-hidden="true" />
          <span className="flex-1 text-sm">Status keuangan</span>
          <strong className="text-sm">Lihat rincian</strong>
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <section className="mt-10" aria-labelledby="ringkasan-title">
        <h2 id="ringkasan-title" className="mb-5 text-xl font-semibold">
          {tk ? "Peluang untuk langkah berikutnya" : "Temukan orang yang tepat"}
        </h2>
        <div data-slot="dashboard-summary">
          <EmptyState title="Ruang untuk aktivitasmu">
            Ringkasan pekerjaan dan informasi terbaru akan tampil di sini.
          </EmptyState>
        </div>
      </section>
      <Link
        href="/bantuan"
        className="mt-4 inline-flex min-h-11 items-center text-sm font-medium"
      >
        Butuh bantuan dengan pekerjaanmu?
      </Link>
    </>
  );
}
