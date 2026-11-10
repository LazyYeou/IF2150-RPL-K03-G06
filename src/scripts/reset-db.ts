import { existsSync, rmSync } from "node:fs";
import { loadEnvConfig } from "@next/env";
import { seed } from "../db/seed";
import { bukaDb, DB_PATH } from "../db/open";
import { migrate } from "./migrate";

// npm run db:reset            -> hapus DB, migrasi, seed
// tsx scripts/reset-db.ts --if-missing  -> siapkan DB tanpa menghapus data (dipakai predev)
async function main() {
  loadEnvConfig(process.cwd());
  const file = DB_PATH();
  const ifMissing = process.argv.includes("--if-missing");
  const alreadyExists = existsSync(file);

  if (ifMissing && alreadyExists) {
    const db = bukaDb(file);
    try {
      migrate(db);
      const penggunaAda = db
        .prepare("SELECT 1 FROM pengguna LIMIT 1")
        .get();
      if (!penggunaAda) await seed(db);
    } finally {
      db.close();
    }
    return;
  }

  if (!ifMissing) {
    for (const suffix of ["", "-wal", "-shm"])
      rmSync(file + suffix, { force: true });
  }
  const db = bukaDb(file);
  try {
    migrate(db);
    await seed(db);
    console.log(`Database siap: ${file}`);
  } finally {
    db.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
