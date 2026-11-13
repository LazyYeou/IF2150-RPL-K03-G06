import { registrasi } from "@/controllers/PenggunaController";
import { ipPermintaan } from "@/lib/auth/rate-limit";
import { toResponse } from "@/lib/errors";
import { bacaJson } from "@/lib/http";

export async function POST(req: Request) {
  try {
    return Response.json(
      await registrasi(await bacaJson(req), ipPermintaan(req)),
      { status: 201 },
    );
  } catch (e) {
    return toResponse(e);
  }
}
