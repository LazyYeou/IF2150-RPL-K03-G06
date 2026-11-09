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
      <main className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            {section[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{section[1]}</p>
        </div>
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
