import { batalkanTiket } from "@/controllers/TiketSengketaController";
import { toResponse } from "@/lib/errors";

// POST /api/tiket/:id/batal (pelapor, status DIAJUKAN)
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return Response.json(await batalkanTiket((await params).id));
  } catch (e) {
    return toResponse(e);
  }
}
