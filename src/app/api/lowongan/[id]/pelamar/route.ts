import { ambilDaftarPelamar } from "@/controllers/PengajuanPenawaranController";
import { toResponse } from "@/lib/errors";

// GET /api/lowongan/:id/pelamar (PK pemilik)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return Response.json(await ambilDaftarPelamar((await params).id));
  } catch (e) {
    return toResponse(e);
  }
}
