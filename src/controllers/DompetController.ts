import "server-only";
import { requireRole } from "@/lib/auth/guards";
import { AppError } from "@/lib/errors";
import { idDariPengguna } from "@/models/TenagaKerja";
import { bacaDataDompet, hitungSaldoRingkas } from "@/models/Dompet";
import type { DompetResponse } from "@/lib/validation/dompet";

export async function ambilDompetSaya(): Promise<DompetResponse> {
  const user = await requireRole("TK");
  const idTK = idDariPengguna(user.id);
  if (!idTK) {
    throw new AppError("NOT_FOUND", 404, "Profil tenaga kerja tidak ditemukan");
  }

  return bacaDataDompet(idTK);
}

export async function ambilRingkasanSaldoTK(idPengguna: string): Promise<{
  saldo: number;
  saldoTersedia: number;
}> {
  const idTK = idDariPengguna(idPengguna);
  if (!idTK) {
    return { saldo: 0, saldoTersedia: 0 };
  }

  return hitungSaldoRingkas(idTK);
}
