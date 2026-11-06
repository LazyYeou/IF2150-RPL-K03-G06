# PRD — Kerja-In

| Atribut | Nilai |
|---|---|
| Produk | Kerja-In — marketplace jasa harian sektor informal |
| Tim | IF2150 K03 / G06 "Shifu" — Davin, Aditya, Ridwan (project lead), Karmel, Sebastio |
| Versi dokumen | 1.0 (5 Nov 2026) |
| Status | Disetujui untuk implementasi Tugas 9 (M9) |
| Pemilik | Ridwan (project lead) |
| Rilis target | `v9.0` 10 Nov 2026 (jaring pengaman) · `v9.1` final ≤ 11 Nov 2026 20.00 WIB |
| Sumber kebenaran teknis | [`Kerja-In_Rancangan_Pengembangan.md`](../../Kerja-In_Rancangan_Pengembangan.md) (rancangan r3) |
| Daftar pekerjaan | [`Kerja-In_Issues.md`](../../Kerja-In_Issues.md) · GitHub Issues #3–#53, milestone `M9 – Implementasi` |
| Kontrak teknis | [`contracts/db.md`](contracts/db.md) · [`contracts/api.md`](contracts/api.md) · [`contracts/modules.md`](contracts/modules.md) |

> PRD ini menjawab **apa** dan **mengapa**. **Bagaimana** (skema DB, query, sequence, folder) ada di rancangan. Bila keduanya bertentangan, rancangan r3 yang berlaku dan PRD ini diperbarui.

---

## 1. Ringkasan

Kerja-In mempertemukan **Penyedia Kerja (PK)** yang butuh tenaga harian dengan **Tenaga Kerja (TK)** sektor informal, dengan **Customer Service (CS)** sebagai verifikator identitas dan penengah sengketa. Pembayaran ditampung lewat Payment Gateway (bukan disimpan platform) dan upah baru dicairkan ke saldo TK setelah PK menyetujui hasil kerja.

Alur inti:

```
Registrasi → Verifikasi identitas (TK) → Pasang lowongan (PK) → Cari & ajukan penawaran (TK)
→ Pilih pelamar (PK) → Bayar via gateway (PK) → Kerjakan & serahkan bukti (TK)
→ Setujui / revisi / komplain (PK) → Upah masuk saldo (TK) → Tarik dana (TK)
→ Rating & ulasan (keduanya) ; Sengketa → diputus CS (refund / cairkan)
```

## 2. Latar Belakang & Masalah

| Pihak | Masalah saat ini |
|---|---|
| PK | Sulit menemukan tenaga harian tepercaya; tidak ada jaminan hasil kerja sebelum membayar |
| TK | Akses pekerjaan bergantung pada relasi; tidak punya portofolio/rekam jejak; risiko tidak dibayar |
| Keduanya | Tidak ada pihak netral saat terjadi perselisihan |

Selaras **SDG 8** (pekerjaan layak & pertumbuhan ekonomi inklusif).

## 3. Tujuan & Non-Tujuan

### 3.1 Tujuan
1. PK dapat memasang lowongan dan memilih TK terverifikasi dengan kuota yang terjamin (tidak pernah lebih dari kuota).
2. Dana PK aman: ditahan sampai hasil disetujui atau diputus CS, dan tidak pernah tertagih/terkredit ganda.
3. TK membangun reputasi lewat rating & ulasan, serta dapat mencairkan saldo.
4. Asisten dapat menjalankan aplikasi dari *clone* bersih dengan ±3 perintah, tanpa Docker atau akun layanan eksternal.

### 3.2 Non-Tujuan (Won't, Tugas 9)
Chat, GPS/peta, verifikasi Dukcapil, email produksi, adapter gateway sungguhan yang wajib, aplikasi mobile native, mode akun ganda TK↔PK, offline-first, pengurusan BPJS/UMR/PPh 21 (platform adalah perantara, bukan pemberi kerja).

## 4. Metrik Keberhasilan (untuk rilis M9)

