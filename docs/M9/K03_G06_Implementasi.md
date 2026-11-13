# Kerja-In — Laporan Implementasi Perangkat Lunak

## Tugas Besar IF2150 - Rekayasa Perangkat Lunak

**Kelas:** K-03  
**Kelompok:** 6 — Shifu  
**Asisten:** Agatha

| NIM | Nama |
|---|---|
| 13525033 | Davin Farel Santoso |
| 13525039 | Aditya Rasyid |
| 13525096 | Muhammad Ridwan Nasir Firdaus |
| 13525102 | Karmel Tua Haloho |
| 13525123 | Sebastio Nugroho |

Dokumen ini mencatat implementasi Kerja-In dan merujuk rancangan kelas pada [DPPL2 M8](../M8/K03_G06_DPPL2.md). Status dan bukti yang dicantumkan sesuai keadaan repo saat laporan ini disusun.

---

# BAGIAN B: Laporan Implementasi

## B.1 Perubahan dari DPPL

| No | Bagian DPPL | Rancangan Awal | Implementasi Akhir | Alasan |
|---:|---|---|---|---|
| 1 | C03 PenyediaKerja dan C04 CustomerService | Entitas peran dimodelkan sebagai kelas domain | Data peran disimpan dalam tabel `penyedia_kerja` dan `customer_service`; operasi berbagi model pengguna dan controller fitur | Menghindari kelas TypeScript terpisah untuk data yang direlasikan dengan akun; skema tabel tetap memisahkan data peran |
| 2 | C16–C30 kelas UI | UI dimodelkan sebagai kelas antarmuka | Diwujudkan sebagai halaman Next.js App Router dan komponen React di `src/app/` dan `src/views/` | Bentuk UI mengikuti arsitektur web dan bukan kelas UI berorientasi objek |
| 3 | C33 PenyediaKerjaController | Controller khusus penyedia kerja | Operasi dibagi ke `LowonganPekerjaanController` dan `PengajuanPenawaranController` | Tanggung jawab dipisah menurut fitur lowongan dan penawaran |
| 4 | C38 BuktiPenyerahanController | Controller khusus bukti penyerahan | Operasi tersebar pada `TransaksiBuktiController` dan `BerkasController` | Pemisahan alur transaksi dari validasi, penyimpanan, dan pengunduhan berkas |
| 5 | C40 PencairanDanaController | Controller pencairan dana khusus | Operasi pencairan berada di `DompetController`; entitas tetap ada di model dan basis data | Pencairan merupakan bagian dari alur dompet/saldo |
| 6 | C41 UlasanRatingController dan C43 RiwayatSengketaController | Controller khusus untuk ulasan dan riwayat sengketa | Ulasan ditangani `TransaksiPekerjaanController`; riwayat sengketa dicatat bersama alur tiket dan tabel append-only | Menyatukan operasi dengan konteks transaksi/tiket yang mengotorisasi dan mengubahnya |
| 7 | Pencarian lowongan (§17.3 DPPL2) | Optimasi pencarian direncanakan setelah profiling, termasuk FTS5 | Implementasi saat ini masih memakai `LIKE`; migrasi FTS5 dan hasil profiling belum tersedia | Pekerjaan belum selesai; tercatat sebagai tindak lanjut pada [issue #45](https://github.com/LazyYeou/IF2150-RPL-K03-G06/issues/45) |
| 8 | PaymentGateway | Integrasi gateway eksternal | Alur pembayaran saat ini menggunakan mock gateway lokal (`MockGatewayController` dan halaman mock gateway) | Memungkinkan demonstrasi dan pengujian tanpa akun layanan eksternal; bukan integrasi pembayaran produksi |

## B.2 Bukti Penerapan Best Practices

| Praktik | Bukti | Keterangan |
|---|---|---|
| Branching | [Daftar branch](https://github.com/LazyYeou/IF2150-RPL-K03-G06/branches/all) dan [riwayat `dev`](https://github.com/LazyYeou/IF2150-RPL-K03-G06/commits/dev) | Menggunakan branch fitur/perbaikan seperti `feat/*`, `fix/*`, dan `test/*`, lalu mengintegrasikan perubahan melalui PR/branch integrasi. |
| Semantic commit | [Riwayat commit](https://github.com/LazyYeou/IF2150-RPL-K03-G06/commits/dev) | Contoh: `fix(test): playwright config order` (`c4d9eb92`), `fix(db): bootstrap empty database` (`477d6ba3`), dan `feat(ui): integrate UI branches` (`645935b4`). |
| Track tasks | [Issues repo](https://github.com/LazyYeou/IF2150-RPL-K03-G06/issues) | Pekerjaan M9 dirinci pada [#45 profiling](https://github.com/LazyYeou/IF2150-RPL-K03-G06/issues/45), [#46 bug bash](https://github.com/LazyYeou/IF2150-RPL-K03-G06/issues/46), dan [#49 laporan](https://github.com/LazyYeou/IF2150-RPL-K03-G06/issues/49). Tidak ada tautan GitHub Project yang dicatat pada issue tersebut. |
| Pull request dan review | [PR #64](https://github.com/LazyYeou/IF2150-RPL-K03-G06/pull/64), [PR #111](https://github.com/LazyYeou/IF2150-RPL-K03-G06/pull/111) | PR #64 mendapat review komentar dari LazyYeou. PR #111 mendapat review otomatis Graphify; review otomatis bukan pengganti review anggota. |
| Pengujian | [`src/tests/`](../../src/tests/) | `cd src && npm test` — **lulus**, 37 test files dan 382 tests. Cakupan mencakup unit dan integrasi. E2E tersedia terpisah melalui `npm run test:e2e` dan tidak termasuk dalam hasil ini. |

### B.2.1 Profiling dan Optimasi

| Informasi | Keterangan |
|---|---|
| Fitur / proses yang diprofil | Pencarian lowongan (`Q-102a`) |
| Alat | Pengukuran profiling belum dijalankan/tercatat. Issue #45 merencanakan `EXPLAIN QUERY PLAN`, median 20 request, payload, dan seed 20.000 lowongan. |
| Temuan (sebelum) | Belum ada angka baseline atau tangkapan layar yang dapat diverifikasi. Pemeriksaan implementasi menunjukkan query masih menggunakan `LIKE` pada `src/models/LowonganPekerjaan.ts`. |
| Perbaikan | FTS5 dan migrasinya belum ditemukan pada implementasi saat ini; pekerjaan masih tercatat di [issue #45](https://github.com/LazyYeou/IF2150-RPL-K03-G06/issues/45) yang berstatus terbuka. |
| Hasil (sesudah) | Belum ada pengukuran sesudah perbaikan. Karena itu belum dapat disimpulkan adanya peningkatan waktu respons atau payload. |

## B.3 Kendala dan Catatan Penting

- [Issue #46](https://github.com/LazyYeou/IF2150-RPL-K03-G06/issues/46) untuk bug bash masih terbuka dan belum memiliki rekap known issues. Tidak ditemukan issue terbuka berlabel `bug` saat pengecekan, tetapi hal itu bukan bukti bahwa aplikasi bebas bug.
- Pengujian silang formal dan hasilnya perlu dilengkapi pada issue #46. Beberapa bagian dashboard dinamis masih menggunakan halaman placeholder, antara lain `src/app/tk/[section]/page.tsx` dan `src/app/pk/[section]/page.tsx`.
- Pembayaran menggunakan mock gateway lokal; jangan menggunakan data atau mengharapkan transaksi uang sungguhan.
- Pencarian lowongan masih menggunakan `LIKE`; belum ada optimasi FTS5 maupun hasil benchmark (lihat B.2.1).
- Untuk menjalankan aplikasi, ikuti [`src/README.md`](../../src/README.md). Dari folder `src`, jalankan `npm ci`, siapkan `.env.local` berdasarkan `.env.example`, lalu `npm run dev`. Pengujian unit/integrasi dijalankan dengan `npm test`.

## B.4 Kontribusi Anggota

Persentase berikut merupakan pembagian sementara yang berjumlah 100%; seluruh anggota perlu mengonfirmasi bersama.

| NIM | Nama | Modul / Fitur yang Dikerjakan | Persentase Kontribusi |
|---|---|---|---:|
| 13525033 | Davin Farel Santoso | Autentikasi dan pengujian alur autentikasi, profil, notifikasi, layout, serta perbaikan integrasi | 20% |
| 13525039 | Aditya Rasyid | Integrasi UI dan branch antarmuka; dokumentasi implementasi M9 | 20% |
| 13525096 | Muhammad Ridwan Nasir Firdaus | Fondasi basis data, autentikasi, lowongan, penawaran, dan fitur verifikasi/tiket | 20% |
| 13525102 | Karmel Tua Haloho | Pembayaran, gateway/webhook, refund, dompet, dan pencairan dana | 20% |
| 13525123 | Sebastio Nugroho | Alur transaksi, bukti pekerjaan, ulasan, serta pengujian E2E/QA | 20% |
| **Total** |  |  | **100%** |

## B.5 Traceability Kelas Perancangan ke Implementasi

Tabel berikut memetakan seluruh kelas C01–C45 dari Tabel 4.1 DPPL2. Kelas yang tidak diwujudkan sebagai unit bernama sama dipetakan ke tabel, halaman, controller, atau komponen yang menjalankan tanggung jawabnya.

| ID Kelas | Nama Kelas Perancangan | Bentuk Implementasi | Lokasi (File dan Nama) | Keterangan |
|---|---|---|---|---|
| C01 | Pengguna | Model, controller, tabel | `src/models/Pengguna.ts`; `src/controllers/PenggunaController.ts`; `src/db/migrations/0001_init.sql` — `pengguna` | Data akun dan operasi autentikasi |
| C02 | TenagaKerja | Model, controller, tabel | `src/models/TenagaKerja.ts`; `src/controllers/TenagaKerjaController.ts`; `src/db/migrations/0001_init.sql` — `tenaga_kerja` | Profil pekerja, verifikasi, saldo, dan rekening |
| C03 | PenyediaKerja | Tabel dan operasi fitur | `src/db/migrations/0001_init.sql` — `penyedia_kerja`; `src/controllers/LowonganPekerjaanController.ts`; `src/controllers/PengajuanPenawaranController.ts` | Tidak ada model TypeScript terpisah; data peran disimpan sebagai tabel relasi pengguna |
| C04 | CustomerService | Controller dan tabel | `src/controllers/CustomerServiceController.ts`; `src/controllers/TiketSengketaController.ts`; `src/db/migrations/0001_init.sql` — `customer_service` | Data peran di tabel; peninjauan verifikasi/tiket pada controller |
| C05 | LowonganPekerjaan | Model, controller, tabel | `src/models/LowonganPekerjaan.ts`; `src/controllers/LowonganPekerjaanController.ts`; `src/db/migrations/0001_init.sql` — `lowongan_pekerjaan` | Validasi, penyimpanan, pencarian, dan status lowongan |
| C06 | PengajuanPenawaran | Model, controller, tabel | `src/models/PengajuanPenawaran.ts`; `src/controllers/PengajuanPenawaranController.ts`; `src/db/migrations/0001_init.sql` — `pengajuan_penawaran` | Pengajuan, penarikan, daftar pelamar, dan pemilihan |
| C07 | TransaksiPekerjaan | Model, controller, state machine, tabel | `src/models/TransaksiPekerjaan.ts`; `src/models/statusMachine.ts`; `src/controllers/TransaksiPekerjaanController.ts`; `src/db/migrations/0001_init.sql` — `transaksi_pekerjaan` | Status transaksi, persetujuan hasil, revisi, dan ulasan |
| C08 | BuktiPenyerahan | Model, controller, tabel | `src/models/BuktiPenyerahan.ts`; `src/controllers/TransaksiBuktiController.ts`; `src/controllers/BerkasController.ts`; `src/db/migrations/0001_init.sql` — `bukti_penyerahan` | Unggah, validasi, dan unduh bukti |
| C09 | TagihanPembayaran | Model, controller, tabel | `src/models/TagihanPembayaran.ts`; `src/controllers/TagihanPembayaranController.ts`; `src/db/migrations/0001_init.sql` — `tagihan_pembayaran` | Pembuatan tagihan, pembayaran, kedaluwarsa, dan refund |
| C10 | PencairanDana | Model, controller dompet, tabel | `src/models/PencairanDana.ts`; `src/controllers/DompetController.ts`; `src/db/migrations/0001_init.sql` — `pencairan_dana` | Operasi pencairan menjadi bagian dari controller dompet |
| C11 | UlasanRating | Tabel dan operasi transaksi | `src/db/migrations/0001_init.sql` — `ulasan_rating`; `src/controllers/TransaksiPekerjaanController.ts`; `src/views/transaksi/FormUlasanTransaksi.tsx` | Validasi/persistensi ulasan ditangani alur transaksi; tidak ada model terpisah |
| C12 | TiketSengketa | Model, controller, tabel | `src/models/TiketSengketa.ts`; `src/controllers/TiketSengketaController.ts`; `src/db/migrations/0001_init.sql` — `tiket_sengketa` | Pembuatan, pembatalan, bukti, dan peninjauan tiket |
| C13 | RiwayatSengketa | Tabel append-only dan operasi tiket | `src/db/migrations/0001_init.sql` — `riwayat_sengketa`; `src/db/migrations/0002_immutability.sql`; `src/controllers/TiketSengketaController.ts` | Riwayat dicatat dalam tabel dengan trigger pencegah update/delete |
| C14 | Notifikasi | Model, controller, tabel | `src/models/Notifikasi.ts`; `src/controllers/NotifikasiController.ts`; `src/db/migrations/0001_init.sql` — `notifikasi` | Pengiriman, daftar, dan status dibaca |
| C15 | PaymentGateway | Controller dan adapter mock | `src/controllers/PaymentGatewayController.ts`; `src/controllers/MockGatewayController.ts`; `src/controllers/TagihanPembayaranController.ts` | Integrasi yang tersedia saat ini adalah gateway mock |
| C16 | PenggunaUI | Halaman dan komponen React | `src/app/daftar/page.tsx`; `src/app/masuk/page.tsx`; `src/views/AuthForm.tsx` | Registrasi dan login |
| C17 | TenagaKerjaUI | Halaman dan komponen React | `src/app/tk/page.tsx`; `src/app/tk/verifikasi/page.tsx`; `src/app/tk/lamaran/page.tsx`; `src/views/dompet/HalamanDompet.tsx` | Ruang kerja tenaga kerja, verifikasi, lamaran, dan dompet |
| C18 | PenyediaKerjaUI | Halaman dan komponen React | `src/app/pk/page.tsx`; `src/app/pk/lowongan/page.tsx`; `src/app/pk/lowongan/pasang/page.tsx`; `src/app/pk/lowongan/[id]/page.tsx`; `src/app/pk/lowongan/[id]/pelamar/page.tsx` | Ruang kerja penyedia, lowongan, dan pelamar |
| C19 | CustomerServiceUI | Halaman React | `src/app/cs/page.tsx`; `src/app/cs/verifikasi/page.tsx`; `src/app/cs/tiket/page.tsx`; `src/app/cs/tiket/[id]/page.tsx` | Dashboard CS, antrean verifikasi, dan tiket |
| C20 | LowonganPekerjaanUI | Halaman dan komponen React | `src/app/lowongan/page.tsx`; `src/app/lowongan/[id]/page.tsx`; `src/app/pk/lowongan/page.tsx`; `src/app/pk/lowongan/pasang/page.tsx` | Pencarian/detail lowongan dan pengelolaan lowongan |
| C21 | PengajuanPenawaranUI | Komponen dan halaman React | `src/views/penawaran/DialogPenawaran.tsx`; `src/views/penawaran/DialogTarikPenawaran.tsx`; `src/views/penawaran/DaftarLamaran.tsx`; `src/app/tk/lamaran/page.tsx`; `src/app/pk/lowongan/[id]/pelamar/page.tsx` | Form/dialog penawaran, daftar lamaran, dan seleksi pelamar |
| C22 | TransaksiPekerjaanUI | Halaman dan komponen React | `src/views/transaksi/HalamanDaftarTransaksi.tsx`; `src/views/transaksi/DetailTransaksi.tsx`; `src/app/pk/transaksi/[id]/page.tsx`; `src/app/tk/pekerjaan/[id]/page.tsx` | Daftar dan detail alur transaksi per peran |
| C23 | BuktiPenyerahanUI | Komponen dan halaman React | `src/views/transaksi/DetailTransaksi.tsx`; `src/app/api/transaksi/[id]/bukti/route.ts` | Interaksi unggah dan tampilan bukti berada dalam detail transaksi |
| C24 | TagihanPembayaranUI | Komponen dan halaman React | `src/views/transaksi/TagihanPembayaranUI.tsx`; `src/app/pk/transaksi/[id]/bayar/page.tsx`; `src/app/mock-gateway/[idTagihan]/page.tsx` | Tagihan dan mock pembayaran |
| C25 | PencairanDanaUI | Komponen React | `src/views/dompet/HalamanDompet.tsx`; `src/views/dompet/DompetUI.tsx` | Saldo, riwayat mutasi, dan permintaan pencairan |
| C26 | UlasanRatingUI | Komponen dan halaman React | `src/views/transaksi/FormUlasanTransaksi.tsx`; `src/app/tk/pekerjaan/[id]/ulasan/page.tsx`; `src/app/pk/transaksi/[id]/ulasan/page.tsx` | Form ulasan dari sisi pekerja dan penyedia |
| C27 | TiketSengketaUI | Halaman React | `src/app/tiket/[id]/page.tsx`; `src/app/cs/tiket/page.tsx`; `src/app/cs/tiket/[id]/page.tsx` | Pengguna dan CS mengakses alur tiket sesuai peran |
| C28 | RiwayatSengketaUI | Halaman detail tiket | `src/app/tiket/[id]/page.tsx`; `src/app/cs/tiket/[id]/page.tsx` | Riwayat ditampilkan sebagai bagian dari detail tiket, bukan UI terpisah |
| C29 | NotifikasiUI | Komponen React | `src/views/NotificationBell.tsx` | Daftar/pemberitahuan dibaca dari komponen navigasi |
| C30 | PaymentGatewayUI | Komponen dan halaman React | `src/views/MockGatewayUI.tsx`; `src/app/mock-gateway/[idTagihan]/page.tsx` | UI hanya untuk simulasi gateway |
| C31 | PenggunaController | Controller | `src/controllers/PenggunaController.ts` | Registrasi, login, dan logout |
| C32 | TenagaKerjaController | Controller | `src/controllers/TenagaKerjaController.ts` | Pengajuan dan pemeriksaan status verifikasi pekerja |
| C33 | PenyediaKerjaController | Operasi pada beberapa controller | `src/controllers/LowonganPekerjaanController.ts`; `src/controllers/PengajuanPenawaranController.ts` | Tanggung jawab dipecah berdasarkan lowongan dan seleksi pelamar |
| C34 | CustomerServiceController | Controller | `src/controllers/CustomerServiceController.ts`; `src/controllers/TiketSengketaController.ts` | Verifikasi identitas dan penanganan tiket |
| C35 | LowonganPekerjaanController | Controller | `src/controllers/LowonganPekerjaanController.ts` | CRUD, pencarian, dan detail lowongan |
| C36 | PengajuanPenawaranController | Controller | `src/controllers/PengajuanPenawaranController.ts` | Pengajuan/penarikan penawaran dan seleksi pelamar |
| C37 | TransaksiPekerjaanController | Controller | `src/controllers/TransaksiPekerjaanController.ts` | Daftar/detail transaksi, persetujuan, revisi, dan ulasan |
| C38 | BuktiPenyerahanController | Controller dan layanan berkas | `src/controllers/TransaksiBuktiController.ts`; `src/controllers/BerkasController.ts` | Operasi transaksi dipisah dari akses berkas |
| C39 | TagihanPembayaranController | Controller | `src/controllers/TagihanPembayaranController.ts` | Pembuatan, pembayaran, kedaluwarsa, dan refund |
| C40 | PencairanDanaController | Operasi pada controller dompet | `src/controllers/DompetController.ts` | Pengajuan dan pengulangan pencairan |
| C41 | UlasanRatingController | Operasi pada controller transaksi | `src/controllers/TransaksiPekerjaanController.ts` | Operasi ulasan menjadi bagian dari transaksi |
| C42 | TiketSengketaController | Controller | `src/controllers/TiketSengketaController.ts` | Pembuatan, detail, pembatalan, bukti, dan antrean tiket |
| C43 | RiwayatSengketaController | Operasi pada controller tiket dan tabel | `src/controllers/TiketSengketaController.ts`; `src/db/migrations/0001_init.sql` — `riwayat_sengketa` | Pencatatan riwayat dilakukan pada proses tiket; tidak ada controller terpisah |
| C44 | NotifikasiController | Controller | `src/controllers/NotifikasiController.ts` | Pengiriman, pengambilan daftar, dan penandaan dibaca |
| C45 | PaymentGatewayController | Controller dan mock gateway | `src/controllers/PaymentGatewayController.ts`; `src/controllers/MockGatewayController.ts` | Webhook pembayaran dan simulasi gateway lokal |
