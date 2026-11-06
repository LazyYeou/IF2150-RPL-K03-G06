import { notFound } from "next/navigation";
import SectionPlaceholder from "@/views/dashboard/SectionPlaceholder";
const sections: Record<string, [string, string]> = {
  lowongan: [
    "Lowongan saya",
    "Kelola kebutuhan pekerjaan dan temukan tenaga kerja yang sesuai.",
  ],
  transaksi: [
    "Transaksi",
    "Pantau pekerjaan, pembayaran, dan hasil yang perlu ditinjau.",
  ],
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
      home="/pk"
    />
  );
}
