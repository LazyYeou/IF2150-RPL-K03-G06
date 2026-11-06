import { logout } from "@/controllers/PenggunaController";
import { toResponse } from "@/lib/errors";

export async function POST() {
  try {
    await logout();
    return new Response(null, { status: 204 });
  } catch (e) {
    return toResponse(e);
  }
}
