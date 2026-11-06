import { prosesPenolakanVerifikasi } from "@/controllers/CustomerServiceController";
import { toResponse } from "@/lib/errors";
import { bacaJson } from "@/lib/http";

// POST /api/cs/verifikasi/:idTK/tolak (CS) — alasan wajib
export async function POST(
  req: Request,
  { params }: { params: Promise<{ idTK: string }> },
) {
  try {
    return Response.json(
      await prosesPenolakanVerifikasi((await params).idTK, await bacaJson(req)),
    );
  } catch (e) {
    return toResponse(e);
  }
}
