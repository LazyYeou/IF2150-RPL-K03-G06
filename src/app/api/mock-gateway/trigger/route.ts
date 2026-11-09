import { prosesNotifikasiWebhook } from "@/controllers/PaymentGatewayController";
import { cariTagihanBerdasarkanId } from "@/models/TagihanPembayaran";
import { tandaTanganiWebhook } from "@/lib/payment/mock";
import { AppError, toResponse } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const provider = (process.env.PAYMENT_PROVIDER ?? "mock").toLowerCase();
    if (provider !== "mock") {
      throw new AppError("FORBIDDEN", 403, "Mock gateway hanya aktif saat PAYMENT_PROVIDER=mock");
    }

    const body = await req.json();
    const idTagihan = String(body.idTagihan ?? "");
    const status = String(body.status ?? "BERHASIL").toUpperCase();

    const tagihan = cariTagihanBerdasarkanId(idTagihan);
    if (!tagihan) {
      throw new AppError("NOT_FOUND", 404, "Tagihan tidak ditemukan");
    }

    const payload = {
      idTagihan: tagihan.id,
      nominal: tagihan.totalBayar,
      status,
      idempotencyKey: tagihan.id,
    };

    const { rawBody, signature } = tandaTanganiWebhook(payload);

    await prosesNotifikasiWebhook(rawBody, signature);

    return Response.json({
      success: true,
      status,
      redirectUrl: `/pk/transaksi/${tagihan.idTransaksi}`,
    });
  } catch (e) {
    return toResponse(e);
  }
}
