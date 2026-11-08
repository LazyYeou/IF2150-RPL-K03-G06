import { ambilDetailTransaksi } from "@/controllers/TransaksiPekerjaanController";
import { toResponse } from "@/lib/errors";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    return Response.json(await ambilDetailTransaksi((await context.params).id));
  } catch (e) {
    return toResponse(e);
  }
}
