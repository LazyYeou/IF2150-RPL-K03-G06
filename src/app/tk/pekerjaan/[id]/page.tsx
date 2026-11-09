import { forbidden, notFound, unauthorized } from "next/navigation";
import { ambilDetailTransaksi } from "@/controllers/TransaksiPekerjaanController";
import DetailTransaksi from "@/views/transaksi/DetailTransaksi";
import { AppError } from "@/lib/errors";

export default async function DetailPekerjaan({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const transaksi = await ambilDetailTransaksi((await params).id);
    return (
      <main>
        <DetailTransaksi
          transaksi={transaksi}
          idTransaksi={(await params).id}
          peran="TK"
        />
      </main>
    );
  } catch (error) {
    if (error instanceof AppError && error.status === 403) forbidden();
    if (error instanceof AppError && error.status === 401) unauthorized();
    if (error instanceof AppError && error.status === 404) notFound();
    notFound();
  }
}
