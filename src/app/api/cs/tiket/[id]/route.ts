import { ambilTiketUntukCS } from "@/controllers/TiketSengketaController";
import { toResponse } from "@/lib/errors";

// GET /api/cs/tiket/:id (CS)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return Response.json(await ambilTiketUntukCS((await params).id));
  } catch (e) {
    return toResponse(e);
  }
}
