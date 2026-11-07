import { notFound } from "next/navigation";
import SectionPlaceholder from "@/views/dashboard/SectionPlaceholder";
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
  return (
    <SectionPlaceholder
      title={section[0]}
      description={section[1]}
      home="/tk"
    />
  );
}
