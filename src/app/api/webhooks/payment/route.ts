import { prosesNotifikasiWebhook } from "@/controllers/PaymentGatewayController";
import { toResponse } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get("x-callback-signature") ??
      req.headers.get("x-signature") ??
      req.headers.get("signature");

    const result = await prosesNotifikasiWebhook(rawBody, signature);
    return Response.json(result);
  } catch (e) {
    return toResponse(e);
  }
}
