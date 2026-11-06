import type Database from "better-sqlite3";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { bukaDb } from "@/db/open";
import { seed } from "@/db/seed";
import { migrate } from "@/scripts/migrate";

/** DB SQLite sementara (migrasi + seed) per suite test. Panggil `tutup()` di afterAll. */
export async function dbSementara(): Promise<{
  db: Database.Database;
  tutup: () => void;
}> {
  const dir = mkdtempSync(path.join(tmpdir(), "kerjain-db-"));
  const db = bukaDb(path.join(dir, "test.db"));
  migrate(db);
  await seed(db);
  return {
    db,
    tutup: () => {
      db.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}
