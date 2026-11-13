import { resetSandi } from "@/controllers/ResetSandiController";
import { toResponse } from "@/lib/errors";
import { bacaJson } from "@/lib/http";

export async function POST(req: Request) {
  try {
    await resetSandi(await bacaJson(req));
    return new Response(null, { status: 204 });
  } catch (e) {
    return toResponse(e);
  }
}
