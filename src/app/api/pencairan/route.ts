import { ajukanPencairanController } from "@/controllers/DompetController";
import { bacaJson } from "@/lib/http";
import { toResponse } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await bacaJson(req);
    const result = await ajukanPencairanController(body);
    return Response.json(result, { status: 201 });
  } catch (e) {
    return toResponse(e);
  }
}
