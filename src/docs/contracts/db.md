# Kontrak Database — Kerja-In

| Atribut | Nilai |
|---|---|
| Versi | 1.0 (5 Nov 2026) |
| Pemilik | Davin (skema & migrasi) · tiap pemilik domain mereview tabelnya (#4) |
| DBMS | SQLite 3 (`better-sqlite3`), satu file `src/data/kerjain.db`, mode WAL |
| Sumber kebenaran | `src/db/migrations/*.sql` setelah #4 di-merge; sebelum itu rancangan §11.2–11.3 |

Dokumen ini adalah **janji antar anggota** tentang bentuk data. Mengubahnya = migrasi baru + pengumuman di grup + update dokumen ini di PR yang sama.

## 1. Konvensi

| Hal | Aturan |
|---|---|
| Tabel | Semua `STRICT`; nama `snake_case` tunggal (mis. `lowongan_pekerjaan`) |
| Kolom | `snake_case`; dipetakan ke `camelCase` hanya di layer Model |
| ID | `TEXT` UUID dari `crypto.randomUUID()` di aplikasi. Tabel log: `INTEGER PRIMARY KEY AUTOINCREMENT` |
| Waktu | `TEXT` UTC `YYYY-MM-DD HH:MM:SS` dari `datetime('now')`. Konversi ke WIB hanya di UI |
| Tanggal saja | `TEXT` `YYYY-MM-DD` |
| Boolean | `INTEGER` 0/1 + `CHECK` |
| Uang | `INTEGER` rupiah, tanpa desimal |
| Enum | `TEXT` + `CHECK (... IN (...))`, kode huruf besar (§4) |
| JSON | `TEXT` + `CHECK (json_valid(...))` |
| Foreign key | Aktif lewat `PRAGMA foreign_keys = ON` di setiap koneksi |
| Berkas | Hanya *path* relatif di DB; isi berkas di `storage/` (lihat [modules.md §4](modules.md#4-penyimpanan-berkas)) |

## 2. Tabel

Kolom bertanda **wajib** = `NOT NULL`. `→` = foreign key.

### 2.1 Akun & sesi

**`pengguna`** (C01)
| Kolom | Tipe | Aturan |
|---|---|---|
| `id_pengguna` | TEXT PK | UUID |
| `nama` | TEXT wajib | 1–80 karakter (setelah trim) |
| `email` | TEXT wajib | UNIQUE, `COLLATE NOCASE` |
| `password_hash` | TEXT wajib | Argon2id |
| `peran` | TEXT wajib | `TK` · `PK` · `CS` |
| `tanggal_lahir` | TEXT wajib | `YYYY-MM-DD`; usia ≥ 17 dicek di controller |
| `persetujuan_privasi_at` | TEXT wajib | waktu persetujuan privasi |
| `akumulasi_rating` | REAL wajib | default 0 |
| `jumlah_ulasan` | INTEGER wajib | default 0 |
| `area_layanan` | TEXT | ≤ 150 (divalidasi Zod) |
| `bio` | TEXT | ≤ 1000 |
| `created_at` | TEXT wajib | default now |

**`sesi`** — `id_sesi` TEXT PK (**SHA-256 hex** token cookie; token mentah tidak pernah disimpan) · `id_pengguna` → pengguna (CASCADE) · `expires_at` wajib (7 hari, diperpanjang bila aktif) · `created_at`. Index `idx_sesi_pengguna`.

**`reset_sandi`** — `token_hash` TEXT PK · `id_pengguna` → pengguna (CASCADE) · `expires_at` wajib (30 menit) · `dipakai` 0/1.

**`tenaga_kerja`** (C02)
| Kolom | Tipe | Aturan |
|---|---|---|
| `id_tenaga_kerja` | TEXT PK | |
| `id_pengguna` | TEXT wajib UNIQUE | → pengguna (CASCADE) |
| `status_verifikasi` | TEXT wajib | enum verifikasi (§4), default `BELUM_TERVERIFIKASI` |
| `dokumen_identitas_path` | TEXT | berkas terenkripsi di `storage/identitas/` |
| `waktu_pengajuan_verifikasi` | TEXT | |
| `alasan_penolakan` | TEXT | wajib diisi controller saat `DITOLAK` |
| `saldo_pendapatan` | INTEGER wajib | ≥ 0; hanya berubah bersama baris `mutasi_saldo` |
| `rekening_tujuan` | TEXT | |

**`penyedia_kerja`** (C03) — `id_penyedia_kerja` PK · `id_pengguna` UNIQUE → pengguna (CASCADE).

**`customer_service`** (C04) — `id_cs` PK · `id_pengguna` UNIQUE → pengguna (CASCADE) · `hak_akses` `CS` · `ADMIN` (default `CS`).

### 2.2 Lowongan & penawaran

**`lowongan_pekerjaan`** (C05)
| Kolom | Tipe | Aturan |
|---|---|---|
| `id_lowongan` | TEXT PK | |
| `id_penyedia_kerja` | TEXT wajib | → penyedia_kerja |
| `judul` | TEXT wajib | 8–150 |
| `deskripsi` | TEXT wajib | 20–2000 |
| `ruang_lingkup`, `kriteria_hasil` | TEXT wajib | |
| `kategori` | TEXT wajib | salah satu kategori seed (§5) |
| `lokasi` | TEXT wajib | kecamatan & kota saja, bukan alamat lengkap |
| `tanggal_pekerjaan`, `estimasi_durasi` | TEXT wajib | |
| `upah` | INTEGER wajib | 1.000–100.000.000 |
| `satuan_upah` | TEXT wajib | `PER_TUGAS` · `PER_HARI` |
| `kuota` | INTEGER wajib | 1–50 |
| `jumlah_diterima` | INTEGER wajib | default 0; `CHECK (jumlah_diterima BETWEEN 0 AND kuota)` |
| `pernyataan_risiko` | INTEGER wajib | 0/1; wajib 1 untuk kategori berisiko (dicek controller) |
| `status_lowongan` | TEXT wajib | `OPEN` · `CLOSED_FULL` · `DIBATALKAN` |
| `created_at` | TEXT wajib | |

Index: `idx_lowongan_open (status_lowongan, kategori, created_at DESC)`, `idx_lowongan_pk (id_penyedia_kerja)`.

**`pengajuan_penawaran`** (C06)
| Kolom | Tipe | Aturan |
|---|---|---|
| `id_penawaran` | TEXT PK | |
| `id_lowongan` | TEXT wajib | → lowongan_pekerjaan |
| `id_tenaga_kerja` | TEXT wajib | → tenaga_kerja |
| `harga_penawaran` | INTEGER wajib | 1.000–100.000.000 |
| `ketersediaan` | TEXT wajib | ≤ 120 |
| `pesan_penawaran` | TEXT | ≤ 1000 |
| `status_penawaran` | TEXT wajib | enum penawaran (§4), default `MENUNGGU` |
| `created_at` | TEXT wajib | |

Index unik parsial `uq_penawaran_aktif (id_lowongan, id_tenaga_kerja) WHERE status_penawaran IN ('MENUNGGU','DITERIMA')` → satu penawaran aktif per TK per lowongan; boleh mengajukan ulang setelah `DITARIK`.

### 2.3 Transaksi pekerjaan

**`transaksi_pekerjaan`** (C07)
| Kolom | Tipe | Aturan |
|---|---|---|
| `id_transaksi` | TEXT PK | |
| `id_lowongan` | TEXT wajib | → lowongan_pekerjaan |
| `id_penawaran` | TEXT wajib UNIQUE | → pengajuan_penawaran |
| `id_tenaga_kerja`, `id_penyedia_kerja` | TEXT wajib | → profil masing-masing |
| `nominal_upah` | INTEGER wajib | > 0 |
| `status_pekerjaan` | TEXT wajib | enum pekerjaan (§4), default `MENUNGGU_PEMBAYARAN` |
| `status_sebelum_sengketa` | TEXT | diisi saat masuk `DISENGKETAKAN` |
| `created_at` | TEXT wajib | |

`UNIQUE (id_lowongan, id_tenaga_kerja)`.

**`bukti_penyerahan`** (C08) — `id_penyerahan` PK · `id_transaksi` → transaksi · `deskripsi_pengerjaan` wajib · `file_path` wajib · `ukuran_file` 1–10.485.760 byte · `timestamp_pengiriman`.

**`catatan_revisi`** — `id_revisi` PK · `id_transaksi` → transaksi · `catatan` 10–1000 · `waktu_permintaan`.

### 2.4 Pembayaran & saldo

**`tagihan_pembayaran`** (C09)
| Kolom | Tipe | Aturan |
|---|---|---|
| `id_tagihan` | TEXT PK | juga idempotency key `charge()` |
| `id_transaksi` | TEXT wajib | → transaksi |
| `nominal_upah` | INTEGER wajib | |
| `commission_fee` | INTEGER wajib | ≥ 0; `round(COMMISSION_RATE × upah)` |
| `total_bayar` | INTEGER wajib | `CHECK (total_bayar = nominal_upah + commission_fee)` |
| `metode` | TEXT | diisi saat bayar |
| `expiry_timestamp` | TEXT wajib | now + `PAYMENT_EXPIRY_HOURS` |
| `status_pembayaran` | TEXT wajib | enum tagihan (§4) |
| `created_at` | TEXT wajib | |

Index unik parsial `uq_tagihan_aktif (id_transaksi) WHERE status_pembayaran IN ('MENUNGGU_PEMBAYARAN','DIPROSES','BERHASIL')` → maksimal satu tagihan aktif/lunas per transaksi (KNF11).

**`pencairan_dana`** (C10) — `id_pencairan` PK (juga idempotency key `disburse()`) · `id_tenaga_kerja` → TK · `nominal` ≥ 10.000 · `rekening_tujuan` wajib · `status_pencairan` enum pencairan (§4) · `waktu_pengajuan`. Index `(id_tenaga_kerja, status_pencairan)`.

**`mutasi_saldo`** — buku besar idempoten, **append-only**
| Kolom | Tipe | Aturan |
|---|---|---|
| `kunci_operasi` | TEXT PK | `upah:<idTransaksi>` (kredit) · `cair:<idPencairan>` (debit) |
| `id_tenaga_kerja` | TEXT wajib | → TK |
| `nominal` | INTEGER wajib | positif = kredit, negatif = debit |
| `created_at` | TEXT wajib | |

**`log_gateway`** (C15), **append-only** — `id_log` INTEGER PK AUTOINCREMENT · `jenis` `CHARGE` · `DISBURSEMENT` · `REFUND` · `CALLBACK` · `referensi_id` (id tagihan/pencairan/tiket) · `provider` default `MOCK` · `payload` JSON valid · `created_at`.

### 2.5 Ulasan

**`ulasan_rating`** (C11) — `id_ulasan` PK · `id_transaksi` → transaksi · `id_penilai`, `id_penerima` → pengguna · `nilai` 1–5 · `deskripsi_ulasan` ≤ 1000 · `created_at` · `UNIQUE (id_transaksi, id_penilai)` (KF22). Index `idx_ulasan_penerima`.

### 2.6 Sengketa

**`tiket_sengketa`** (C12)
| Kolom | Tipe | Aturan |
|---|---|---|
| `id_tiket` | TEXT PK | |
| `nomor_tiket` | TEXT wajib UNIQUE | `KIN-xxxxxx` |
| `id_transaksi` | TEXT | → transaksi; `NULL` = bantuan umum |
| `id_pelapor` | TEXT wajib | → pengguna |
| `kategori_masalah` | TEXT wajib | |
| `deskripsi_komplain` | TEXT wajib | 20–1000 |
| `status_tiket` | TEXT wajib | enum tiket (§4), default `DIAJUKAN` |
| `keputusan` | TEXT | `REFUND` · `PENCAIRAN` |
| `created_at` | TEXT wajib | |

Index unik parsial `uq_tiket_aktif (id_transaksi) WHERE id_transaksi IS NOT NULL AND status_tiket NOT IN ('DITUTUP','DITOLAK','DIBATALKAN')` → satu tiket aktif per transaksi.

**`bukti_sengketa`** — `id_bukti` PK · `id_tiket` → tiket · `id_pengunggah` → pengguna · `file_path` wajib · `created_at`.

**`riwayat_sengketa`** (C13), **append-only** — `id_riwayat` INTEGER PK AUTOINCREMENT · `id_tiket` → tiket · `id_aktor` → pengguna (NULL = sistem) · `log_aktivitas` wajib · `timestamp`.

### 2.7 Lainnya

**`notifikasi`** (C14) — `id_notifikasi` PK · `id_penerima` → **pengguna** (selalu `id_pengguna`, bukan id profil) · `pesan_notifikasi` wajib · `tautan` · `status_baca` 0/1 · `waktu_kirim`. Index `(id_penerima, status_baca, waktu_kirim DESC)`.

**`lowongan_tersimpan`** (Could) — PK `(id_pengguna, id_lowongan)`.

**`lowongan_fts`** (`0003_fts.sql`, #45) — tabel virtual FTS5 `(id_lowongan UNINDEXED, judul, deskripsi)`, disinkronkan trigger insert/update/delete dari `lowongan_pekerjaan`.

**`_migrasi`** — dicatat oleh `scripts/migrate.ts`: nama berkas migrasi yang sudah dijalankan.

## 3. Invarian yang dijaga DB

| Invarian | Mekanisme |
|---|---|
| Kuota tidak terlampaui (KNF07) | `CHECK (jumlah_diterima BETWEEN 0 AND kuota)` + `BEGIN IMMEDIATE` |
| Satu penawaran aktif per TK per lowongan (KF10) | `uq_penawaran_aktif` |
| Satu TK hanya sekali per lowongan di transaksi | `UNIQUE (id_lowongan, id_tenaga_kerja)` |
| Satu tagihan aktif per transaksi (KNF11) | `uq_tagihan_aktif` |
| Total tagihan benar | `CHECK (total_bayar = nominal_upah + commission_fee)` |
| Saldo tidak negatif | `CHECK (saldo_pendapatan >= 0)` |
| Kredit/debit saldo sekali saja (KF17, KNF16) | PK `mutasi_saldo.kunci_operasi` + `INSERT … ON CONFLICT DO NOTHING` |
| Ulasan sekali per penilai per transaksi (KF22) | `UNIQUE (id_transaksi, id_penilai)` |
| Satu tiket aktif per transaksi | `uq_tiket_aktif` |
| Riwayat & ledger tidak bisa diubah (KNF20) | Trigger `0002_immutability.sql`: `RAISE(ABORT)` pada `UPDATE`/`DELETE` di `riwayat_sengketa`, `mutasi_saldo`, `log_gateway` |

Aturan bisnis yang **tidak** bisa diekspresikan DB (usia ≥ 17, risiko wajib, transisi status, kepemilikan) dijaga controller dan wajib punya test.

## 4. Enum

| Domain | Kolom | Nilai |
|---|---|---|
| Peran | `pengguna.peran` | `TK` `PK` `CS` |
| Hak akses CS | `customer_service.hak_akses` | `CS` `ADMIN` |
| Verifikasi | `tenaga_kerja.status_verifikasi` | `BELUM_TERVERIFIKASI` `MENUNGGU_VERIFIKASI` `TERVERIFIKASI` `DITOLAK` |
| Lowongan | `status_lowongan` | `OPEN` `CLOSED_FULL` `DIBATALKAN` |
| Satuan upah | `satuan_upah` | `PER_TUGAS` `PER_HARI` |
| Penawaran | `status_penawaran` | `MENUNGGU` `DITERIMA` `DITOLAK` `DITARIK` `DITOLAK_OTOMATIS` |
| Pekerjaan | `status_pekerjaan` | `MENUNGGU_PEMBAYARAN` `IN_PROGRESS` `SUBMITTED` `COMPLETED` `DISENGKETAKAN` `DIBATALKAN` |
| Tagihan | `status_pembayaran` | `MENUNGGU_PEMBAYARAN` `DIPROSES` `BERHASIL` `GAGAL` `KEDALUWARSA` `DIKEMBALIKAN` |
| Pencairan | `status_pencairan` | `MENUNGGU_PROSES` `DIPROSES` `BERHASIL` `GAGAL` `DITOLAK` |
| Tiket | `status_tiket` | `DIAJUKAN` `DITINJAU` `MENUNGGU_BALASAN` `DIPROSES` `DITUTUP` `DITOLAK` `DIBATALKAN` |
| Keputusan sengketa | `keputusan` | `REFUND` `PENCAIRAN` |
| Log gateway | `log_gateway.jenis` | `CHARGE` `DISBURSEMENT` `REFUND` `CALLBACK` |

Transisi yang sah dan label UI: [modules.md §2](modules.md#2-state-machine).

## 5. Data referensi & seed

Kategori lowongan: `Kebersihan`, `Perbaikan Rumah`, `Angkut Barang`, `Acara & Katering`, `Pertukangan`, `Kelistrikan` (**berisiko**, KNF09), `Lainnya`.

Akun uji (fiktif, password di-hash saat seed):

| Peran | Email | Password | Kondisi |
|---|---|---|---|
| TK terverifikasi | `tk1@kerjain.test` | `Password123!` | saldo Rp500.000 |
| TK belum terverifikasi | `tk2@kerjain.test` | `Password123!` | uji KF06 |
| TK menunggu verifikasi | `tk3@kerjain.test` | `Password123!` | muncul di antrean CS |
| PK | `pk1@kerjain.test` | `Password123!` | 3 lowongan OPEN, 1 transaksi SUBMITTED |
| CS | `cs1@kerjain.test` | `Password123!` | `hak_akses=ADMIN` |

Plus ±30 lowongan multi-kategori, transaksi di setiap status pekerjaan, dan 1 tiket aktif. Akun CS hanya dibuat lewat seed.

## 6. Aturan akses & perubahan

1. Hanya kode server (`models/`, lewat `lib/db`) yang menyentuh DB. `lib/db` memakai `import 'server-only'`.
2. Hanya prepared statement; parameter `?` atau `@nama`. Tidak ada penyambungan string.
3. Tulis multi-baris/tabel di `tx()` (`BEGIN IMMEDIATE`), tanpa `await` di dalamnya.
4. Perubahan skema = berkas baru `db/migrations/000N_<nama>.sql`. Migrasi yang sudah di-merge tidak diedit.
5. Setiap perubahan skema memperbarui dokumen ini dan seed (`db/seed.ts`) di PR yang sama, direview pemilik tabel.
6. Katalog query (Q-001…Q-105) dan terjemahan PostgreSQL → SQLite: rancangan §11.5.

## Perubahan hasil review #95/#98

Migrasi 0004 menambah `operasi_refund`: id_tagihan PK, id_transaksi UNIQUE, id_tiket UNIQUE, id_cs, catatan, status (MENGIRIM/BELUM_PASTI/GAGAL/BERHASIL), klaim, batas_klaim. Foreign key mengikat semua referensi. Trigger mengunci status tiket/pekerjaan selama operasi belum final dan melarang ledger upah untuk transaksi yang sudah diputus refund.

`rekening_tujuan` pada pencairan_dana (dan data rekening profil lama yang dimigrasi) menyimpan ciphertext `enc:rekening:v1:...`, bukan nomor mentah. `log_gateway.payload` tersanitasi, rekening berupa last-four dan HMAC. Maintenance data lama mempertahankan ID/waktu log dan memastikan trigger append-only tetap aktif setelah selesai; prosedur di [review-fixes.md](../review-fixes.md).
