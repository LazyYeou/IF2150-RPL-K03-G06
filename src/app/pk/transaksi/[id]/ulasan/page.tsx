import { forbidden, notFound, unauthorized } from "next/navigation";
import { ambilDataFormUlasan } from "@/controllers/TransaksiPekerjaanController";
import { AppError } from "@/lib/errors";
import FormUlasanTransaksi from "@/views/transaksi/FormUlasanTransaksi";

export default async function UlasanTransaksiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const data = await ambilDataFormUlasan((await params).id);
    return (
      <main>
        <FormUlasanTransaksi {...data} />
      </main>
    );
  } catch (error) {
    if (error instanceof AppError && error.status === 403) forbidden();
    if (error instanceof AppError && error.status === 401) unauthorized();
    if (
      error instanceof AppError &&
      (error.status === 404 || error.status === 409)
    )
      notFound();
    notFound();
  }
}
