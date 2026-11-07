import { notFound } from "next/navigation";
import SectionPlaceholder from "@/views/dashboard/SectionPlaceholder";
import { ambilTransaksiSaya } from "@/controllers/TransaksiPekerjaanController";
import DaftarTransaksi from "@/views/transaksi/DaftarTransaksi";
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
  if ((await params).section === "transaksi") {
    const data = await ambilTransaksiSaya({ peran: "PK", page: 1 });
    return (
      <main>
        <h1>{section[0]}</h1>
        <p>{section[1]}</p>
        <DaftarTransaksi items={data.items} detailPath="pk" />
      </main>
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
