import { prosesPengajuanPenawaran } from "@/controllers/PengajuanPenawaranController";
import { toResponse } from "@/lib/errors";
import { bacaJson } from "@/lib/http";

// POST /api/penawaran (TK terverifikasi) — KF10, KF11
export async function POST(req: Request) {
  try {
    return Response.json(await prosesPengajuanPenawaran(await bacaJson(req)), {
      status: 201,
    });
  } catch (e) {
    return toResponse(e);
  }
}
