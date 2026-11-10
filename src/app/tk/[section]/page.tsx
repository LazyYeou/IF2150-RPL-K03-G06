import { notFound } from "next/navigation";
import SectionPlaceholder from "@/views/dashboard/SectionPlaceholder";
import HalamanDaftarTransaksi, {
  type QueryDaftarTransaksi,
} from "@/views/transaksi/HalamanDaftarTransaksi";
import HalamanDompet from "@/views/dompet/HalamanDompet";

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
  const { section: sectionKey } = await params;
  const section = sections[sectionKey];
  if (!section) notFound();

  if (sectionKey === "pekerjaan") {
    return (
      <HalamanDaftarTransaksi
        peran="TK"
        title={section[0]}
        description={section[1]}
        query={await searchParams}
      />
    );
  }

  if (sectionKey === "dompet") {
    return <HalamanDompet />;
  }

  return (
    <SectionPlaceholder
      title={section[0]}
      description={section[1]}
      home="/tk"
    />
  );
}
