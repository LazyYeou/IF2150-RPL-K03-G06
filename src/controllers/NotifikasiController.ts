import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";

/**
 * Kontrak: docs/contracts/modules.md §1. Panggil SETELAH commit transaksi bisnis.
 * `idPengguna` = pengguna.id_pengguna (bukan id profil).
 * shortcut: hanya menyimpan baris notifikasi; API baca/tandai dan lonceng ada di #28.
 */
export async function kirimNotifikasi(
  idPengguna: string,
  pesan: string,
  tautan?: string,
): Promise<void> {
  db.prepare(
    "INSERT INTO notifikasi (id_notifikasi, id_penerima, pesan_notifikasi, tautan) VALUES (?, ?, ?, ?)",
  ).run(randomUUID(), idPengguna, pesan, tautan ?? null);
}
