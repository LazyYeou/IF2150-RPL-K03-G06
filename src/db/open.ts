import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

export const DB_PATH = () =>
  path.resolve(process.env.DATABASE_PATH ?? "./data/kerjain.db");

/**
 * Buka koneksi SQLite dengan PRAGMA wajib (rancangan §11.4).
 * Dipakai bersama oleh lib/db.ts (server) dan skrip CLI/test, sehingga PRAGMA tidak terduplikasi.
 * Sengaja tanpa `server-only` agar bisa dijalankan lewat tsx.
 */
export function bukaDb(file: string = DB_PATH()): Database.Database {
  if (file !== ":memory:") mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL"); // pembaca tidak memblokir penulis
  db.pragma("foreign_keys = ON"); // wajib, default SQLite OFF
  db.pragma("busy_timeout = 5000"); // tunggu kunci maks 5 detik
  db.pragma("synchronous = NORMAL");
  return db;
}
