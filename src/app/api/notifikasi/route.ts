import { ambilNotifikasi } from "@/controllers/NotifikasiController";
import { toResponse } from "@/lib/errors";
import { bacaQuery } from "@/lib/http";
export async function GET(req: Request) {
  try {
    return Response.json(await ambilNotifikasi(bacaQuery(req)), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return toResponse(e);
  }
}
