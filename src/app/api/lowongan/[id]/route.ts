import { ambilDetailLowongan } from "@/controllers/LowonganPekerjaanController";
import { toResponse } from "@/lib/errors";

// GET /api/lowongan/:id (publik)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return Response.json(await ambilDetailLowongan((await params).id));
  } catch (e) {
    return toResponse(e);
  }
}
