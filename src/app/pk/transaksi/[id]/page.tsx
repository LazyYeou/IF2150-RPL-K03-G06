import { notFound } from "next/navigation";
import { ambilDetailTransaksi } from "@/controllers/TransaksiPekerjaanController";
import DetailTransaksi from "@/views/transaksi/DetailTransaksi";

export default async function DetailTransaksiPK({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const transaksi = await ambilDetailTransaksi((await params).id);
    return (
      <main>
        <DetailTransaksi transaksi={transaksi} />
      </main>
    );
  } catch {
    notFound();
  }
}
