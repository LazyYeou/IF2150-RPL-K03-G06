import { notFound } from "next/navigation";
import SectionPlaceholder from "@/views/dashboard/SectionPlaceholder";
import HalamanDaftarTransaksi, {
  type QueryDaftarTransaksi,
} from "@/views/transaksi/HalamanDaftarTransaksi";

const sections: Record<string, [string, string]> = {
  transaksi: [
    "Transaksi",
    "Pantau pekerjaan, pembayaran, dan hasil yang perlu ditinjau.",
  ],
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
  if ((await params).section === "transaksi") {
    return (
      <HalamanDaftarTransaksi
        peran="PK"
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
      home="/pk"
    />
  );
}
