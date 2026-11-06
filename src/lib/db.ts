import "server-only";
import type Database from "better-sqlite3";
import { bukaDb } from "@/db/open";

// Singleton: mencegah banyak koneksi saat hot-reload `next dev` (rancangan §11.4).
const g = globalThis as unknown as { __db?: Database.Database };
export const db: Database.Database = g.__db ?? (g.__db = bukaDb());

/**
 * Semua operasi tulis multi-langkah WAJIB lewat tx() = BEGIN IMMEDIATE.
 * `fn` sinkron: tidak boleh ada `await` di dalamnya (upload & gateway dilakukan di luar tx).
 */
export const tx = <T>(fn: () => T): T => db.transaction(fn).immediate();
