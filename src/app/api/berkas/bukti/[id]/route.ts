import { unduhBuktiPenyerahan } from "@/controllers/BerkasController";
import { berkasResponse } from "@/lib/berkas-response";

// GET /api/berkas/bukti/:id — peserta transaksi atau CS (KF16)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return berkasResponse(() => unduhBuktiPenyerahan(id));
}
