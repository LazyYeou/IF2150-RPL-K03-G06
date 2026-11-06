import { ambilStatusVerifikasi } from "@/controllers/TenagaKerjaController";
import { toResponse } from "@/lib/errors";

// GET /api/verifikasi/status (TK)
export async function GET() {
  try {
    return Response.json(await ambilStatusVerifikasi());
  } catch (e) {
    return toResponse(e);
  }
}
