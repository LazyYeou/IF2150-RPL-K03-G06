import { prosesLogin } from "@/controllers/PenggunaController";
import { ipPermintaan } from "@/lib/auth/rate-limit";
import { toResponse } from "@/lib/errors";
import { bacaJson } from "@/lib/http";

export async function POST(req: Request) {
  try {
    return Response.json(
      await prosesLogin(await bacaJson(req), ipPermintaan(req)),
    );
  } catch (e) {
    return toResponse(e);
  }
}
