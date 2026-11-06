import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomUUID,
} from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { BATAS_BERKAS_IDENTITAS } from "./validation/verifikasi";

// Kontrak: docs/contracts/modules.md §4. KNF02, KNF22.
export type Kategori = "identitas" | "bukti" | "sengketa";

const BATAS_LAIN = 10 * 1024 * 1024;
const batas = (k: Kategori) =>
  k === "identitas" ? BATAS_BERKAS_IDENTITAS : BATAS_LAIN;

const JENIS = {
  jpg: { mime: "image/jpeg", magic: [0xff, 0xd8, 0xff] },
  png: {
    mime: "image/png",
    magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  },
  pdf: { mime: "application/pdf", magic: [0x25, 0x50, 0x44, 0x46, 0x2d] }, // "%PDF-"
} as const;
type Ekstensi = keyof typeof JENIS;

/** Dilempar untuk berkas yang ditolak; route adapter memetakannya ke 400 BERKAS_TIDAK_VALID. */
export class BerkasTidakValidError extends Error {
  readonly code = "BERKAS_TIDAK_VALID";
  readonly status = 400;
}

const jenisDariBytes = (b: Buffer): Ekstensi | null =>
  (Object.keys(JENIS) as Ekstensi[]).find((e) =>
    JENIS[e].magic.every((byte, i) => b[i] === byte),
  ) ?? null;

const folder = () => path.resolve(process.env.STORAGE_DIR ?? "./storage");

/** Path relatif dari DB -> path absolut, menolak keluar dari folder storage. */
function resolvePath(rel: string): string {
  const base = folder();
  const abs = path.resolve(base, rel);
  if (!abs.startsWith(base + path.sep))
    throw new Error("Path berkas tidak valid");
  return abs;
}

function kunci(): Buffer {
  const hex = process.env.FILE_ENCRYPTION_KEY ?? "";
  if (!/^[0-9a-fA-F]{64}$/.test(hex))
    throw new Error("FILE_ENCRYPTION_KEY harus 64 karakter hex (32 byte)");
  return Buffer.from(hex, "hex");
}

// Format berkas terenkripsi: iv(12) | authTag(16) | ciphertext
function enkripsi(data: Buffer): Buffer {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", kunci(), iv);
  const isi = Buffer.concat([c.update(data), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), isi]);
}

function dekripsi(data: Buffer): Buffer {
  const d = createDecipheriv("aes-256-gcm", kunci(), data.subarray(0, 12));
  d.setAuthTag(data.subarray(12, 28));
  return Buffer.concat([d.update(data.subarray(28)), d.final()]);
}

/**
 * Validasi (ukuran, MIME, magic bytes) lalu simpan sebagai `<kategori>/<uuid>.<ext>[.enc]`.
 * Mengembalikan path relatif untuk disimpan di DB. Panggil sebelum tx(); hapus berkas bila tx gagal.
 */
export async function simpanBerkas(
  kategori: Kategori,
  file: File,
  opsi: { enkripsi?: boolean } = {},
): Promise<{ path: string; ukuran: number }> {
  if (file.size === 0) throw new BerkasTidakValidError("Berkas kosong");
  if (file.size > batas(kategori))
    throw new BerkasTidakValidError(
      `Ukuran berkas melebihi ${batas(kategori) / 1024 / 1024} MB`,
    );

  const data = Buffer.from(await file.arrayBuffer());
  const ext = jenisDariBytes(data);
  if (!ext)
    throw new BerkasTidakValidError("Format berkas harus JPG, PNG, atau PDF");
  if (file.type && file.type !== JENIS[ext].mime)
    throw new BerkasTidakValidError(
      "Isi berkas tidak sesuai tipe yang dinyatakan",
    );

  const rel = `${kategori}/${randomUUID()}.${ext}${opsi.enkripsi ? ".enc" : ""}`;
  const abs = resolvePath(rel);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, opsi.enkripsi ? enkripsi(data) : data);
  return { path: rel, ukuran: data.length };
}

/** Baca berkas (didekripsi otomatis bila berakhiran `.enc`) beserta MIME-nya. */
export async function bacaBerkas(
  rel: string,
): Promise<{ data: Buffer; mime: string }> {
  const abs = resolvePath(rel);
  const mentah = await readFile(abs);
  const terenkripsi = abs.endsWith(".enc");
  const ext = path
    .extname(terenkripsi ? abs.slice(0, -4) : abs)
    .slice(1) as Ekstensi;
  return {
    data: terenkripsi ? dekripsi(mentah) : mentah,
    mime: JENIS[ext]?.mime ?? "application/octet-stream",
  };
}

/** Hapus berkas; tidak error bila sudah tidak ada. */
export async function hapusBerkas(rel: string): Promise<void> {
  await unlink(resolvePath(rel)).catch((e: NodeJS.ErrnoException) => {
    if (e.code !== "ENOENT") throw e;
  });
}
