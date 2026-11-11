import "server-only";
import { db, tx } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { getPaymentAdapter } from "@/lib/payment/adapter";
import { catatLog } from "@/models/LogGateway";
import * as Notifikasi from "@/models/Notifikasi";
import {
  cariTagihanBerdasarkanId,
  ubahStatusTagihan,
} from "@/models/TagihanPembayaran";
import { cariPencairanBerdasarkanId } from "@/models/PencairanDana";
import { ambilInfoTransaksi } from "@/controllers/TagihanPembayaranController";
import type { StatusTagihan } from "@/lib/validation/tagihan";
import { NominalWebhook } from "@/lib/validation/payment";
import { normalisasiMidtrans } from "@/lib/payment/midtrans-webhook";

export interface WebhookResult {
  received: boolean;
  status: string;
  duplicate?: boolean;
  ignored?: boolean;
}

export async function prosesNotifikasiWebhook(
  rawBody: string,
  signature: string | null,
): Promise<WebhookResult> {
  const adapter = getPaymentAdapter();

  const midtrans =
    (process.env.PAYMENT_PROVIDER ?? "mock").toLowerCase() === "midtrans";
  if (
    !midtrans &&
    (!signature || !adapter.verifikasiWebhook(rawBody, signature))
  ) {
    throw new AppError("UNAUTHORIZED", 401, "Signature webhook tidak valid");
  }

  let payload: Record<string, unknown>;
  if (midtrans) {
    const notification = await normalisasiMidtrans(rawBody);
    if (!notification)
      return { received: true, ignored: true, status: "REFUND" };
    payload = notification;
  } else {
    try {
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      throw new AppError("BAD_REQUEST", 400, "Payload JSON tidak valid");
    }
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload))
    throw new AppError(
      "BAD_REQUEST",
      400,
      "Payload webhook harus berupa objek",
    );
  const nominalParsed = NominalWebhook.safeParse(payload.nominal);
  if (!nominalParsed.success)
    throw new AppError(
      "BAD_REQUEST",
      400,
      "Nominal webhook wajib berupa bilangan bulat positif yang valid",
    );

  const jenis = String(payload.jenis ?? "").toUpperCase();
  const referensiId = String(
    payload.referensiId ?? payload.idTagihan ?? payload.idPencairan ?? "",
  );
  const statusRaw = String(payload.status ?? "").toUpperCase();
  const nominal = nominalParsed.data;

  if (!referensiId) {
    throw new AppError("BAD_REQUEST", 400, "referensiId tidak disertakan");
  }

  const isPencairan =
    jenis === "PENCAIRAN" ||
    Boolean(payload.idPencairan) ||
    Boolean(cariPencairanBerdasarkanId(referensiId));

  if (isPencairan) {
    return prosesWebhookPencairan(referensiId, statusRaw, nominal, payload);
  }

  return prosesWebhookPembayaran(referensiId, statusRaw, nominal, payload);
}

function prosesWebhookPencairan(
  idPencairan: string,
  statusRaw: string,
  nominal: number,
  payload: Record<string, unknown>,
): WebhookResult {
  const statusValid = ["BERHASIL", "GAGAL", "DITOLAK", "DIPROSES"];
  if (!statusValid.includes(statusRaw)) {
    throw new AppError(
      "BAD_REQUEST",
      400,
      `Status webhook '${statusRaw}' tidak dikenal untuk pencairan`,
    );
  }

  const pencairan = cariPencairanBerdasarkanId(idPencairan);
  if (!pencairan) {
    throw new AppError("NOT_FOUND", 404, "Pencairan dana tidak ditemukan");
  }

  if (nominal !== pencairan.nominal) {
    throw new AppError(
      "BAD_REQUEST",
      400,
      "Nominal tidak sesuai pengajuan pencairan",
    );
  }

  catatLog(
    "CALLBACK",
    idPencairan,
    payload,
    (process.env.PAYMENT_PROVIDER ?? "mock").toUpperCase(),
  );

  return tx(() => {
    const current = cariPencairanBerdasarkanId(idPencairan);
    if (!current) {
      throw new Error("Pencairan dana tidak ditemukan dalam transaksi");
    }

    if (current.status === statusRaw) {
      return { received: true, duplicate: true, status: statusRaw };
    }

    if (
      current.status === "BERHASIL" ||
      current.status === "GAGAL" ||
      current.status === "DITOLAK"
    ) {
      return { received: true, ignored: true, status: current.status };
    }

    db.prepare(
      `UPDATE pencairan_dana
       SET status_pencairan = ?
       WHERE id_pencairan = ?`,
    ).run(statusRaw, idPencairan);

    const tkRow = db
      .prepare(`SELECT id_pengguna FROM tenaga_kerja WHERE id_tenaga_kerja = ?`)
      .get(current.idTenagaKerja) as { id_pengguna: string } | undefined;

    if (statusRaw === "BERHASIL") {
      const mutasi = db
        .prepare(
          `INSERT INTO mutasi_saldo (kunci_operasi, id_tenaga_kerja, nominal, created_at)
           VALUES (?, ?, ?, datetime('now'))
           ON CONFLICT(kunci_operasi) DO NOTHING`,
        )
        .run(`cair:${idPencairan}`, current.idTenagaKerja, -current.nominal);

      if (mutasi.changes === 1) {
        db.prepare(
          `UPDATE tenaga_kerja
           SET saldo_pendapatan = saldo_pendapatan - ?
           WHERE id_tenaga_kerja = ?`,
        ).run(current.nominal, current.idTenagaKerja);
      }

      if (tkRow) {
        Notifikasi.buat(
          tkRow.id_pengguna,
          `Pencairan dana sebesar Rp ${current.nominal.toLocaleString("id-ID")} berhasil diproses.`,
          "/tk/dompet",
        );
      }
    } else if (statusRaw === "GAGAL" || statusRaw === "DITOLAK") {
      if (tkRow) {
        Notifikasi.buat(
          tkRow.id_pengguna,
          `Pencairan dana sebesar Rp ${current.nominal.toLocaleString("id-ID")} gagal diproses. Saldo Anda telah dipulihkan.`,
          "/tk/dompet",
        );
      }
    }

    return { received: true, status: statusRaw };
  });
}

