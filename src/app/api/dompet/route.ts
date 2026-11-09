import { ambilDompetSaya } from "@/controllers/DompetController";
import { toResponse } from "@/lib/errors";

export async function GET() {
  try {
    const data = await ambilDompetSaya();
    return Response.json(data);
  } catch (e) {
    return toResponse(e);
  }
}
