import "server-only";
import { requireOwner, requireUser } from "@/lib/auth/guards";
import { AppError } from "@/lib/errors";
import { tandaTanganiWebhook } from "@/lib/payment/mock";
import { TriggerMockGatewayInput } from "@/lib/validation/payment";
import { cariPencairanBerdasarkanId } from "@/models/PencairanDana";
import { cariTagihanBerdasarkanId } from "@/models/TagihanPembayaran";
import { idDariPengguna } from "@/models/TenagaKerja";
import { ambilInfoTransaksi } from "./TagihanPembayaranController";
import { prosesNotifikasiWebhook } from "./PaymentGatewayController";

export async function prosesTriggerMockGateway(raw: unknown) {
  const user = await requireUser();
  if ((process.env.PAYMENT_PROVIDER ?? "mock").toLowerCase() !== "mock")
    throw new AppError(
      "FORBIDDEN",
      403,
      "Mock gateway hanya aktif saat PAYMENT_PROVIDER=mock",
    );
  const input = TriggerMockGatewayInput.parse(raw);
  const { status } = input;
  let payload: Record<string, unknown>;
  let redirectUrl: string;

  if ("idPencairan" in input) {
    if (user.peran !== "TK")
      throw new AppError(
        "FORBIDDEN",
        403,
        "Hanya tenaga kerja pemilik pencairan yang boleh menjalankan simulasi",
      );
    const pencairan = cariPencairanBerdasarkanId(input.idPencairan);
    if (!pencairan)
      throw new AppError("NOT_FOUND", 404, "Pencairan dana tidak ditemukan");
    const idTK = idDariPengguna(user.id);
    if (!idTK)
      throw new AppError(
        "FORBIDDEN",
        403,
        "Profil tenaga kerja tidak ditemukan",
      );
    requireOwner(pencairan.idTenagaKerja, idTK);
    payload = {
      jenis: "PENCAIRAN",
      referensiId: pencairan.id,
      idPencairan: pencairan.id,
      nominal: pencairan.nominal,
      status,
      idempotencyKey: pencairan.id,
      waktu: new Date().toISOString(),
    };
    redirectUrl = "/tk/dompet";
  } else {
    if (user.peran !== "PK")
      throw new AppError(
        "FORBIDDEN",
        403,
        "Hanya penyedia kerja pemilik tagihan yang boleh menjalankan simulasi",
      );
    const tagihan = cariTagihanBerdasarkanId(input.idTagihan);
    if (!tagihan)
      throw new AppError("NOT_FOUND", 404, "Tagihan tidak ditemukan");
    const transaksi = ambilInfoTransaksi(tagihan.idTransaksi);
    if (!transaksi)
      throw new AppError("NOT_FOUND", 404, "Transaksi tidak ditemukan");
    requireOwner(transaksi.idPenggunaPK, user.id);
    payload = {
      jenis: "PEMBAYARAN",
      referensiId: tagihan.id,
      idTagihan: tagihan.id,
      nominal: tagihan.totalBayar,
      status,
      idempotencyKey: tagihan.id,
      waktu: new Date().toISOString(),
    };
    redirectUrl = `/pk/transaksi/${tagihan.idTransaksi}`;
  }

  const { rawBody, signature } = tandaTanganiWebhook(payload);
  await prosesNotifikasiWebhook(rawBody, signature);
  return { success: true, status, redirectUrl };
}