function prosesWebhookPembayaran(
  idTagihan: string,
  statusRaw: string,
  nominal: number,
  payload: Record<string, unknown>,
): WebhookResult {
  const statusValid: StatusTagihan[] = [
    "BERHASIL",
    "GAGAL",
    "KEDALUWARSA",
    "DIPROSES",
  ];
  if (!statusValid.includes(statusRaw as StatusTagihan)) {
    throw new AppError(
      "BAD_REQUEST",
      400,
      `Status webhook '${statusRaw}' tidak dikenal`,
    );
  }
  const status = statusRaw as StatusTagihan;

  const tagihan = cariTagihanBerdasarkanId(idTagihan);
  if (!tagihan) {
    throw new AppError("NOT_FOUND", 404, "Tagihan tidak ditemukan");
  }

  if (nominal !== tagihan.totalBayar) {
    throw new AppError("BAD_REQUEST", 400, "Nominal tidak sesuai tagihan");
  }

  catatLog(
    "CALLBACK",
    idTagihan,
    payload,
    (process.env.PAYMENT_PROVIDER ?? "mock").toUpperCase(),
  );

  return tx(() => {
    const currentTagihan = cariTagihanBerdasarkanId(idTagihan);
    if (!currentTagihan) {
      throw new Error("Tagihan tidak ditemukan dalam transaksi");
    }

    if (currentTagihan.status === status) {
      return { received: true, duplicate: true, status };
    }

    if (
      currentTagihan.status === "BERHASIL" ||
      currentTagihan.status === "DIKEMBALIKAN"
    ) {
      return { received: true, ignored: true, status: currentTagihan.status };
    }

    ubahStatusTagihan(idTagihan, status);

    const trx = ambilInfoTransaksi(currentTagihan.idTransaksi);

    if (status === "BERHASIL") {
      if (trx) {
        if (trx.statusPekerjaan === "MENUNGGU_PEMBAYARAN") {
          db.prepare(
            `UPDATE transaksi_pekerjaan
             SET status_pekerjaan = 'IN_PROGRESS'
             WHERE id_transaksi = ?`,
          ).run(currentTagihan.idTransaksi);

          Notifikasi.buat(
            trx.idPenggunaTK,
            "pekerjaan siap dimulai",
            `/tk/pekerjaan/${currentTagihan.idTransaksi}`,
          );

          Notifikasi.buat(
            trx.idPenggunaPK,
            "Pembayaran berhasil diverifikasi. Tenaga kerja akan segera memulai pekerjaan.",
            `/pk/transaksi/${currentTagihan.idTransaksi}`,
          );
        }
      }
    } else if (status === "GAGAL") {
      if (trx) {
        Notifikasi.buat(
          trx.idPenggunaPK,
          "Pembayaran tagihan gagal. Silakan coba kembali.",
          `/pk/transaksi/${currentTagihan.idTransaksi}/bayar`,
        );
      }
    } else if (status === "KEDALUWARSA") {
      if (trx) {
        Notifikasi.buat(
          trx.idPenggunaPK,
          "Batas waktu pembayaran telah habis.",
          `/pk/transaksi/${currentTagihan.idTransaksi}`,
        );
      }
    }

    return { received: true, status };
  });
}
