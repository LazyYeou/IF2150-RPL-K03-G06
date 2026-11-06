import { lupaSandi } from "@/controllers/ResetSandiController";
import { ipPermintaan } from "@/lib/auth/rate-limit";
import { toResponse } from "@/lib/errors";
import { bacaJson } from "@/lib/http";

export async function POST(req: Request) {
  try {
    return Response.json(lupaSandi(await bacaJson(req), ipPermintaan(req)));
  } catch (e) {
    return toResponse(e);
  }
}
