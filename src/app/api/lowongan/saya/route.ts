import { ambilLowonganSaya } from "@/controllers/LowonganPekerjaanController";
import { toResponse } from "@/lib/errors";
import { bacaQuery } from "@/lib/http";

// GET /api/lowongan/saya?page= (PK)
export async function GET(req: Request) {
  try {
    return Response.json(await ambilLowonganSaya(bacaQuery(req)));
  } catch (e) {
    return toResponse(e);
  }
}
