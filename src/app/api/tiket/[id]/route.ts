import { ambilDetailTiket } from "@/controllers/TiketSengketaController";
import { toResponse } from "@/lib/errors";

// GET /api/tiket/:id (pelapor / peserta / CS)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return Response.json(await ambilDetailTiket((await params).id));
  } catch (e) {
    return toResponse(e);
  }
}
