import { forbidden, notFound, redirect } from "next/navigation";
import { ambilDataFormUlasan } from "@/controllers/TransaksiPekerjaanController";
import { AppError } from "@/lib/errors";
import FormUlasanTransaksi from "@/views/transaksi/FormUlasanTransaksi";

export default async function UlasanPekerjaanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const data = await ambilDataFormUlasan(id);
    return (
      <main>
        <FormUlasanTransaksi {...data} />
      </main>
    );
  } catch (error) {
    if (error instanceof AppError && error.status === 403) forbidden();
    if (error instanceof AppError && error.status === 401)
      redirect(`/masuk?next=${encodeURIComponent(`/tk/pekerjaan/${id}/ulasan`)}`);
    if (
      error instanceof AppError &&
      (error.status === 404 || error.status === 409)
    )
      notFound();
    throw error;
  }
}
