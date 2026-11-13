import { prosesUlasanTransaksi } from "@/controllers/TransaksiPekerjaanController";
import { toResponse } from "@/lib/errors";
import { bacaJson } from "@/lib/http";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    return Response.json(
      await prosesUlasanTransaksi(
        (await context.params).id,
        await bacaJson(req),
      ),
      { status: 201 },
    );
  } catch (error) {
    return toResponse(error);
  }
}
