import { existsSync, rmSync } from "node:fs";
import { seed } from "../db/seed";
import { bukaDb, DB_PATH } from "../db/open";
import { migrate } from "./migrate";

// npm run db:reset            -> hapus DB, migrasi, seed
// tsx scripts/reset-db.ts --if-missing  -> hanya bila file DB belum ada (dipakai predev)
async function main() {
  const file = DB_PATH();
  if (process.argv.includes("--if-missing") && existsSync(file)) return;

  for (const suffix of ["", "-wal", "-shm"])
    rmSync(file + suffix, { force: true });
  const db = bukaDb(file);
  migrate(db);
  await seed(db);
  db.close();
  console.log(`Database siap: ${file}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
