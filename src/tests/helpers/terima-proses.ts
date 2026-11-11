// Dijalankan sebagai proses terpisah oleh tests/integration/domain-lintas.test.ts (KNF07).
// Argumen: <mulaiMs> <idPenawaran> <idPenyediaKerja>. Koneksi DB dibuka dari DATABASE_PATH di env.
async function main() {
  const [mulai, idPenawaran, idPK] = process.argv.slice(2);
  const { terima } = await import("../../models/PengajuanPenawaran");
  const { db } = await import("../../lib/db");
  // Tunggu titik waktu yang sama agar dua proses benar-benar berebut kunci tulis.
  while (Date.now() < Number(mulai)) await new Promise((r) => setTimeout(r, 1));
  const hasil = terima(idPenawaran, idPK);
  console.log(JSON.stringify(hasil));
  db.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
