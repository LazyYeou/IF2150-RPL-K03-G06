import { notFound } from "next/navigation";
import SectionPlaceholder from "@/views/dashboard/SectionPlaceholder";
import HalamanDaftarTransaksi, {
  type QueryDaftarTransaksi,
} from "@/views/transaksi/HalamanDaftarTransaksi";
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
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<QueryDaftarTransaksi>;
}) {
  const section = sections[(await params).section];
  if (!section) notFound();
  if ((await params).section === "pekerjaan") {
    return (
      <HalamanDaftarTransaksi
        peran="TK"
        title={section[0]}
        description={section[1]}
        query={await searchParams}
      />
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
