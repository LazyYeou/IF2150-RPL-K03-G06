import { ambilTenagaKerja } from "@/controllers/TenagaKerjaPublikController";
import { toResponse } from "@/lib/errors";

// GET /api/tenaga-kerja/:id (publik; id = id pengguna)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return Response.json(await ambilTenagaKerja((await params).id));
  } catch (e) {
    return toResponse(e);
  }
}
