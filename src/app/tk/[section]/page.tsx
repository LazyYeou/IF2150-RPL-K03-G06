import { notFound } from "next/navigation";
import SectionPlaceholder from "@/views/dashboard/SectionPlaceholder";
import { ambilTransaksiSaya } from "@/controllers/TransaksiPekerjaanController";
import DaftarTransaksi from "@/views/transaksi/DaftarTransaksi";
const sections: Record<string, [string, string]> = {
  lamaran: [
    "Lamaran saya",
    "Pantau penawaran dan perkembangan lamaranmu di satu tempat.",
  ],
  pekerjaan: [
    "Pekerjaan saya",
    "Pantau pekerjaan, hasil, dan status penyelesaiannya.",
  ],
  dompet: ["Dompet", "Lihat pendapatan dan kelola pencairan upahmu."],
};
export default async function Section({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const section = sections[(await params).section];
  if (!section) notFound();
  if ((await params).section === "pekerjaan") {
    const data = await ambilTransaksiSaya({ peran: "TK", page: 1 });
    return (
      <main>
        <h1>{section[0]}</h1>
        <p>{section[1]}</p>
        <DaftarTransaksi items={data.items} detailPath="tk" />
      </main>
    );
  }
  return (
    <SectionPlaceholder
      title={section[0]}
      description={section[1]}
      home="/tk"
    />
  );
}
