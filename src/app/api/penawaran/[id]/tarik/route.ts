import { batalkanPengajuan } from "@/controllers/PengajuanPenawaranController";
import { toResponse } from "@/lib/errors";

// POST /api/penawaran/:id/tarik (TK pemilik, status MENUNGGU)
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return Response.json(await batalkanPengajuan((await params).id));
  } catch (e) {
    return toResponse(e);
  }
}
