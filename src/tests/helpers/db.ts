import type Database from "better-sqlite3";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { bukaDb } from "@/db/open";
import { seed } from "@/db/seed";
import { migrate } from "@/scripts/migrate";

/** DB SQLite sementara (migrasi + seed) per suite test. Panggil `tutup()` di afterAll. */
export async function dbSementara(options: { seed?: boolean } = {}): Promise<{
  db: Database.Database;
  file: string;
  tutup: () => void;
}> {
  const dir = mkdtempSync(path.join(tmpdir(), "kerjain-db-"));
  const file = path.join(dir, "test.db");
  let db: Database.Database | undefined;
  const tutup = () => {
    try {
      if (db?.open) db.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };
  try {
    db = bukaDb(file);
    migrate(db);
    if (options.seed !== false) await seed(db);
  } catch (e) {
    tutup();
    throw e;
  }
  return {
    db,
    file,
    tutup,
  };
}

/** Panggil SEBELUM impor controller/lib/db secara dinamis; satu binding per suite. */
export async function dbAplikasiSementara(options: { seed?: boolean } = {}) {
  const globalDb = globalThis as unknown as { __db?: Database.Database };
  const lama = globalDb.__db;
  if (lama?.open)
    throw new Error(
      "DB singleton sudah terbuka; siapkan helper sebelum mengimpor modul aplikasi",
    );
  const pathLama = process.env.DATABASE_PATH;
  const sementara = await dbSementara(options);
  process.env.DATABASE_PATH = sementara.file;
  globalDb.__db = sementara.db;
  let ditutup = false;
  return {
    db: sementara.db,
    file: sementara.file,
    tutup() {
      if (ditutup) return;
      ditutup = true;
      try {
        sementara.tutup();
      } finally {
        if (globalDb.__db === sementara.db) {
          if (lama === undefined) delete globalDb.__db;
          else globalDb.__db = lama;
        }
        if (process.env.DATABASE_PATH === sementara.file) {
          if (pathLama === undefined) delete process.env.DATABASE_PATH;
          else process.env.DATABASE_PATH = pathLama;
        }
      }
    },
  };
}
