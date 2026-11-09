import { notFound } from "next/navigation";
import { ambilDataMockGateway } from "@/controllers/TagihanPembayaranController";
import MockGatewayUI from "@/views/MockGatewayUI";
import { AppError } from "@/lib/errors";

export default async function MockGatewayPage({
  params,
}: {
  params: Promise<{ idTagihan: string }>;
}) {
  const provider = (process.env.PAYMENT_PROVIDER ?? "mock").toLowerCase();
  if (provider !== "mock") {
    notFound();
  }

  const { idTagihan } = await params;
  try {
    const { tagihan, transaksi } = await ambilDataMockGateway(idTagihan);

    return (
      <main className="min-h-screen bg-muted/20">
        <MockGatewayUI
          tagihan={{
            id: tagihan.id,
            idTransaksi: tagihan.idTransaksi,
            nominalUpah: tagihan.nominalUpah,
            commissionFee: tagihan.commissionFee,
            totalBayar: tagihan.totalBayar,
            metode: tagihan.metode,
            status: tagihan.status,
          }}
          transaksi={{
            idTransaksi: transaksi.idTransaksi,
            judulLowongan: transaksi.judulLowongan,
            namaTenagaKerja: transaksi.namaTenagaKerja,
            statusPekerjaan: transaksi.statusPekerjaan,
          }}
        />
      </main>
    );
  } catch (err: unknown) {
    if (err instanceof AppError && err.status === 404) {
      notFound();
    }
    notFound();
  }
}
