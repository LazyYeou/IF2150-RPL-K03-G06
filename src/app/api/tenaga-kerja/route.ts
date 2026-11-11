import { cariTenagaKerja } from "@/controllers/TenagaKerjaPublikController";
import { toResponse } from "@/lib/errors";
import { bacaQuery } from "@/lib/http";

// GET /api/tenaga-kerja?q=&page= (publik; hanya TK terverifikasi)
export async function GET(req: Request) {
  try {
    return Response.json(await cariTenagaKerja(bacaQuery(req)));
  } catch (e) {
    return toResponse(e);
  }
}
