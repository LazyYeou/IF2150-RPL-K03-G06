import { ambilProfil, perbaruiProfil } from "@/controllers/ProfilController";
import { toResponse } from "@/lib/errors";
import { bacaJson } from "@/lib/http";
export async function GET() {
  try {
    return Response.json(await ambilProfil(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return toResponse(e);
  }
}
export async function PATCH(req: Request) {
  try {
    return Response.json(await perbaruiProfil(await bacaJson(req)), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return toResponse(e);
  }
}
