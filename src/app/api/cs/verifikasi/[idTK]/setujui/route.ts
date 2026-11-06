import { prosesPersetujuanVerifikasi } from "@/controllers/CustomerServiceController";
import { toResponse } from "@/lib/errors";

// POST /api/cs/verifikasi/:idTK/setujui (CS)
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ idTK: string }> },
) {
  try {
    return Response.json(
      await prosesPersetujuanVerifikasi((await params).idTK),
    );
  } catch (e) {
    return toResponse(e);
  }
}
