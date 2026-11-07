import { tandaiNotifikasiDibaca } from "@/controllers/NotifikasiController";
import { toResponse } from "@/lib/errors";
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await tandaiNotifikasiDibaca((await params).id);
    return new Response(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return toResponse(e);
  }
}
