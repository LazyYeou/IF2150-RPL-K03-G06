import { hash } from "@node-rs/argon2";
import type Database from "better-sqlite3";
import { randomUUID } from "node:crypto";

// Data fiktif untuk pengembangan (rancangan §11.6). Semua akun berpassword PASSWORD_UJI.
export const PASSWORD_UJI = "Password123!";

const KATEGORI: Record<string, string[]> = {
  Kebersihan: [
    "Bersih-bersih rumah pindahan",
    "Cuci karpet dan sofa ruang tamu",
    "Bersihkan kamar mandi kos",
  ],
  "Perbaikan Rumah": [
    "Perbaiki atap bocor",
    "Cat ulang pagar rumah",
    "Pasang rak dinding",
  ],
  "Angkut Barang": [
    "Angkut lemari ke kos baru",
    "Pindahan barang satu truk",
    "Angkut galon dan gas bulanan",
  ],
  "Acara & Katering": [
    "Bantu pasang tenda hajatan",
    "Pelayan acara syukuran",
    "Cuci piring acara keluarga",
  ],
  Pertukangan: [
    "Buat meja kerja kayu",
    "Pasang keramik teras",
    "Perbaiki pintu lemari",
  ],
  Kelistrikan: [
    "Pasang lampu taman",
    "Ganti MCB rumah",
    "Tarik kabel stop kontak baru",
  ],
  Lainnya: [
    "Jaga toko setengah hari",
    "Antar paket dalam kota",
    "Bantu menata gudang kecil",
  ],
};

type Params = Record<string, string | number | null>;

