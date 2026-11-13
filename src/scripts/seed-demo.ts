import { loadEnvConfig } from "@next/env";
import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { hash } from "@node-rs/argon2";
import type Database from "better-sqlite3";
import { bukaDb, DB_PATH } from "../db/open";
import { PASSWORD_UJI, seed } from "../db/seed";
import { migrate } from "./migrate";
import { pdfDummy, pngDummy } from "./gambar-dummy";

// npm run db:seed-demo — reset DB + seed dasar + data untuk SEMUA skenario, lengkap dengan berkas dummy.
// MENGHAPUS data/kerjain.db dan isi storage/{identitas,bukti,sengketa}. Hanya untuk pengembangan.

type P = string | number | null;
let db: Database.Database;
const jalan = (sql: string, ...p: P[]) => db.prepare(sql).run(...p);
const satu = <T>(sql: string, ...p: P[]) => db.prepare(sql).get(...p) as T;
const uuid = () => randomUUID();
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const KOMISI = Number(process.env.COMMISSION_RATE ?? 0.05);

async function main() {
  loadEnvConfig(process.cwd());
  if (!/^[0-9a-fA-F]{64}$/.test(process.env.FILE_ENCRYPTION_KEY ?? ""))
    throw new Error(
      "FILE_ENCRYPTION_KEY di .env.local harus 64 karakter hex. Buat: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  const { simpanBerkas } = await import("../lib/storage");
  const { enkripsiRekening } = await import("../lib/rekening");
  const storage = path.resolve(process.env.STORAGE_DIR ?? "./storage");
  for (const k of ["identitas", "bukti", "sengketa"])
    rmSync(path.join(storage, k), { recursive: true, force: true });
  const file = DB_PATH();
  for (const s of ["", "-wal", "-shm"]) rmSync(file + s, { force: true });
  db = bukaDb(file);
  migrate(db);
  await seed(db);

  // ----- berkas dummy -----
  let nBukti = 0;
  let nSengketa = 0;
  const file_ = (data: Buffer, nama: string, tipe: string) =>
    new File([new Uint8Array(data)], nama, { type: tipe });
  const bukti = async (judul: string) =>
    (
      await simpanBerkas(
        "bukti",
        file_(
          pngDummy("BUKTI KERJA", judul, (++nBukti * 47) % 360),
          "b.png",
          "image/png",
        ),
      )
    ).path;
  const sengketa = async (judul: string, pdf = false) =>
    (
      await simpanBerkas(
        "sengketa",
        pdf
          ? file_(pdfDummy("Bukti sengketa", judul), "s.pdf", "application/pdf")
          : file_(
              pngDummy("BUKTI SENGKETA", judul, (++nSengketa * 71 + 10) % 360),
              "s.png",
              "image/png",
            ),
      )
    ).path;
  const identitas = async (nama: string, pdf = false) =>
    (
      await simpanBerkas(
        "identitas",
        pdf
          ? file_(pdfDummy("KTP dummy", nama), "k.pdf", "application/pdf")
          : file_(pngDummy("KTP DUMMY", nama, 200), "k.png", "image/png"),
        { enkripsi: true },
      )
    ).path;

  // berkas fisik untuk bukti pada seed dasar (path sudah ada di DB, berkasnya belum)
  for (const r of db
    .prepare(
      "SELECT file_path p FROM bukti_penyerahan WHERE file_path LIKE 'bukti/seed-%'",
    )
    .all() as { p: string }[]) {
    mkdirSync(path.dirname(path.join(storage, r.p)), { recursive: true });
    writeFileSync(
      path.join(storage, r.p),
      pngDummy("BUKTI KERJA", "SEED DASAR", 160),
    );
  }

  const hashSandi = await hash(PASSWORD_UJI);
  db.exec("BEGIN IMMEDIATE");
  try {
    await demo({ bukti, sengketa, identitas, hashSandi, enkripsiRekening });
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  ringkas();
  db.close();
}

type Alat = {
  bukti: (j: string) => Promise<string>;
  sengketa: (j: string, pdf?: boolean) => Promise<string>;
  identitas: (n: string, pdf?: boolean) => Promise<string>;
  hashSandi: string;
  enkripsiRekening: (v: string, k: string) => string;
};

async function demo(a: Alat) {
  // ===== Akun =====
  const akun = (
    kunci: string,
    nama: string,
    peran: string,
    o: { bio?: string; area?: string; lahir?: string } = {},
  ) => {
    const id = uuid();
    jalan(
      `INSERT INTO pengguna (id_pengguna, nama, email, password_hash, peran, tanggal_lahir, persetujuan_privasi_at, bio, area_layanan)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)`,
      id,
      nama,
      `${kunci}@kerjain.test`,
      a.hashSandi,
      peran,
      o.lahir ?? "1994-03-12",
      o.bio ?? null,
      o.area ?? null,
    );
    return id;
  };
  const tkIds: Record<string, { id: string; user: string }> = {};
  const pkIds: Record<string, { id: string; user: string }> = {};
  const lamaTK = (kunci: string) => {
    const r = satu<{ id: string; user: string }>(
      "SELECT t.id_tenaga_kerja id, t.id_pengguna user FROM tenaga_kerja t JOIN pengguna u USING (id_pengguna) WHERE u.email = ?",
      `${kunci}@kerjain.test`,
    );
    tkIds[kunci] = r;
  };
  for (const k of ["tk1", "tk2", "tk3"]) lamaTK(k);
  pkIds.pk1 = satu(
    "SELECT p.id_penyedia_kerja id, p.id_pengguna user FROM penyedia_kerja p JOIN pengguna u USING (id_pengguna) WHERE u.email = 'pk1@kerjain.test'",
  );
  const cs1 = satu<{ id: string }>(
    "SELECT id_pengguna id FROM pengguna WHERE email = 'cs1@kerjain.test'",
  ).id;

  const tkBaru = async (
    kunci: string,
    nama: string,
    status: string,
    o: {
      bio?: string;
      area?: string;
      dok?: string;
      alasan?: string;
      umur?: string;
    } = {},
  ) => {
    const user = akun(kunci, nama, "TK", { bio: o.bio, area: o.area });
    const id = uuid();
    jalan(
      `INSERT INTO tenaga_kerja (id_tenaga_kerja, id_pengguna, status_verifikasi, dokumen_identitas_path, waktu_pengajuan_verifikasi, alasan_penolakan)
       VALUES (?, ?, ?, ?, CASE WHEN ? IS NULL THEN NULL ELSE datetime('now', ?) END, ?)`,
      id,
      user,
      status,
      o.dok ?? null,
      o.umur ?? null,
      o.umur ?? "0 hours",
      o.alasan ?? null,
    );
    tkIds[kunci] = { id, user };
  };
  const pkBaru = (kunci: string, nama: string, bio: string) => {
    const user = akun(kunci, nama, "PK", { bio, area: "Bandung" });
    const id = uuid();
    jalan(
      "INSERT INTO penyedia_kerja (id_penyedia_kerja, id_pengguna) VALUES (?, ?)",
      id,
      user,
    );
    pkIds[kunci] = { id, user };
  };

  jalan(
    "UPDATE pengguna SET bio = ?, area_layanan = ? WHERE email = 'tk1@kerjain.test'",
    "Pekerja harian berpengalaman 5 tahun: bersih-bersih, angkut barang, dan perbaikan ringan.",
    "Coblong dan Dago, Bandung",
  );
  jalan(
    "UPDATE pengguna SET area_layanan = 'Bandung' WHERE email = 'pk1@kerjain.test'",
  );
  // tk3 (seed dasar) kini punya dokumen sungguhan di antrean verifikasi
  jalan(
    "UPDATE tenaga_kerja SET dokumen_identitas_path = ? WHERE id_tenaga_kerja = ?",
    await a.identitas("JOKO WIDODO"),
    tkIds.tk3.id,
  );
  await tkBaru("tk4", "Rina Marlina", "DITOLAK", {
    dok: undefined,
    umur: "-2 days",
    alasan:
      "Foto KTP buram dan tidak terbaca. Silakan unggah ulang dengan pencahayaan yang baik.",
  });
  await tkBaru("tk5", "Dedi Kurniawan", "TERVERIFIKASI", {
    bio: "Tukang serbabisa: cat, keramik, pasang rak, dan servis ringan. Rapi dan tepat waktu.",
    area: "Cicendo dan Lengkong, Bandung",
  });
  await tkBaru("tk6", "Lia Permata", "TERVERIFIKASI", {
    bio: "Spesialis kebersihan rumah dan kantor, serta bantu acara keluarga.",
    area: "Dago dan Coblong, Bandung",
  });
  await tkBaru("tk7", "Bagas Saputra", "TERVERIFIKASI", {
    bio: "Angkut barang dan pindahan dengan mobil bak sendiri.",
    area: "Buah Batu, Bandung",
  });
  await tkBaru("tk8", "Nanda Putri", "MENUNGGU_VERIFIKASI", {
    dok: await a.identitas("NANDA PUTRI", true),
    umur: "-5 hours",
  });
  jalan(
    "UPDATE tenaga_kerja SET waktu_pengajuan_verifikasi = datetime('now','-1 days') WHERE id_tenaga_kerja = ?",
    tkIds.tk3.id,
  );
  pkBaru(
    "pk2",
    "Maya Kusuma",
    "Pemilik toko perabot dan rumah kos di Bandung.",
  );
  pkBaru(
    "pk3",
    "Hendra Wijaya",
    "Pengelola kantor kecil dan katering rumahan.",
  );
  jalan(
    "INSERT INTO customer_service (id_cs, id_pengguna, hak_akses) VALUES (?, ?, 'CS')",
    uuid(),
    akun("cs2", "Raka Pratama", "CS"),
  );
  const cs2 = satu<{ id: string }>(
    "SELECT id_pengguna id FROM pengguna WHERE email = 'cs2@kerjain.test'",
  ).id;

  // ===== Helper domain =====
  const LOKASI = [
    "Coblong, Bandung",
    "Dago, Bandung",
    "Cicendo, Bandung",
    "Lengkong, Bandung",
    "Buah Batu, Bandung",
  ];
  let nLok = 0;
  const lowongan = (
    pk: string,
    judul: string,
    kategori: string,
    o: {
      kuota?: number;
      diterima?: number;
      status?: string;
      upah?: number;
      satuan?: string;
      tanggal?: string;
      umur?: string;
    } = {},
  ) => {
    const id = uuid();
    jalan(
      `INSERT INTO lowongan_pekerjaan (id_lowongan, id_penyedia_kerja, judul, deskripsi, ruang_lingkup, kriteria_hasil, kategori, lokasi,
         tanggal_pekerjaan, estimasi_durasi, upah, satuan_upah, kuota, jumlah_diterima, pernyataan_risiko, status_lowongan, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`,
      id,
      pkIds[pk].id,
      judul,
      `${judul}. Pekerjaan sesuai kesepakatan, alat dan bahan utama disediakan oleh penyedia kerja.`,
      "Sesuai deskripsi pekerjaan di lokasi, termasuk merapikan area setelah selesai.",
      "Hasil rapi, aman, dan selesai tepat waktu sesuai kesepakatan.",
      kategori,
      LOKASI[nLok++ % LOKASI.length],
      o.tanggal ?? "2026-11-20",
      "3 jam",
      o.upah ?? 150_000,
      o.satuan ?? "PER_TUGAS",
      o.kuota ?? 1,
      o.diterima ?? 0,
      kategori === "Kelistrikan" ? 1 : 0,
      o.status ?? "OPEN",
      o.umur ?? "-1 days",
    );
    return id;
  };
  const idLow = (judul: string) =>
    satu<{ id: string }>(
      "SELECT id_lowongan id FROM lowongan_pekerjaan WHERE judul = ?",
      judul,
    ).id;
  const penawaran = (
    low: string,
    tk: string,
    harga: number,
    status: string,
    o: { pesan?: string; umur?: string; sedia?: string } = {},
  ) => {
    const id = uuid();
    jalan(
      `INSERT INTO pengajuan_penawaran (id_penawaran, id_lowongan, id_tenaga_kerja, harga_penawaran, ketersediaan, pesan_penawaran, status_penawaran, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`,
      id,
      low,
      tkIds[tk].id,
      harga,
      o.sedia ?? "Bisa mulai besok pagi",
      o.pesan ?? null,
      status,
      o.umur ?? "-6 hours",
    );
    return id;
  };
  const transaksi = (
    low: string,
    pen: string,
    tk: string,
    pk: string,
    upah: number,
    status: string,
    o: { sebelum?: string; umur?: string } = {},
  ) => {
    const id = uuid();
    jalan(
      `INSERT INTO transaksi_pekerjaan (id_transaksi, id_lowongan, id_penawaran, id_tenaga_kerja, id_penyedia_kerja, nominal_upah, status_pekerjaan, status_sebelum_sengketa, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`,
      id,
      low,
      pen,
      tkIds[tk].id,
      pkIds[pk].id,
      upah,
      status,
      o.sebelum ?? null,
      o.umur ?? "-4 days",
    );
    return id;
  };
  /** Lowongan kuota 1 yang sudah terisi + penawaran DITERIMA + transaksi. */
  const kerjaan = (
    pk: string,
    tk: string,
    judul: string,
    kategori: string,
    upah: number,
    status: string,
    o: { sebelum?: string; umur?: string } = {},
  ) => {
    const low = lowongan(pk, judul, kategori, {
      kuota: 1,
      diterima: 1,
      status: "CLOSED_FULL",
      upah,
      umur: o.umur ?? "-6 days",
      tanggal: "2026-11-08",
    });
    const pen = penawaran(low, tk, upah, "DITERIMA", {
      umur: o.umur ?? "-5 days",
      pesan: "Siap mengerjakan sesuai kesepakatan.",
    });
    return transaksi(low, pen, tk, pk, upah, status, o);
  };
  const fee = (upah: number) => Math.round(upah * KOMISI);
  const tagihan = (
    trx: string,
    status: string,
    metode: string | null,
    expiry: string,
    umur = "-3 days",
  ) => {
    const upah = satu<{ n: number }>(
      "SELECT nominal_upah n FROM transaksi_pekerjaan WHERE id_transaksi = ?",
      trx,
    ).n;
    const id = uuid();
    jalan(
      `INSERT INTO tagihan_pembayaran (id_tagihan, id_transaksi, nominal_upah, commission_fee, total_bayar, metode, expiry_timestamp, status_pembayaran, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?), ?, datetime('now', ?))`,
      id,
      trx,
      upah,
      fee(upah),
      upah + fee(upah),
      metode,
      expiry,
      status,
      umur,
    );
    if (["DIPROSES", "BERHASIL", "DIKEMBALIKAN"].includes(status))
      jalan(
        "INSERT INTO log_gateway (jenis, referensi_id, payload) VALUES ('CHARGE', ?, ?)",
        id,
        JSON.stringify({ idTagihan: id, total: upah + fee(upah), metode }),
      );
    return id;
  };
  const buktiKerja = async (
    trx: string,
    deskripsi: string,
    judul: string,
    umur = "-2 days",
  ) => {
    const p = await a.bukti(judul);
    jalan(
      `INSERT INTO bukti_penyerahan (id_penyerahan, id_transaksi, deskripsi_pengerjaan, file_path, ukuran_file, timestamp_pengiriman)
       VALUES (?, ?, ?, ?, ?, datetime('now', ?))`,
      uuid(),
      trx,
      deskripsi,
      p,
      30_000,
      umur,
    );
  };
  const revisi = (trx: string, catatan: string, umur = "-1 days") =>
    jalan(
      "INSERT INTO catatan_revisi (id_revisi, id_transaksi, catatan, waktu_permintaan) VALUES (?, ?, ?, datetime('now', ?))",
      uuid(),
      trx,
      catatan,
      umur,
    );
  const kredit = (trx: string, tk: string, umur = "-1 days") => {
    const n = satu<{ n: number }>(
      "SELECT nominal_upah n FROM transaksi_pekerjaan WHERE id_transaksi = ?",
      trx,
    ).n;
    jalan(
      "INSERT INTO mutasi_saldo (kunci_operasi, id_tenaga_kerja, nominal, created_at) VALUES (?, ?, ?, datetime('now', ?))",
      `upah:${trx}`,
      tkIds[tk].id,
      n,
      umur,
    );
    jalan(
      "UPDATE tenaga_kerja SET saldo_pendapatan = saldo_pendapatan + ? WHERE id_tenaga_kerja = ?",
      n,
      tkIds[tk].id,
    );
  };
  const ulasan = (
    trx: string,
    penilai: string,
    penerima: string,
    nilai: number,
    teks: string | null,
    umur = "-1 days",
  ) =>
    jalan(
      "INSERT INTO ulasan_rating (id_ulasan, id_transaksi, id_penilai, id_penerima, nilai, deskripsi_ulasan, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?))",
      uuid(),
      trx,
      penilai,
      penerima,
      nilai,
      teks,
      umur,
    );
  let nTiket = 1;
  const tiket = async (o: {
    trx?: string;
    pelapor: string;
    kategori: string;
    deskripsi: string;
    status: string;
    keputusan?: string;
    umur: string;
    riwayat: [string | null, string, string][];
    bukti?: [string, string, string][]; //  [pengunggah, label, umur]
  }) => {
    const id = uuid();
    jalan(
      `INSERT INTO tiket_sengketa (id_tiket, nomor_tiket, id_transaksi, id_pelapor, kategori_masalah, deskripsi_komplain, status_tiket, keputusan, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`,
      id,
      `KIN-${String(++nTiket).padStart(6, "0")}`,
      o.trx ?? null,
      o.pelapor,
      o.kategori,
      o.deskripsi,
      o.status,
      o.keputusan ?? null,
      o.umur,
    );
    for (const [aktor, log, umur] of o.riwayat)
      jalan(
        "INSERT INTO riwayat_sengketa (id_tiket, id_aktor, log_aktivitas, timestamp) VALUES (?, ?, ?, datetime('now', ?))",
        id,
        aktor,
        log,
        umur,
      );
    for (const [peng, label, umur] of o.bukti ?? [])
      jalan(
        "INSERT INTO bukti_sengketa (id_bukti, id_tiket, id_pengunggah, file_path, created_at) VALUES (?, ?, ?, ?, datetime('now', ?))",
        uuid(),
        id,
        peng,
        await a.sengketa(label, label.endsWith(".pdf")),
        umur,
      );
    return id;
  };
  const operasiRefund = (
    trx: string,
    tkt: string,
    cs: string,
    catatan: string,
    status: string,
  ) => {
    const t = satu<{ id: string }>(
      "SELECT id_tagihan id FROM tagihan_pembayaran WHERE id_transaksi = ? AND status_pembayaran IN ('BERHASIL','DIKEMBALIKAN')",
      trx,
    ).id;
    jalan(
      "INSERT INTO operasi_refund (id_tagihan, id_transaksi, id_tiket, id_cs, catatan, status, klaim, batas_klaim) VALUES (?, ?, ?, ?, ?, ?, NULL, 0)",
      t,
      trx,
      tkt,
      cs,
      catatan,
      status,
    );
    if (status === "BERHASIL")
      jalan(
        "INSERT INTO log_gateway (jenis, referensi_id, payload) VALUES ('REFUND', ?, ?)",
        t,
        JSON.stringify({ idTagihan: t, idempotencyKey: `refund:${tkt}` }),
      );
  };
  const pencairan = (
    tk: string,
    nominal: number,
    rekening: string,
    status: string,
    pengiriman: string,
    umur: string,
    debit = false,
  ) => {
    const id = uuid();
    jalan(
      "INSERT INTO pencairan_dana (id_pencairan, id_tenaga_kerja, nominal, rekening_tujuan, status_pencairan, waktu_pengajuan) VALUES (?, ?, ?, ?, ?, datetime('now', ?))",
      id,
      tkIds[tk].id,
      nominal,
      a.enkripsiRekening(rekening, `pencairan:${id}`),
      status,
      umur,
    );
    jalan(
      "INSERT INTO pengiriman_pencairan (id_pencairan, status) VALUES (?, ?)",
      id,
      pengiriman,
    );
    if (debit) {
      jalan(
        "INSERT INTO mutasi_saldo (kunci_operasi, id_tenaga_kerja, nominal, created_at) VALUES (?, ?, ?, datetime('now', ?))",
        `cair:${id}`,
        tkIds[tk].id,
        -nominal,
        umur,
      );
      jalan(
        "UPDATE tenaga_kerja SET saldo_pendapatan = saldo_pendapatan - ? WHERE id_tenaga_kerja = ?",
        nominal,
        tkIds[tk].id,
      );
    }
    jalan(
      "INSERT INTO log_gateway (jenis, referensi_id, payload) VALUES ('DISBURSEMENT', ?, ?)",
      id,
      JSON.stringify({ nominal, idempotencyKey: id }),
    );
    return id;
  };
  const notif = (
    user: string,
    pesan: string,
    tautan: string | null,
    baca: boolean,
    umur: string,
  ) =>
    jalan(
      "INSERT INTO notifikasi (id_notifikasi, id_penerima, pesan_notifikasi, tautan, status_baca, waktu_kirim) VALUES (?, ?, ?, ?, ?, datetime('now', ?))",
      uuid(),
      user,
      pesan,
      tautan,
      baca ? 1 : 0,
      umur,
    );

  const PK1 = pkIds.pk1.user;
  const PK2 = () => pkIds.pk2.user;
  const PK3 = () => pkIds.pk3.user;
  const TK = (k: string) => tkIds[k].user;

  // ===== Penawaran pada lowongan seed dasar (milik pk1) =====
  const pindahan = idLow("Bersih-bersih rumah pindahan");
  penawaran(pindahan, "tk1", 110_000, "MENUNGGU", {
    pesan: "Saya bisa mulai pagi dan membawa alat sendiri.",
    umur: "-5 hours",
  });
  penawaran(pindahan, "tk5", 95_000, "MENUNGGU", { umur: "-9 hours" });
  penawaran(pindahan, "tk6", 100_000, "MENUNGGU", {
    pesan: "Biasa menangani rumah pindahan, bisa berdua dengan rekan.",
    umur: "-1 days",
  });
  const karpet = idLow("Cuci karpet dan sofa ruang tamu");
  penawaran(karpet, "tk5", 120_000, "MENUNGGU", { umur: "-3 hours" });
  penawaran(karpet, "tk6", 125_000, "DITARIK", {
    pesan: "Maaf, jadwal saya bentrok.",
    umur: "-2 days",
  });
  penawaran(karpet, "tk7", 130_000, "DITOLAK", { umur: "-2 days" });
  penawaran(idLow("Bersihkan kamar mandi kos"), "tk1", 150_000, "MENUNGGU", {
    umur: "-2 hours",
  });
  penawaran(idLow("Perbaiki atap bocor"), "tk7", 170_000, "MENUNGGU", {
    pesan: "Punya tangga dan terpal sendiri.",
    umur: "-7 hours",
  });
  penawaran(idLow("Ganti MCB rumah"), "tk5", 105_000, "MENUNGGU", {
    umur: "-4 hours",
  });
  penawaran(idLow("Pasang rak dinding"), "tk1", 225_000, "DITARIK", {
    umur: "-3 days",
  });
  penawaran(idLow("Cat ulang pagar rumah"), "tk1", 210_000, "DITOLAK", {
    umur: "-3 days",
  });
  jalan(
    "INSERT INTO lowongan_tersimpan (id_pengguna, id_lowongan) VALUES (?, ?)",
    TK("tk1"),
    idLow("Perbaiki atap bocor"),
  );
  jalan(
    "INSERT INTO lowongan_tersimpan (id_pengguna, id_lowongan) VALUES (?, ?)",
    TK("tk1"),
    idLow("Pasang lampu taman"),
  );
  jalan(
    "INSERT INTO lowongan_tersimpan (id_pengguna, id_lowongan) VALUES (?, ?)",
    TK("tk1"),
    idLow("Ganti MCB rumah"),
  );
  jalan(
    "INSERT INTO lowongan_tersimpan (id_pengguna, id_lowongan) VALUES (?, ?)",
    TK("tk5"),
    idLow("Bersih-bersih rumah pindahan"),
  );
  jalan(
    "INSERT INTO lowongan_tersimpan (id_pengguna, id_lowongan) VALUES (?, ?)",
    TK("tk5"),
    idLow("Cuci piring acara keluarga"),
  );
  // undangan PK -> TK
  jalan(
    "INSERT INTO undangan_pekerjaan (id_lowongan, id_tenaga_kerja) VALUES (?, ?)",
    idLow("Ganti MCB rumah"),
    tkIds.tk6.id,
  );
  notif(
    TK("tk6"),
    'Budi Santoso mengundang Anda melamar "Ganti MCB rumah".',
    `/lowongan/${idLow("Ganti MCB rumah")}`,
    false,
    "-3 hours",
  );

  // ===== Lowongan baru pk2 dan pk3 =====
  const ac = lowongan("pk2", "Servis AC dua unit", "Perbaikan Rumah", {
    kuota: 2,
    upah: 180_000,
  });
  penawaran(ac, "tk1", 175_000, "MENUNGGU", { umur: "-3 hours" });
  penawaran(ac, "tk5", 180_000, "MENUNGGU", {
    pesan: "Punya pengalaman servis AC split.",
    umur: "-5 hours",
  });
  jalan(
    "INSERT INTO undangan_pekerjaan (id_lowongan, id_tenaga_kerja) VALUES (?, ?)",
    ac,
    tkIds.tk1.id,
  );
  notif(
    TK("tk1"),
    'Maya Kusuma mengundang Anda melamar "Servis AC dua unit".',
    `/lowongan/${ac}`,
    false,
    "-2 hours",
  );
  const cctv = lowongan("pk2", "Pasang CCTV rumah", "Kelistrikan", {
    upah: 320_000,
  });
  penawaran(cctv, "tk5", 300_000, "MENUNGGU", { umur: "-1 days" });
  lowongan("pk2", "Cuci tandon air", "Kebersihan", {
    status: "DIBATALKAN",
    upah: 130_000,
    umur: "-3 days",
  });
  penawaran(idLow("Cuci tandon air"), "tk7", 125_000, "DITOLAK_OTOMATIS", {
    umur: "-3 days",
  });
  const gen = lowongan("pk3", "Angkut kulkas ke lantai 3", "Angkut Barang", {
    upah: 200_000,
    tanggal: "2026-11-24",
  });
  penawaran(gen, "tk7", 190_000, "MENUNGGU", { umur: "-8 hours" });
  lowongan("pk3", "Les privat matematika SD", "Lainnya", {
    upah: 90_000,
    satuan: "PER_HARI",
    tanggal: "2026-11-25",
  });
  lowongan("pk3", "Pasang wallpaper kamar", "Perbaikan Rumah", {
    upah: 240_000,
    tanggal: "2026-11-26",
  });
  const tiruan = lowongan(
    "pk3",
    "Bantu acara arisan keluarga",
    "Acara & Katering",
    { upah: 140_000, tanggal: "2026-11-27", kuota: 2 },
  );
  penawaran(tiruan, "tk6", 140_000, "MENUNGGU", { umur: "-10 hours" });

  // kuota 3 terisi 1: masih OPEN, pelamar lain menunggu
  const catering = lowongan(
    "pk3",
    "Catering hajatan 50 porsi",
    "Acara & Katering",
    { kuota: 3, diterima: 1, upah: 400_000, tanggal: "2026-11-22" },
  );
  const pCat = penawaran(catering, "tk6", 400_000, "DITERIMA", {
    umur: "-2 days",
  });
  transaksi(catering, pCat, "tk6", "pk3", 400_000, "MENUNGGU_PEMBAYARAN", {
    umur: "-1 days",
  });
  penawaran(catering, "tk1", 390_000, "MENUNGGU", { umur: "-1 days" });
  penawaran(catering, "tk5", 410_000, "MENUNGGU", { umur: "-20 hours" });
  // kuota 2 terisi penuh (dua transaksi) + satu ditolak otomatis
  const kanopi = lowongan("pk2", "Bongkar pasang kanopi", "Pertukangan", {
    kuota: 2,
    diterima: 2,
    status: "CLOSED_FULL",
    upah: 300_000,
    umur: "-6 days",
  });
  for (const k of ["tk6", "tk7"]) {
    const t = transaksi(
      kanopi,
      penawaran(kanopi, k, 300_000, "DITERIMA", { umur: "-5 days" }),
      k,
      "pk2",
      300_000,
      "IN_PROGRESS",
      { umur: "-4 days" },
    );
    tagihan(t, "BERHASIL", "VA_BNI", "-3 days", "-4 days");
  }
  penawaran(kanopi, "tk1", 300_000, "DITOLAK_OTOMATIS", { umur: "-5 days" });

  // ===== Transaksi: pembayaran =====
  const t1 = kerjaan(
    "pk2",
    "tk5",
    "Pasang tirai dan rel jendela",
    "Perbaikan Rumah",
    220_000,
    "MENUNGGU_PEMBAYARAN",
    { umur: "-1 days" },
  );
  tagihan(t1, "MENUNGGU_PEMBAYARAN", null, "+1 days", "-1 hours");
  const t2 = kerjaan(
    "pk2",
    "tk6",
    "Bersihkan taman depan",
    "Kebersihan",
    160_000,
    "MENUNGGU_PEMBAYARAN",
    { umur: "-1 days" },
  );
  tagihan(t2, "DIPROSES", "VA_BCA", "+1 days", "-2 hours");
  const t3 = kerjaan(
    "pk3",
    "tk5",
    "Cuci sofa kantor",
    "Kebersihan",
    190_000,
    "MENUNGGU_PEMBAYARAN",
    { umur: "-4 days" },
  );
  tagihan(t3, "KEDALUWARSA", "QRIS", "-2 days", "-3 days");
  const t4 = kerjaan(
    "pk3",
    "tk6",
    "Angkut rak buku gudang",
    "Angkut Barang",
    210_000,
    "MENUNGGU_PEMBAYARAN",
    { umur: "-2 days" },
  );
  tagihan(t4, "GAGAL", "EWALLET", "+1 days", "-1 days");

  // ===== Transaksi: pengerjaan =====
  const t5 = kerjaan(
    "pk2",
    "tk5",
    "Cat dinding ruang tamu",
    "Perbaikan Rumah",
    350_000,
    "IN_PROGRESS",
    { umur: "-3 days" },
  );
  tagihan(t5, "BERHASIL", "VA_BCA", "-2 days", "-3 days");
  const t6 = kerjaan(
    "pk1",
    "tk5",
    "Ganti keran dapur",
    "Perbaikan Rumah",
    180_000,
    "SUBMITTED",
    { umur: "-4 days" },
  );
  tagihan(t6, "BERHASIL", "QRIS", "-3 days", "-4 days");
  await buktiKerja(
    t6,
    "Keran terpasang, tetapi masih menetes sedikit.",
    "KERAN V1",
    "-3 days",
  );
  revisi(
    t6,
    "Keran masih menetes di sambungan. Mohon dikencangkan dan dites ulang.",
    "-2 days",
  );
  await buktiKerja(
    t6,
    "Sambungan sudah dikencangkan dan dites 15 menit, tidak menetes.",
    "KERAN V2",
    "-1 days",
  );
  const t7 = kerjaan(
    "pk2",
    "tk6",
    "Rapikan etalase toko",
    "Lainnya",
    150_000,
    "IN_PROGRESS",
    { umur: "-3 days" },
  );
  tagihan(t7, "BERHASIL", "EWALLET", "-2 days", "-3 days");
  await buktiKerja(t7, "Etalase bagian kiri sudah rapi.", "ETALASE", "-2 days");
  revisi(
    t7,
    "Bagian kanan dan rak bawah belum dirapikan, mohon dilengkapi.",
    "-1 days",
  );

  // ===== Transaksi: selesai + ulasan + saldo =====
  const t8 = kerjaan(
    "pk1",
    "tk5",
    "Pasang lampu halaman belakang",
    "Kelistrikan",
    350_000,
    "COMPLETED",
    { umur: "-7 days" },
  );
  tagihan(t8, "BERHASIL", "VA_BNI", "-6 days", "-7 days");
  await buktiKerja(
    t8,
    "Tiga lampu taman terpasang dan menyala.",
    "LAMPU TAMAN",
    "-5 days",
  );
  kredit(t8, "tk5", "-4 days");
  ulasan(
    t8,
    PK1,
    TK("tk5"),
    5,
    "Rapi, cepat, dan aman. Sangat direkomendasikan.",
    "-4 days",
  );
  ulasan(
    t8,
    TK("tk5"),
    PK1,
    4,
    "Penyedia kerja ramah dan pembayaran lancar.",
    "-4 days",
  );
  const t9 = kerjaan(
    "pk2",
    "tk5",
    "Cuci karpet masjid",
    "Kebersihan",
    275_000,
    "COMPLETED",
    { umur: "-8 days" },
  );
  tagihan(t9, "BERHASIL", "QRIS", "-7 days", "-8 days");
  await buktiKerja(
    t9,
    "Karpet dicuci dan dijemur, sudah kering.",
    "KARPET",
    "-6 days",
  );
  kredit(t9, "tk5", "-5 days");
  ulasan(t9, PK2(), TK("tk5"), 5, "Karpet bersih dan wangi.", "-5 days");
  const t10 = kerjaan(
    "pk3",
    "tk6",
    "Bantu pindahan kantor kecil",
    "Angkut Barang",
    250_000,
    "COMPLETED",
    { umur: "-8 days" },
  );
  tagihan(t10, "BERHASIL", "VA_BCA", "-7 days", "-8 days");
  await buktiKerja(
    t10,
    "Semua meja dan berkas sudah dipindahkan.",
    "PINDAHAN",
    "-6 days",
  );
  kredit(t10, "tk6", "-5 days"); // belum ada ulasan: untuk menguji form ulasan
  const t11 = kerjaan(
    "pk1",
    "tk7",
    "Servis pompa air",
    "Perbaikan Rumah",
    300_000,
    "COMPLETED",
    { umur: "-9 days" },
  );
  tagihan(t11, "BERHASIL", "EWALLET", "-8 days", "-9 days");
  await buktiKerja(
    t11,
    "Pompa diservis dan diganti seal.",
    "POMPA AIR",
    "-7 days",
  );
  kredit(t11, "tk7", "-6 days");
  ulasan(
    t11,
    PK1,
    TK("tk7"),
    3,
    "Hasil cukup baik, tetapi datang terlambat satu jam.",
    "-6 days",
  );
  ulasan(t11, TK("tk7"), PK1, 5, null, "-6 days");

  // ===== Sengketa pada transaksi =====
  // refund selesai
  const t12 = kerjaan(
    "pk2",
    "tk6",
    "Perbaiki genteng bocor",
    "Perbaikan Rumah",
    260_000,
    "DIBATALKAN",
    { umur: "-9 days" },
  );
  tagihan(t12, "DIKEMBALIKAN", "VA_BCA", "-8 days", "-9 days");
  await buktiKerja(
    t12,
    "Genteng diganti, foto hasil terlampir.",
    "GENTENG",
    "-7 days",
  );
  const k12 = await tiket({
    trx: t12,
    pelapor: PK2(),
    kategori: "Hasil pekerjaan tidak sesuai",
    umur: "-6 days",
    status: "DITUTUP",
    keputusan: "REFUND",
    deskripsi: "Genteng masih bocor saat hujan dan beberapa genteng retak.",
    riwayat: [
      [PK2(), "Tiket diajukan", "-6 days"],
      [PK2(), "Bukti diunggah", "-6 days"],
      [cs1, "Tiket ditinjau CS sebelum keputusan refund", "-5 days"],
      [
        cs1,
        "Keputusan REFUND diproses: Atap tetap bocor, dana dikembalikan ke penyedia kerja.",
        "-5 days",
      ],
      [cs1, "Refund berhasil, tiket ditutup", "-5 days"],
    ],
    bukti: [[PK2(), "ATAP MASIH BOCOR", "-6 days"]],
  });
  operasiRefund(
    t12,
    k12,
    cs1,
    "Atap tetap bocor, dana dikembalikan ke penyedia kerja.",
    "BERHASIL",
  );
  // pencairan sengketa selesai
  const t13 = kerjaan(
    "pk3",
    "tk5",
    "Pasang paving halaman",
    "Pertukangan",
    400_000,
    "COMPLETED",
    { umur: "-10 days" },
  );
  tagihan(t13, "BERHASIL", "VA_BNI", "-9 days", "-10 days");
  await buktiKerja(
    t13,
    "Paving terpasang rata, 12 meter persegi.",
    "PAVING",
    "-8 days",
  );
  kredit(t13, "tk5", "-4 days");
  await tiket({
    trx: t13,
    pelapor: PK3(),
    kategori: "Pekerjaan belum selesai",
    umur: "-7 days",
    status: "DITUTUP",
    keputusan: "PENCAIRAN",
    deskripsi: "Paving di sudut halaman belum rata dan ada celah antar paving.",
    riwayat: [
      [PK3(), "Tiket diajukan", "-7 days"],
      [
        cs2,
        "CS meminta bukti tambahan: Mohon unggah foto sudut yang dimaksud.",
        "-6 days",
      ],
      [PK3(), "Bukti diunggah", "-6 days"],
      [null, "Bukti diterima, tiket kembali ditinjau", "-6 days"],
      [TK("tk5"), "Bukti diunggah", "-5 days"],
      [cs2, "Tiket ditinjau CS sebelum keputusan pencairan", "-4 days"],
      [
        cs2,
        "Keputusan PENCAIRAN, upah dikreditkan: Bukti TK menunjukkan pekerjaan sesuai kesepakatan.",
        "-4 days",
      ],
    ],
    bukti: [
      [PK3(), "SUDUT PAVING", "-6 days"],
      [TK("tk5"), "PAVING RATA", "-5 days"],
    ],
  });
  // sengketa aktif: DITINJAU
  const t14 = kerjaan(
    "pk1",
    "tk6",
    "Pasang plafon kamar",
    "Pertukangan",
    280_000,
    "DISENGKETAKAN",
    { sebelum: "SUBMITTED", umur: "-5 days" },
  );
  tagihan(t14, "BERHASIL", "QRIS", "-4 days", "-5 days");
  await buktiKerja(
    t14,
    "Plafon terpasang, finishing dempul selesai.",
    "PLAFON",
    "-3 days",
  );
  await tiket({
    trx: t14,
    pelapor: PK1,
    kategori: "Hasil pekerjaan tidak sesuai",
    umur: "-2 days",
    status: "DITINJAU",
    deskripsi:
      "Plafon bergelombang di dekat lampu dan sambungan terlihat jelas.",
    riwayat: [
      [PK1, "Tiket diajukan", "-2 days"],
      [PK1, "Bukti diunggah", "-2 days"],
      [TK("tk6"), "Bukti diunggah", "-1 days"],
    ],
    bukti: [
      [PK1, "PLAFON BERGELOMBANG", "-2 days"],
      [TK("tk6"), "PLAFON SETELAH", "-1 days"],
    ],
  });
  // sengketa: MENUNGGU_BALASAN (dilaporkan TK)
  const t15 = kerjaan(
    "pk2",
    "tk7",
    "Cat ulang kanopi",
    "Perbaikan Rumah",
    230_000,
    "DISENGKETAKAN",
    { sebelum: "IN_PROGRESS", umur: "-6 days" },
  );
  tagihan(t15, "BERHASIL", "VA_BCA", "-5 days", "-6 days");
  await tiket({
    trx: t15,
    pelapor: TK("tk7"),
    kategori: "Penyedia kerja tidak responsif",
    umur: "-3 days",
    status: "MENUNGGU_BALASAN",
    deskripsi:
      "Cat sudah disediakan di hari pertama tetapi penyedia kerja tidak membukakan akses ke kanopi.",
    riwayat: [
      [TK("tk7"), "Tiket diajukan", "-3 days"],
      [
        cs2,
        "CS meminta bukti tambahan: Mohon unggah tangkapan layar percakapan dengan penyedia kerja.",
        "-2 days",
      ],
    ],
    bukti: [[TK("tk7"), "CHAT PENYEDIA.PDF", "-3 days"]],
  });
  // sengketa: refund DIPROSES, hasil gateway belum pasti (untuk uji ulang keputusan)
  const t16 = kerjaan(
    "pk3",
    "tk7",
    "Bongkar pasang rak toko",
    "Pertukangan",
    270_000,
    "DISENGKETAKAN",
    { sebelum: "SUBMITTED", umur: "-6 days" },
  );
  tagihan(t16, "BERHASIL", "VA_BNI", "-5 days", "-6 days");
  await buktiKerja(
    t16,
    "Rak toko sudah dibongkar dan dipasang ulang.",
    "RAK TOKO",
    "-4 days",
  );
  const k16 = await tiket({
    trx: t16,
    pelapor: PK3(),
    kategori: "Pekerjaan tidak dikerjakan",
    umur: "-3 days",
    status: "DIPROSES",
    keputusan: "REFUND",
    deskripsi:
      "Rak hanya dibongkar dan tidak dipasang kembali sampai tenggat yang disepakati.",
    riwayat: [
      [PK3(), "Tiket diajukan", "-3 days"],
      [cs1, "Tiket ditinjau CS sebelum keputusan refund", "-1 days"],
      [
        cs1,
        "Keputusan REFUND diproses: Pekerjaan tidak diselesaikan sesuai kesepakatan.",
        "-1 days",
      ],
    ],
    bukti: [[PK3(), "RAK BELUM DIPASANG", "-3 days"]],
  });
  operasiRefund(
    t16,
    k16,
    cs1,
    "Pekerjaan tidak diselesaikan sesuai kesepakatan.",
    "BELUM_PASTI",
  );
  // sengketa: ditolak CS (transaksi kembali ke status sebelumnya)
  const t17 = kerjaan(
    "pk1",
    "tk5",
    "Tambal dinding retak",
    "Perbaikan Rumah",
    190_000,
    "SUBMITTED",
    { umur: "-5 days" },
  );
  tagihan(t17, "BERHASIL", "EWALLET", "-4 days", "-5 days");
  await buktiKerja(
    t17,
    "Retakan ditambal dan dicat ulang.",
    "DINDING",
    "-2 days",
  );
  await tiket({
    trx: t17,
    pelapor: PK1,
    kategori: "Hasil pekerjaan tidak sesuai",
    umur: "-4 days",
    status: "DITOLAK",
    deskripsi: "Warna cat dinding terlihat berbeda dari dinding sekitarnya.",
    riwayat: [
      [PK1, "Tiket diajukan", "-4 days"],
      [
        cs2,
        "Tiket ditolak CS: Perbedaan warna wajar karena cat lama memudar; tidak ada pelanggaran kesepakatan.",
        "-3 days",
      ],
    ],
  });
  // sengketa: dibatalkan pelapor
  const t18 = kerjaan(
    "pk2",
    "tk6",
    "Pasang stop kontak ruang makan",
    "Kelistrikan",
    170_000,
    "IN_PROGRESS",
    { umur: "-3 days" },
  );
  tagihan(t18, "BERHASIL", "VA_BNI", "-2 days", "-3 days");
  await tiket({
    trx: t18,
    pelapor: PK2(),
    kategori: "Keterlambatan",
    umur: "-2 days",
    status: "DIBATALKAN",
    deskripsi: "Pekerjaan terlambat dua hari dari jadwal yang disepakati.",
    riwayat: [
      [PK2(), "Tiket diajukan", "-2 days"],
      [PK2(), "Tiket dibatalkan oleh pelapor", "-1 days"],
    ],
  });

  // tiket tambahan pada seed dasar dan bantuan umum
  const kin1 = satu<{ id: string }>(
    "SELECT id_tiket id FROM tiket_sengketa WHERE nomor_tiket = 'KIN-000001'",
  ).id;
  jalan(
    "INSERT INTO bukti_sengketa (id_bukti, id_tiket, id_pengunggah, file_path) VALUES (?, ?, ?, ?)",
    uuid(),
    kin1,
    PK1,
    await a.sengketa("RAK MIRING"),
  );
  await tiket({
    pelapor: TK("tk5"),
    kategori: "Pertanyaan pembayaran",
    umur: "-5 hours",
    status: "DIAJUKAN",
    deskripsi:
      "Saya ingin bertanya mengapa pencairan dana saya masih berstatus diproses.",
    riwayat: [[TK("tk5"), "Tiket diajukan", "-5 hours"]],
  });
  await tiket({
    pelapor: TK("tk1"),
    kategori: "Verifikasi akun",
    umur: "-2 days",
    status: "MENUNGGU_BALASAN",
    deskripsi:
      "Dokumen identitas saya sudah diverifikasi tetapi beberapa fitur belum terbuka.",
    riwayat: [
      [TK("tk1"), "Tiket diajukan", "-2 days"],
      [
        cs1,
        "CS meminta bukti tambahan: Mohon kirim tangkapan layar halaman yang bermasalah.",
        "-1 days",
      ],
    ],
  });
  await tiket({
    pelapor: PK2(),
    kategori: "Saran fitur",
    umur: "-6 days",
    status: "DITOLAK",
    deskripsi: "Mohon tambahkan fitur pembayaran tunai di lokasi pekerjaan.",
    riwayat: [
      [PK2(), "Tiket diajukan", "-6 days"],
      [
        cs2,
        "Tiket ditolak CS: Pembayaran tunai di luar platform tidak didukung demi keamanan kedua pihak.",
        "-5 days",
      ],
    ],
  });

  // ===== Pencairan dana =====
  pencairan(
    "tk5",
    300_000,
    "BANK:1234567890",
    "BERHASIL",
    "DITERIMA",
    "-3 days",
    true,
  );
  pencairan(
    "tk5",
    150_000,
    "BANK:1234567890",
    "DIPROSES",
    "DITERIMA",
    "-6 hours",
  ); // menunggu hasil akhir gateway
  pencairan(
    "tk5",
    100_000,
    "EWALLET:081234567890",
    "GAGAL",
    "DITOLAK",
    "-2 days",
  );
  pencairan(
    "tk7",
    50_000,
    "BANK:9876543210123",
    "DITOLAK",
    "DITOLAK",
    "-1 days",
  );
  pencairan(
    "tk7",
    120_000,
    "EWALLET:085711112222",
    "DIPROSES",
    "BELUM_PASTI",
    "-3 hours",
  ); // tombol "Coba lagi"
  pencairan(
    "tk6",
    100_000,
    "BANK:1112223334",
    "MENUNGGU_PROSES",
    "SIAP",
    "-30 minutes",
  );

  // ===== Notifikasi =====
  const L = (j: string) => `/lowongan/${idLow(j)}`;
  notif(
    TK("tk1"),
    'Penawaran Anda untuk "Bantu pindahan kamar kos" diterima. Menunggu pembayaran dari pemberi kerja.',
    "/tk/pekerjaan",
    true,
    "-9 days",
  );
  notif(
    TK("tk1"),
    "Pembayaran diterima, pekerjaan siap dimulai.",
    "/tk/pekerjaan",
    true,
    "-8 days",
  );
  notif(
    TK("tk1"),
    "Upah Rp 200.000 telah dikreditkan ke dompet Anda.",
    "/tk/dompet",
    true,
    "-6 days",
  );
  notif(
    TK("tk1"),
    'Ada sengketa pada transaksi "Pasang rak buku di kamar". Tim CS sedang meninjau.',
    `/tiket/${kin1}`,
    false,
    "-2 days",
  );
  notif(
    TK("tk1"),
    'Penawaran Anda untuk "Cat ulang pagar rumah" tidak dipilih.',
    "/tk/lamaran",
    false,
    "-1 days",
  );
  notif(
    TK("tk5"),
    'Penawaran Anda untuk "Pasang lampu halaman belakang" diterima.',
    "/tk/pekerjaan",
    true,
    "-9 days",
  );
  notif(
    TK("tk5"),
    "Pembayaran upah Rp 350.000 telah dikreditkan ke dompet Anda.",
    "/tk/dompet",
    true,
    "-4 days",
  );
  notif(
    TK("tk5"),
    "Budi Santoso memberi Anda ulasan 5 bintang.",
    `/profil/${TK("tk5")}`,
    false,
    "-4 days",
  );
  notif(
    TK("tk5"),
    "Pencairan Rp 150.000 sedang diproses oleh bank.",
    "/tk/dompet",
    false,
    "-6 hours",
  );
  notif(
    TK("tk5"),
    "Pencairan Rp 100.000 gagal. Saldo tidak terpotong.",
    "/tk/dompet",
    false,
    "-2 days",
  );
  notif(
    TK("tk6"),
    "Permintaan revisi dari penyedia kerja: Bagian kanan dan rak bawah belum dirapikan, mohon dilengkapi.",
    "/tk/pekerjaan",
    false,
    "-1 days",
  );
  notif(
    TK("tk7"),
    "CS meminta bukti tambahan untuk tiket Anda.",
    "/tiket",
    false,
    "-2 days",
  );
  notif(
    TK("tk7"),
    "Pencairan Rp 50.000 ditolak: rekening tidak valid.",
    "/tk/dompet",
    false,
    "-1 days",
  );
  notif(
    PK1,
    'Siti Aminah mengajukan penawaran untuk "Bersih-bersih rumah pindahan".',
    `/pk/lowongan/${pindahan}/pelamar`,
    false,
    "-5 hours",
  );
  notif(
    PK1,
    'Dedi Kurniawan mengajukan penawaran untuk "Bersih-bersih rumah pindahan".',
    `/pk/lowongan/${pindahan}/pelamar`,
    false,
    "-9 hours",
  );
  notif(
    PK1,
    'Hasil pekerjaan "Ganti keran dapur" telah dikirim. Silakan periksa.',
    `/pk/transaksi/${t6}`,
    false,
    "-1 days",
  );
  notif(
    PK1,
    'Tiket sengketa untuk "Tambal dinding retak" ditolak CS.',
    "/bantuan",
    true,
    "-3 days",
  );
  notif(
    PK2(),
    'Pembayaran untuk "Cat dinding ruang tamu" berhasil.',
    `/pk/transaksi/${t5}`,
    true,
    "-3 days",
  );
  notif(
    PK2(),
    "Refund sebesar Rp 273.000 berhasil. Sengketa ditutup.",
    "/bantuan",
    true,
    "-5 days",
  );
  notif(
    PK2(),
    `Dua tenaga kerja mengajukan penawaran untuk "Servis AC dua unit".`,
    `/pk/lowongan/${ac}/pelamar`,
    false,
    "-3 hours",
  );
  notif(
    PK3(),
    'Hasil pekerjaan "Bantu pindahan kantor kecil" telah selesai. Beri ulasan Anda.',
    "/pk/transaksi",
    false,
    "-5 days",
  );
  notif(
    PK3(),
    "Keputusan refund untuk tiket Anda sedang diproses.",
    "/bantuan",
    false,
    "-1 days",
  );
  notif(
    cs1,
    "Pengajuan verifikasi baru dari Nanda Putri.",
    "/cs/verifikasi",
    false,
    "-5 hours",
  );
  notif(
    cs1,
    "Tiket baru dari Dedi Kurniawan menunggu peninjauan.",
    "/cs/tiket",
    false,
    "-5 hours",
  );
  notif(
    cs2,
    "Tiket KIN-000001 belum ditinjau lebih dari 1 hari.",
    "/cs/tiket",
    true,
    "-1 days",
  );
  void L;

  // ===== Reset sandi: token deterministik untuk menguji halaman /reset-sandi =====
  const token = (nama: string) =>
    createHash("sha256").update(`demo-reset-${nama}`).digest("base64url");
  const rs = (nama: string, user: string, expires: string, dipakai: number) =>
    jalan(
      "INSERT INTO reset_sandi (token_hash, id_pengguna, expires_at, dipakai) VALUES (?, ?, datetime('now', ?), ?)",
      sha256(token(nama)),
      user,
      expires,
      dipakai,
    );
  rs("valid", TK("tk2"), "+7 days", 0);
  rs("kedaluwarsa", TK("tk3"), "-1 hours", 0);
  rs("terpakai", TK("tk1"), "+7 days", 1);
  RESET.push(
    ["valid (tk2)", token("valid")],
    ["kedaluwarsa (tk3)", token("kedaluwarsa")],
    ["sudah dipakai (tk1)", token("terpakai")],
  );

  // ===== Rating dihitung dari ulasan (sama dengan model) =====
  jalan(
    `UPDATE pengguna SET akumulasi_rating = COALESCE((SELECT AVG(nilai) FROM ulasan_rating WHERE id_penerima = pengguna.id_pengguna), 0),
       jumlah_ulasan = (SELECT COUNT(*) FROM ulasan_rating WHERE id_penerima = pengguna.id_pengguna)`,
  );
}
const RESET: [string, string][] = [];

function ringkas() {
  const n = (t: string) =>
    (db.prepare(`SELECT COUNT(*) c FROM ${t}`).get() as { c: number }).c;
  console.log("\nSeed demo selesai. Kata sandi semua akun: " + PASSWORD_UJI);
  console.table(
    db
      .prepare(
        `SELECT p.email, p.nama, p.peran, COALESCE(t.status_verifikasi, '') verifikasi, COALESCE(t.saldo_pendapatan, '') saldo, p.akumulasi_rating rating, p.jumlah_ulasan ulasan
       FROM pengguna p LEFT JOIN tenaga_kerja t USING (id_pengguna) ORDER BY p.peran DESC, p.email`,
      )
      .all(),
  );
  console.log(
    [
      "pengguna",
      "lowongan_pekerjaan",
      "pengajuan_penawaran",
      "transaksi_pekerjaan",
      "tagihan_pembayaran",
      "bukti_penyerahan",
      "tiket_sengketa",
      "bukti_sengketa",
      "ulasan_rating",
      "pencairan_dana",
      "notifikasi",
      "lowongan_tersimpan",
      "undangan_pekerjaan",
    ]
      .map((t) => `${t}: ${n(t)}`)
      .join("\n"),
  );
  console.log(
    "\nTautan reset sandi (http://localhost:3000/reset-sandi?token=...):",
  );
  for (const [nama, t] of RESET) console.log(`  ${nama}: ${t}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
