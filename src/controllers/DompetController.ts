import "server-only";
import { requireRole, requireVerifiedTK } from "@/lib/auth/guards";
import { AppError } from "@/lib/errors";
import { cariVerifikasi, idDariPengguna } from "@/models/TenagaKerja";
import { bacaDataDompet, hitungSaldoRingkas } from "@/models/Dompet";
import { ajukanPencairanDana } from "@/models/PencairanDana";
import {
  PencairanInputSchema,
  type DompetResponse,
  type PencairanResponse,
} from "@/lib/validation/dompet";

export async function ambilDompetSaya(): Promise<DompetResponse> {
  const user = await requireRole("TK");
  const idTK = idDariPengguna(user.id);
  if (!idTK) {
    throw new AppError("NOT_FOUND", 404, "Profil tenaga kerja tidak ditemukan");
  }

  return bacaDataDompet(idTK);
}

export async function ambilDataHalamanDompet(): Promise<{
  dompet: DompetResponse;
  statusVerifikasi: string;
}> {
  const user = await requireRole("TK");
  const idTK = idDariPengguna(user.id);
  if (!idTK) {
    throw new AppError("NOT_FOUND", 404, "Profil tenaga kerja tidak ditemukan");
  }

  const dompet = bacaDataDompet(idTK);
  const verifikasi = cariVerifikasi(user.id);

  return {
    dompet,
    statusVerifikasi: verifikasi?.status ?? "BELUM_TERVERIFIKASI",
  };
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

export async function ajukanPencairanController(
  input: unknown,
): Promise<PencairanResponse> {
  const user = await requireVerifiedTK();

  const parsed = PencairanInputSchema.safeParse(input);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      fields[path] = issue.message;
    }
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "Isian pencairan dana tidak valid",
      fields,
    );
  }

  return ajukanPencairanDana(
    user.idTenagaKerja,
    parsed.data.nominal,
    parsed.data.rekeningTujuan,
  );
}
