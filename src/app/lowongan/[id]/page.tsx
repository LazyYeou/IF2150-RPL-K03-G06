import DialogPenawaran from "@/views/penawaran/DialogPenawaran";
import { konteksPenawaran } from "@/controllers/PengajuanPenawaranController";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ambilDetailLowongan } from "@/controllers/LowonganPekerjaanController";
import { AppError } from "@/lib/errors";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";
export default async function Detail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let item;
  try {
    item = await ambilDetailLowongan(id);
  } catch (e) {
    if (e instanceof AppError && e.status === 404) notFound();
    throw e;
  }
  const konteks = await konteksPenawaran();
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="site-container py-12 outline-none"
    >
      <Link
        href="/lowongan"
        className="inline-flex min-h-11 items-center text-sm text-muted-foreground"
      >
        ← Semua pekerjaan
      </Link>
      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_300px]">
        <article>
          <StatusBadge status={item.status} />
          <h1 className="mt-4 text-3xl font-semibold">{item.judul}</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {item.lokasi} · {formatTanggal(item.tanggalPekerjaan)} ·{" "}
            {item.estimasiDurasi}
          </p>
          {[
            { title: "Deskripsi pekerjaan", text: item.deskripsi },
            { title: "Ruang lingkup", text: item.ruangLingkup },
            { title: "Kriteria keberhasilan", text: item.kriteriaHasil },
          ].map((s) => (
            <section key={s.title} className="mt-8 border-t pt-6">
              <h2 className="text-xl font-semibold">{s.title}</h2>
              <p className="mt-3 text-sm leading-7 whitespace-pre-line text-muted-foreground">
                {s.text}
              </p>
            </section>
          ))}
        </article>
        <aside className="h-fit rounded-xl border bg-muted/50 p-6">
          <p className="text-sm text-muted-foreground">Upah yang ditawarkan</p>
          <p className="mt-3 text-3xl font-semibold">
            {formatRupiah(item.upah)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            /{item.satuanUpah === "PER_HARI" ? "hari" : "tugas"}
          </p>
          <p className="mt-3 text-sm">{item.kategori}</p>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            Tinjau ruang lingkup dan sepakati upah sebelum mulai bekerja.
          </p>
          <section className="mt-6 border-t pt-5" aria-labelledby="provider-title">
            <h2 id="provider-title" className="text-sm font-semibold">
              Penyedia kerja
            </h2>
            <p className="mt-2 text-sm">{item.penyedia.nama}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Rating {item.penyedia.akumulasiRating.toFixed(1)} ·{" "}
              {item.penyedia.jumlahUlasan} ulasan
            </p>
          </section>
          <DialogPenawaran
            key={`${item.id}:${konteks.idPengguna ?? "publik"}`}
            lowongan={item}
            peran={konteks.peran}
            terverifikasi={konteks.terverifikasi}
          />
        </aside>
      </div>
    </main>
  );
}
