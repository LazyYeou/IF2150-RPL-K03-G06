import { tinjauDokumenIdentitas } from "@/controllers/CustomerServiceController";
import { berkasResponse } from "@/lib/berkas-response";

// GET /api/cs/verifikasi/:idTK/dokumen (CS) — stream berkas terdekripsi, no-store
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ idTK: string }> },
) {
  const { idTK } = await params;
  return berkasResponse(() => tinjauDokumenIdentitas(idTK));
}
