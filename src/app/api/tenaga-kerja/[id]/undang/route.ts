import { prosesUndangan } from "@/controllers/TenagaKerjaPublikController";
import { toResponse } from "@/lib/errors";
import { bacaJson } from "@/lib/http";

// POST /api/tenaga-kerja/:id/undang (PK pemilik lowongan OPEN)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return Response.json(
      await prosesUndangan((await params).id, await bacaJson(req)),
      { status: 201 },
    );
  } catch (e) {
    return toResponse(e);
  }
}
