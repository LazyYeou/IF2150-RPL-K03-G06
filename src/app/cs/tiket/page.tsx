import { penggunaHalaman } from "@/controllers/LayoutController";
import { EmptyState } from "@/components/ui/empty-state";
import { FileSearch, History, Scale } from "lucide-react";
export default async function Tiket() {
  await penggunaHalaman("CS");
  return (
    <>
      <p className="text-xs text-muted-foreground">Ruang Customer Service</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Tiket & sengketa
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Bantu pengguna menyelesaikan kendala pekerjaan dan pembayaran
        berdasarkan bukti.
      </p>
      <div className="my-8 grid gap-4 lg:grid-cols-3">
        {[
          {
            Icon: FileSearch,
            title: "Tinjau laporan",
            text: "Periksa keluhan, pihak terkait, dan bukti pendukung.",
          },
          {
            Icon: History,
            title: "Telusuri riwayat",
            text: "Ikuti perubahan status dan aktivitas penanganan secara kronologis.",
          },
          {
            Icon: Scale,
            title: "Tentukan penyelesaian",
            text: "Minta bukti tambahan, tolak laporan, atau putuskan refund/pencairan sesuai hasil pemeriksaan.",
          },
        ].map(({ Icon, title, text }) => (
          <section key={title} className="rounded-xl border p-5">
            <Icon className="mb-4 size-6 text-navy" aria-hidden="true" />
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {text}
            </p>
          </section>
        ))}
      </div>
      <EmptyState title="Ruang penanganan tiket">
        Daftar keluhan, bukti pendukung, dan riwayat penanganan akan ditampilkan
        di sini.
      </EmptyState>
    </>
  );
}
