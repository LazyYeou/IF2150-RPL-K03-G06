import "server-only";
import { requireCS, requireUser } from "@/lib/auth/guards";
import { AppError } from "@/lib/errors";
import { kirimNotifikasi } from "./NotifikasiController";
import { prosesRefundTagihan } from "./TagihanPembayaranController";
import { hapusBerkas, simpanBerkas } from "@/lib/storage";
import { Id } from "@/lib/validation/common";
import {
  BuatTiketInput,
  DaftarTiketQuery,
  MintaBuktiInput,
  PutuskanTiketInput,
  TolakTiketInput,
} from "@/lib/validation/sengketa";
import * as Tiket from "@/models/TiketSengketa";

// C42, C43. UC12, KF24, KF26. Urutan: guard -> validasi -> simpan berkas -> tx() di model.

const tidakAda = () => new AppError("NOT_FOUND", 404, "Tiket tidak ditemukan");
const final = () =>
  new AppError(
    "STATUS_TIDAK_VALID",
    409,
    "Tiket sudah final dan tidak dapat diubah",
  );

function idTiket(raw: string) {
  const p = Id.safeParse(raw);
  if (!p.success) throw tidakAda();
  return p.data;
}

/** Berkas opsional; kosong/bukan File dianggap tidak ada. */
const ambilBerkas = (form: FormData) => {
  const b = form.get("berkas");
  return b instanceof File && b.size > 0 ? b : null;
};

/** Pelapor/peserta (atau CS bila `bolehCS`) boleh mengakses; selain itu 403. Tidak ada -> 404. */
async function aksesTiket(rawId: string, bolehCS: boolean) {
  const user = await requireUser();
  const id = idTiket(rawId);
  const peserta = Tiket.pesertaTiket(id);
  if (!peserta) throw tidakAda();
  if (!(bolehCS && user.peran === "CS") && !peserta.includes(user.id))
    throw new AppError(
      "FORBIDDEN",
      403,
      "Anda tidak berhak mengakses tiket ini",
    );
  return { user, id };
}

export async function prosesPembuatanTiket(form: FormData) {
  const user = await requireUser();
  const input = BuatTiketInput.parse({
    idTransaksi: form.get("idTransaksi") || undefined,
    kategoriMasalah: form.get("kategoriMasalah"),
    deskripsi: form.get("deskripsi"),
  });
  const berkas = ambilBerkas(form);
  const disimpan = berkas ? await simpanBerkas("sengketa", berkas) : undefined;
  let hasil: Tiket.HasilBuat;
  try {
    hasil = Tiket.buat(user.id, input, disimpan);
  } catch (e) {
    if (disimpan) await hapusBerkas(disimpan.path);
    throw e;
  }
  if (!hasil.ok) {
    if (disimpan) await hapusBerkas(disimpan.path);
    if (hasil.alasan === "TRANSAKSI_TIDAK_ADA")
      throw new AppError("NOT_FOUND", 404, "Transaksi tidak ditemukan");
    if (hasil.alasan === "BUKAN_PESERTA")
      throw new AppError("FORBIDDEN", 403, "Anda bukan peserta transaksi ini");
    if (hasil.alasan === "TIKET_AKTIF")
      throw new AppError(
        "TIKET_AKTIF",
        409,
        "Sudah ada tiket aktif untuk transaksi ini atau upah sudah dikreditkan",
      );
    throw new AppError(
      "STATUS_TIDAK_VALID",
      409,
      "Tiket hanya dapat diajukan untuk pekerjaan yang sedang berlangsung atau sudah diserahkan",
    );
  }
  return Tiket.detail(hasil.id)!;
}

export async function ambilDetailTiket(rawId: string) {
  const { id } = await aksesTiket(rawId, true);
  return Tiket.detail(id)!;
}

