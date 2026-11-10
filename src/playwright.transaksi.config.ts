import { defineConfig } from "@playwright/test";
import path from "node:path";

const fixtureDir = process.env.TRANSAKSI_E2E_DIR;
if (!fixtureDir)
  throw new Error(
    "Jalankan melalui npm run test:e2e:transaksi agar fixture diisolasi dan dibersihkan.",
  );
const port = 3117;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: [
    "transaksi-paginasi.spec.ts",
    "transaksi-akses.spec.ts",
    "penawaran-ui.spec.ts",
  ],
  metadata: { fixtureDir },
  globalSetup: "./tests/helpers/transaksi-e2e-setup.ts",
  workers: 1,
  timeout: 60000,
  use: { baseURL, channel: process.env.PLAYWRIGHT_CHANNEL },
  webServer: {
    command: `node node_modules/next/dist/bin/next start -p ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    env: {
      DATABASE_PATH: path.join(fixtureDir, "test.db"),
      STORAGE_DIR: path.join(fixtureDir, "storage"),
      APP_URL: baseURL,
    },
  },
});
