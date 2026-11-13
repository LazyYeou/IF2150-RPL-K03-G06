import { ambilAntreanTiket } from "@/controllers/TiketSengketaController";
import { toResponse } from "@/lib/errors";
import { bacaQuery } from "@/lib/http";

// GET /api/cs/tiket (CS) — antrean tiket, ?status=&page=
export async function GET(req: Request) {
  try {
    return Response.json(await ambilAntreanTiket(bacaQuery(req)));
  } catch (e) {
    return toResponse(e);
  }
}
