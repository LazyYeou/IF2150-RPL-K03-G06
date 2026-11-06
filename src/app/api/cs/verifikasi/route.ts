import { ambilAntreanVerifikasi } from "@/controllers/CustomerServiceController";
import { toResponse } from "@/lib/errors";

// GET /api/cs/verifikasi (CS) — antrean MENUNGGU_VERIFIKASI
export async function GET() {
  try {
    return Response.json(await ambilAntreanVerifikasi());
  } catch (e) {
    return toResponse(e);
  }
}
