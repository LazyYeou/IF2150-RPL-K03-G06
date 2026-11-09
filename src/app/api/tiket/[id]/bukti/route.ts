import { prosesUnggahBuktiTiket } from "@/controllers/TiketSengketaController";
import { toResponse } from "@/lib/errors";
import { bacaForm } from "@/lib/http";

// POST /api/tiket/:id/bukti (pelapor / peserta), multipart
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return Response.json(
      await prosesUnggahBuktiTiket((await params).id, await bacaForm(req)),
      { status: 201 },
    );
  } catch (e) {
    return toResponse(e);
  }
}
