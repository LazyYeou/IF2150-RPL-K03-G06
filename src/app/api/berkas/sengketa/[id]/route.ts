import { unduhBuktiSengketa } from "@/controllers/BerkasController";
import { berkasResponse } from "@/lib/berkas-response";

// GET /api/berkas/sengketa/:id — pelapor, peserta transaksi, atau CS (KF26)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return berkasResponse(() => unduhBuktiSengketa(id));
}
