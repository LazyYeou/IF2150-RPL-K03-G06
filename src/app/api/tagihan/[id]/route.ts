import { ambilDetailTagihan } from "@/controllers/TagihanPembayaranController";
import { toResponse } from "@/lib/errors";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const tagihan = await ambilDetailTagihan(id);
    return Response.json(tagihan);
  } catch (e) {
    return toResponse(e);
  }
}
