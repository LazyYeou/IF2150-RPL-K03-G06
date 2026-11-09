import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const jar = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      jar.has(name) ? { name, value: jar.get(name) } : undefined,
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (name: string) => void jar.delete(name),
  }),
}));

type Db = typeof import("@/lib/db").db;
type SetujuiRoute = typeof import("@/app/api/transaksi/[id]/setujui/route");
type JsonRoute =
  | typeof import("@/app/api/transaksi/[id]/revisi/route")
  | typeof import("@/app/api/transaksi/[id]/ulasan/route");

let db: Db;
let dir: string;
let setujuiRoute: SetujuiRoute;
let revisiRoute: typeof import("@/app/api/transaksi/[id]/revisi/route");
let ulasanRoute: typeof import("@/app/api/transaksi/[id]/ulasan/route");
let detailRoute: typeof import("@/app/api/transaksi/[id]/route");
let buatSesi: typeof import("@/lib/auth/session").buatSesi;

const one = <T>(sql: string, ...params: unknown[]) =>
  db.prepare(sql).get(...params) as T;

async function buatTransaksiSubmitted() {
  const sumber = one<{
    idTK: string;
    idPK: string;
    nominalUpah: number;
    judul: string;
    deskripsi: string;
    ruangLingkup: string;
    kriteria: string;
    kategori: string;
    lokasi: string;
    tanggal: string;
    durasi: string;
    upahLowongan: number;
    satuan: string;
    idPenggunaTK: string;
    idPenggunaPK: string;
    namaTK: string;
  }>(
    `SELECT t.id_tenaga_kerja AS idTK, t.id_penyedia_kerja AS idPK,
            t.nominal_upah AS nominalUpah, l.judul, l.deskripsi,
            l.ruang_lingkup AS ruangLingkup, l.kriteria_hasil AS kriteria,
            l.kategori, l.lokasi, l.tanggal_pekerjaan AS tanggal,
            l.estimasi_durasi AS durasi, l.upah AS upahLowongan,
            l.satuan_upah AS satuan, tk.id_pengguna AS idPenggunaTK,
            pk.id_pengguna AS idPenggunaPK, utk.nama AS namaTK
     FROM transaksi_pekerjaan t
     JOIN lowongan_pekerjaan l ON l.id_lowongan = t.id_lowongan
     JOIN tenaga_kerja tk ON tk.id_tenaga_kerja = t.id_tenaga_kerja
     JOIN pengguna utk ON utk.id_pengguna = tk.id_pengguna
     JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = t.id_penyedia_kerja
     WHERE t.status_pekerjaan = 'SUBMITTED'
     LIMIT 1`,
  );
  const idLowongan = randomUUID();
  const idPenawaran = randomUUID();
  const idTransaksi = randomUUID();
  db.prepare(
    `INSERT INTO lowongan_pekerjaan
     (id_lowongan, id_penyedia_kerja, judul, deskripsi, ruang_lingkup,
      kriteria_hasil, kategori, lokasi, tanggal_pekerjaan, estimasi_durasi,
      upah, satuan_upah, kuota, jumlah_diterima, status_lowongan)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 'CLOSED_FULL')`,
  ).run(
    idLowongan,
    sumber.idPK,
    sumber.judul,
    sumber.deskripsi,
    sumber.ruangLingkup,
    sumber.kriteria,
    sumber.kategori,
    sumber.lokasi,
    sumber.tanggal,
    sumber.durasi,
    sumber.upahLowongan,
    sumber.satuan,
  );
  db.prepare(
    `INSERT INTO pengajuan_penawaran
     (id_penawaran, id_lowongan, id_tenaga_kerja, harga_penawaran,
      ketersediaan, status_penawaran)
     VALUES (?, ?, ?, ?, 'Kapan saja', 'DITERIMA')`,
  ).run(idPenawaran, idLowongan, sumber.idTK, sumber.nominalUpah);
  db.prepare(
    `INSERT INTO transaksi_pekerjaan
     (id_transaksi, id_lowongan, id_penawaran, id_tenaga_kerja,
      id_penyedia_kerja, nominal_upah, status_pekerjaan)
     VALUES (?, ?, ?, ?, ?, ?, 'SUBMITTED')`,
  ).run(idTransaksi, idLowongan, idPenawaran, sumber.idTK, sumber.idPK, sumber.nominalUpah);

  const commissionFee = Math.round(sumber.nominalUpah * 0.05);
  db.prepare(
    `INSERT INTO tagihan_pembayaran
     (id_tagihan, id_transaksi, nominal_upah, commission_fee, total_bayar,
      expiry_timestamp, status_pembayaran)
     VALUES (?, ?, ?, ?, ?, datetime('now', '+1 day'), 'BERHASIL')`,
  ).run(
    randomUUID(),
    idTransaksi,
    sumber.nominalUpah,
    commissionFee,
    sumber.nominalUpah + commissionFee,
  );
  return {
    idTransaksi,
    idPenggunaTK: sumber.idPenggunaTK,
    idPenggunaPK: sumber.idPenggunaPK,
    nominalUpah: sumber.nominalUpah,
    namaTK: sumber.namaTK,
  };
}

