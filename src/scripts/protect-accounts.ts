import { loadEnvConfig } from "@next/env";
import type Database from "better-sqlite3";
import { bukaDb } from "../db/open";
import {
  enkripsiRekening,
  dekripsiRekening,
  sanitasiLog,
  terenkripsi,
} from "../lib/rekening";

/** Maintenance offline: tidak mencetak data rekening atau kunci. */
export function lindungiRekening(db: Database.Database) {
  // Validasi key sebelum mengubah data/triggers.
  enkripsiRekening("validasi", "maintenance");
  const awalSecure = db.pragma("secure_delete", { simple: true });
  db.pragma("secure_delete = ON");
  try {
    return db
      .transaction(() => {
        let rekening = 0;
        let log = 0;
        for (const [table, idField, prefix] of [
          ["pencairan_dana", "id_pencairan", "pencairan"],
          ["tenaga_kerja", "id_tenaga_kerja", "tk"],
        ]) {
          const rows = db
            .prepare(
              `SELECT ${idField} id, rekening_tujuan rekening FROM ${table} WHERE rekening_tujuan IS NOT NULL`,
            )
            .all() as { id: string; rekening: string }[];
          for (const row of rows) {
            if (terenkripsi(row.rekening)) {
              dekripsiRekening(row.rekening, `${prefix}:${row.id}`);
              continue;
            }
            db.prepare(
              `UPDATE ${table} SET rekening_tujuan = ? WHERE ${idField} = ?`,
            ).run(
              enkripsiRekening(row.rekening, `${prefix}:${row.id}`),
              row.id,
            );
            rekening++;
          }
        }
        const rows = db
          .prepare("SELECT id_log id, payload FROM log_gateway")
          .all() as { id: number; payload: string }[];
        const perubahan = rows.flatMap((row) => {
          let isi: unknown = row.payload;
          try {
            isi = JSON.parse(row.payload);
          } catch {
            /* log teks lama */
          }
          const aman = sanitasiLog(isi);
          const payload =
            typeof aman === "string" ? aman : JSON.stringify(aman);
          return payload !== row.payload ? [{ id: row.id, payload }] : [];
        });
        if (perubahan.length) {
          const trigger = db
            .prepare(
              "SELECT sql FROM sqlite_master WHERE type = 'trigger' AND name = 'log_no_update'",
            )
            .get() as { sql: string } | undefined;
          if (!trigger)
            throw new Error("Trigger append-only log tidak ditemukan");
          // Pengecualian migrasi satu transaksi: INSERT normal tidak pernah membuka trigger ini.
          db.exec("DROP TRIGGER log_no_update");
          for (const row of perubahan) {
            db.prepare(
              "UPDATE log_gateway SET payload = ? WHERE id_log = ?",
            ).run(row.payload, row.id);
            log++;
          }
          db.exec(trigger.sql);
        }
        return { rekening, log };
      })
      .immediate();
  } finally {
    db.pragma(`secure_delete = ${Number(awalSecure)}`);
  }
}
if (require.main === module) {
  loadEnvConfig(process.cwd());
  const db = bukaDb();
  try {
    const hasil = lindungiRekening(db);
    db.pragma("wal_checkpoint(TRUNCATE)");
    db.exec("VACUUM");
    db.pragma("wal_checkpoint(TRUNCATE)");
    console.log(
      `Perlindungan rekening selesai: ${hasil.rekening} rekening, ${hasil.log} log.`,
    );
  } finally {
    db.close();
  }
}
