import { prosesPemilihanPelamar } from "@/controllers/PengajuanPenawaranController";
import { toResponse } from "@/lib/errors";

// POST /api/penawaran/:id/terima (PK pemilik lowongan)
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return Response.json(await prosesPemilihanPelamar((await params).id));
  } catch (e) {
    return toResponse(e);
  }
}
