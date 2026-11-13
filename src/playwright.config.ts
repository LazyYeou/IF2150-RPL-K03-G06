import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  // Suite ini perlu >12 transaksi dan dijalankan lewat konfigurasi DB sementara.
  testIgnore: [
    "**/transaksi-paginasi.spec.ts",
    "**/penawaran-ui.spec.ts",
    "**/transaksi-z-happy-path.spec.ts", // butuh DB fixture dari runner test:e2e:transaksi
  ],
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
