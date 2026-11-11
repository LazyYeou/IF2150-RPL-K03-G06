import { ambilLowonganTersimpan } from "@/controllers/LowonganTersimpanController";
import { toResponse } from "@/lib/errors";
import { bacaQuery } from "@/lib/http";

// GET /api/lowongan-tersimpan?page= (TK)
export async function GET(req: Request) {
  try {
    return Response.json(await ambilLowonganTersimpan(bacaQuery(req)));
  } catch (e) {
    return toResponse(e);
  }
}
