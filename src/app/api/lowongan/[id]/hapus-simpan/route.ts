import { hapusLowonganTersimpan } from "@/controllers/LowonganTersimpanController";
import { toResponse } from "@/lib/errors";

// POST /api/lowongan/:id/hapus-simpan (TK), idempoten
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return Response.json(await hapusLowonganTersimpan((await params).id));
  } catch (e) {
    return toResponse(e);
  }
}
