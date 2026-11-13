import { loadEnvConfig } from "@next/env";

async function main() {
  loadEnvConfig(process.cwd());
  const [id, reference] = process.argv.slice(2);
  if (!id || !reference)
    throw new Error(
      "Gunakan: npm run midtrans:reconcile -- <idPencairan> <reference_no>",
    );
  // Binding DB baru dibuka setelah .env.local dimuat.
  const { rekonsiliasiPayout } = await import("./reconcile-midtrans");
  const { db } = await import("../lib/db");
  try {
    await rekonsiliasiPayout(id, reference);
    console.log(
      "Referensi terverifikasi. Gunakan Coba lagi pada pengajuan yang sama; tidak membuat payout baru.",
    );
  } finally {
    db.close();
  }
}
main().catch(() => {
  console.error(
    "Rekonsiliasi ditolak. Periksa ID, referensi Iris, dan konfigurasi; jangan membuat payout pengganti.",
  );
  process.exitCode = 1;
});
