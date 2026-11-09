import { buatTagihanTransaksi } from "@/controllers/TagihanPembayaranController";
import { toResponse } from "@/lib/errors";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { tagihan, baru } = await buatTagihanTransaksi(id);
    return Response.json(tagihan, { status: baru ? 201 : 200 });
  } catch (e) {
    return toResponse(e);
  }
}
