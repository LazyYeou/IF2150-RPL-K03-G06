import { performance } from "node:perf_hooks";
import path from "node:path";

// Profiling pencarian lowongan (#45): npm run db:profil-cari [berkas] — membandingkan LIKE (Q-102a) dan jalur model.
process.env.DATABASE_PATH = path.resolve(process.argv[2] ?? "data/besar.db");
const ULANG = 20;
const KASUS: { nama: string; q: string; kategori?: string }[] = [
  { nama: "kata umum", q: "bersih" },
  { nama: "kata langka (1 hasil)", q: "nomor 12345" },
  { nama: "tanpa hasil", q: "xyzzy" },
  { nama: "umum + kategori", q: "cuci", kategori: "Kebersihan" },
];
const median = (a: number[]) =>
  [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

async function main() {
  const { db } = await import("../lib/db");
  const { cari, escapeLike, toFtsQuery } =
    await import("../models/LowonganPekerjaan");
  const n = (
    db.prepare("SELECT COUNT(*) n FROM lowongan_pekerjaan").get() as {
      n: number;
    }
  ).n;
  console.log(`Baris lowongan_pekerjaan: ${n}\n`);
  const where = String.raw`l.status_lowongan = 'OPEN'
    AND (l.judul LIKE @q ESCAPE '\' OR l.deskripsi LIKE @q ESCAPE '\')
    AND (@kategori IS NULL OR l.kategori = @kategori)`;
  const like = (k: (typeof KASUS)[number]) => {
    const p = { q: `%${escapeLike(k.q)}%`, kategori: k.kategori ?? null };
    const items = db
      .prepare(
        `SELECT l.id_lowongan id, l.judul, l.deskripsi FROM lowongan_pekerjaan l WHERE ${where} ORDER BY l.created_at DESC, l.id_lowongan LIMIT 12`,
      )
      .all(p);
    const total = db
      .prepare(`SELECT COUNT(*) total FROM lowongan_pekerjaan l WHERE ${where}`)
      .get(p);
    return { items, total };
  };
  const plan = (k: (typeof KASUS)[number]) =>
    (
      db
        .prepare(
          `EXPLAIN QUERY PLAN SELECT COUNT(*) FROM lowongan_pekerjaan l WHERE ${where}`,
        )
        .all({ q: `%${escapeLike(k.q)}%`, kategori: k.kategori ?? null }) as {
        detail: string;
      }[]
    ).map((r) => r.detail);
  console.log(
    "| Kasus | Strategi | Median (ms) | Maks (ms) | Total hasil | Payload (byte) |\n|---|---|---|---|---|---|",
  );
  for (const k of KASUS) {
    for (const [nama, jalan] of [
      ["LIKE (Q-102a)", () => like(k)],
      [
        "model cari()",
        () =>
          cari({
            q: k.q,
            kategori: k.kategori as never,
            urut: "terbaru",
            page: 1,
          }),
      ],
    ] as const) {
      jalan(); // pemanasan
      const t: number[] = [];
      let r: unknown;
      for (let i = 0; i < ULANG; i++) {
        const s = performance.now();
        r = jalan();
        t.push(performance.now() - s);
      }
      const tot = (r as { total: number | { total: number } }).total;
      console.log(
        `| ${k.nama} | ${nama} | ${median(t).toFixed(2)} | ${Math.max(...t).toFixed(2)} | ${typeof tot === "number" ? tot : tot.total} | ${JSON.stringify(r).length} |`,
      );
    }
  }
  console.log("\nEXPLAIN QUERY PLAN (LIKE, COUNT):");
  for (const k of KASUS) console.log(`- ${k.nama}: ${plan(k).join(" ; ")}`);
  console.log("\nEXPLAIN QUERY PLAN (FTS, COUNT):");
  for (const k of KASUS) {
    const rows = db
      .prepare(
        `EXPLAIN QUERY PLAN SELECT COUNT(*) FROM lowongan_pekerjaan l WHERE l.status_lowongan = 'OPEN' AND l.rowid IN (SELECT rowid FROM lowongan_fts WHERE lowongan_fts MATCH ?) AND (? IS NULL OR l.kategori = ?)`,
      )
      .all(toFtsQuery(k.q), k.kategori ?? null, k.kategori ?? null) as {
      detail: string;
    }[];
    console.log(`- ${k.nama}: ${rows.map((r) => r.detail).join(" ; ")}`);
  }
  db.close();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