| Metrik | Target | Cara ukur |
|---|---|---|
| Alur E2E happy path (§17.1 rancangan) | Lulus sebelum feature freeze D4 | Playwright di CI (#43) |
| Kriteria penerimaan KF Must | 100% punya test yang lulus | Vitest unit + integrasi |
| Integritas uang | 0 kasus saldo/tagihan ganda | Test KNF07, KNF11, KNF16, KF17 |
| Waktu cek status verifikasi | < 1 detik (KNF03) | Log durasi |
| Waktu hasil pencarian | ≤ 5 detik pada 20.000 lowongan (KNF04) | Profiling B.2.1 (#45) |
| Kemudahan menjalankan | Clone bersih → `npm run dev` berhasil oleh anggota non-penulis README | Uji #47 |
| UI mobile | Rapi di 360/768/1280 px; skor Lighthouse dicatat | #44 |

## 5. Pengguna & Aktor

| ID | Aktor | Kebutuhan utama |
|---|---|---|
| A01 | Tenaga Kerja (TK) | Cari lowongan, ajukan penawaran, kerjakan, serahkan bukti, terima upah, tarik dana, bangun rating |
| A02 | Penyedia Kerja (PK) | Pasang lowongan, pilih pelamar, bayar, periksa hasil (setujui/revisi/komplain) |
| A03 | Customer Service (CS) | Verifikasi identitas TK, tangani & putus sengketa. CS dengan `hak_akses=ADMIN` = "Administrator" di SKPL |
| – | Payment Gateway (sistem eksternal, bukan aktor) | Charge, disbursement, refund, callback ber-HMAC (mock di lokal) |

Aturan: **1 akun = 1 peran**. Akun CS hanya dibuat lewat seed. Fitur utama TK (penawaran, penyerahan bukti, pencairan) terkunci sampai identitas **terverifikasi**. Matriks izin lengkap: rancangan §3.1.

## 6. Lingkup MVP (MoSCoW)

| Prioritas | Use case / fitur |
|---|---|
| **Must** | UC01 Registrasi & login · UC02 Verifikasi identitas · UC03 Kelola lowongan · UC04 Cari lowongan · UC05 Ajukan penawaran · UC06 Pilih tenaga kerja · UC07 Pembayaran (mock gateway) · UC08 Serahkan hasil · UC09 Verifikasi penyelesaian · UC10 Pencairan dana |
| **Should** | UC11 Rating & ulasan · UC12 Keluhan/sengketa (buat, putuskan, tolak, batal) · Notifikasi in-app (polling) · Lupa/reset sandi · Profil, privasi, S&K, 404 |
| **Could** (setelah gate D4) | Lowongan tersimpan · Pencarian & profil TK + undangan (I-06, I-07, I-26) · Adapter Midtrans sandbox |

## 7. Kebutuhan Fungsional

Setiap KF punya kriteria penerimaan yang **wajib diuji** (unit/integrasi/E2E). Detail endpoint di rancangan §12, layar di §13.

| ID | Kebutuhan | Kriteria penerimaan | UC | Prio | Issue |
|---|---|---|---|---|---|
| KF01 | Registrasi dengan pilihan peran, profil, persetujuan privasi | Tanpa centang privasi → 400; peran ∉ {TK, PK} → 400 | UC01 | M | #8 |
| KF02 | Tolak usia < 17 tahun | 17 tahun kurang 1 hari ditolak; tepat 17 tahun diterima | UC01 | M | #8, #40 |
| KF03 | Login & terbitkan sesi | Kredensial salah → pesan generik; sukses → cookie HttpOnly + redirect sesuai peran | UC01 | M | #8 |
| KF04 | TK unggah dokumen identitas + persetujuan | Hanya JPG/PNG/PDF ≤ 5 MB (cek magic bytes); tersimpan terenkripsi & privat | UC02 | M | #12, #14 |
| KF05 | CS setujui/tolak verifikasi | `MENUNGGU → TERVERIFIKASI/DITOLAK`; tolak wajib alasan; notifikasi terkirim | UC02 | M | #20, #31 |
| KF06 | Blokir fitur utama TK belum terverifikasi | Penawaran/penyerahan/pencairan → 403 `NOT_VERIFIED` | UC02 | M | #20 |
| KF07 | Lowongan baru berstatus `OPEN` | Status awal `OPEN`, `jumlah_diterima = 0` | UC03 | M | #11 |
| KF08 | Isian lowongan tidak valid ditolak per field | Skema Zod sama di klien & server; error per field | UC03 | M | #11, #23 |
| KF09 | Pencarian hanya menampilkan lowongan `OPEN` | `CLOSED_FULL` tidak muncul; hasil kosong → empty state | UC04 | M | #11, #13 |
| KF10 | Penawaran hanya oleh TK terverifikasi, sekali per lowongan | UI menyembunyikan tombol + server menolak; penawaran ganda → 409 | UC05 | M | #21, #24 |
| KF11 | Simpan penawaran (harga, ketersediaan, pesan) | Status `MENUNGGU`; PK pemilik mendapat notifikasi | UC05 | M | #21 |
| KF12 | PK menerima pelamar → transaksi pekerjaan | Satu transaksi DB: penawaran `DITERIMA`, `jumlah_diterima+1`, transaksi `MENUNGGU_PEMBAYARAN` | UC06 | M | #22, #30 |
| KF13 | Kuota penuh → lowongan `CLOSED_FULL` | Penerimaan terakhir menutup lowongan; sisa penawaran `DITOLAK_OTOMATIS` | UC06 | M | #22 |
| KF14 | Bayar via gateway, lalu `IN_PROGRESS` | Status hanya berubah lewat callback terverifikasi HMAC | UC07 | M | #16, #25 |
| KF15 | Catat status & riwayat pembayaran | Setiap callback tercatat di `log_gateway`; tagihan punya status final | UC07 | M | #15, #25 |
| KF16 | TK serahkan bukti → `SUBMITTED` | Hanya TK yang ditugaskan, status `IN_PROGRESS`, berkas ≤ 10 MB | UC08 | M | #26 |
| KF17 | PK setujui → `COMPLETED` & kredit upah | Saldo TK bertambah **tepat sekali** (kunci `upah:<id>`) | UC09 | M | #35 |
| KF18 | Notifikasi upah & saldo terbarui | Notifikasi ada; saldo dashboard TK terbarui | UC09 | M | #35 |
| KF19 | Pengajuan pencairan dengan validasi rekening | Format `BANK:` 10–16 digit / `EWALLET:08…`; nominal ≤ saldo tersedia, minimal Rp10.000 | UC10 | M | #34 |
| KF20 | Log pencairan tidak bisa diubah | id, nominal, penerima, waktu, status tercatat; append-only | UC10 | M | #34 |
| KF21 | Rating 1–5 & ulasan setelah `COMPLETED` | Form hanya untuk peserta transaksi `COMPLETED` | UC11 | S | #36 |
| KF22 | Tolak ulasan ganda | UNIQUE (`id_transaksi`, `id_penilai`) → 409 | UC11 | S | #36 |
| KF23 | Hitung ulang rata-rata rating | `akumulasi_rating` diperbarui dalam transaksi yang sama | UC11 | S | #36 |
| KF24 | Keluhan → tiket di dashboard CS | Tiket `DIAJUKAN` muncul di antrean CS; dana ditahan (`DISENGKETAKAN`) | UC12 | S | #29, #37 |
| KF25 | Putusan CS: refund ke PK / cairkan ke TK | Refund via adapter (kunci `refund:<idTiket>`) atau kredit upah idempoten | UC12 | S | #38, #39 |
| KF26 | Riwayat penanganan sengketa kronologis | `riwayat_sengketa` append-only, terurut waktu | UC12 | S | #29 |

## 8. Kebutuhan Non-Fungsional

| Kategori | ID | Kebutuhan | Penerimaan |
|---|---|---|---|
| Keamanan | KNF01 | Password & token tidak tersimpan plaintext | Argon2id; DB hanya menyimpan SHA-256 token sesi |
| | KNF02 | Dokumen identitas terenkripsi at rest | AES-256-GCM; akses tanpa hak → 403 |
| | KNF06, KNF14 | Anti-IDOR | Kepemilikan dicek dari sesi, bukan body; test IDOR |
| | KNF12, KNF17 | Kanal & data pembayaran aman | Webhook HMAC-SHA256 (salah → 401); rekening ditampilkan masked |
| | KNF19 | Modul CS hanya untuk CS/Admin | Non-CS ke `/api/cs/*` → 403 |
| Reliabilitas | KNF07 | Kuota terakhir hanya untuk 1 TK | 2 penerimaan bersamaan dari 2 koneksi → tepat 1 sukses |
| | KNF11 | Tidak ada pembayaran ganda | Satu tagihan aktif per transaksi |
| | KNF15, KNF16 | Dana ditahan sampai konfirmasi; pencairan idempoten | Webhook dikirim ulang → debit sekali |
| | KNF20 | Riwayat sengketa, mutasi saldo, log gateway tamper-proof | `UPDATE/DELETE` ditolak trigger DB |
| Kinerja | KNF03 | Cek status verifikasi < 1 s | – |
| | KNF04 | Hasil pencarian ≤ 5 s | Profiling sebelum/sesudah FTS5 |
| | KNF08 | RAM klien ≤ 150 MB | Paginasi server; diukur di DevTools |
| | KNF22 | Berkas ≤ 10 MB, gambar dikompres | Kompresi klien ke ≤ 2 MB |
| Ergonomi | KNF05, KNF21 | Mobile-first, adaptif | Target sentuh ≥ 44 px; uji 360/768/1280 px |
| Keselamatan | KNF09 | Lowongan berisiko wajib pernyataan risiko | Kategori berisiko (mis. Kelistrikan) tanpa centang → 400 |
| Ketersediaan | KNF10, KNF23 | Downtime ≤ 24 jam/bulan; fail-closed | Lihat [CONTRIBUTING §Rilis & deploy](../../CONTRIBUTING.md#7-rilis--deploy) |

Konflik batas berkas diputuskan: **KTP ≤ 5 MB, bukti pekerjaan & bukti sengketa ≤ 10 MB**.

## 9. Pengalaman Pengguna

- Web responsif, **mobile-first**, bahasa Indonesia, format rupiah & tanggal Indonesia.
- Layar I-01 s.d. I-29 dari prototipe Figma DPPL2 Bab 6, ditambah 8 layar baru I-30 s.d. I-37 (verifikasi, antrean CS, daftar pelamar, invoice, mock gateway, ulasan, tiket CS, detail tiket). Peta route: rancangan §13.
- Status ditampilkan dengan label Indonesia (rancangan §7.8), mis. `SUBMITTED` → "Menunggu pemeriksaan".
- Semua data bisnis disimpan di server; `localStorage` hanya untuk preferensi UI.
- Aksesibilitas: navigasi keyboard, fokus terjaga di dialog, Escape menutup dialog tanpa mengirim.

## 10. Batasan, Asumsi & Dependensi

**Batasan teknis (keputusan K1–K11 rancangan):**
- Next.js 15 full-stack (App Router), TypeScript strict, satu repo, satu proses; kode di `src/`.
- SQLite satu file (`better-sqlite3`), autentikasi sesi ditulis sendiri, berkas di `storage/` lokal; tanpa Docker/Supabase/ORM/library auth.
- Uang selalu `INTEGER` rupiah; status memakai enum kode tunggal.
- Pembayaran/pencairan/refund wajib lewat `PaymentGatewayAdapter`; default `PAYMENT_PROVIDER=mock`.

**Asumsi:** skala MVP 100–500 pengguna; satu instance server; pengguna memakai browser modern dengan internet.

**Dependensi antarmodul:** kontrak di rancangan §20.4 (`kirimNotifikasi`, `kreditUpahDalamTx`, `PaymentGatewayAdapter`, skema Zod `lib/validation/*`, guard auth). Urutan: fondasi D0 → auth → verifikasi/lowongan → penawaran → pilih pelamar → bayar → bukti → setujui → dompet; sengketa butuh transaksi + kredit upah.

## 11. Rencana Rilis

| Hari | Tanggal | Fokus | Gate |
|---|---|---|---|
| D0 | Kam 5 Nov | Fondasi: setup repo & CI, skema DB + seed, auth dasar | Semua anggota berhasil `npm run dev` (#6) |
| D1–D3 | 6–8 Nov | Fitur paralel per domain | – |
| D4 | Sen 9 Nov | Feature freeze Must + Should | E2E happy path lulus |
| D5 | Sel 10 Nov | Integrasi, bug bash, profiling, README | Tag `v9.0` |
| D6 | Rab 11 Nov | Laporan M9, AI-Usage, perbaikan kecil | Merge terakhir ≤ 19.00, tag `v9.1` ≤ 20.00 WIB |

Kepemilikan domain & pasangan reviewer: rancangan §20.

## 12. Risiko Utama

| Risiko | Mitigasi |
|---|---|
| Native module (`better-sqlite3`, `@node-rs/argon2`) gagal terpasang | Node 20/22 LTS; Windows: "Desktop development with C++" atau WSL; verifikasi D0 (#6) |
| Bug uang (saldo/tagihan ganda) | Ledger idempoten, unique index, test integrasi wajib, review Karmel + 1 |
| Waktu 6 hari | MoSCoW ketat, feature freeze D4, `v9.0` lebih awal |
| Backend 6 UC di satu orang (Ridwan) | Kontrak API D1 pagi; Davin mengambil alih putusan sengketa bila belum mulai D3 malam |
| Kredensial ter-commit | `.gitignore`, `.env.example`, secret scanning; rotasi bila bocor |

Daftar lengkap: rancangan §22.

## 13. Pertanyaan Terbuka

| # | Pertanyaan | Usulan | Pemutus |
|---|---|---|---|
| Q1 | Rancangan §10 menulis grup route `(tk)/dashboard-tk`, sedangkan §13 dan issue memakai `/tk`, `/pk`, `/cs` | Ikuti §13 (`/tk/*`, `/pk/*`, `/cs/*`) karena middleware & issue memakainya | Ridwan |
| Q2 | Daftar scope commit §18 lebih sempit dari scope di judul issue (`setup`, `api`, `storage`, `profil`, `release`, `qa`, `m9`, `readme`, `tenaga-kerja`) | commitlint hanya mewajibkan scope ada, tanpa daftar tetap | Ridwan |
| Q3 | Diagram §14.1 rancangan masih menulis peserta "PostgreSQL" | Baca sebagai SQLite; perbaiki di rancangan | Ridwan |

## 14. Glosarium

| Istilah | Arti |
|---|---|
| TK / PK / CS | Tenaga Kerja / Penyedia Kerja / Customer Service |
| KF / KNF | Kebutuhan Fungsional / Non-Fungsional (SKPL) |
| UCxx, I-xx, Cxx, Q-xxx | Use case, layar UI, kelas (C01–C45 DPPL2), query katalog DPPL2 |
| Commission fee | Biaya layanan = `COMMISSION_RATE` × upah, ditagihkan ke PK |
| Saldo tersedia | `saldo_pendapatan` − pencairan yang masih `MENUNGGU_PROSES`/`DIPROSES` |
| Mock gateway | Halaman simulasi gateway + webhook ber-HMAC untuk lokal/pengujian |
| Gate D4 | Syarat feature freeze: E2E happy path lulus |

## 15. Riwayat Perubahan

| Versi | Tanggal | Perubahan | Oleh |
|---|---|---|---|
| 1.0 | 5 Nov 2026 | Versi awal, diturunkan dari rancangan r3 | Tim G06 |