export async function seed(db: Database.Database): Promise<void> {
  const passwordHash = await hash(PASSWORD_UJI); // Argon2id
  const uuid = () => randomUUID();

  db.transaction(() => {
    const insert = (sql: string, p: Params) => db.prepare(sql).run(p);

    // ===== Akun =====
    const akun = (kunci: string, nama: string, peran: "TK" | "PK" | "CS") => {
      const id = uuid();
      insert(
        `INSERT INTO pengguna (id_pengguna, nama, email, password_hash, peran, tanggal_lahir, persetujuan_privasi_at)
         VALUES (@id, @nama, @email, @hash, @peran, '1995-05-17', datetime('now'))`,
        { id, nama, email: `${kunci}@kerjain.test`, hash: passwordHash, peran },
      );
      return id;
    };
    const tk = (kunci: string, nama: string, status: string, saldo = 0) => {
      const idPengguna = akun(kunci, nama, "TK");
      const id = uuid();
      insert(
        `INSERT INTO tenaga_kerja (id_tenaga_kerja, id_pengguna, status_verifikasi, saldo_pendapatan, waktu_pengajuan_verifikasi)
         VALUES (@id, @idPengguna, @status, @saldo, CASE WHEN @status = 'MENUNGGU_VERIFIKASI' THEN datetime('now') END)`,
        { id, idPengguna, status, saldo },
      );
      return { id, idPengguna };
    };

    const tk1 = tk("tk1", "Siti Aminah", "TERVERIFIKASI", 500_000);
    tk("tk2", "Andi Pratama", "BELUM_TERVERIFIKASI");
    tk("tk3", "Joko Widodo", "MENUNGGU_VERIFIKASI"); // dokumen_identitas_path sengaja kosong: tidak ada berkas seed

    const pkPengguna = akun("pk1", "Budi Santoso", "PK");
    const pk = uuid();
    insert(
      `INSERT INTO penyedia_kerja (id_penyedia_kerja, id_pengguna) VALUES (@pk, @pkPengguna)`,
      { pk, pkPengguna },
    );

    const csPengguna = akun("cs1", "Dewi Lestari", "CS");
    insert(
      `INSERT INTO customer_service (id_cs, id_pengguna, hak_akses) VALUES (@id, @csPengguna, 'ADMIN')`,
      {
        id: uuid(),
        csPengguna,
      },
    );

    // saldo awal tk1 dicatat di ledger agar konsisten dengan saldo_pendapatan (sisanya dari transaksi COMPLETED)
    const saldoAwal = 300_000;
    insert(
      `INSERT INTO mutasi_saldo (kunci_operasi, id_tenaga_kerja, nominal) VALUES (@k, @tk, @n)`,
      {
        k: `seed:${tk1.id}`,
        tk: tk1.id,
        n: saldoAwal,
      },
    );

    // ===== Lowongan =====
    const lowongan = (
      judul: string,
      kategori: string,
      i: number,
      o: {
        kuota?: number;
        diterima?: number;
        status?: string;
        upah?: number;
      } = {},
    ) => {
      const id = uuid();
      insert(
        `INSERT INTO lowongan_pekerjaan (id_lowongan, id_penyedia_kerja, judul, deskripsi, ruang_lingkup, kriteria_hasil, kategori,
           lokasi, tanggal_pekerjaan, estimasi_durasi, upah, satuan_upah, kuota, jumlah_diterima, pernyataan_risiko, status_lowongan, created_at)
         VALUES (@id, @pk, @judul, @deskripsi, @lingkup, @kriteria, @kategori, @lokasi, @tanggal, @durasi, @upah, @satuan,
           @kuota, @diterima, @risiko, @status, datetime('now', @umur))`,
        {
          id,
          pk,
          judul,
          deskripsi: `${judul}. Pekerjaan harian, bahan disediakan penyedia kerja, bisa dikerjakan sendiri atau berdua.`,
          lingkup: "Sesuai deskripsi pekerjaan di lokasi.",
          kriteria:
            "Pekerjaan rapi, selesai tepat waktu, dan sesuai kesepakatan.",
          kategori,
          lokasi: [
            "Coblong, Bandung",
            "Dago, Bandung",
            "Cicendo, Bandung",
            "Lengkong, Bandung",
          ][i % 4],
          tanggal: new Date(Date.UTC(2026, 10, 12 + (i % 10)))
            .toISOString()
            .slice(0, 10),
          durasi: `${2 + (i % 5)} jam`,
          upah: o.upah ?? 100_000 + (i % 8) * 25_000,
          satuan: i % 2 ? "PER_HARI" : "PER_TUGAS",
          kuota: o.kuota ?? 1 + (i % 3),
          diterima: o.diterima ?? 0,
          risiko: kategori === "Kelistrikan" ? 1 : 0,
          status: o.status ?? "OPEN",
          umur: `-${i} hours`,
        },
      );
      return id;
    };

    // 25 lowongan OPEN multi-kategori (kuota belum terisi)
    const semua = Object.entries(KATEGORI).flatMap(([k, judul]) =>
      judul.map((j) => [j, k] as const),
    );
    for (let i = 0; i < 25; i++)
      lowongan(
        semua[i % semua.length][0] + (i >= semua.length ? ` #${i}` : ""),
        semua[i % semua.length][1],
        i,
      );

    // ===== Transaksi di tiap status (semua dikerjakan tk1, dibayar pk1) =====
    const fee = (upah: number) =>
      Math.round(upah * Number(process.env.COMMISSION_RATE ?? 0.05));
    const transaksi = (
      judul: string,
      status: string,
      o: {
        upah?: number;
        tagihan?: boolean;
        bukti?: boolean;
        sebelum?: string;
      } = {},
    ) => {
      const upah = o.upah ?? 200_000;
      const idLowongan = lowongan(judul, "Kebersihan", 30, {
        kuota: 1,
        diterima: 1,
        status: "CLOSED_FULL",
        upah,
      });
      const idPenawaran = uuid();
      insert(
        `INSERT INTO pengajuan_penawaran (id_penawaran, id_lowongan, id_tenaga_kerja, harga_penawaran, ketersediaan, status_penawaran)
         VALUES (@idPenawaran, @idLowongan, @tk, @upah, 'Kapan saja', 'DITERIMA')`,
        { idPenawaran, idLowongan, tk: tk1.id, upah },
      );
      const idTransaksi = uuid();
      insert(
        `INSERT INTO transaksi_pekerjaan (id_transaksi, id_lowongan, id_penawaran, id_tenaga_kerja, id_penyedia_kerja, nominal_upah, status_pekerjaan, status_sebelum_sengketa)
         VALUES (@idTransaksi, @idLowongan, @idPenawaran, @tk, @pk, @upah, @status, @sebelum)`,
        {
          idTransaksi,
          idLowongan,
          idPenawaran,
          tk: tk1.id,
          pk,
          upah,
          status,
          sebelum: o.sebelum ?? null,
        },
      );
      if (o.tagihan) {
        insert(
          `INSERT INTO tagihan_pembayaran (id_tagihan, id_transaksi, nominal_upah, commission_fee, total_bayar, metode, expiry_timestamp, status_pembayaran)
           VALUES (@id, @idTransaksi, @upah, @fee, @total, 'QRIS', datetime('now', '+1 day'), 'BERHASIL')`,
          {
            id: uuid(),
            idTransaksi,
            upah,
            fee: fee(upah),
            total: upah + fee(upah),
          },
        );
      }
      if (o.bukti) {
        insert(
          `INSERT INTO bukti_penyerahan (id_penyerahan, id_transaksi, deskripsi_pengerjaan, file_path, ukuran_file)
           VALUES (@id, @idTransaksi, 'Pekerjaan selesai, foto hasil terlampir.', @path, 1024)`,
          { id: uuid(), idTransaksi, path: `bukti/seed-${idTransaksi}.png` }, // berkas fisik tidak dibuat oleh seed
        );
      }
      return idTransaksi;
    };

    transaksi("Cuci mobil dan motor keluarga", "MENUNGGU_PEMBAYARAN");
    transaksi("Rapikan taman belakang rumah", "IN_PROGRESS", { tagihan: true });
    transaksi("Bersihkan gudang toko kelontong", "SUBMITTED", {
      tagihan: true,
      bukti: true,
    });
    const selesai = transaksi("Bantu pindahan kamar kos", "COMPLETED", {
      tagihan: true,
      bukti: true,
      upah: 500_000 - saldoAwal,
    });
    insert(
      `INSERT INTO mutasi_saldo (kunci_operasi, id_tenaga_kerja, nominal) VALUES (@k, @tk, @n)`,
      {
        k: `upah:${selesai}`,
        tk: tk1.id,
        n: 500_000 - saldoAwal,
      },
    );

    // 1 tiket sengketa aktif pada transaksi DISENGKETAKAN
    const sengketa = transaksi("Pasang rak buku di kamar", "DISENGKETAKAN", {
      tagihan: true,
      bukti: true,
      sebelum: "SUBMITTED",
    });
    const idTiket = uuid();
    insert(
      `INSERT INTO tiket_sengketa (id_tiket, nomor_tiket, id_transaksi, id_pelapor, kategori_masalah, deskripsi_komplain, status_tiket)
       VALUES (@idTiket, 'KIN-000001', @sengketa, @pelapor, 'Hasil pekerjaan tidak sesuai', 'Rak terpasang miring dan tidak sesuai ukuran yang disepakati sebelumnya.', 'DIAJUKAN')`,
      { idTiket, sengketa, pelapor: pkPengguna },
    );
    insert(
      `INSERT INTO riwayat_sengketa (id_tiket, id_aktor, log_aktivitas) VALUES (@idTiket, @pelapor, 'Tiket diajukan')`,
      {
        idTiket,
        pelapor: pkPengguna,
      },
    );
  }).immediate();
}
