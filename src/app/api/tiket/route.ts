import { prosesPembuatanTiket } from "@/controllers/TiketSengketaController";
import { toResponse } from "@/lib/errors";
import { bacaForm } from "@/lib/http";

// POST /api/tiket (user; peserta bila ada idTransaksi), multipart
export async function POST(req: Request) {
  try {
    return Response.json(await prosesPembuatanTiket(await bacaForm(req)), {
      status: 201,
    });
  } catch (e) {
    return toResponse(e);
  }
}
