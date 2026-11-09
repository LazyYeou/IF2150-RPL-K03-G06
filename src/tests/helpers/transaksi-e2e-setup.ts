import type { FullConfig } from "@playwright/test";
import path from "node:path";
import { bukaDb } from "../../db/open";
import { seed } from "../../db/seed";
import { migrate } from "../../scripts/migrate";
import { tambahFixtureTransaksi } from "./transaksi";

export default async function setup(config: FullConfig) {
  const dir = config.metadata.fixtureDir as string;
  if (!path.basename(dir).startsWith("kerjain-transaksi-e2e-"))
    throw new Error("DB fixture sementara diperlukan");
  const db = bukaDb(path.join(dir, "test.db"));
  try {
    migrate(db);
    await seed(db);
    tambahFixtureTransaksi(db);
    db.prepare(
      "UPDATE transaksi_pekerjaan SET status_pekerjaan = 'DIBATALKAN' WHERE status_pekerjaan = 'MENUNGGU_PEMBAYARAN'",
    ).run();
  } finally {
    db.close();
  }
}
