import { prosesNotifikasiWebhook } from "@/controllers/PaymentGatewayController";
import { cariTagihanBerdasarkanId } from "@/models/TagihanPembayaran";
import { cariPencairanBerdasarkanId } from "@/models/PencairanDana";
import { tandaTanganiWebhook } from "@/lib/payment/mock";
import { AppError, toResponse } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const provider = (process.env.PAYMENT_PROVIDER ?? "mock").toLowerCase();
    if (provider !== "mock") {
      throw new AppError(
        "FORBIDDEN",
        403,
        "Mock gateway hanya aktif saat PAYMENT_PROVIDER=mock",
      );
    }

    const body = await req.json();
    const status = String(body.status ?? "BERHASIL").toUpperCase();

    // Simulasi Webhook Pencairan Dana
    if (body.idPencairan) {
      const idPencairan = String(body.idPencairan);
      const pencairan = cariPencairanBerdasarkanId(idPencairan);
      if (!pencairan) {
        throw new AppError("NOT_FOUND", 404, "Pencairan dana tidak ditemukan");
      }

      const payload = {
        jenis: "PENCAIRAN",
        idPencairan: pencairan.id,
        referensiId: pencairan.id,
        nominal: pencairan.nominal,
        status,
        idempotencyKey: pencairan.id,
        waktu: new Date().toISOString(),
      };

      const { rawBody, signature } = tandaTanganiWebhook(payload);
      await prosesNotifikasiWebhook(rawBody, signature);

      return Response.json({
        success: true,
        status,
        redirectUrl: "/tk/dompet",
      });
    }

    // Simulasi Webhook Pembayaran Tagihan
    const idTagihan = String(body.idTagihan ?? "");
    const tagihan = cariTagihanBerdasarkanId(idTagihan);
    if (!tagihan) {
      throw new AppError("NOT_FOUND", 404, "Tagihan tidak ditemukan");
    }

    const payload = {
      idTagihan: tagihan.id,
      nominal: tagihan.totalBayar,
      status,
      idempotencyKey: tagihan.id,
      waktu: new Date().toISOString(),
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
