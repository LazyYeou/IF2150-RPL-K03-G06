import type Database from "better-sqlite3";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { bukaDb } from "../db/open";

const DIR_MIGRASI = path.resolve(__dirname, "../db/migrations");

/** Jalankan berkas `db/migrations/*.sql` berurutan yang belum tercatat di `_migrasi`. Mengembalikan nama yang dijalankan. */
export function migrate(db: Database.Database, dir = DIR_MIGRASI): string[] {
  db.exec(
    `CREATE TABLE IF NOT EXISTS _migrasi (
       nama TEXT PRIMARY KEY,
       dijalankan_at TEXT NOT NULL DEFAULT (datetime('now'))
     ) STRICT`,
  );
  const sudah = new Set(
    db
      .prepare("SELECT nama FROM _migrasi")
      .all()
      .map((r) => (r as { nama: string }).nama),
  );
  const baru = readdirSync(dir)
    .filter((f) => f.endsWith(".sql") && !sudah.has(f))
    .sort();
  for (const nama of baru) {
    // satu migrasi = satu transaksi: gagal di tengah tidak meninggalkan skema setengah jadi
    db.transaction(() => {
      db.exec(readFileSync(path.join(dir, nama), "utf8"));
      db.prepare("INSERT INTO _migrasi (nama) VALUES (?)").run(nama);
    }).immediate();
  }
  return baru;
}

if (require.main === module) {
  const db = bukaDb();
  const baru = migrate(db);
  console.log(
    baru.length
      ? `Migrasi dijalankan: ${baru.join(", ")}`
      : "Skema sudah terbaru",
  );
  db.close();
}
