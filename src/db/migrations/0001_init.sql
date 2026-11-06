-- ===== Akun & sesi (C01–C04) =====
CREATE TABLE pengguna (
  id_pengguna            TEXT PRIMARY KEY,
  nama                   TEXT NOT NULL CHECK (length(trim(nama)) BETWEEN 1 AND 80),
  email                  TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash          TEXT NOT NULL,                         -- Argon2id (KNF01)
  peran                  TEXT NOT NULL CHECK (peran IN ('TK','PK','CS')),
  tanggal_lahir          TEXT NOT NULL,                         -- YYYY-MM-DD, divalidasi ≥17 thn di controller
  persetujuan_privasi_at TEXT NOT NULL,                         -- bukti persetujuan (KF01, UU PDP)
  akumulasi_rating       REAL NOT NULL DEFAULT 0,
  jumlah_ulasan          INTEGER NOT NULL DEFAULT 0,
  area_layanan           TEXT,
  bio                    TEXT CHECK (bio IS NULL OR length(bio) <= 1000),
  created_at             TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

CREATE TABLE sesi (
  id_sesi     TEXT PRIMARY KEY,          -- SHA-256 (hex) dari token di cookie; token mentah tidak pernah disimpan
  id_pengguna TEXT NOT NULL REFERENCES pengguna(id_pengguna) ON DELETE CASCADE,
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;
CREATE INDEX idx_sesi_pengguna ON sesi(id_pengguna);

CREATE TABLE reset_sandi (
  token_hash  TEXT PRIMARY KEY,
  id_pengguna TEXT NOT NULL REFERENCES pengguna(id_pengguna) ON DELETE CASCADE,
  expires_at  TEXT NOT NULL,
  dipakai     INTEGER NOT NULL DEFAULT 0 CHECK (dipakai IN (0,1))
) STRICT;

CREATE TABLE tenaga_kerja (
  id_tenaga_kerja            TEXT PRIMARY KEY,
  id_pengguna                TEXT NOT NULL UNIQUE REFERENCES pengguna(id_pengguna) ON DELETE CASCADE,
  status_verifikasi          TEXT NOT NULL DEFAULT 'BELUM_TERVERIFIKASI'
    CHECK (status_verifikasi IN ('BELUM_TERVERIFIKASI','MENUNGGU_VERIFIKASI','TERVERIFIKASI','DITOLAK')),
  dokumen_identitas_path     TEXT,
  waktu_pengajuan_verifikasi TEXT,
  alasan_penolakan           TEXT,
  saldo_pendapatan           INTEGER NOT NULL DEFAULT 0 CHECK (saldo_pendapatan >= 0),
  rekening_tujuan            TEXT
) STRICT;

CREATE TABLE penyedia_kerja (
  id_penyedia_kerja TEXT PRIMARY KEY,
  id_pengguna       TEXT NOT NULL UNIQUE REFERENCES pengguna(id_pengguna) ON DELETE CASCADE
) STRICT;

CREATE TABLE customer_service (
  id_cs       TEXT PRIMARY KEY,
  id_pengguna TEXT NOT NULL UNIQUE REFERENCES pengguna(id_pengguna) ON DELETE CASCADE,
  hak_akses   TEXT NOT NULL DEFAULT 'CS' CHECK (hak_akses IN ('CS','ADMIN'))
) STRICT;

-- ===== Lowongan & Penawaran (C05, C06) =====
CREATE TABLE lowongan_pekerjaan (
  id_lowongan        TEXT PRIMARY KEY,
  id_penyedia_kerja  TEXT NOT NULL REFERENCES penyedia_kerja(id_penyedia_kerja),
  judul              TEXT NOT NULL CHECK (length(judul) BETWEEN 8 AND 150),
  deskripsi          TEXT NOT NULL CHECK (length(deskripsi) BETWEEN 20 AND 2000),
  ruang_lingkup      TEXT NOT NULL,
  kriteria_hasil     TEXT NOT NULL,
  kategori           TEXT NOT NULL,
  lokasi             TEXT NOT NULL,              -- kecamatan & kota, bukan alamat lengkap
  tanggal_pekerjaan  TEXT NOT NULL,
  estimasi_durasi    TEXT NOT NULL,
  upah               INTEGER NOT NULL CHECK (upah BETWEEN 1000 AND 100000000),
  satuan_upah        TEXT NOT NULL CHECK (satuan_upah IN ('PER_TUGAS','PER_HARI')),
  kuota              INTEGER NOT NULL CHECK (kuota BETWEEN 1 AND 50),
  jumlah_diterima    INTEGER NOT NULL DEFAULT 0,
  pernyataan_risiko  INTEGER NOT NULL DEFAULT 0 CHECK (pernyataan_risiko IN (0,1)),
  status_lowongan    TEXT NOT NULL DEFAULT 'OPEN' CHECK (status_lowongan IN ('OPEN','CLOSED_FULL','DIBATALKAN')),
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (jumlah_diterima BETWEEN 0 AND kuota)          -- KNF07 lapis terakhir
) STRICT;
CREATE INDEX idx_lowongan_open ON lowongan_pekerjaan (status_lowongan, kategori, created_at DESC);
CREATE INDEX idx_lowongan_pk   ON lowongan_pekerjaan (id_penyedia_kerja);

CREATE TABLE pengajuan_penawaran (
  id_penawaran     TEXT PRIMARY KEY,
  id_lowongan      TEXT NOT NULL REFERENCES lowongan_pekerjaan(id_lowongan),
  id_tenaga_kerja  TEXT NOT NULL REFERENCES tenaga_kerja(id_tenaga_kerja),
  harga_penawaran  INTEGER NOT NULL CHECK (harga_penawaran BETWEEN 1000 AND 100000000),
  ketersediaan     TEXT NOT NULL CHECK (length(ketersediaan) <= 120),
  pesan_penawaran  TEXT CHECK (pesan_penawaran IS NULL OR length(pesan_penawaran) <= 1000),
  status_penawaran TEXT NOT NULL DEFAULT 'MENUNGGU'
    CHECK (status_penawaran IN ('MENUNGGU','DITERIMA','DITOLAK','DITARIK','DITOLAK_OTOMATIS')),
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;
-- satu penawaran aktif per TK per lowongan (boleh mengajukan ulang setelah ditarik)
CREATE UNIQUE INDEX uq_penawaran_aktif ON pengajuan_penawaran (id_lowongan, id_tenaga_kerja)
  WHERE status_penawaran IN ('MENUNGGU','DITERIMA');
CREATE INDEX idx_penawaran_tk ON pengajuan_penawaran (id_tenaga_kerja);

-- ===== Transaksi pekerjaan & bukti (C07, C08) =====
CREATE TABLE transaksi_pekerjaan (
  id_transaksi            TEXT PRIMARY KEY,
  id_lowongan             TEXT NOT NULL REFERENCES lowongan_pekerjaan(id_lowongan),
  id_penawaran            TEXT NOT NULL UNIQUE REFERENCES pengajuan_penawaran(id_penawaran),
  id_tenaga_kerja         TEXT NOT NULL REFERENCES tenaga_kerja(id_tenaga_kerja),
  id_penyedia_kerja       TEXT NOT NULL REFERENCES penyedia_kerja(id_penyedia_kerja),
  nominal_upah            INTEGER NOT NULL CHECK (nominal_upah > 0),
  status_pekerjaan        TEXT NOT NULL DEFAULT 'MENUNGGU_PEMBAYARAN'
    CHECK (status_pekerjaan IN ('MENUNGGU_PEMBAYARAN','IN_PROGRESS','SUBMITTED','COMPLETED','DISENGKETAKAN','DIBATALKAN')),
  status_sebelum_sengketa TEXT,
  created_at              TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (id_lowongan, id_tenaga_kerja)
) STRICT;

CREATE TABLE bukti_penyerahan (
  id_penyerahan        TEXT PRIMARY KEY,
  id_transaksi         TEXT NOT NULL REFERENCES transaksi_pekerjaan(id_transaksi),
  deskripsi_pengerjaan TEXT NOT NULL,
  file_path            TEXT NOT NULL,
  ukuran_file          INTEGER NOT NULL CHECK (ukuran_file BETWEEN 1 AND 10485760),
  timestamp_pengiriman TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

CREATE TABLE catatan_revisi (
  id_revisi        TEXT PRIMARY KEY,
  id_transaksi     TEXT NOT NULL REFERENCES transaksi_pekerjaan(id_transaksi),
  catatan          TEXT NOT NULL CHECK (length(catatan) BETWEEN 10 AND 1000),
  waktu_permintaan TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

-- ===== Pembayaran (C09, C10, C15) =====
CREATE TABLE tagihan_pembayaran (
  id_tagihan        TEXT PRIMARY KEY,
  id_transaksi      TEXT NOT NULL REFERENCES transaksi_pekerjaan(id_transaksi),
  nominal_upah      INTEGER NOT NULL,
  commission_fee    INTEGER NOT NULL CHECK (commission_fee >= 0),
  total_bayar       INTEGER NOT NULL,
  metode            TEXT,
  expiry_timestamp  TEXT NOT NULL,
  status_pembayaran TEXT NOT NULL DEFAULT 'MENUNGGU_PEMBAYARAN'
    CHECK (status_pembayaran IN ('MENUNGGU_PEMBAYARAN','DIPROSES','BERHASIL','GAGAL','KEDALUWARSA','DIKEMBALIKAN')),
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (total_bayar = nominal_upah + commission_fee)
) STRICT;
-- KNF11: maks satu tagihan aktif/lunas per transaksi
CREATE UNIQUE INDEX uq_tagihan_aktif ON tagihan_pembayaran (id_transaksi)
  WHERE status_pembayaran IN ('MENUNGGU_PEMBAYARAN','DIPROSES','BERHASIL');

CREATE TABLE pencairan_dana (
  id_pencairan     TEXT PRIMARY KEY,
  id_tenaga_kerja  TEXT NOT NULL REFERENCES tenaga_kerja(id_tenaga_kerja),
  nominal          INTEGER NOT NULL CHECK (nominal >= 10000),
  rekening_tujuan  TEXT NOT NULL,          -- "BCA:1234567890" / "GOPAY:08xxxx"
  status_pencairan TEXT NOT NULL DEFAULT 'MENUNGGU_PROSES'
    CHECK (status_pencairan IN ('MENUNGGU_PROSES','DIPROSES','BERHASIL','GAGAL','DITOLAK')),
  waktu_pengajuan  TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;
CREATE INDEX idx_pencairan_tk ON pencairan_dana (id_tenaga_kerja, status_pencairan);

CREATE TABLE mutasi_saldo (                -- buku besar idempoten (KNF16, KNF20)
  kunci_operasi   TEXT PRIMARY KEY,        -- 'upah:<idTransaksi>' | 'cair:<idPencairan>'
  id_tenaga_kerja TEXT NOT NULL REFERENCES tenaga_kerja(id_tenaga_kerja),
  nominal         INTEGER NOT NULL,        -- + kredit, − debit
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

CREATE TABLE log_gateway (                  -- C15 PaymentGateway (log komunikasi)
  id_log       INTEGER PRIMARY KEY AUTOINCREMENT,
  jenis        TEXT NOT NULL CHECK (jenis IN ('CHARGE','DISBURSEMENT','REFUND','CALLBACK')),
  referensi_id TEXT NOT NULL,              -- id_tagihan / id_pencairan / id_tiket
  provider     TEXT NOT NULL DEFAULT 'MOCK',
  payload      TEXT NOT NULL CHECK (json_valid(payload)),
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

-- ===== Ulasan (C11) =====
CREATE TABLE ulasan_rating (
  id_ulasan        TEXT PRIMARY KEY,
  id_transaksi     TEXT NOT NULL REFERENCES transaksi_pekerjaan(id_transaksi),
  id_penilai       TEXT NOT NULL REFERENCES pengguna(id_pengguna),
  id_penerima      TEXT NOT NULL REFERENCES pengguna(id_pengguna),
  nilai            INTEGER NOT NULL CHECK (nilai BETWEEN 1 AND 5),
  deskripsi_ulasan TEXT CHECK (deskripsi_ulasan IS NULL OR length(deskripsi_ulasan) <= 1000),
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (id_transaksi, id_penilai)          -- KF22
) STRICT;
CREATE INDEX idx_ulasan_penerima ON ulasan_rating (id_penerima);

-- ===== Sengketa (C12, C13) =====
CREATE TABLE tiket_sengketa (
  id_tiket           TEXT PRIMARY KEY,
  nomor_tiket        TEXT NOT NULL UNIQUE,                 -- KIN-xxxxxx
  id_transaksi       TEXT REFERENCES transaksi_pekerjaan(id_transaksi),  -- NULL = bantuan umum (I-23)
  id_pelapor         TEXT NOT NULL REFERENCES pengguna(id_pengguna),
  kategori_masalah   TEXT NOT NULL,
  deskripsi_komplain TEXT NOT NULL CHECK (length(deskripsi_komplain) BETWEEN 20 AND 1000),
  status_tiket       TEXT NOT NULL DEFAULT 'DIAJUKAN'
    CHECK (status_tiket IN ('DIAJUKAN','DITINJAU','MENUNGGU_BALASAN','DIPROSES','DITUTUP','DITOLAK','DIBATALKAN')),
  keputusan          TEXT CHECK (keputusan IS NULL OR keputusan IN ('REFUND','PENCAIRAN')),
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;
CREATE UNIQUE INDEX uq_tiket_aktif ON tiket_sengketa (id_transaksi)
  WHERE id_transaksi IS NOT NULL AND status_tiket NOT IN ('DITUTUP','DITOLAK','DIBATALKAN');

CREATE TABLE bukti_sengketa (
  id_bukti      TEXT PRIMARY KEY,
  id_tiket      TEXT NOT NULL REFERENCES tiket_sengketa(id_tiket),
  id_pengunggah TEXT NOT NULL REFERENCES pengguna(id_pengguna),
  file_path     TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

CREATE TABLE riwayat_sengketa (
  id_riwayat    INTEGER PRIMARY KEY AUTOINCREMENT,
  id_tiket      TEXT NOT NULL REFERENCES tiket_sengketa(id_tiket),
  id_aktor      TEXT REFERENCES pengguna(id_pengguna),
  log_aktivitas TEXT NOT NULL,
  timestamp     TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

-- ===== Notifikasi (C14) =====
CREATE TABLE notifikasi (
  id_notifikasi    TEXT PRIMARY KEY,
  id_penerima      TEXT NOT NULL REFERENCES pengguna(id_pengguna),  -- selalu id_pengguna (bukan id profil)
  pesan_notifikasi TEXT NOT NULL,
  tautan           TEXT,
  status_baca      INTEGER NOT NULL DEFAULT 0 CHECK (status_baca IN (0,1)),
  waktu_kirim      TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;
CREATE INDEX idx_notif_penerima ON notifikasi (id_penerima, status_baca, waktu_kirim DESC);

-- ===== Could-have =====
CREATE TABLE lowongan_tersimpan (
  id_pengguna TEXT NOT NULL REFERENCES pengguna(id_pengguna),
  id_lowongan TEXT NOT NULL REFERENCES lowongan_pekerjaan(id_lowongan),
  PRIMARY KEY (id_pengguna, id_lowongan)
) STRICT;
