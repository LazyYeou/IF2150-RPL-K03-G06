import { penggunaHalaman } from "@/controllers/LayoutController";
import WorkspaceShell from "@/views/layout/WorkspaceShell";
export default async function Bantuan() {
  const user = await penggunaHalaman();
  return (
    <WorkspaceShell peran={user.peran} nama={user.nama}>
      <h1 className="text-3xl font-semibold">Pusat bantuan</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Kesepakatan jelas membantu pekerjaan berjalan dengan baik.
      </p>
      <div className="mt-8 space-y-5">
        {[
          {
            title: "Sebelum mulai bekerja",
            text: "Pastikan lingkup pekerjaan, jadwal, dan upah sudah disepakati bersama.",
          },
          {
            title: "Verifikasi identitas",
            text: "Tenaga kerja perlu memverifikasi identitas sebelum mengajukan penawaran dan menerima pekerjaan.",
          },
          {
            title: "Keluhan dan sengketa",
            text: "Siapkan kronologi dan bukti pendukung agar Customer Service dapat memeriksa kendala pekerjaan atau pembayaran.",
          },
        ].map((s) => (
          <section className="rounded-xl border p-6" key={s.title}>
            <h2 className="font-semibold">{s.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {s.text}
            </p>
          </section>
        ))}
      </div>
    </WorkspaceShell>
  );
}
