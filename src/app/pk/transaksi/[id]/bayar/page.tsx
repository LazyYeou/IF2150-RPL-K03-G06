import { forbidden, notFound, unauthorized } from "next/navigation";
import { ambilDataHalamanBayar } from "@/controllers/TagihanPembayaranController";
import TagihanPembayaranUI from "@/views/TagihanPembayaranUI";
import { AppError } from "@/lib/errors";

export default async function HalamanBayarPK({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const { transaksi, tagihan } = await ambilDataHalamanBayar(id);

    return (
      <main className="py-8">
        <TagihanPembayaranUI transaksi={transaksi} tagihan={tagihan} />
      </main>
    );
  } catch (error) {
    if (error instanceof AppError) {
      if (error.status === 401) unauthorized();
      if (error.status === 403) forbidden();
      if (error.status === 404) notFound();
    }
    notFound();
  }
}
