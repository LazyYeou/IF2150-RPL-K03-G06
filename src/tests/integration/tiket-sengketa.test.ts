import { randomUUID } from "node:crypto";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { DaftarTiketResponse, Tiket } from "@/lib/validation/sengketa";

// Cookie palsu: tiruan `cookies()` dari next/headers
const jar = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (n: string) =>
      jar.has(n) ? { name: n, value: jar.get(n) } : undefined,
    set: (n: string, v: string) => void jar.set(n, v),
    delete: (n: string) => void jar.delete(n),
  }),
}));

type Db = typeof import("@/lib/db").db;
let dir: string;
let db: Db;
let masuk: (email: string) => Promise<void>;
let buatRoute: typeof import("@/app/api/tiket/route");
let detailRoute: typeof import("@/app/api/tiket/[id]/route");
let buktiRoute: typeof import("@/app/api/tiket/[id]/bukti/route");
let batalRoute: typeof import("@/app/api/tiket/[id]/batal/route");
let csDaftar: typeof import("@/app/api/cs/tiket/route");
let csDetail: typeof import("@/app/api/cs/tiket/[id]/route");

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4];
const png = () =>
  new File([new Uint8Array(PNG)], "bukti.png", { type: "image/png" });
const one = <T>(sql: string, ...p: unknown[]) => db.prepare(sql).get(...p) as T;
const idProfil = (tabel: "tenaga_kerja" | "penyedia_kerja", email: string) =>
  one<{ id: string }>(
    `SELECT t.id_${tabel} id FROM ${tabel} t JOIN pengguna u USING (id_pengguna) WHERE u.email = ?`,
    email,
  ).id;

function transaksi(status: string, tk = "tk1@kerjain.test") {
  const lowongan = randomUUID();
  const penawaran = randomUUID();
  const id = randomUUID();
  const pk = idProfil("penyedia_kerja", "pk1@kerjain.test");
  const idTK = idProfil("tenaga_kerja", tk);
  db.prepare(
    `INSERT INTO lowongan_pekerjaan (id_lowongan, id_penyedia_kerja, judul, deskripsi, ruang_lingkup, kriteria_hasil,
       kategori, lokasi, tanggal_pekerjaan, estimasi_durasi, upah, satuan_upah, kuota, jumlah_diterima, status_lowongan)
     VALUES (?, ?, 'Lowongan uji tiket sengketa', 'Deskripsi lowongan untuk uji tiket sengketa', 'a', 'b',
       'Kebersihan', 'Bandung', '2026-12-01', '2 jam', 200000, 'PER_TUGAS', 1, 1, 'CLOSED_FULL')`,
  ).run(lowongan, pk);
  db.prepare(
    `INSERT INTO pengajuan_penawaran (id_penawaran, id_lowongan, id_tenaga_kerja, harga_penawaran, ketersediaan, status_penawaran)
     VALUES (?, ?, ?, 200000, 'Kamis', 'DITERIMA')`,
  ).run(penawaran, lowongan, idTK);
  db.prepare(
    `INSERT INTO transaksi_pekerjaan (id_transaksi, id_lowongan, id_penawaran, id_tenaga_kerja, id_penyedia_kerja, nominal_upah, status_pekerjaan)
     VALUES (?, ?, ?, ?, ?, 200000, ?)`,
  ).run(id, lowongan, penawaran, idTK, pk, status);
  return id;
}
const statusPekerjaan = (id: string) =>
  one<{ s: string; sebelum: string | null }>(
    "SELECT status_pekerjaan s, status_sebelum_sengketa sebelum FROM transaksi_pekerjaan WHERE id_transaksi = ?",
    id,
  );

const form = (o: Record<string, string | File | undefined> = {}) => {
  const f = new FormData();
  const isi = {
    kategoriMasalah: "Pekerjaan tidak sesuai",
    deskripsi: "Hasil pekerjaan tidak sesuai kesepakatan awal kami.",
    ...o,
  };
  for (const [k, v] of Object.entries(isi)) if (v !== undefined) f.set(k, v);
  return f;
};
const buat = (f: FormData) =>
  buatRoute.POST(
    new Request("http://localhost/api/tiket", { method: "POST", body: f }),
  );
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const lihat = (id: string) =>
  detailRoute.GET(new Request(`http://localhost/api/tiket/${id}`), ctx(id));