function postSetujui(id: string) {
  return setujuiRoute.POST(
    new Request(`http://localhost/api/transaksi/${id}/setujui`, {
      method: "POST",
    }),
    { params: Promise.resolve({ id }) },
  );
}

function postJson(route: JsonRoute, id: string, body: unknown) {
  return route.POST(
    new Request(`http://localhost/api/transaksi/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  );
}

describe("pemeriksaan hasil transaksi (Issue #35)", () => {
  beforeAll(async () => {
    dir = mkdtempSync(path.join(tmpdir(), "kerjain-pemeriksaan-"));
    process.env.DATABASE_PATH = path.join(dir, "test.db");
    const { bukaDb } = await import("@/db/open");
    const { migrate } = await import("@/scripts/migrate");
    const { seed } = await import("@/db/seed");
    const awal = bukaDb();
    migrate(awal);
    await seed(awal);
    awal.close();
    ({ db } = await import("@/lib/db"));
    ({ buatSesi } = await import("@/lib/auth/session"));
    setujuiRoute = await import("@/app/api/transaksi/[id]/setujui/route");
    revisiRoute = await import("@/app/api/transaksi/[id]/revisi/route");
    ulasanRoute = await import("@/app/api/transaksi/[id]/ulasan/route");
    detailRoute = await import("@/app/api/transaksi/[id]/route");
  });

  afterAll(() => {
    jar.clear();
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  beforeEach(() => jar.clear());

  it("mengkredit upah tepat sekali, meskipun helper saldo dipanggil ulang", async () => {
    const trx = await buatTransaksiSubmitted();
    await buatSesi(trx.idPenggunaPK);
    const saldoSebelum = one<{ saldo: number }>(
      `SELECT saldo_pendapatan AS saldo FROM tenaga_kerja
       WHERE id_pengguna = ?`,
      trx.idPenggunaTK,
    ).saldo;

    const pertama = await postSetujui(trx.idTransaksi);
    expect(pertama.status).toBe(200);
    expect(await pertama.json()).toMatchObject({
      idTransaksi: trx.idTransaksi,
      status: "COMPLETED",
    });

    const { kreditUpahDalamTx } = await import(
      "@/controllers/TransaksiPekerjaanController"
    );
    const { tx } = await import("@/lib/db");
    expect(tx(() => kreditUpahDalamTx(db, trx.idTransaksi))).toBe(false);
    expect((await postSetujui(trx.idTransaksi)).status).toBe(409);

    expect(
      one<{ saldo: number }>(
        `SELECT saldo_pendapatan AS saldo FROM tenaga_kerja
         WHERE id_pengguna = ?`,
        trx.idPenggunaTK,
      ).saldo,
    ).toBe(saldoSebelum + trx.nominalUpah);
    expect(
      one<{ jumlah: number }>(
        `SELECT COUNT(*) AS jumlah FROM mutasi_saldo
         WHERE kunci_operasi = ?`,
        `upah:${trx.idTransaksi}`,
      ).jumlah,
    ).toBe(1);
    expect(
      one<{ jumlah: number }>(
        `SELECT COUNT(*) AS jumlah FROM notifikasi
         WHERE id_penerima = ? AND tautan = ?`,
        trx.idPenggunaTK,
        `/tk/pekerjaan/${trx.idTransaksi}`,
      ).jumlah,
    ).toBe(1);
  });

  it("menolak persetujuan bila tagihan belum berhasil atau tiket masih aktif", async () => {
    const transaksiTagihanGagal = await buatTransaksiSubmitted();
    await buatSesi(transaksiTagihanGagal.idPenggunaPK);
    db.prepare(
      `UPDATE tagihan_pembayaran SET status_pembayaran = 'GAGAL'
       WHERE id_transaksi = ?`,
    ).run(transaksiTagihanGagal.idTransaksi);
    expect((await postSetujui(transaksiTagihanGagal.idTransaksi)).status).toBe(409);

    const trx = await buatTransaksiSubmitted();
    await buatSesi(trx.idPenggunaPK);
    db.prepare(
      `INSERT INTO tiket_sengketa
       (id_tiket, nomor_tiket, id_transaksi, id_pelapor,
        kategori_masalah, deskripsi_komplain)
       VALUES (?, ?, ?, ?, 'Hasil pekerjaan', ?)`,
    ).run(
      randomUUID(),
      `KIN-${randomUUID().slice(0, 6)}`,
      trx.idTransaksi,
      trx.idPenggunaPK,
      "Hasil pekerjaan perlu diperiksa karena ada kendala.",
    );
    expect((await postSetujui(trx.idTransaksi)).status).toBe(409);
    expect(
      one<{ status: string }>(
        `SELECT status_pekerjaan AS status FROM transaksi_pekerjaan
         WHERE id_transaksi = ?`,
        trx.idTransaksi,
      ).status,
    ).toBe("SUBMITTED");
  });

  it("minta revisi menyimpan catatan dan menampilkan bukti/revisi pada detail", async () => {
    const trx = await buatTransaksiSubmitted();
    await buatSesi(trx.idPenggunaPK);
    const idBukti = randomUUID();
    db.prepare(
      `INSERT INTO bukti_penyerahan
       (id_penyerahan, id_transaksi, deskripsi_pengerjaan, file_path, ukuran_file)
       VALUES (?, ?, ?, ?, 1024)`,
    ).run(
      idBukti,
      trx.idTransaksi,
      "Hasil pekerjaan telah dikirim dan dapat diperiksa.",
      `bukti/${idBukti}.png`,
    );

    expect(
      (
        await postJson(revisiRoute, trx.idTransaksi, { catatan: "Pendek" })
      ).status,
    ).toBe(400);

    const catatan = "Mohon rapikan bagian sisi kiri sesuai kesepakatan.";
    const response = await postJson(revisiRoute, trx.idTransaksi, { catatan });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: "IN_PROGRESS" });
    expect(
      one<{ jumlah: number }>(
        `SELECT COUNT(*) AS jumlah FROM notifikasi
         WHERE id_penerima = ? AND tautan = ?`,
        trx.idPenggunaTK,
        `/tk/pekerjaan/${trx.idTransaksi}`,
      ).jumlah,
    ).toBe(1);

    const detail = await detailRoute.GET(
      new Request(`http://localhost/api/transaksi/${trx.idTransaksi}`),
      { params: Promise.resolve({ id: trx.idTransaksi }) },
    );
    expect(await detail.json()).toMatchObject({
      status: "IN_PROGRESS",
      bukti: [
        {
          id: idBukti,
          urlBerkas: `/api/berkas/bukti/${idBukti}`,
        },
      ],
      revisi: [{ catatan }],
    });
  });

  it("mengirim ulasan sesudah disetujui dan mencegah duplikat", async () => {
    const trx = await buatTransaksiSubmitted();
    await buatSesi(trx.idPenggunaPK);
    expect(
      (
        await postJson(ulasanRoute, trx.idTransaksi, {
          nilai: 4,
          deskripsi: "Belum selesai",
        })
      ).status,
    ).toBe(409);
    expect((await postSetujui(trx.idTransaksi)).status).toBe(200);
    const { ambilDataFormUlasan } = await import(
      "@/controllers/TransaksiPekerjaanController"
    );
    expect(await ambilDataFormUlasan(trx.idTransaksi)).toMatchObject({
      peran: "PK",
      namaPenerima: trx.namaTK,
    });

    expect(
      (
        await postJson(ulasanRoute, trx.idTransaksi, {
          deskripsi: "Rating wajib dipilih sebelum ulasan dikirim.",
        })
      ).status,
    ).toBe(400);
    const response = await postJson(ulasanRoute, trx.idTransaksi, {
      nilai: 4,
      deskripsi: "Pekerjaan sesuai kesepakatan dan selesai tepat waktu.",
    });
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      nilai: 4,
      deskripsi: "Pekerjaan sesuai kesepakatan dan selesai tepat waktu.",
    });
    expect(
      (
        await postJson(ulasanRoute, trx.idTransaksi, { nilai: 5 })
      ).status,
    ).toBe(409);
    expect(await ambilDataFormUlasan(trx.idTransaksi)).toMatchObject({
      sudahDiulas: true,
    });
    expect(
      one<{ jumlah: number; rating: number }>(
        `SELECT jumlah_ulasan AS jumlah, akumulasi_rating AS rating
         FROM pengguna WHERE id_pengguna = ?`,
        trx.idPenggunaTK,
      ),
    ).toMatchObject({ jumlah: 1, rating: 4 });

    await buatSesi(trx.idPenggunaTK);
    expect(await ambilDataFormUlasan(trx.idTransaksi)).toMatchObject({
      peran: "TK",
    });
    const ulasanPenyedia = await postJson(ulasanRoute, trx.idTransaksi, {
      nilai: 5,
      deskripsi: "Komunikasi dan kesepakatan berjalan baik.",
    });
    expect(ulasanPenyedia.status).toBe(201);
    expect(await ulasanPenyedia.json()).toMatchObject({
      idPenerima: trx.idPenggunaPK,
      nilai: 5,
    });
    expect(
      one<{ jumlah: number; rating: number }>(
        `SELECT jumlah_ulasan AS jumlah, akumulasi_rating AS rating
         FROM pengguna WHERE id_pengguna = ?`,
        trx.idPenggunaPK,
      ),
    ).toMatchObject({ jumlah: 1, rating: 5 });

    const { ambilProfilPublik } = await import(
      "@/controllers/TransaksiPekerjaanController"
    );
    const profil = await ambilProfilPublik(trx.idPenggunaTK);
    expect(profil).toMatchObject({
      id: trx.idPenggunaTK,
      jumlahUlasan: 1,
      akumulasiRating: 4,
      ulasan: [
        {
          namaPenilai: expect.any(String),
          judulPekerjaan: expect.any(String),
          nilai: 4,
          deskripsi:
            "Pekerjaan sesuai kesepakatan dan selesai tepat waktu.",
        },
      ],
    });
  });
});
