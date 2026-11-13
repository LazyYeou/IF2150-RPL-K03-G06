import { prosesUnggahBuktiPekerjaan } from "@/controllers/TransaksiBuktiController";
import { toResponse } from "@/lib/errors";
import { bacaForm } from "@/lib/http";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    return Response.json(
      await prosesUnggahBuktiPekerjaan(
        (await context.params).id,
        await bacaForm(req),
      ),
      { status: 201 },
    );
  } catch (error) {
    return toResponse(error);
  }
}
