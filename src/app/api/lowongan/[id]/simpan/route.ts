import { simpanLowongan } from "@/controllers/LowonganTersimpanController";
import { toResponse } from "@/lib/errors";

// POST /api/lowongan/:id/simpan (TK), idempoten
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return Response.json(await simpanLowongan((await params).id));
  } catch (e) {
    return toResponse(e);
  }
}
