import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const dir = mkdtempSync(path.join(tmpdir(), "kerjain-transaksi-e2e-"));
const child = spawn(
  process.execPath,
  [
    path.resolve("node_modules/@playwright/test/cli.js"),
    "test",
    "--config",
    "playwright.transaksi.config.ts",
    ...process.argv.slice(2),
  ],
  {
    stdio: "inherit",
    windowsHide: true,
    env: { ...process.env, TRANSAKSI_E2E_DIR: dir },
  },
);
child.once("error", (error) => console.error(error));
child.once("close", (code) => {
  try {
    // Playwright telah menghentikan server sehingga koneksi SQLite juga tertutup.
    const target = path.resolve(dir);
    if (
      path.dirname(target) !== path.resolve(tmpdir()) ||
      !path.basename(target).startsWith("kerjain-transaksi-e2e-")
    )
      throw new Error("Direktori fixture tidak valid");
    rmSync(target, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 200,
    });
    process.exitCode = code ?? 1;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
});
