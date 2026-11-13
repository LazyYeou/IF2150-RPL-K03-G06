# Kerja-In — IF2150 K03 G06 (Shifu)

Kerja-In adalah marketplace jasa harian sektor informal. **Penyedia Kerja (PK)** memasang lowongan, memilih pelamar, membayar tagihan, dan memeriksa hasil kerja. **Tenaga Kerja (TK)** mengajukan penawaran, mengirim bukti pekerjaan, menerima upah, dan mengajukan pencairan. **Customer Service (CS)** memverifikasi identitas dan menangani sengketa.

Panduan ini mencakup delapan butir [spesifikasi M9 §A.5](../docs/M9/KXX_GYY_Implementasi.md#a5-isi-minimal-srcreadmemd). Aplikasi memakai SQLite lokal dan **payment gateway mock secara default**: tidak perlu Docker, akun cloud, atau API key untuk mencoba aplikasi. Mock adalah simulasi, tidak memindahkan uang sungguhan.

**Aplikasi online (Railway): [Buka Kerja-In](https://if2150-rpl-k03-g06-production.up.railway.app/)**

Panduan instalasi lokal dan akun seed di bawah berlaku untuk lingkungan lokal. Ketersediaan akun/data uji serta provider pembayaran pada deployment mengikuti konfigurasi server Railway.

## 1. Teknologi dan prasyarat

Versi paket berikut diambil dari [package-lock.json](package-lock.json); gunakan `npm ci` agar instalasi mengikuti lockfile.

| Komponen          | Versi                                                                   |
| ----------------- | ----------------------------------------------------------------------- |
| Runtime           | Node.js 22 (sama dengan CI); uji lokal: 22.23.4, npm 10.9.9             |
| Bahasa            | TypeScript 5.9.3                                                        |
| Framework dan UI  | Next.js 15.5.29, React / React DOM 19.1.0                               |
| Styling           | Tailwind CSS 4.3.4; komponen shadcn/ui di `components/ui/`              |
| Basis data        | SQLite 3.49.2 melalui `better-sqlite3` 11.10.0; WAL, foreign keys, FTS5 |
| Form dan validasi | React Hook Form 7.91.0, Zod 3.25.76                                     |
| Hash password     | `@node-rs/argon2` 2.2.2 (Argon2id)                                      |
| Pengujian         | Vitest 2.1.9, Playwright 1.64.1                                         |
| Pemeriksaan kode  | ESLint 9.39.5, Prettier 3.9.10, TypeScript                              |

Pasang Git, Node.js 22 dan npm. Periksa dengan `git --version`, `node --version`, dan `npm --version`. Internet diperlukan untuk instalasi paket/browser serta pengambilan font Google saat build. SQLite terbundel dalam dependensi; tidak perlu memasang server SQLite terpisah. Gunakan versi Node yang sama saat instalasi dan menjalankan aplikasi.

## 2. Instalasi dari clone bersih

Contoh ini memakai branch integrasi `dev`. Untuk memverifikasi rilis, checkout tag/commit yang disepakati tim sebelum instalasi dan catat hasil `git rev-parse HEAD`.

```sh
git clone --branch dev https://github.com/LazyYeou/IF2150-RPL-K03-G06.git
cd IF2150-RPL-K03-G06/src
npm ci
```

Semua perintah npm berikut dijalankan dari **`src`**. Salin template konfigurasi **sekali**:

```powershell
# Windows PowerShell
Copy-Item .env.example .env.local
```

```sh
# Linux / macOS / WSL
cp .env.example .env.local
```

Jangan menimpa `.env.local` yang sudah berisi konfigurasi. Buat dua nilai acak terpisah dengan menjalankan perintah berikut dua kali. Salin hasil pertama ke `FILE_ENCRYPTION_KEY` dan hasil kedua ke `PAYMENT_WEBHOOK_SECRET` di `.env.local`:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Pertahankan `PAYMENT_PROVIDER=mock` dan `APP_URL=http://localhost:3000` untuk setup awal. Setelah konfigurasi terisi:

```sh
npm run db:reset
npm run dev
```

Buka **http://localhost:3000**, lalu `/masuk`. Hentikan server dengan `Ctrl+C`.

**`db:reset` menghapus database pada `DATABASE_PATH`, menjalankan semua migrasi, lalu memasukkan seed.** Pakai pada setup baru atau bila sengaja ingin mengulang data uji. Perintah ini tidak membersihkan direktori berkas unggahan. Jangan gunakan untuk memperbarui DB yang datanya ingin disimpan.

Hook `predev` otomatis menjalankan migrasi dan menyiapkan seed jika DB belum ada atau tabel pengguna kosong. DB yang sudah berisi pengguna dipertahankan. `npm run build` dan `npm start` tidak menjalankan hook ini; siapkan DB lebih dahulu.

## 3. Konfigurasi dan pemeliharaan data

Template lengkap: [.env.example](.env.example). Nilai lokal ada di `.env.local`, yang diabaikan Git. Jangan menaruh kunci sebenarnya di `.env.example` atau variabel `NEXT_PUBLIC_*`. Restart server setelah mengganti konfigurasi.

| Variabel                 | Nilai / kegunaan                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------- |
| `DATABASE_PATH`          | `./data/kerjain.db`, relatif terhadap `src` saat menjalankan perintah di atas          |
| `STORAGE_DIR`            | `./storage`, berkas identitas, bukti pekerjaan dan sengketa                            |
| `FILE_ENCRYPTION_KEY`    | Wajib untuk fitur enkripsi: 64 karakter hex (32 byte), dibuat sendiri                  |
| `APP_URL`                | `http://localhost:3000`; cocokkan dengan origin browser untuk CSRF dan tautan reset    |
| `TRUST_PROXY`            | `false`; aktifkan hanya di belakang proxy tepercaya yang menimpa header IP             |
| `COMMISSION_RATE`        | `0.05`, biaya layanan = pembulatan tarif × upah                                        |
| `PAYMENT_EXPIRY_HOURS`   | `24`, masa berlaku tagihan                                                             |
| `PAYMENT_PROVIDER`       | `mock` untuk pengembangan tanpa layanan eksternal; `midtrans` untuk integrasi opsional |
| `PAYMENT_WEBHOOK_SECRET` | Rahasia acak untuk HMAC callback mock; ganti nilai contoh                              |
| `MIDTRANS_SERVER_KEY`    | Opsional pada mock; Server Key Snap/Core untuk mode Midtrans                           |
| `MIDTRANS_IS_PRODUCTION` | `false` untuk sandbox; jangan aktifkan produksi untuk pengujian                        |
| `MIDTRANS_IRIS_API_KEY`  | Opsional pada mock; API key Iris Creator untuk pencairan, berbeda dari Server Key      |

**Jangan mengganti `FILE_ENCRYPTION_KEY` setelah menyimpan data terenkripsi.** Simpan kunci beserta backup secara aman: tanpa kunci lama, identitas dan rekening lama tidak bisa didekripsi.

### Upgrade database yang sudah ada

Hentikan server, backup DB dan `storage/` saat tidak ada proses penulis, serta pertahankan kunci lama. Setelah mengambil kode terbaru:

```sh
npm ci
npm run db:migrate
```

Migrasi SQL dijalankan berurutan dan dicatat di `_migrasi`; migrasi yang sudah diterapkan tidak diulang. Jika DB berasal dari versi sebelum perlindungan rekening, jalankan maintenance berikut satu kali dengan kunci lama yang benar:

```sh
npm run db:protect-accounts
```

Kemudian `npm run dev`. Detail upgrade rekening/refund: [review-fixes.md](docs/review-fixes.md). Tidak perlu `db:reset` setiap pull atau setiap menjalankan aplikasi.

### Midtrans (opsional)

Isi Server Key **sandbox** di `.env.local`, ubah `PAYMENT_PROVIDER=midtrans`, dan pertahankan `MIDTRANS_IS_PRODUCTION=false`. Pencairan memerlukan key Iris tersendiri. Webhook `/api/webhooks/payment` harus bisa dijangkau gateway melalui HTTPS publik; localhost saja tidak dapat menerima webhook eksternal.

Ikuti [panduan Midtrans](docs/midtrans.md) untuk konfigurasi, approval Iris, format bank dan rekonsiliasi. Hasil gateway yang belum pasti tidak boleh dianggap pembayaran berhasil atau diulang sebagai transfer baru secara sembarang. Pengujian otomatis menggunakan mock/stub, bukan bukti pembayaran langsung di sandbox/produksi.

## 4. Menjalankan aplikasi dan pengujian

| Perintah                     | Fungsi                                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| `npm run dev`                | Server pengembangan; hook `predev` menyiapkan DB                                         |
| `npm run build`              | Build aplikasi produksi                                                                  |
| `npm start`                  | Jalankan hasil build pada port 3000; siapkan DB dan build dahulu                         |
| `npm run lint`               | Pemeriksaan ESLint                                                                       |
| `npm run typecheck`          | Pemeriksaan TypeScript; bila tipe route Next belum ada, build dahulu                     |
| `npm test`                   | Unit dan integrasi Vitest di `tests/unit/` dan `tests/integration/`                      |
| `npm run test:e2e:transaksi` | Suite browser transaksi, akses, paginasi, penawaran dan dialog dengan fixture terisolasi |
| `npm run test:e2e:penawaran` | Subset suite terisolasi untuk UI penawaran                                               |

Pemeriksaan dasar dari setup baru:

```sh
npm run lint
npm test
npm run build
npm run typecheck
```

Untuk suite browser terisolasi, install Chromium sekali dan build ulang bila kode aplikasi berubah:

```sh
npx playwright install chromium
npm run build
npm run test:e2e:transaksi
```

Runner membuat DB dan storage sementara, menyalakan hasil build di **port 3117**, dan membersihkan fixture setelah selesai. Pastikan port itu kosong. Untuk happy path lengkap:

```powershell
# PowerShell
$env:TRANSAKSI_E2E_SUITE = 'happy-path'
npm run test:e2e:transaksi
Remove-Item Env:TRANSAKSI_E2E_SUITE
```

```sh
# Linux / macOS / WSL
TRANSAKSI_E2E_SUITE=happy-path npm run test:e2e:transaksi
```

`npm run test:e2e` memakai konfigurasi lain yang dapat menggunakan server port 3000 dan data lokal. Untuk perintah ini, siapkan lingkungan/DB khusus pengujian; jangan arahkan ke data yang ingin dipertahankan. Konfigurasi: [Vitest](vitest.config.ts), [Playwright terisolasi](playwright.transaksi.config.ts), [CI](../.github/workflows/ci.yml).

## 5. Akun dan skenario uji

Sesudah seed standar, **semua akun berikut memakai password `Password123!`**. Ini akun fiktif lokal dari [db/seed.ts](db/seed.ts), bukan kredensial layanan eksternal.

| Email              | Peran / kondisi                        | Tujuan percobaan                                    |
| ------------------ | -------------------------------------- | --------------------------------------------------- |
| `tk1@kerjain.test` | TK terverifikasi, saldo awal Rp500.000 | Penawaran, pekerjaan, pengiriman bukti dan dompet   |
| `tk2@kerjain.test` | TK belum terverifikasi                 | Pengajuan verifikasi dan pembatasan fitur TK        |
| `tk3@kerjain.test` | TK menunggu verifikasi                 | Kondisi antrean verifikasi                          |
| `pk1@kerjain.test` | PK                                     | Lowongan, pelamar, pembayaran dan pemeriksaan hasil |
| `cs1@kerjain.test` | CS dengan hak ADMIN                    | Verifikasi identitas dan sengketa                   |

Seed berisi **30 lowongan** (25 terbuka dan 5 terkait transaksi), 5 transaksi pada status menunggu pembayaran, sedang dikerjakan, menunggu pemeriksaan, selesai, dan disengketakan; serta 1 tiket sengketa aktif. ID dibuat acak setiap reset.

Langkah percobaan singkat:

1. Masuk sebagai PK, buka dashboard `/pk`, daftar transaksi dan tagihan pekerjaan yang menunggu pembayaran. Mode mock mengarahkan ke simulator `/mock-gateway/[idTagihan]`; pilih hasil pembayaran di sana.
2. Masuk sebagai `tk1`, buka `/tk`, pilih pekerjaan yang sedang dikerjakan, lalu kirim deskripsi dan JPG/PNG/PDF milik sendiri (maksimal 10 MB).
3. Masuk kembali sebagai PK untuk memeriksa hasil, menyetujui atau meminta revisi. Periksa saldo TK dan coba pencairan mock.
4. Masuk sebagai CS melalui akun seed untuk melihat antrean verifikasi dan tiket sengketa.

**Batas seed:** path bukti pekerjaan dan status verifikasi tersedia untuk demonstrasi, tetapi berkas fisiknya tidak dibuat. `tk3` tidak memiliki dokumen identitas seed untuk dibuka; uji verifikasi lengkap memakai TK yang benar-benar mengunggah dokumen uji (maksimal 5 MB). Jangan memakai data identitas asli. Untuk menguji unduhan bukti, unggah bukti baru melalui aplikasi.

Fitur lupa sandi mencetak tautan pemulihan ke **terminal server**, bukan mengirim email sungguhan. Gunakan akun seed atau email akun yang baru didaftarkan.

## 6. Modul dan pembagian anggota

Pembagian utama mengikuti [PRD](docs/PRD.md) dan [kontrak modul](docs/contracts/modules.md). Kontribusi lintas modul/perbaikan integrasi tercatat di riwayat commit/PR.

| Anggota  | Tanggung jawab utama                                                                             | Lokasi implementasi                                                                      |
| -------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Davin    | Skema/migrasi/seed, autentikasi/sesi, profil, notifikasi, layout per peran dan komponen bersama  | `db/`, `lib/auth/`, controller auth/profil/notifikasi, `views/layout/`, `components/ui/` |
| Aditya   | Frontend alur verifikasi, lowongan, penawaran/pemilihan pelamar, pembayaran, dompet dan sengketa | `app/`, `views/`, fixture frontend                                                       |
| Ridwan   | Project lead; backend verifikasi, lowongan, penawaran/pemilihan TK, storage dan sengketa         | Controller/model domain, `lib/storage.ts`, `lib/validation/`                             |
| Karmel   | Gateway pembayaran, tagihan, dompet, pencairan dan refund                                        | `lib/payment/`, controller/model pembayaran dan pencairan                                |
| Sebastio | State machine, detail/timeline transaksi, bukti, pemeriksaan hasil dan ulasan                    | `models/statusMachine.ts`, controller/model transaksi dan ulasan, `views/transaksi/`     |

Fitur mencakup registrasi/login/logout/reset sandi; profil, privasi/S&K dan 404; pencarian lowongan dengan FTS5; pencarian/profil TK dan undangan; penawaran dan pemilihan TK; pembayaran mock dengan adapter Midtrans opsional; transaksi/bukti/revisi; persetujuan hasil dan saldo; pencairan; rating/ulasan; verifikasi CS, sengketa dan notifikasi in-app. Endpoint dan izin: [contracts/api.md](docs/contracts/api.md).

Struktur: `app/` untuk halaman/API, `controllers/` untuk orkestrasi/otorisasi, `models/` untuk akses data, `views/` dan `components/` untuk UI, `lib/` untuk layanan bersama, `scripts/` untuk CLI, dan `tests/` untuk pengujian.

## 7. Tabel dan skema database

Skema yang diterapkan ada di [db/migrations/](db/migrations/). Atribut, tipe, foreign key, CHECK, indeks dan relasi dasar dijelaskan di [kontrak database](docs/contracts/db.md). Migrasi menjadi rujukan penambahan setelah dokumen kontrak tersebut.

| Kelompok                    | Tabel                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------- |
| Akun dan autentikasi        | `pengguna`, `sesi`, `reset_sandi`, `tenaga_kerja`, `penyedia_kerja`, `customer_service` |
| Lowongan dan penawaran      | `lowongan_pekerjaan`, `pengajuan_penawaran`, `lowongan_tersimpan`, `undangan_pekerjaan` |
| Pekerjaan                   | `transaksi_pekerjaan`, `bukti_penyerahan`, `catatan_revisi`                             |
| Pembayaran dan saldo        | `tagihan_pembayaran`, `pencairan_dana`, `mutasi_saldo`, `log_gateway`                   |
| Sengketa dan reputasi       | `tiket_sengketa`, `bukti_sengketa`, `riwayat_sengketa`, `ulasan_rating`                 |
| Notifikasi                  | `notifikasi`                                                                            |
| Operasi gateway dan migrasi | `pengiriman_pencairan`, `operasi_refund`, `operasi_midtrans`, `_migrasi`                |
| Indeks pencarian virtual    | `lowongan_fts` (FTS5 dan tabel internal yang dikelola SQLite)                           |

Migrasi: [0001 skema dasar](db/migrations/0001_init.sql), [0002 append-only](db/migrations/0002_immutability.sql), [0003 pengiriman pencairan](db/migrations/0003_pengiriman_pencairan.sql), [0004 operasi refund](db/migrations/0004_operasi_refund.sql), [0005 operasi Midtrans](db/migrations/0005_operasi_midtrans.sql), [0006 FTS5](db/migrations/0006_fts.sql), dan [0007 undangan](db/migrations/0007_undangan.sql). `_migrasi` dibuat oleh [runner migrasi](scripts/migrate.ts).

Berkas berada di `storage/`, bukan `public/`; DB menyimpan path-nya. Backup mencakup DB, storage, dan kunci enkripsi. Jangan commit DB, unggahan, atau `.env.local`.

## 8. Troubleshooting

Temuan tim berasal dari [issue setup #6](https://github.com/LazyYeou/IF2150-RPL-K03-G06/issues/6) dan [panduan kontribusi](docs/CONTRIBUTING.md). Komentar issue mencatat kegagalan kompilasi `better-sqlite3` karena toolchain C++ belum terpasang, serta pergantian versi Node. Anggota melaporkan Node 22 dan 24; panduan ini memakai Node 22 agar sama dengan CI.

| Gejala                                                                                   | Langkah penanganan                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `better-sqlite3` / `@node-rs/argon2` gagal dipasang, `node-gyp` / compiler C++ tidak ada | Pastikan Node 22 dan arsitektur Node sesuai mesin (`node -p "process.platform + ' ' + process.arch"`). Bila perlu kompilasi, pasang Python dan Visual Studio Build Tools dengan workload **Desktop development with C++**, atau pakai Node di WSL. Jalankan `npm ci` lagi dari lingkungan yang sama. Jangan berbagi `node_modules` Windows dan WSL. |
| `NODE_MODULE_VERSION` tidak cocok setelah ganti Node                                     | Hentikan server lalu `npm ci` ulang dengan versi Node yang dipakai menjalankan aplikasi.                                                                                                                                                                                                                                                            |
| PowerShell menolak `npm.ps1`                                                             | Gunakan `npm.cmd` dan `npx.cmd` sebagai pengganti npm/npx.                                                                                                                                                                                                                                                                                          |
| Warning deprecated / laporan audit setelah `npm ci`                                      | Bedakan warning dari exit code gagal. Tinjau `npm audit` terpisah; jangan menjalankan `npm audit fix --force` sebagai langkah setup karena dapat mengubah dependensi dan lockfile.                                                                                                                                                                  |
| Key enkripsi kosong / tidak valid                                                        | Isi `FILE_ENCRYPTION_KEY` dengan 64 karakter hex di `.env.local`, lalu restart. Untuk data lama gunakan key asli.                                                                                                                                                                                                                                   |
| `no such table` / skema tertinggal                                                       | Pastikan terminal di `src` dan `DATABASE_PATH` benar, hentikan server lalu `npm run db:migrate`. Jika DB baru hanya dimigrasi tanpa seed, `npm run dev` mengisi seed ketika pengguna kosong.                                                                                                                                                        |
| `database is locked`                                                                     | Hentikan server/CLI lain yang menulis DB yang sama; gunakan fixture terisolasi untuk test. Jangan menghapus DB untuk mengatasi lock.                                                                                                                                                                                                                |
| `Origin` ditolak (403)                                                                   | Cocokkan `APP_URL` dengan protokol, hostname dan port browser; `localhost` berbeda dari `127.0.0.1`. Restart server.                                                                                                                                                                                                                                |
| Login ditolak setelah banyak percobaan (429)                                             | Tunggu jendela pembatasan 15 menit; periksa email/password seed.                                                                                                                                                                                                                                                                                    |
| Bukti/identitas seed tidak bisa diunduh                                                  | Seed tidak menyediakan file fisik; unggah dokumen uji sendiri sesuai §5.                                                                                                                                                                                                                                                                            |
| Browser Playwright belum terpasang / port 3117 dipakai                                   | Jalankan `npx playwright install chromium`; hentikan proses lain pada port 3117 sebelum suite terisolasi.                                                                                                                                                                                                                                           |
| Build gagal mengambil font Google                                                        | Pastikan akses jaringan ke layanan font tersedia.                                                                                                                                                                                                                                                                                                   |
| Midtrans 401 / hasil gateway belum pasti                                                 | Periksa pasangan key dan lingkungan sandbox, restart, lalu ikuti [rekonsiliasi](docs/midtrans.md). Jangan reset DB atau mengubah status pembayaran secara manual.                                                                                                                                                                                   |

## 9. Verifikasi clone bersih (issue #47)

Catatan pemeriksaan lokal: [readme-clone-check.md](docs/readme-clone-check.md). Pengujian otomatis di mesin penulis **tidak menggantikan** kriteria issue: anggota **selain Davin** harus clone ke direktori baru, mengikuti panduan ini, dan mencatat hasilnya sendiri di komentar [issue #47](https://github.com/LazyYeou/IF2150-RPL-K03-G06/issues/47).

Template komentar anggota penguji:

```text
Penguji: <nama selain Davin>
OS / arsitektur: <...>
Node / npm: <node --version; npm --version>
Branch/tag dan commit: <git rev-parse HEAD>
Clone baru, tanpa node_modules/.env.local/DB dari folder lama: ya/tidak
npm ci: <hasil>
Konfigurasi lokal dan db:reset: <hasil; jangan lampirkan key>
npm run dev + beranda + login TK/PK/CS: <hasil>
Lint / test / build / typecheck: <hasil bila dijalankan>
Kendala dan solusi: <...>
```

Centang butir uji anggota lain hanya setelah bukti tersebut tersedia. Alur kerja dan review: [CONTRIBUTING.md](docs/CONTRIBUTING.md).