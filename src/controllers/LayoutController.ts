import "server-only";
import { redirect } from "next/navigation";
import { bacaSesi, type Peran } from "@/lib/auth/session";
import { requireRole, requireUser } from "@/lib/auth/guards";
import { AppError } from "@/lib/errors";
import { roleHome } from "@/lib/navigation";
export const ambilPenggunaLayout = () => bacaSesi();
export async function penggunaHalaman(peran?: Peran) {
  try {
    return peran ? await requireRole(peran) : await requireUser();
  } catch (e) {
    if (e instanceof AppError && e.status === 401) redirect("/masuk");
    if (e instanceof AppError && e.status === 403) {
      const user = await bacaSesi();
      if (user) redirect(roleHome[user.peran]);
    }
    throw e;
  }
}
