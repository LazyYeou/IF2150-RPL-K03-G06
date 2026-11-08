import {
  ambilTransaksiSaya,
} from "@/controllers/TransaksiPekerjaanController";
import { toResponse } from "@/lib/errors";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    return Response.json(
      await ambilTransaksiSaya({
        peran: url.searchParams.get("peran") ?? undefined,
        page: url.searchParams.get("page") ?? undefined,
      }),
    );
  } catch (e) {
    return toResponse(e);
  }
}
