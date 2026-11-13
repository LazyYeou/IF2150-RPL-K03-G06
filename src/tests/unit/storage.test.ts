import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  bacaBerkas,
  BerkasTidakValidError,
  hapusBerkas,
  simpanBerkas,
} from "@/lib/storage";

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const berkas = (bytes: number[], nama: string, type: string, pad = 0) =>
  new File([new Uint8Array([...bytes, ...new Uint8Array(pad).fill(7)])], nama, {
    type,
  });
const png = (pad = 32) => berkas(PNG, "ktp.png", "image/png", pad);

let dir: string;
beforeAll(() => {
  dir = mkdtempSync(path.join(tmpdir(), "kerjain-storage-"));
  process.env.STORAGE_DIR = dir;
  process.env.FILE_ENCRYPTION_KEY = "ab".repeat(32);
});
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("simpanBerkas validasi (KNF22)", () => {
  it("menyimpan PNG dengan nama UUID, bukan nama asli", async () => {
    const r = await simpanBerkas("bukti", png());
    expect(r.path).toMatch(/^bukti\/[0-9a-f-]{36}\.png$/);
    expect(r.path).not.toContain("ktp");
    expect((await bacaBerkas(r.path)).mime).toBe("image/png");
  });
  it("menolak .exe yang di-rename .jpg (magic bytes)", async () => {
    const exe = berkas([0x4d, 0x5a, 0x90, 0x00], "foto.jpg", "image/jpeg", 64);
    await expect(simpanBerkas("bukti", exe)).rejects.toBeInstanceOf(
      BerkasTidakValidError,
    );
  });
  it("menolak MIME yang tidak cocok dengan isi", async () => {
    await expect(
      simpanBerkas("bukti", berkas(PNG, "a.jpg", "image/jpeg", 8)),
    ).rejects.toThrow(/tidak sesuai/);
  });
  it("menolak berkas kosong", async () => {
    await expect(
      simpanBerkas("bukti", new File([], "a.png", { type: "image/png" })),
    ).rejects.toThrow(/kosong/);
  });
  it("batas ukuran: identitas 5 MB, bukti 10 MB", async () => {
    const lima = 5 * 1024 * 1024;
    await expect(simpanBerkas("identitas", png(lima))).rejects.toThrow(/5 MB/);
    await expect(simpanBerkas("bukti", png(lima))).resolves.toBeDefined();
    await expect(simpanBerkas("bukti", png(10 * 1024 * 1024))).rejects.toThrow(
      /10 MB/,
    );
  });
});

describe("enkripsi AES-256-GCM (KNF02)", () => {
  it("isi di disk tidak terbaca, tetapi bacaBerkas mengembalikan aslinya", async () => {
    const asli = png(64);
    const r = await simpanBerkas("identitas", asli, { enkripsi: true });
    expect(r.path).toMatch(/\.png\.enc$/);
    const disk = readFileSync(path.join(dir, r.path));
    expect(disk.subarray(28, 36)).not.toEqual(Buffer.from(PNG)); // ciphertext, bukan header PNG
    const hasil = await bacaBerkas(r.path);
    expect(hasil.mime).toBe("image/png");
    expect(hasil.data.equals(Buffer.from(await asli.arrayBuffer()))).toBe(true);
  });
  it("berkas yang diubah di disk gagal didekripsi (integritas GCM)", async () => {
    const r = await simpanBerkas("identitas", png(), { enkripsi: true });
    const file = path.join(dir, r.path);
    const b = readFileSync(file);
    b[b.length - 1] ^= 0xff;
    const { writeFileSync } = await import("node:fs");
    writeFileSync(file, b);
    await expect(bacaBerkas(r.path)).rejects.toThrow();
  });
});

describe("path & hapus", () => {
  it("menolak path traversal", async () => {
    await expect(bacaBerkas("../../etc/passwd")).rejects.toThrow(/tidak valid/);
    await expect(hapusBerkas("../x.png")).rejects.toThrow(/tidak valid/);
  });
  it("hapusBerkas menghapus dan idempoten", async () => {
    const r = await simpanBerkas("sengketa", png());
    await hapusBerkas(r.path);
    await hapusBerkas(r.path); // kedua kali tidak error
    expect(
      readdirSync(path.join(dir, "sengketa")).some((n) => r.path.endsWith(n)),
    ).toBe(false);
  });
});
