import { prosesSetujuiHasil } from "@/controllers/TransaksiPekerjaanController";
import { toResponse } from "@/lib/errors";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    return Response.json(
      await prosesSetujuiHasil((await context.params).id),
    );
  } catch (error) {
    return toResponse(error);
  }
}
