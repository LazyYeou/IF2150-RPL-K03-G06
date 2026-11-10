import { ulangPencairanController } from "@/controllers/DompetController";
import { toResponse } from "@/lib/errors";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const result = await ulangPencairanController((await context.params).id);
    return Response.json(result, { status: result.bisaCobaUlang ? 202 : 200 });
  } catch (e) {
    return toResponse(e);
  }
}
