import { prosesPengajuanVerifikasi } from "@/controllers/TenagaKerjaController";
import { toResponse } from "@/lib/errors";
import { bacaForm } from "@/lib/http";

// POST /api/verifikasi (multipart, TK) — KF04
export async function POST(req: Request) {
  try {
    return Response.json(await prosesPengajuanVerifikasi(await bacaForm(req)), {
      status: 201,
    });
  } catch (e) {
    return toResponse(e);
  }
}
