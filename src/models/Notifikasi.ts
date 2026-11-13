import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { keIso } from "@/lib/http";
import type { DaftarNotifikasi, Notifikasi } from "@/lib/validation/notifikasi";

export function buat(idPengguna: string, pesan: string, tautan?: string) {
  db.prepare(
    "INSERT INTO notifikasi (id_notifikasi, id_penerima, pesan_notifikasi, tautan) VALUES (?, ?, ?, ?)",
  ).run(randomUUID(), idPengguna, pesan, tautan ?? null);
}
export function daftar(
  idPengguna: string,
  belumDibaca: boolean,
): DaftarNotifikasi {
  // Snapshot yang sama untuk daftar dan jumlah; penghitung tidak dibatasi 20 item.
  return db.transaction(() => {
    const rows = db
      .prepare(
        `SELECT id_notifikasi AS id, pesan_notifikasi AS pesan, tautan,
      status_baca AS dibaca, waktu_kirim AS waktuKirim FROM notifikasi
      WHERE id_penerima = ? AND (? = 0 OR status_baca = 0)
      ORDER BY waktu_kirim DESC, rowid DESC LIMIT 20`,
      )
      .all(idPengguna, belumDibaca ? 1 : 0) as (Omit<Notifikasi, "dibaca"> & {
      dibaca: number;
    })[];
    const count = db
      .prepare(
        "SELECT count(*) AS jumlah FROM notifikasi WHERE id_penerima = ? AND status_baca = 0",
      )
      .get(idPengguna) as { jumlah: number };
    return {
      items: rows.map((r) => ({
        ...r,
        dibaca: r.dibaca === 1,
        waktuKirim: keIso(r.waktuKirim),
      })),
      jumlahBelumDibaca: count.jumlah,
    };
  })();
}
export function tandaiDibaca(id: string, idPengguna: string): boolean {
  // WHERE membatasi kepemilikan secara atomik; pengulangan tetap berhasil untuk pemilik.
  return Boolean(
    db
      .prepare(
        `UPDATE notifikasi SET status_baca = 1
    WHERE id_notifikasi = ? AND id_penerima = ? RETURNING id_notifikasi`,
      )
      .get(id, idPengguna),
  );
}
