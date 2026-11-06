import { ambilPenawaranSaya } from "@/controllers/PengajuanPenawaranController";
import { toResponse } from "@/lib/errors";
import { bacaQuery } from "@/lib/http";

// GET /api/penawaran/saya?status=&page= (TK)
export async function GET(req: Request) {
  try {
    return Response.json(await ambilPenawaranSaya(bacaQuery(req)));
  } catch (e) {
    return toResponse(e);
  }
}
