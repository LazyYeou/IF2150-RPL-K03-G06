import { prosesTolakTiket } from "@/controllers/TiketSengketaController";
import { toResponse } from "@/lib/errors";
import { bacaJson } from "@/lib/http";

// POST /api/cs/tiket/:id/tolak (CS)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return Response.json(
      await prosesTolakTiket((await params).id, await bacaJson(req)),
    );
  } catch (e) {
    return toResponse(e);
  }
}