export async function prosesUnggahBuktiTiket(rawId: string, form: FormData) {
  const { user, id } = await aksesTiket(rawId, false);
  const berkas = ambilBerkas(form);
  if (!berkas)
    throw new AppError(
      "BERKAS_TIDAK_VALID",
      400,
      "Berkas bukti wajib diunggah",
    );
  const disimpan = await simpanBerkas("sengketa", berkas);
  let hasil: Tiket.HasilUbah;
  try {
    hasil = Tiket.tambahBukti(id, user.id, disimpan.path);
  } catch (e) {
    await hapusBerkas(disimpan.path);
    throw e;
  }
  if (!hasil.ok) {
    await hapusBerkas(disimpan.path);
    throw hasil.alasan === "TIDAK_ADA" ? tidakAda() : final();
  }
  return Tiket.detail(id)!;
}

export async function batalkanTiket(rawId: string) {
  const user = await requireUser();
  const id = idTiket(rawId);
  const hasil = Tiket.batal(id, user.id);
  if (!hasil.ok) {
    if (hasil.alasan === "TIDAK_ADA") throw tidakAda();
    if (hasil.alasan === "BUKAN_PELAPOR")
      throw new AppError(
        "FORBIDDEN",
        403,
        "Hanya pelapor yang dapat membatalkan tiket",
      );
    throw new AppError(
      "STATUS_TIDAK_VALID",
      409,
      "Hanya tiket yang masih diajukan yang dapat dibatalkan",
    );
  }
  return Tiket.detail(id)!;
}

export async function ambilAntreanTiket(query: unknown) {
  await requireCS();
  const q = DaftarTiketQuery.parse(query);
  return Tiket.daftarCS(q.status, q.page);
}

export async function ambilTiketUntukCS(rawId: string) {
  await requireCS();
  const t = Tiket.detail(idTiket(rawId));
  if (!t) throw tidakAda();
  return t;
}

const STATUS_FINAL = ["DITUTUP", "DITOLAK", "DIBATALKAN"];

/** Notifikasi ke peserta tiket, dipanggil setelah commit. */
async function beritahu(id: string, pesan: string) {
  for (const u of new Set(Tiket.pesertaTiket(id) ?? []))
    await kirimNotifikasi(u, pesan, `/tiket/${id}`);
}

function hasilCS(h: Tiket.HasilKeputusan) {
  if (h.ok) return;
  throw h.alasan === "TIDAK_ADA"
    ? tidakAda()
    : new AppError(
        "STATUS_TIDAK_VALID",
        409,
        "Status tiket tidak mengizinkan tindakan ini",
      );
}

export async function prosesKeputusanTiket(rawId: string, body: unknown) {
  const user = await requireCS();
  const id = idTiket(rawId);
  const { keputusan, catatan } = PutuskanTiketInput.parse(body);
  const t = Tiket.detail(id);
  if (!t) throw tidakAda();
  // Tiket final hanya boleh dikonfirmasi ulang untuk REFUND yang sama (idempoten di model refund).
  if (
    !t.idTransaksi ||
    (STATUS_FINAL.includes(t.status) &&
      !(keputusan === "REFUND" && t.keputusan === "REFUND")) ||
    (t.keputusan && t.keputusan !== keputusan)
  )
    throw new AppError(
      "STATUS_TIDAK_VALID",
      409,
      "Tiket sudah final/diputus atau tidak terkait transaksi",
    );
  if (keputusan === "REFUND")
    await prosesRefundTagihan(t.idTransaksi, id, catatan);
  else {
    hasilCS(Tiket.cairkan(id, user.id, catatan));
    await beritahu(id, "Sengketa diputuskan: upah dicairkan ke tenaga kerja.");
  }
  return Tiket.detail(id)!;
}

export async function prosesMintaBukti(rawId: string, body: unknown) {
  const user = await requireCS();
  const id = idTiket(rawId);
  const { pesan } = MintaBuktiInput.parse(body);
  hasilCS(Tiket.mintaBukti(id, user.id, pesan));
  await beritahu(id, `CS meminta bukti tambahan: ${pesan}`);
  return Tiket.detail(id)!;
}

export async function prosesTolakTiket(rawId: string, body: unknown) {
  const user = await requireCS();
  const id = idTiket(rawId);
  const { alasan } = TolakTiketInput.parse(body);
  hasilCS(Tiket.tolak(id, user.id, alasan));
  await beritahu(id, `Tiket sengketa ditolak: ${alasan}`);
  return Tiket.detail(id)!;
}