const unggah = (id: string, f: FormData) =>
  buktiRoute.POST(
    new Request(`http://localhost/api/tiket/${id}/bukti`, {
      method: "POST",
      body: f,
    }),
    ctx(id),
  );
const batalkan = (id: string) =>
  batalRoute.POST(
    new Request(`http://localhost/api/tiket/${id}/batal`, { method: "POST" }),
    ctx(id),
  );
const kode = async (r: Response) => (await r.json()).error?.code;
async function ajukan(trx: string | undefined, f = form()) {
  if (trx) f.set("idTransaksi", trx);
  const r = await buat(f);
  expect(r.status).toBe(201);
  return Tiket.parse(await r.json());
}

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "kerjain-tiket-"));
  process.env.DATABASE_PATH = path.join(dir, "test.db");
  process.env.STORAGE_DIR = path.join(dir, "storage");
  const { bukaDb } = await import("@/db/open");
  const { migrate } = await import("@/scripts/migrate");
  const { seed } = await import("@/db/seed");
  const awal = bukaDb();
  migrate(awal);
  await seed(awal);
  awal.close();
  ({ db } = await import("@/lib/db"));
  const { buatSesi } = await import("@/lib/auth/session");
  buatRoute = await import("@/app/api/tiket/route");
  detailRoute = await import("@/app/api/tiket/[id]/route");
  buktiRoute = await import("@/app/api/tiket/[id]/bukti/route");
  batalRoute = await import("@/app/api/tiket/[id]/batal/route");
  csDaftar = await import("@/app/api/cs/tiket/route");
  csDetail = await import("@/app/api/cs/tiket/[id]/route");
  masuk = (email) =>
    buatSesi(
      one<{ id: string }>(
        "SELECT id_pengguna id FROM pengguna WHERE email = ?",
        email,
      ).id,
    );
  // peserta kedua dan non-peserta
  for (const [email, peran] of [
    ["pk2@kerjain.test", "PK"],
    ["tk4@kerjain.test", "TK"],
  ]) {
    const id = randomUUID();
    db.prepare(
      `INSERT INTO pengguna (id_pengguna, nama, email, password_hash, peran, tanggal_lahir, persetujuan_privasi_at)
       VALUES (?, ?, ?, 'x', ?, '1990-01-01', datetime('now'))`,
    ).run(id, email, email, peran);
    db.prepare(
      peran === "PK"
        ? "INSERT INTO penyedia_kerja (id_penyedia_kerja, id_pengguna) VALUES (?, ?)"
        : "INSERT INTO tenaga_kerja (id_tenaga_kerja, id_pengguna) VALUES (?, ?)",
    ).run(randomUUID(), id);
  }
});
afterAll(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
beforeEach(() => jar.clear());

describe("POST /api/tiket (KF24)", () => {
  it("bantuan umum tanpa transaksi: 201, nomor KIN-xxxxxx, riwayat awal, pekerjaan tidak berubah", async () => {
    await masuk("tk1@kerjain.test");
    const t = await ajukan(undefined);
    expect(t).toMatchObject({
      status: "DIAJUKAN",
      idTransaksi: null,
      keputusan: null,
    });
    expect(t.nomorTiket).toMatch(/^KIN-\d{6}$/);
    expect(t.riwayat.map((r) => r.log)).toEqual(["Tiket diajukan"]);
  });
  it("dari transaksi: peserta PK/TK diterima, pekerjaan DISENGKETAKAN dan status asal disimpan; berkas ikut tersimpan", async () => {
    const trx = transaksi("SUBMITTED");
    await masuk("pk1@kerjain.test");
    const t = await ajukan(trx, form({ berkas: png() }));
    expect(t.idTransaksi).toBe(trx);
    expect(t.bukti).toHaveLength(1);
    expect(statusPekerjaan(trx)).toEqual({
      s: "DISENGKETAKAN",
      sebelum: "SUBMITTED",
    });
    expect(t.riwayat.map((r) => r.log)).toEqual([
      "Tiket diajukan",
      "Bukti diunggah",
    ]);
    jar.clear();
    const trx2 = transaksi("IN_PROGRESS");
    await masuk("tk1@kerjain.test");
    await ajukan(trx2);
    expect(statusPekerjaan(trx2).sebelum).toBe("IN_PROGRESS");
  });
  it("tiket aktif atau upah sudah dikredit -> 409 TIKET_AKTIF tanpa mengubah apa pun", async () => {
    const trx = transaksi("IN_PROGRESS");
    await masuk("pk1@kerjain.test");
    await ajukan(trx);
    const ganda = form({ idTransaksi: trx });
    const r = await buat(ganda);
    expect(r.status).toBe(409);
    expect(await kode(r)).toBe("TIKET_AKTIF");
    const selesai = transaksi("COMPLETED");
    const r2 = await buat(form({ idTransaksi: selesai }));
    expect(r2.status).toBe(409);
    expect(await kode(r2)).toBe("TIKET_AKTIF");
    expect(statusPekerjaan(selesai).s).toBe("COMPLETED");
  });
  it("transaksi belum dibayar -> 409 STATUS_TIDAK_VALID; tidak ada -> 404", async () => {
    const trx = transaksi("MENUNGGU_PEMBAYARAN");
    await masuk("pk1@kerjain.test");
    const r = await buat(form({ idTransaksi: trx }));
    expect(r.status).toBe(409);
    expect(await kode(r)).toBe("STATUS_TIDAK_VALID");
    expect(statusPekerjaan(trx).s).toBe("MENUNGGU_PEMBAYARAN");
    expect((await buat(form({ idTransaksi: randomUUID() }))).status).toBe(404);
  });
  it("bukan peserta transaksi -> 403 dan tidak ada perubahan", async () => {
    const trx = transaksi("IN_PROGRESS");
    for (const email of ["pk2@kerjain.test", "tk4@kerjain.test"]) {
      jar.clear();
      await masuk(email);
      expect((await buat(form({ idTransaksi: trx }))).status).toBe(403);
    }
    expect(statusPekerjaan(trx).s).toBe("IN_PROGRESS");
  });
  it("validasi: deskripsi pendek -> 400; tanpa sesi -> 401; berkas .exe -> 400 dan transaksi utuh", async () => {
    expect((await buat(form())).status).toBe(401);
    const trx = transaksi("IN_PROGRESS");
    await masuk("tk1@kerjain.test");
    expect((await buat(form({ deskripsi: "pendek" }))).status).toBe(400);
    const exe = new File([new Uint8Array([0x4d, 0x5a, 0, 0, 1, 2])], "a.jpg", {
      type: "image/jpeg",
    });
    const r = await buat(form({ idTransaksi: trx, berkas: exe }));
    expect(r.status).toBe(400);
    expect(await kode(r)).toBe("BERKAS_TIDAK_VALID");
    expect(statusPekerjaan(trx).s).toBe("IN_PROGRESS");
  });
  it("dua pembuatan bersamaan untuk transaksi yang sama: hanya satu berhasil", async () => {
    const trx = transaksi("IN_PROGRESS");
    await masuk("pk1@kerjain.test");
    const hasil = await Promise.all([
      buat(form({ idTransaksi: trx })),
      buat(form({ idTransaksi: trx })),
    ]);
    expect(hasil.map((r) => r.status).sort()).toEqual([201, 409]);
    expect(
      one<{ n: number }>(
        "SELECT COUNT(*) n FROM tiket_sengketa WHERE id_transaksi = ?",
        trx,
      ).n,
    ).toBe(1);
  });
});

describe("GET /api/tiket/:id (akses)", () => {
  it("pelapor dan peserta lain transaksi, serta CS, boleh; non-peserta 403; tak dikenal 404", async () => {
    const trx = transaksi("IN_PROGRESS");
    await masuk("pk1@kerjain.test");
    const t = await ajukan(trx);
    expect((await lihat(t.id)).status).toBe(200);
    for (const [email, status] of [
      ["tk1@kerjain.test", 200],
      ["cs1@kerjain.test", 200],
      ["pk2@kerjain.test", 403],
      ["tk4@kerjain.test", 403],
    ] as const) {
      jar.clear();
      await masuk(email);
      expect((await lihat(t.id)).status).toBe(status);
    }
    expect((await lihat(randomUUID())).status).toBe(404);
    expect((await lihat("bukan-uuid")).status).toBe(404);
    jar.clear();
    expect((await lihat(t.id)).status).toBe(401);
  });
  it("tiket bantuan umum hanya untuk pelapor (dan CS)", async () => {
    await masuk("tk1@kerjain.test");
    const t = await ajukan(undefined);
    jar.clear();
    await masuk("pk1@kerjain.test");
    expect((await lihat(t.id)).status).toBe(403);
  });
});

describe("POST /api/tiket/:id/bukti", () => {
  it("peserta menambah bukti: riwayat bertambah, berkas tersimpan di storage/sengketa", async () => {
    const trx = transaksi("IN_PROGRESS");
    await masuk("pk1@kerjain.test");
    const t = await ajukan(trx);
    jar.clear();
    await masuk("tk1@kerjain.test");
    const f = new FormData();
    f.set("berkas", png());
    const r = await unggah(t.id, f);
    expect(r.status).toBe(201);
    const baru = Tiket.parse(await r.json());
    expect(baru.bukti).toHaveLength(1);
    expect(baru.riwayat.at(-1)?.log).toBe("Bukti diunggah");
    expect(
      readdirSync(path.join(process.env.STORAGE_DIR!, "sengketa")).length,
    ).toBeGreaterThan(0);
  });
  it("tiket MENUNGGU_BALASAN kembali DITINJAU setelah bukti; tiket final -> 409 dan berkas dibuang", async () => {
    await masuk("tk1@kerjain.test");
    const t = await ajukan(undefined);
    db.prepare(
      "UPDATE tiket_sengketa SET status_tiket = 'MENUNGGU_BALASAN' WHERE id_tiket = ?",
    ).run(t.id);
    const f = new FormData();
    f.set("berkas", png());
    const r = await unggah(t.id, f);
    expect(Tiket.parse(await r.json()).status).toBe("DITINJAU");
    db.prepare(
      "UPDATE tiket_sengketa SET status_tiket = 'DITUTUP' WHERE id_tiket = ?",
    ).run(t.id);
    const sebelum = readdirSync(
      path.join(process.env.STORAGE_DIR!, "sengketa"),
    ).length;
    const f2 = new FormData();
    f2.set("berkas", png());
    const r2 = await unggah(t.id, f2);
    expect(r2.status).toBe(409);
    expect(
      readdirSync(path.join(process.env.STORAGE_DIR!, "sengketa")).length,
    ).toBe(sebelum);
  });
  it("tanpa berkas -> 400; non-peserta -> 403", async () => {
    await masuk("tk1@kerjain.test");
    const t = await ajukan(undefined);
    expect((await unggah(t.id, new FormData())).status).toBe(400);
    jar.clear();
    await masuk("pk1@kerjain.test");
    const f = new FormData();
    f.set("berkas", png());
    expect((await unggah(t.id, f)).status).toBe(403);
  });
});

describe("POST /api/tiket/:id/batal", () => {
  it("pelapor membatalkan DIAJUKAN: tiket DIBATALKAN, pekerjaan kembali ke status asal, riwayat bertambah", async () => {
    const trx = transaksi("SUBMITTED");
    await masuk("pk1@kerjain.test");
    const t = await ajukan(trx);
    const r = await batalkan(t.id);
    expect(r.status).toBe(200);
    const b = Tiket.parse(await r.json());
    expect(b.status).toBe("DIBATALKAN");
    expect(b.riwayat.at(-1)?.log).toBe("Tiket dibatalkan oleh pelapor");
    expect(statusPekerjaan(trx)).toEqual({ s: "SUBMITTED", sebelum: null });
    // setelah batal boleh mengajukan lagi
    await ajukan(trx);
  });
  it("bukan pelapor 403; bukan DIAJUKAN 409; tak dikenal 404", async () => {
    const trx = transaksi("IN_PROGRESS");
    await masuk("pk1@kerjain.test");
    const t = await ajukan(trx);
    jar.clear();
    await masuk("tk1@kerjain.test"); // peserta tetapi bukan pelapor
    expect((await batalkan(t.id)).status).toBe(403);
    jar.clear();
    await masuk("pk1@kerjain.test");
    db.prepare(
      "UPDATE tiket_sengketa SET status_tiket = 'DITINJAU' WHERE id_tiket = ?",
    ).run(t.id);
    const r = await batalkan(t.id);
    expect(r.status).toBe(409);
    expect(await kode(r)).toBe("STATUS_TIDAK_VALID");
    expect(statusPekerjaan(trx).s).toBe("DISENGKETAKAN");
    expect((await batalkan(randomUUID())).status).toBe(404);
  });
});

describe("GET /api/cs/tiket dan /api/cs/tiket/:id", () => {
  it("CS: daftar paginasi tanpa riwayat, filter status, detail dengan riwayat kronologis", async () => {
    await masuk("tk1@kerjain.test");
    const t = await ajukan(undefined);
    jar.clear();
    await masuk("cs1@kerjain.test");
    const r = await csDaftar.GET(
      new Request("http://localhost/api/cs/tiket?status=DIAJUKAN"),
    );
    expect(r.status).toBe(200);
    const d = await r.json();
    DaftarTiketResponse.parse(d);
    expect(
      d.items.every((i: { status: string }) => i.status === "DIAJUKAN"),
    ).toBe(true);
    expect(d.items.some((i: { id: string }) => i.id === t.id)).toBe(true);
    expect(d.items[0]).not.toHaveProperty("riwayat");
    const det = await csDetail.GET(
      new Request(`http://localhost/api/cs/tiket/${t.id}`),
      ctx(t.id),
    );
    const tiket = Tiket.parse(await det.json());
    const waktu = tiket.riwayat.map((x) => x.timestamp);
    expect([...waktu].sort()).toEqual(waktu);
    expect(
      (
        await csDetail.GET(
          new Request("http://x/api/cs/tiket/x"),
          ctx(randomUUID()),
        )
      ).status,
    ).toBe(404);
    expect(
      (
        await csDaftar.GET(
          new Request("http://localhost/api/cs/tiket?status=ASAL"),
        )
      ).status,
    ).toBe(400);
  });
  it("non-CS 403; tanpa sesi 401", async () => {
    expect(
      (await csDaftar.GET(new Request("http://localhost/api/cs/tiket"))).status,
    ).toBe(401);
    await masuk("tk1@kerjain.test");
    expect(
      (await csDaftar.GET(new Request("http://localhost/api/cs/tiket"))).status,
    ).toBe(403);
    const id = randomUUID();
    expect(
      (
        await csDetail.GET(
          new Request(`http://localhost/api/cs/tiket/${id}`),
          ctx(id),
        )
      ).status,
    ).toBe(403);
  });
});

describe("riwayat tidak bisa diubah (KF26)", () => {
  it("UPDATE dan DELETE pada riwayat_sengketa ditolak database", async () => {
    await masuk("tk1@kerjain.test");
    const t = await ajukan(undefined);
    expect(() =>
      db
        .prepare(
          "UPDATE riwayat_sengketa SET log_aktivitas = 'x' WHERE id_tiket = ?",
        )
        .run(t.id),
    ).toThrow();
    expect(() =>
      db.prepare("DELETE FROM riwayat_sengketa WHERE id_tiket = ?").run(t.id),
    ).toThrow();
  });
});
