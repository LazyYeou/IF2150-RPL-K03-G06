import { forbidden, notFound, redirect } from "next/navigation";
import { ambilDetailTransaksi } from "@/controllers/TransaksiPekerjaanController";
import DetailTransaksi from "@/views/transaksi/DetailTransaksi";
import { AppError } from "@/lib/errors";

export default async function DetailTransaksiPK({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const transaksi = await ambilDetailTransaksi(id);
    return (
      <main>
        <DetailTransaksi transaksi={transaksi} />
      </main>
    );
  } catch (error) {
    if (error instanceof AppError && error.status === 403) forbidden();
    if (error instanceof AppError && error.status === 401)
      redirect(`/masuk?next=${encodeURIComponent(`/pk/transaksi/${id}`)}`);
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  }
}
