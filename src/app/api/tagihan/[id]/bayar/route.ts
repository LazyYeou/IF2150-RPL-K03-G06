import { bayarTagihan } from "@/controllers/TagihanPembayaranController";
import { toResponse } from "@/lib/errors";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const result = await bayarTagihan(id, body.metode);
    return Response.json(result);
  } catch (e) {
    return toResponse(e);
  }
}
