<h1>
IF2150 REKAYASA PERANGKAT LUNAK
<br>
TUGAS 10
<br>
HASIL IMPLEMENTASI DAN UJI PERANGKAT LUNAK (HIUPL)
</h1>
<br>

## Kerja-In

<p align="center"><img alt="Logo Kerja-In" src="../M7/assets/logo.jpeg" width="240"></p>

### Untuk: Agatha Tatianingseto

Dipersiapkan oleh:
| Informasi | Keterangan |
| --- | --- |
| Kelas | 03 |
| Kelompok | 06 — Shifu |

| NIM | Nama |
| --- | --- |
| 13525033 | Davin Farel Santoso |
| 13525039 | Aditya Rasyid |
| 13525096 | Muhammad Ridwan Nasir Firdaus |
| 13525102 | Karmel Tua Haloho |
| 13525123 | Sebastio Nugroho |

---

## Daftar Isi

- [BAB 1: Pendahuluan](#bab-1-pendahuluan)
  - [1.1 Tujuan Penulisan Dokumen](#11-tujuan-penulisan-dokumen)
  - [1.2 Lingkup Masalah](#12-lingkup-masalah)
  - [1.3 Definisi, Istilah, dan Singkatan](#13-definisi-istilah-dan-singkatan)
  - [1.4 Aturan Penomoran](#14-aturan-penomoran)
  - [1.5 Referensi](#15-referensi)
  - [1.6 Deskripsi Umum Dokumen (Ikhtisar)](#16-deskripsi-umum-dokumen-ikhtisar)
- [BAB 2: Deskripsi Umum Perangkat Lunak](#bab-2-deskripsi-umum-perangkat-lunak)
- [BAB 3: Implementasi](#bab-3-implementasi)
  - [3.1 Lingkungan Implementasi](#31-lingkungan-implementasi)
  - [3.2 Implementasi Modul](#32-implementasi-modul)
  - [3.3 Implementasi Antarmuka](#33-implementasi-antarmuka)
  - [3.4 File Lain](#34-file-lain)
- [BAB 4: Hasil Pengujian](#bab-4-hasil-pengujian)
  - [4.1 Strategi dan Kedalaman Pengujian Kelas](#41-strategi-dan-kedalaman-pengujian-kelas)
  - [4.2 Pengujian Unit Kelas](#42-pengujian-unit-kelas)
  - [4.3 Pengujian Integrasi](#43-pengujian-integrasi)
  - [4.4 Pengujian Use Case](#44-pengujian-use-case)
  - [4.5 Pengujian Kebutuhan Non-Fungsional (KNF)](#45-pengujian-kebutuhan-non-fungsional-knf)
  - [4.6 Tangkapan Layar dan Bukti Hasil Pengujian](#46-tangkapan-layar-dan-bukti-hasil-pengujian)
- [BAB 5: Traceability](#bab-5-traceability)

---

## Daftar Perubahan

| Revisi | Deskripsi |
| :--- | :--- |
| | |

---

# BAB 1: Pendahuluan

## 1.1 Tujuan Penulisan Dokumen

Dokumen ini mencatat hasil implementasi dan pengujian Kerja-In sebagai acuan tim pengembang, dosen, dan asisten untuk menilai kesesuaian perangkat lunak dengan SKPL dan DPPL.

## 1.2 Lingkup Masalah

Kerja-In merupakan platform marketplace jasa berbasis web yang mempertemukan Penyedia Kerja dengan Tenaga Kerja sektor informal untuk mempermudah pencarian dan penyediaan pekerjaan harian. Aplikasi ini mendukung registrasi dan verifikasi identitas, pengelolaan lowongan, pengajuan penawaran, pemilihan tenaga kerja, pembayaran melalui Payment Gateway, penyerahan dan pemeriksaan hasil pekerjaan, serta pencairan upah. Rating, ulasan, dan portofolio membantu pengguna menilai reputasi tenaga kerja, sedangkan Customer Service membantu menangani keluhan dan sengketa terkait penggunaan platform.

## 1.3 Definisi, Istilah, dan Singkatan

Tabel 1.3. Definisi Istilah dan Singkatan

| Singkatan, Akronim, atau Istilah | Penjelasan |
| :--- | :--- |
| P/L | Singkatan dari Perangkat Lunak, yaitu aplikasi yang memberikan perintah kepada komputer untuk menjalankan tugas tertentu. |
| SKPL | Singkatan dari Spesifikasi Kebutuhan Perangkat Lunak, yaitu dokumen yang merangkum kriteria-kriteria yang diperlukan untuk membangun aplikasi menjalankan tugasnya. |
| DPPL | Singkatan dari Deskripsi Perancangan Perangkat Lunak, yaitu dokumen yang menjelaskan rancangan arsitektur, kelas, dan antarmuka P/L. |
| HIUPL | Singkatan dari Hasil Implementasi dan Uji Perangkat Lunak, yaitu dokumen yang melaporkan hasil implementasi dan pengujian P/L. |
| KF | Singkatan dari Kebutuhan Fungsional. |
| KNF | Singkatan dari Kebutuhan Non-Fungsional. |
| UC | Singkatan dari Use Case. |
| TC | Singkatan dari Test Case, yaitu satu kasus uji untuk skenario tertentu. |
| UT | Singkatan dari Unit Test, yaitu test case tingkat kelas/operasi. |
| INT | Singkatan dari Integration Test, yaitu test case yang menguji interaksi antarkomponen. |
| Boundary | Kasus uji pada nilai batas masukan, misalnya nilai minimum, maksimum, atau tepat di ambang aturan. |
| Coverage | Persentase baris/cabang kode yang dieksekusi oleh pengujian. |
| APL | Arsitektur Perangkat Lunak. |
| CS | Customer Service. |
| PK | Penyedia Kerja. |
| TK | Tenaga Kerja. |

## 1.4 Aturan Penomoran

Tabel 1.4. Aturan Penomoran

| Hal/Bagian | Penomoran | Keterangan |
| :--- | :--- | :--- |
| Kebutuhan Fungsional | KFXX | Sesuai SKPL |
| Kebutuhan Non-Fungsional | KNFXX | Sesuai SKPL |
| Use Case | UCXX | Sesuai SKPL |
| Kelas | CXX | Sesuai DPPL |
| Antarmuka | I-XX | Sesuai DPPL |
| Test Case Unit | CXX-UTYY | XX adalah nomor kelas, YY adalah nomor urut test case unit pada kelas tersebut |
| Test Case Integrasi | INT-TCYY | YY adalah nomor urut test case integrasi |
| Test Case Use Case | UCXX-TCYY | XX adalah nomor use case, YY adalah nomor urut test case pada use case tersebut |
| Test Case KNF | KNFXX-TCYY | XX adalah nomor KNF, YY adalah nomor urut test case pada KNF tersebut |
| Antarmuka integrasi | AI-XX | Nomor urut batas antarkomponen. |
| Algoritma | Algo-NNN | Sesuai DPPL2. |

## 1.5 Referensi

1. [SKPL (M5)](../M5/K03_G06_SKPL.md)
2. [APL (M6)](../M6/K03_G06_APL.md)
3. [DPPL2 (M8)](../M8/K03_G06_DPPL2.md)
4. [Laporan Implementasi (M9)](../M9/K03_G06_Implementasi.md)
5. [Panduan implementasi Kerja-In](../../src/README.md)
6. [Next.js](https://nextjs.org/docs), [React](https://react.dev/), [SQLite](https://sqlite.org/docs.html)
7. [Vitest](https://v2.vitest.dev/guide/), [Playwright](https://playwright.dev/docs/intro)
8. *Asistensi Akbar Tugas 10: Hasil Implementasi dan Uji Perangkat Lunak*, Laboratorium Rekayasa Perangkat Lunak IF2150.

## 1.6 Deskripsi Umum Dokumen (Ikhtisar)

Bab 1 memuat tujuan dan acuan. Bab 2 menggambarkan perangkat lunak. Bab 3 mencatat lingkungan, modul, antarmuka, dan file implementasi. Bab 4 memuat pengujian unit, integrasi, use case, dan KNF terkait UC01 dan UC02 beserta buktinya. Bab 5 memetakan kebutuhan ke implementasi dan test case.

<br>

---

# BAB 2: Deskripsi Umum Perangkat Lunak

Kerja-In mengelola akun, lowongan, pekerjaan, pembayaran, dan sengketa. Data dan berkas disimpan di SQLite dan penyimpanan aplikasi. Pembayaran dan pencairan disimulasikan oleh Payment Gateway dummy lokal.

```mermaid
flowchart LR
  Browser[Browser: TK, PK, CS] --> UI
  subgraph KI[Kerja-In]
    UI[Antarmuka Next.js] --> API[Route Handler dan Controller]
    API --> Model[Model]
    Model --> DB[(SQLite)]
    API --> File[(Penyimpanan berkas)]
    API --> Adapter[Adapter pembayaran]
    Adapter <-->|Permintaan dan callback simulasi| Mock[Payment Gateway dummy lokal]
  end
```

*Gambar 2.1. Batas sistem dan hubungan antarkomponen Kerja-In.*

<p align="center"><img alt="Use Case Diagram Kerja-In" src="../M5/assets/diagram/uc-diagram.jpg" width="90%"></p>

*Gambar 2.2. Use Case Diagram Kerja-In.*

Tenaga Kerja mencari pekerjaan dan menyerahkan hasil. Penyedia Kerja mengelola lowongan, memilih pelamar, membayar, dan memeriksa hasil. Customer Service memverifikasi identitas dan menangani sengketa.

<br>

---

# BAB 3: Implementasi

## 3.1 Lingkungan Implementasi

Tabel 3.1. Lingkungan Implementasi

| Aspek | Keterangan |
| :--- | :--- |
| Hardware | Intel Core Ultra 7 258V, RAM 32 GB |
| Operating System | Windows 11 (build 26200) |
| Bahasa Pemrograman | TypeScript 5.9.3, JavaScript, HTML, CSS, SQL |
| Framework/Library | Node.js 22.23.4, Next.js 15.5.29, React 19.1.0, Tailwind CSS 4.3.4, Zod 3.25.76 |
| DBMS | SQLite 3.49.2 melalui better-sqlite3 11.10.0 menggantikan PostgreSQL/Supabase dalam DPPL2. Sesi, autentikasi Argon2id, dan penyimpanan berkas dikelola oleh aplikasi. |
| Development Tools | Visual Studio Code, Git, npm |
| Testing Tools | Vitest 2.1.9, V8 Coverage, Playwright 1.64.1, Microsoft Edge, Chrome DevTools Protocol |

## 3.2 Implementasi Modul

Tabel 3.2. Implementasi Modul

| No | ID Kelas | Nama Modul/Kelas | Nama File Fisik | Nama File Executable |
| :--- | :--- | :--- | :--- | :--- |
| 1 | C01 | Pengguna | `src/models/Pengguna.ts`<br>`src/controllers/PenggunaController.ts`<br>`src/db/migrations/0001_init.sql` | — |
| 2 | C02 | TenagaKerja | `src/models/TenagaKerja.ts`<br>`src/controllers/TenagaKerjaController.ts`<br>`src/db/migrations/0001_init.sql` | — |
| 3 | C03 | PenyediaKerja | `src/db/migrations/0001_init.sql`<br>`src/controllers/LowonganPekerjaanController.ts`<br>`src/controllers/PengajuanPenawaranController.ts` | — |
| 4 | C04 | CustomerService | `src/controllers/CustomerServiceController.ts`<br>`src/controllers/TiketSengketaController.ts`<br>`src/db/migrations/0001_init.sql` | — |
| 5 | C05 | LowonganPekerjaan | `src/models/LowonganPekerjaan.ts`<br>`src/controllers/LowonganPekerjaanController.ts`<br>`src/db/migrations/0001_init.sql` | — |
| 6 | C06 | PengajuanPenawaran | `src/models/PengajuanPenawaran.ts`<br>`src/controllers/PengajuanPenawaranController.ts`<br>`src/db/migrations/0001_init.sql` | — |
| 7 | C07 | TransaksiPekerjaan | `src/models/TransaksiPekerjaan.ts`<br>`src/models/statusMachine.ts`<br>`src/controllers/TransaksiPekerjaanController.ts`<br>`src/db/migrations/0001_init.sql` | — |
| 8 | C08 | BuktiPenyerahan | `src/models/BuktiPenyerahan.ts`<br>`src/controllers/TransaksiBuktiController.ts`<br>`src/controllers/BerkasController.ts`<br>`src/db/migrations/0001_init.sql` | — |
| 9 | C09 | TagihanPembayaran | `src/models/TagihanPembayaran.ts`<br>`src/controllers/TagihanPembayaranController.ts`<br>`src/db/migrations/0001_init.sql` | — |
| 10 | C10 | PencairanDana | `src/models/PencairanDana.ts`<br>`src/controllers/DompetController.ts`<br>`src/db/migrations/0001_init.sql` | — |
| 11 | C11 | UlasanRating | `src/db/migrations/0001_init.sql`<br>`src/controllers/TransaksiPekerjaanController.ts`<br>`src/views/transaksi/FormUlasanTransaksi.tsx` | — |
| 12 | C12 | TiketSengketa | `src/models/TiketSengketa.ts`<br>`src/controllers/TiketSengketaController.ts`<br>`src/db/migrations/0001_init.sql` | — |
| 13 | C13 | RiwayatSengketa | `src/db/migrations/0001_init.sql`<br>`src/db/migrations/0002_immutability.sql`<br>`src/controllers/TiketSengketaController.ts` | — |
| 14 | C14 | Notifikasi | `src/models/Notifikasi.ts`<br>`src/controllers/NotifikasiController.ts`<br>`src/db/migrations/0001_init.sql` | — |
| 15 | C15 | PaymentGateway | `src/controllers/PaymentGatewayController.ts`<br>`src/controllers/MockGatewayController.ts`<br>`src/controllers/TagihanPembayaranController.ts`<br>`src/lib/payment/adapter.ts`<br>`src/lib/payment/mock.ts` | — |
| 16 | C16 | PenggunaUI | `src/app/daftar/page.tsx`<br>`src/app/masuk/page.tsx`<br>`src/views/AuthForm.tsx` | — |
| 17 | C17 | TenagaKerjaUI | `src/app/tk/page.tsx`<br>`src/app/tk/verifikasi/page.tsx`<br>`src/app/tk/lamaran/page.tsx`<br>`src/views/dompet/HalamanDompet.tsx` | — |
| 18 | C18 | PenyediaKerjaUI | `src/app/pk/page.tsx`<br>`src/app/pk/lowongan/page.tsx`<br>`src/app/pk/lowongan/pasang/page.tsx`<br>`src/app/pk/lowongan/[id]/page.tsx`<br>`src/app/pk/lowongan/[id]/pelamar/page.tsx` | — |
| 19 | C19 | CustomerServiceUI | `src/app/cs/page.tsx`<br>`src/app/cs/verifikasi/page.tsx`<br>`src/app/cs/tiket/page.tsx`<br>`src/app/cs/tiket/[id]/page.tsx` | — |
| 20 | C20 | LowonganPekerjaanUI | `src/app/lowongan/page.tsx`<br>`src/app/lowongan/[id]/page.tsx`<br>`src/app/pk/lowongan/page.tsx`<br>`src/app/pk/lowongan/pasang/page.tsx` | — |
| 21 | C21 | PengajuanPenawaranUI | `src/views/penawaran/DialogPenawaran.tsx`<br>`src/views/penawaran/DialogTarikPenawaran.tsx`<br>`src/views/penawaran/DaftarLamaran.tsx`<br>`src/app/tk/lamaran/page.tsx`<br>`src/app/pk/lowongan/[id]/pelamar/page.tsx` | — |
| 22 | C22 | TransaksiPekerjaanUI | `src/views/transaksi/HalamanDaftarTransaksi.tsx`<br>`src/views/transaksi/DetailTransaksi.tsx`<br>`src/app/pk/transaksi/[id]/page.tsx`<br>`src/app/tk/pekerjaan/[id]/page.tsx` | — |
| 23 | C23 | BuktiPenyerahanUI | `src/views/transaksi/DetailTransaksi.tsx`<br>`src/app/api/transaksi/[id]/bukti/route.ts` | — |
| 24 | C24 | TagihanPembayaranUI | `src/views/transaksi/TagihanPembayaranUI.tsx`<br>`src/app/pk/transaksi/[id]/bayar/page.tsx`<br>`src/app/mock-gateway/[idTagihan]/page.tsx` | — |
| 25 | C25 | PencairanDanaUI | `src/views/dompet/HalamanDompet.tsx`<br>`src/views/dompet/DompetUI.tsx` | — |
| 26 | C26 | UlasanRatingUI | `src/views/transaksi/FormUlasanTransaksi.tsx`<br>`src/app/tk/pekerjaan/[id]/ulasan/page.tsx`<br>`src/app/pk/transaksi/[id]/ulasan/page.tsx` | — |
| 27 | C27 | TiketSengketaUI | `src/app/tiket/[id]/page.tsx`<br>`src/app/cs/tiket/page.tsx`<br>`src/app/cs/tiket/[id]/page.tsx` | — |
| 28 | C28 | RiwayatSengketaUI | `src/app/tiket/[id]/page.tsx`<br>`src/app/cs/tiket/[id]/page.tsx` | — |
| 29 | C29 | NotifikasiUI | `src/views/NotificationBell.tsx` | — |
| 30 | C30 | PaymentGatewayUI | `src/views/MockGatewayUI.tsx`<br>`src/app/mock-gateway/[idTagihan]/page.tsx` | — |
| 31 | C31 | PenggunaController | `src/controllers/PenggunaController.ts` | — |
| 32 | C32 | TenagaKerjaController | `src/controllers/TenagaKerjaController.ts` | — |
| 33 | C33 | PenyediaKerjaController | `src/controllers/LowonganPekerjaanController.ts`<br>`src/controllers/PengajuanPenawaranController.ts` | — |
| 34 | C34 | CustomerServiceController | `src/controllers/CustomerServiceController.ts`<br>`src/controllers/TiketSengketaController.ts` | — |
| 35 | C35 | LowonganPekerjaanController | `src/controllers/LowonganPekerjaanController.ts` | — |
| 36 | C36 | PengajuanPenawaranController | `src/controllers/PengajuanPenawaranController.ts` | — |
| 37 | C37 | TransaksiPekerjaanController | `src/controllers/TransaksiPekerjaanController.ts` | — |
| 38 | C38 | BuktiPenyerahanController | `src/controllers/TransaksiBuktiController.ts`<br>`src/controllers/BerkasController.ts` | — |
| 39 | C39 | TagihanPembayaranController | `src/controllers/TagihanPembayaranController.ts` | — |
| 40 | C40 | PencairanDanaController | `src/controllers/DompetController.ts` | — |
| 41 | C41 | UlasanRatingController | `src/controllers/TransaksiPekerjaanController.ts` | — |
| 42 | C42 | TiketSengketaController | `src/controllers/TiketSengketaController.ts` | — |
| 43 | C43 | RiwayatSengketaController | `src/controllers/TiketSengketaController.ts`<br>`src/db/migrations/0001_init.sql` | — |
| 44 | C44 | NotifikasiController | `src/controllers/NotifikasiController.ts` | — |
| 45 | C45 | PaymentGatewayController | `src/controllers/PaymentGatewayController.ts`<br>`src/controllers/MockGatewayController.ts`<br>`src/app/api/webhooks/payment/route.ts` | — |

## 3.3 Implementasi Antarmuka

Tabel 3.3. Implementasi Antarmuka

| No | ID Antarmuka | Nama Antarmuka | Nama File Fisik | Nama File Executable |
| :--- | :--- | :--- | :--- | :--- |
| 1 | I-01 | [Beranda](./assets/layar/I-01.png) | `src/app/page.tsx` | — |
| 2 | I-02 | [Pencarian Pekerjaan](./assets/layar/UC04-TC01.png) | `src/app/lowongan/page.tsx` | — |
| 3 | I-03 | [Detail Pekerjaan](./assets/layar/UC05-TC02.png) | `src/app/lowongan/[id]/page.tsx` | — |
| 4 | I-04 | Formulir Penawaran | `src/views/penawaran/DialogPenawaran.tsx` | — |
| 5 | I-05 | [Tinjau Penawaran](./assets/layar/I-05.png) | `src/views/penawaran/DialogPenawaran.tsx` | — |
| 6 | I-06 | Pencarian Tenaga Kerja | Belum ada layar; endpoint tersedia | — |
| 7 | I-07 | [Profil Tenaga Kerja](./assets/layar/UC11-TC01.png) | `src/app/profil/[id]/page.tsx` | — |
| 8 | I-08 | [Masuk](./assets/layar/I-08.png) | `src/app/masuk/page.tsx` | — |
| 9 | I-09 | [Daftar Akun](./assets/layar/I-09.png) | `src/app/daftar/page.tsx` | — |
| 10 | I-10 | [Pemulihan Kata Sandi](./assets/layar/I-10.png) | `src/app/lupa-sandi/page.tsx` | — |
| 11 | I-11 | [Dashboard Tenaga Kerja](./assets/layar/I-11.png) | `src/app/tk/page.tsx` | — |
| 12 | I-12 | [Dashboard Penyedia Kerja](./assets/layar/I-12.png) | `src/app/pk/page.tsx` | — |
| 13 | I-13 | [Lamaran Saya](./assets/layar/I-13.png) | `src/app/tk/lamaran/page.tsx` | — |
| 14 | I-14 | [Pekerjaan Saya](./assets/layar/I-14.png) | `src/app/tk/[section]/page.tsx` | — |
| 15 | I-15 | [Lowongan Saya](./assets/layar/I-15.png) | `src/app/pk/lowongan/page.tsx` | — |
| 16 | I-16 | [Pasang Pekerjaan — Detail](./assets/layar/I-16.png) | `src/features/jobs/job-posting-wizard.tsx` | — |
| 17 | I-17 | Pasang Pekerjaan — Lokasi dan Jadwal | `src/features/jobs/job-posting-wizard.tsx` | — |
| 18 | I-18 | Pasang Pekerjaan — Upah dan Ketentuan | `src/features/jobs/job-posting-wizard.tsx` | — |
| 19 | I-19 | Pasang Pekerjaan — Tinjau dan Terbitkan | `src/features/jobs/job-posting-wizard.tsx` | — |
| 20 | I-20 | [Dompet](./assets/layar/UC10-TC01.png) | `src/views/dompet/HalamanDompet.tsx` | — |
| 21 | I-21 | [Pemeriksaan dan Transaksi](./assets/layar/UC08-TC01.png) | `src/views/transaksi/DetailTransaksi.tsx` | — |
| 22 | I-22 | [Pengaturan Profil Saya](./assets/layar/I-22.png) | `src/app/profil/page.tsx` | — |
| 23 | I-23 | [Pusat Bantuan dan Keluhan](./assets/layar/I-23.png) | `src/app/bantuan/page.tsx` | — |
| 24 | I-24 | [Kebijakan Privasi](./assets/layar/I-24.png) | `src/app/privasi/page.tsx` | — |
| 25 | I-25 | [Syarat dan Ketentuan](./assets/layar/I-25.png) | `src/app/syarat/page.tsx` | — |
| 26 | I-26 | Undangan Tenaga Kerja | Belum ada layar; endpoint tersedia | — |
| 27 | I-27 | Konfirmasi Penarikan Penawaran | `src/views/penawaran/DialogTarikPenawaran.tsx` | — |
| 28 | I-28 | [Halaman Tidak Ditemukan](./assets/layar/I-28.png) | `src/app/not-found.tsx` | — |
| 29 | I-29 | Permintaan Revisi Pekerjaan | `src/views/transaksi/DetailTransaksi.tsx` | — |

## 3.4 File Lain

Tabel 3.4. File Lain

| No | Nama File | Keterangan |
| :--- | :--- | :--- |
| 1 | `src/package.json` | Dependensi dan perintah aplikasi |
| 2 | `src/package-lock.json` | Versi dependensi terkunci |
| 3 | `src/.env.example` | Template konfigurasi aplikasi |
| 4 | `src/next.config.ts` | Konfigurasi Next.js |
| 5 | `src/middleware.ts` | Pemeriksaan permintaan aplikasi |
| 6 | `src/db/migrations/` | Skema, indeks, dan trigger SQLite |
| 7 | `src/db/seed.ts` | Data uji fiktif |
| 8 | `src/lib/db.ts` | Akses basis data dan transaksi |
| 9 | `src/lib/auth/` | Sesi, hash, dan pemeriksaan peran |
| 10 | `src/lib/storage.ts` | Validasi dan penyimpanan berkas |
| 11 | `src/lib/payment/` | Adapter dan simulator Payment Gateway dummy |
| 12 | `src/vitest.config.ts` | Konfigurasi uji unit dan integrasi |
| 13 | `src/playwright.config.ts` | Konfigurasi uji browser |
| 14 | `src/tests/unit/` | Uji unit |
| 15 | `src/tests/integration/` | Uji integrasi |
| 16 | `src/tests/e2e/` | Uji antarmuka browser |

<br>

---

# BAB 4: Hasil Pengujian

Pengujian mencakup UC01 (registrasi dan login) dan UC02 (verifikasi identitas). Vitest mencatat 75 kasus lulus dari 75 kasus pada lima file uji terkait.

## 4.1 Strategi dan Kedalaman Pengujian Kelas

Tabel 4.1.1. Identifikasi Tingkat Pengujian Kelas

| ID Kelas | Nama Kelas | Tingkat | Alasan | Test Case Terkait |
| :--- | :--- | :--- | :--- | :--- |
| C01 | Pengguna | Mendalam | Pembuatan akun atomik dan penolakan email ganda | C01-UT01, C01-UT02, C01-UT03, C01-UT04, C01-UT05, C01-UT06, C01-UT07, C01-UT08, C01-UT09, C01-UT10, C01-UT11, C01-UT12, C01-UT13, C01-UT14, C01-UT15, C01-UT16, C01-UT17, C01-UT18, C01-UT19, C01-UT20, C01-UT21, C01-UT22, C01-UT23, C01-UT24, INT-TC01, INT-TC02 |
| C02 | TenagaKerja | Mendalam | Aturan transisi verifikasi | INT-TC04, INT-TC05 |
| C03 | PenyediaKerja | Tidak perlu | Data peran berupa tabel, tanpa kelas domain terpisah | INT-TC01, INT-TC02 |
| C04 | CustomerService | Tidak perlu | Data peran berupa tabel, tanpa kelas domain terpisah | INT-TC04, INT-TC05 |
| C16 | PenggunaUI | Tidak perlu | Antarmuka React diuji melalui alur pengguna | UC01-TC01, UC01-TC02, UC01-TC03 |
| C17 | TenagaKerjaUI | Tidak perlu | Antarmuka React diuji melalui alur pengguna | UC02-TC01, UC02-TC02, UC02-TC04 |
| C19 | CustomerServiceUI | Tidak perlu | Antarmuka React diuji melalui alur pengguna | UC02-TC01, UC02-TC03 |
| C31 | PenggunaController | Mendalam | Validasi usia, kredensial dan autentikasi | INT-TC01, INT-TC02 |
| C32 | TenagaKerjaController | Mendalam | Validasi dokumen dan status pengajuan | INT-TC04, INT-TC05 |
| C34 | CustomerServiceController | Mendalam | Otorisasi dan keputusan verifikasi | INT-TC04, INT-TC05 |

## 4.2 Pengujian Unit Kelas

Jalankan `npm test -- tests/unit/usia.test.ts` dari `src`. Cakupan per file diukur dengan Vitest dan V8 dari suite unit usia serta empat suite integrasi autentikasi dan verifikasi yang dicantumkan di Subbab 4.3.

### 4.2.1 Kelas Pengguna

**ID Kelas:** C01<br>
**Nama Kelas:** Pengguna<br>
**Tingkat:** Mendalam

Tabel 4.2.1. Hasil Pengujian Unit Kelas C01

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C01-UT01 | `validasiBatasUsia()` | Batas | sehari sebelum ulang tahun ke-17 | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT02 | `validasiBatasUsia()` | Batas | tepat ulang tahun ke-17 | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT03 | `validasiBatasUsia()` | Batas | sehari setelah ulang tahun ke-17 | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT04 | `validasiBatasUsia()` | Negatif | sebelum pergantian hari WIB | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT05 | `validasiBatasUsia()` | Batas | tepat tengah malam WIB | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT06 | `validasiBatasUsia()` | Normal | lahir 29 Feb: 28 Feb tahun nonkabisat masih 16 | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT07 | `validasiBatasUsia()` | Normal | lahir 29 Feb: 1 Maret tahun nonkabisat sudah 17 | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT08 | `validasiBatasUsia()` | Normal | 29 Feb yang valid pada tahun kabisat | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT09 | `validasiBatasUsia()` | Batas | ulang tahun di 1 Januari, belum 17 | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT10 | `validasiBatasUsia()` | Batas | ulang tahun di 1 Januari, sudah 17 | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT11 | `validasiBatasUsia()` | Normal | tahun 2000 kabisat | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT12 | `validasiBatasUsia()` | Normal | tahun 1900 bukan kabisat | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT13 | `validasiBatasUsia()` | Negatif | tanggal tidak valid/masa depan ditolak:  | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT14 | `validasiBatasUsia()` | Negatif | tanggal tidak valid/masa depan ditolak: invalid | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT15 | `validasiBatasUsia()` | Negatif | tanggal tidak valid/masa depan ditolak: 2009-02-29 | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT16 | `validasiBatasUsia()` | Negatif | tanggal tidak valid/masa depan ditolak: 2000-02-30 | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT17 | `validasiBatasUsia()` | Negatif | tanggal tidak valid/masa depan ditolak: 2000-04-31 | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT18 | `validasiBatasUsia()` | Negatif | tanggal tidak valid/masa depan ditolak: 2000-13-01 | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT19 | `validasiBatasUsia()` | Negatif | tanggal tidak valid/masa depan ditolak: 2000-00-01 | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT20 | `validasiBatasUsia()` | Negatif | tanggal tidak valid/masa depan ditolak: 2000-01-00 | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT21 | `validasiBatasUsia()` | Negatif | tanggal tidak valid/masa depan ditolak: 06-11-2009 | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT22 | `validasiBatasUsia()` | Negatif | tanggal tidak valid/masa depan ditolak: 2009-1-1 | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT23 | `validasiBatasUsia()` | Negatif | tanggal tidak valid/masa depan ditolak: 2009-11-06T00:00:00Z | Asersi berhasil | Asersi berhasil | Pass |
| C01-UT24 | `validasiBatasUsia()` | Negatif | tanggal tidak valid/masa depan ditolak: 2027-01-01 | Asersi berhasil | Asersi berhasil | Pass |

Tabel 4.2.1b. Ringkasan Cakupan Kelas C01

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | registrasi, validasiUsia, login, generateToken |
| Operasi yang diuji | validasiBatasUsia() |
| ID Algoritma yang tercakup | Algo-001 |
| Coverage (target ≥ 70%) | `src/models/Pengguna.ts`: 100% baris / 100% cabang<br>`src/controllers/PenggunaController.ts`: 100% baris / 100% cabang<br>`src/lib/validation/auth.ts`: 100% baris / 100% cabang |

### 4.2.2 Kelas TenagaKerja

**ID Kelas:** C02<br>
**Nama Kelas:** TenagaKerja<br>
**Tingkat:** Mendalam

Tabel 4.2.2. Hasil Pengujian Unit Kelas C02

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| — | — | — | — | — | Uji integrasi: INT-TC04, INT-TC05 | Belum ada uji unit khusus |

Tabel 4.2.2b. Ringkasan Cakupan Kelas C02

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | ajukanVerifikasi, perbaruiStatusVerifikasi |
| Operasi yang diuji | — |
| ID Algoritma yang tercakup | — |
| Coverage (target ≥ 70%) | `src/models/TenagaKerja.ts`: 92.55% baris / 91.66% cabang<br>`src/controllers/TenagaKerjaController.ts`: 87.75% baris / 77.77% cabang |

### 4.2.3 Kelas PenggunaController

**ID Kelas:** C31<br>
**Nama Kelas:** PenggunaController<br>
**Tingkat:** Mendalam

Tabel 4.2.3. Hasil Pengujian Unit Kelas C31

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| — | — | — | — | — | Uji integrasi: INT-TC01, INT-TC02 | Belum ada uji unit khusus |

Tabel 4.2.3b. Ringkasan Cakupan Kelas C31

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | Lihat Tabel 4.1 DPPL2 |
| Operasi yang diuji | — |
| ID Algoritma yang tercakup | — |
| Coverage (target ≥ 70%) | `src/controllers/PenggunaController.ts`: 100% baris / 100% cabang |

### 4.2.4 Kelas TenagaKerjaController

**ID Kelas:** C32<br>
**Nama Kelas:** TenagaKerjaController<br>
**Tingkat:** Mendalam

Tabel 4.2.4. Hasil Pengujian Unit Kelas C32

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| — | — | — | — | — | Uji integrasi: INT-TC04, INT-TC05 | Belum ada uji unit khusus |

Tabel 4.2.4b. Ringkasan Cakupan Kelas C32

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | Lihat Tabel 4.1 DPPL2 |
| Operasi yang diuji | — |
| ID Algoritma yang tercakup | — |
| Coverage (target ≥ 70%) | `src/controllers/TenagaKerjaController.ts`: 87.75% baris / 77.77% cabang |

### 4.2.5 Kelas CustomerServiceController

**ID Kelas:** C34<br>
**Nama Kelas:** CustomerServiceController<br>
**Tingkat:** Mendalam

Tabel 4.2.5. Hasil Pengujian Unit Kelas C34

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| — | — | — | — | — | Uji integrasi: INT-TC04, INT-TC05 | Belum ada uji unit khusus |

Tabel 4.2.5b. Ringkasan Cakupan Kelas C34

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | Lihat Tabel 4.1 DPPL2 |
| Operasi yang diuji | — |
| ID Algoritma yang tercakup | — |
| Coverage (target ≥ 70%) | `src/controllers/CustomerServiceController.ts`: 93.33% baris / 95.23% cabang |

## 4.3 Pengujian Integrasi

Vitest menggunakan controller, model, dan SQLite uji. Sejumlah suite menggantikan akses cookie pada batas Next.js. Pengujian browser memakai sesi dan HTTP aplikasi.

Tabel 4.3.1. Daftar Antarmuka Antarkomponen

| ID Antarmuka | Komponen Asal | Komponen Tujuan | Jenis Batas | Test Case |
| :--- | :--- | :--- | :--- | :--- |
| AI-01 | PenggunaController | Pengguna, autentikasi dan sesi | Controller – Model | INT-TC01, INT-TC02 |
| AI-02 | TenagaKerjaController / CustomerServiceController | TenagaKerja dan penyimpanan berkas | Controller – Model – Berkas | INT-TC04, INT-TC05 |

Tabel 4.3.2. Hasil Pengujian Integrasi

| ID Pengujian | ID Antarmuka | Skenario | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| INT-TC01 | AI-01 | auth-flow | `tests/integration/auth-flow.test.ts` | fixture frontend sesuai kontrak respons autentikasi; mendaftarkan TK beserta profil dan cookie sesi | 19/19 kasus lulus | Pass |
| INT-TC02 | AI-01 | auth | `tests/integration/auth.test.ts` | hash Argon2id, verifikasi benar/salah, hash rusak = false; DB menyimpan SHA-256 token, bukan token mentah; cookie HttpOnly diset | 18/18 kasus lulus | Pass |
| INT-TC04 | AI-02 | verifikasi | `tests/integration/verifikasi.test.ts` | TK belum terverifikasi: 201, status menunggu, berkas tersimpan terenkripsi; GET /status mengembalikan status terkini | 7/7 kasus lulus | Pass |
| INT-TC05 | AI-02 | verifikasi-cs | `tests/integration/verifikasi-cs.test.ts` | CS melihat antrean MENUNGGU sesuai skema; non-CS -> 403, tanpa sesi -> 401 | 7/7 kasus lulus | Pass |

## 4.4 Pengujian Use Case

Skenario mengikuti SKPL 4.4. Bukti diperoleh dari browser Edge dan permintaan HTTP pada aplikasi lokal.

### 4.4.1 Use Case Melakukan Registrasi

**ID Use Case:** UC01<br>
**Nama Use Case:** Melakukan Registrasi

Tabel 4.4.1. Hasil Pengujian Use Case UC01

| ID Pengujian | ID KF | Skenario | Prosedur Pengujian | Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UC01-TC01 | KF01, KF02, KF03 | Normal | 1. Pengguna memilih opsi registrasi<br>2. Pengguna mengisi formulir profil lengkap, memasukkan tanggal lahir (usia $\ge$ 17 tahun), dan menyetujui kebijakan privasi lalu menekan daftar<br>3. Pengguna melakukan login dengan kredensial yang baru dibuat | Akun TK baru, usia ≥17, setuju privasi, kredensial valid | Sistem menampilkan formulir registrasi, pilihan peran (Tenaga Kerja atau Penyedia Kerja), dan meminta persetujuan kebijakan privasi<br>Sistem memvalidasi usia pendaftar dan menyimpan data pengguna<br>Sistem memverifikasi kredensial, menerbitkan token autentikasi, dan menampilkan halaman beranda | Akun tersimpan, lalu login berhasil dan dashboard TK terbuka. | Pass |
| UC01-TC02 | KF01, KF02, KF03 | Alternatif 1: Batas Usia Tidak Valid | 1. Pengguna memilih opsi registrasi<br>2. Pengguna memasukkan tanggal lahir yang menunjukkan usia di bawah 17 tahun dan menekan daftar<br>3. Pengguna memperbaiki input tanggal lahir menjadi valid | Tanggal lahir 2015-01-01 | Sistem menampilkan formulir registrasi, pilihan peran, dan kebijakan privasi<br>Sistem memblokir pendaftaran dan menampilkan pesan kesalahan bahwa pengguna harus berusia minimal 17 tahun<br>Sistem kembali ke langkah 2 skenario normal | Usia di bawah 17 tahun ditolak; pesan batas usia muncul. | Pass |
| UC01-TC03 | KF01, KF02, KF03 | Alternatif 2: Email Sudah Terdaftar | 1. Pengguna memilih opsi registrasi<br>2. Pengguna mengisi formulir dengan email yang sudah ada di basis data dan menekan daftar<br>3. Pengguna memilih opsi menuju halaman login | Email akun seed | Sistem menampilkan formulir registrasi, pilihan peran, dan kebijakan privasi<br>Sistem menolak pendaftaran dan menampilkan pesan bahwa email sudah digunakan, serta menyarankan pengguna untuk login<br>Sistem mengarahkan pengguna ke halaman login | Email terdaftar ditolak; aplikasi menyarankan masuk. | Pass |

### 4.4.2 Use Case Mengelola Verifikasi Identitas

**ID Use Case:** UC02<br>
**Nama Use Case:** Mengelola Verifikasi Identitas

Tabel 4.4.2. Hasil Pengujian Use Case UC02

| ID Pengujian | ID KF | Skenario | Prosedur Pengujian | Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UC02-TC01 | KF04, KF05, KF06 | Normal | 1. Tenaga Kerja memilih menu verifikasi identitas<br>2. Tenaga Kerja mengunggah dokumen dan mengirimkan pengajuan<br>3. Customer Service menekan tombol setuju verifikasi manual pada dashboard | PDF uji, persetujuan, aksi setujui CS | Sistem menampilkan antarmuka pengunggahan dokumen identitas<br>Sistem menyimpan dokumen dan mengubah status menjadi "Menunggu Persetujuan"<br>Sistem memperbarui status identitas pengguna menjadi "Terverifikasi" dan membuka akses fitur utama platform | Unggahan diterima dan status akhir TERVERIFIKASI setelah persetujuan CS. | Pass |
| UC02-TC02 | KF04, KF05, KF06 | Alternatif 1: Format atau Ukuran Dokumen Tidak Valid | 1. Tenaga Kerja memilih menu verifikasi identitas<br>2. Tenaga Kerja mengunggah file dengan ekstensi yang tidak didukung (misal: .exe) atau melebihi batas ukuran (misal: > 5MB) | Berkas .exe | Sistem menampilkan antarmuka pengunggahan dokumen identitas<br>Sistem menolak unggahan dan menampilkan pesan error format/ukuran file tidak sesuai | Unggahan ditolak dengan HTTP 400. | Pass |
| UC02-TC03 | KF04, KF05, KF06 | Alternatif 2: Dokumen Ditolak oleh Customer Service | 1. Tenaga Kerja memilih menu verifikasi identitas<br>2. Tenaga Kerja mengunggah dokumen yang buram atau data tidak cocok<br>3. Customer Service menolak verifikasi pada dashboard dengan memberikan alasan | PDF uji dan alasan penolakan | Sistem menampilkan antarmuka pengunggahan dokumen identitas<br>Sistem menyimpan dokumen sebagai "Menunggu Persetujuan"<br>Sistem memperbarui status menjadi "Ditolak", mengirim notifikasi revisi beserta alasan, dan fitur utama tetap dibatasi | CS menolak dokumen; status DITOLAK tampil. | Pass |
| UC02-TC04 | KF04, KF05, KF06 | Alternatif 3: Mengakses Fitur Utama Sebelum Terverifikasi | 1. Tenaga Kerja (dengan status belum terverifikasi) mencoba menekan menu fitur utama platform<br>2. Sistem memblokir akses ke halaman tersebut | TK belum terverifikasi | Sistem mendeteksi status akun belum disetujui<br>Sistem menampilkan pop-up peringatan bahwa akun harus diverifikasi dan mengarahkan pengguna ke halaman verifikasi | Penawaran ditolak dengan HTTP 403. | Pass |

## 4.5 Pengujian Kebutuhan Non-Fungsional (KNF)

Tabel 4.5. Hasil Pengujian KNF

| ID Pengujian | ID KNF | Parameter | Target Terukur | Metode dan Alat | Hasil Aktual | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| KNF01-TC01 | KNF01 | Security | Kata sandi berupa hash dan token sesi tidak tersimpan sebagai teks biasa | Vitest, pemeriksaan SQLite | Hash Argon2id; token mentah tidak ditemukan pada penyimpanan sesi. | Pass |
| KNF02-TC01 | KNF02 | Security | Dokumen identitas tersimpan terenkripsi | Vitest, baca berkas penyimpanan uji | Unggahan diterima dan berkas tersimpan terenkripsi. | Pass |
| KNF03-TC01 | KNF03 | Response time | Pemeriksaan status akses < 1.000 ms | Playwright HTTP, 5 permintaan status setelah pemanasan | 5 pengukuran: rata-rata 31.03 ms, maksimum 37.05 ms. | Pass |
| KNF21-TC01 | KNF21 | Portability | Formulir registrasi dapat digunakan pada layar kecil dan desktop | Playwright pada Windows: Edge 390 × 844 dan Chrome 1440 × 900 | Kolom registrasi dapat diisi tanpa gulir horizontal pada kedua ukuran. | Pass untuk formulir registrasi pada dua profil yang diuji. |
| KNF22-TC01 | KNF22 | Memory | Dokumen identitas dikompresi otomatis hingga ≤ 10 MB | Inspeksi alur unggah dokumen identitas | Formulir dan penyimpanan membatasi ukuran dokumen identitas hingga 5 MiB. Kompresi otomatis dokumen identitas belum tersedia. | Belum terpenuhi. Tambahkan kompresi pada format yang didukung atau sesuaikan SKPL. |
| KNF23-TC01 | KNF23 | Availability | Uptime akses status verifikasi ≥ 99,9% | Pemantauan endpoint status verifikasi | Belum tersedia data uptime yang representatif. | Belum diuji. Catat permintaan berhasil dan gagal secara berkala di lingkungan yang digunakan. |

## 4.6 Tangkapan Layar dan Bukti Hasil Pengujian

Tabel 4.6. Bukti Hasil Pengujian

| ID Pengujian | Bukti Hasil Pengujian |
| :--- | :--- |
| INT-TC01 | [Vitest · auth-flow](./assets/layar/integration-auth-flow.png) |
| INT-TC02 | [Vitest · auth](./assets/layar/integration-auth.png) |
| INT-TC04 | [Vitest · verifikasi](./assets/layar/integration-verifikasi.png) |
| INT-TC05 | [Vitest · verifikasi-cs](./assets/layar/integration-verifikasi-cs.png) |
| C01-UT01, C01-UT02, C01-UT03, C01-UT04, C01-UT05, C01-UT06, C01-UT07, C01-UT08, C01-UT09, C01-UT10, C01-UT11, C01-UT12, C01-UT13, C01-UT14, C01-UT15, C01-UT16, C01-UT17, C01-UT18, C01-UT19, C01-UT20, C01-UT21, C01-UT22, C01-UT23, C01-UT24 | [Vitest · usia](./assets/layar/unit-usia.png)<br>[![C01-unit](./assets/layar/C01-unit.png)](./assets/layar/C01-unit.png) |
| C01 (coverage) | [Cakupan V8 UC01–UC02](./assets/layar/coverage-uc01-uc02.png) |
| C02 (coverage) | [Cakupan V8 UC01–UC02](./assets/layar/coverage-uc01-uc02.png) |
| C31 (coverage) | [Cakupan V8 UC01–UC02](./assets/layar/coverage-uc01-uc02.png) |
| C32 (coverage) | [Cakupan V8 UC01–UC02](./assets/layar/coverage-uc01-uc02.png) |
| C34 (coverage) | [Cakupan V8 UC01–UC02](./assets/layar/coverage-uc01-uc02.png) |
| UC01-TC01 | [![UC01-TC01](./assets/layar/UC01-TC01.png)](./assets/layar/UC01-TC01.png) |
| UC01-TC02 | [![UC01-TC02](./assets/layar/UC01-TC02.png)](./assets/layar/UC01-TC02.png) |
| UC01-TC03 | [![UC01-TC03](./assets/layar/UC01-TC03.png)](./assets/layar/UC01-TC03.png) |
| UC02-TC01 | [![UC02-TC01](./assets/layar/UC02-TC01.png)](./assets/layar/UC02-TC01.png) |
| UC02-TC02 | [![UC02-TC02](./assets/layar/UC02-TC02.png)](./assets/layar/UC02-TC02.png) |
| UC02-TC03 | [![UC02-TC03](./assets/layar/UC02-TC03.png)](./assets/layar/UC02-TC03.png) |
| UC02-TC04 | [![UC02-TC04](./assets/layar/UC02-TC04.png)](./assets/layar/UC02-TC04.png) |
| KNF01-TC01 | [Vitest · auth-flow](./assets/layar/integration-auth-flow.png) |
| KNF02-TC01 | [Vitest · verifikasi](./assets/layar/integration-verifikasi.png) |
| KNF03-TC01 | [Pengukuran status verifikasi](./assets/layar/KNF03-verifikasi.png) |
| KNF21-TC01 | [Registrasi ponsel](./assets/layar/KNF21-daftar-ponsel.png)<br>[Registrasi desktop](./assets/layar/KNF21-daftar-desktop.png) |
| KNF22-TC01 | [`verification-page.tsx`](../../src/features/verification/verification-page.tsx) · batas ukuran dokumen identitas |
| KNF23-TC01 | Belum ada bukti pengukuran uptime. |

<br>

---

# BAB 5: Traceability

Matriks mencakup seluruh kebutuhan. Hasil dan bukti pada Bab 4 terbatas pada pengujian yang terkait dengan UC01 dan UC02.

Tabel 5.1. Matriks Kerunutan KF terhadap Implementasi dan Pengujian

| KF ID | KNF Terkait | Use Case ID | Kelas Terkait | Implementasi File Terkait | Test Case (UC) | Test Case (Unit/Integrasi/KNF) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| KF01 | KNF21 | UC01 | C01 – Pengguna<br>C16 – PenggunaUI<br>C31 – PenggunaController | `src/models/Pengguna.ts`<br>`src/app/daftar/page.tsx`<br>`src/controllers/PenggunaController.ts` | UC01-TC01, UC01-TC03 | C01-UT01, C01-UT02, C01-UT03, C01-UT04, C01-UT05, C01-UT06, C01-UT07, C01-UT08, C01-UT09, C01-UT10, C01-UT11, C01-UT12, C01-UT13, C01-UT14, C01-UT15, C01-UT16, C01-UT17, C01-UT18, C01-UT19, C01-UT20, C01-UT21, C01-UT22, C01-UT23, C01-UT24, INT-TC01, INT-TC02, KNF21-TC01 |
| KF02 | — | UC01 | C01 – Pengguna<br>C16 – PenggunaUI<br>C31 – PenggunaController | `src/models/Pengguna.ts`<br>`src/app/daftar/page.tsx`<br>`src/controllers/PenggunaController.ts` | UC01-TC01, UC01-TC02 | C01-UT01, C01-UT02, C01-UT03, C01-UT04, C01-UT05, C01-UT06, C01-UT07, C01-UT08, C01-UT09, C01-UT10, C01-UT11, C01-UT12, C01-UT13, C01-UT14, C01-UT15, C01-UT16, C01-UT17, C01-UT18, C01-UT19, C01-UT20, C01-UT21, C01-UT22, C01-UT23, C01-UT24, INT-TC01, INT-TC02 |
| KF03 | KNF01 | UC01 | C01 – Pengguna<br>C16 – PenggunaUI<br>C31 – PenggunaController | `src/models/Pengguna.ts`<br>`src/app/daftar/page.tsx`<br>`src/controllers/PenggunaController.ts` | UC01-TC01 | C01-UT01, C01-UT02, C01-UT03, C01-UT04, C01-UT05, C01-UT06, C01-UT07, C01-UT08, C01-UT09, C01-UT10, C01-UT11, C01-UT12, C01-UT13, C01-UT14, C01-UT15, C01-UT16, C01-UT17, C01-UT18, C01-UT19, C01-UT20, C01-UT21, C01-UT22, C01-UT23, C01-UT24, INT-TC01, INT-TC02, KNF01-TC01 |
| KF04 | KNF02, KNF22 | UC02 | C02 – TenagaKerja<br>C17 – TenagaKerjaUI<br>C19 – CustomerServiceUI<br>C32 – TenagaKerjaController<br>C34 – CustomerServiceController | `src/models/TenagaKerja.ts`<br>`src/app/tk/page.tsx`<br>`src/app/cs/page.tsx`<br>`src/controllers/TenagaKerjaController.ts`<br>`src/controllers/CustomerServiceController.ts` | UC02-TC01, UC02-TC02 | INT-TC04, INT-TC05, KNF02-TC01, KNF22-TC01 |
| KF05 | — | UC02 | C02 – TenagaKerja<br>C17 – TenagaKerjaUI<br>C19 – CustomerServiceUI<br>C32 – TenagaKerjaController<br>C34 – CustomerServiceController | `src/models/TenagaKerja.ts`<br>`src/app/tk/page.tsx`<br>`src/app/cs/page.tsx`<br>`src/controllers/TenagaKerjaController.ts`<br>`src/controllers/CustomerServiceController.ts`<br>Persetujuan manual tersedia; tautan verifikasi email belum dibuktikan. | UC02-TC01, UC02-TC03 | INT-TC04, INT-TC05 |
| KF06 | KNF03, KNF23 | UC02 | C02 – TenagaKerja<br>C17 – TenagaKerjaUI<br>C19 – CustomerServiceUI<br>C32 – TenagaKerjaController<br>C34 – CustomerServiceController | `src/models/TenagaKerja.ts`<br>`src/app/tk/page.tsx`<br>`src/app/cs/page.tsx`<br>`src/controllers/TenagaKerjaController.ts`<br>`src/controllers/CustomerServiceController.ts` | UC02-TC01, UC02-TC03, UC02-TC04 | INT-TC04, INT-TC05, KNF03-TC01, KNF23-TC01 |
| KF07 | KNF05, KNF09, KNF10 | UC03 | C05 – LowonganPekerjaan<br>C18 – PenyediaKerjaUI<br>C35 – LowonganPekerjaanController | `src/models/LowonganPekerjaan.ts`<br>`src/app/pk/page.tsx`<br>`src/controllers/LowonganPekerjaanController.ts` | UC03-TC01, UC03-TC03 | INT-TC06, INT-TC07, KNF05-TC01, KNF09-TC01, KNF10-TC01 |
| KF08 | KNF09, KNF10 | UC03 | C05 – LowonganPekerjaan<br>C18 – PenyediaKerjaUI<br>C35 – LowonganPekerjaanController | `src/models/LowonganPekerjaan.ts`<br>`src/app/pk/page.tsx`<br>`src/controllers/LowonganPekerjaanController.ts` | UC03-TC02 | INT-TC06, INT-TC07, KNF09-TC01, KNF10-TC01 |
| KF09 | KNF04, KNF08, KNF10, KNF21 | UC04 | C05 – LowonganPekerjaan<br>C20 – LowonganPekerjaanUI<br>C35 – LowonganPekerjaanController | `src/models/LowonganPekerjaan.ts`<br>`src/app/lowongan/page.tsx`<br>`src/controllers/LowonganPekerjaanController.ts` | UC04-TC01, UC04-TC02 | INT-TC06, INT-TC07, KNF04-TC01, KNF21-TC01, KNF08-TC01, KNF10-TC01 |
| KF10 | KNF05, KNF10 | UC05 | C02 – TenagaKerja<br>C06 – PengajuanPenawaran<br>C21 – PengajuanPenawaranUI<br>C36 – PengajuanPenawaranController | `src/models/TenagaKerja.ts`<br>`src/models/PengajuanPenawaran.ts`<br>`src/views/penawaran/DialogPenawaran.tsx`<br>`src/controllers/PengajuanPenawaranController.ts` | UC05-TC01, UC05-TC02 | INT-TC04, INT-TC05, INT-TC08, INT-TC09, INT-TC10, KNF05-TC01, KNF10-TC01 |
| KF11 | KNF10 | UC05 | C02 – TenagaKerja<br>C06 – PengajuanPenawaran<br>C21 – PengajuanPenawaranUI<br>C36 – PengajuanPenawaranController | `src/models/TenagaKerja.ts`<br>`src/models/PengajuanPenawaran.ts`<br>`src/views/penawaran/DialogPenawaran.tsx`<br>`src/controllers/PengajuanPenawaranController.ts` | UC05-TC01, UC05-TC03 | INT-TC04, INT-TC05, INT-TC08, INT-TC09, INT-TC10, KNF10-TC01 |
| KF12 | KNF06, KNF07, KNF08, KNF10, KNF21, KNF23 | UC06 | C05 – LowonganPekerjaan<br>C06 – PengajuanPenawaran<br>C07 – TransaksiPekerjaan<br>C21 – PengajuanPenawaranUI<br>C36 – PengajuanPenawaranController | `src/models/LowonganPekerjaan.ts`<br>`src/models/PengajuanPenawaran.ts`<br>`src/models/TransaksiPekerjaan.ts`<br>`src/views/penawaran/DialogPenawaran.tsx`<br>`src/controllers/PengajuanPenawaranController.ts` | UC06-TC01, UC06-TC02, UC06-TC03 | INT-TC06, INT-TC07, INT-TC08, INT-TC09, INT-TC10, C07-UT01, C07-UT02, C07-UT03, C07-UT04, C07-UT05, C07-UT06, C07-UT07, C07-UT08, C07-UT09, C07-UT10, INT-TC11, INT-TC12, KNF06-TC01, KNF07-TC01, KNF21-TC01, KNF08-TC01, KNF10-TC01, KNF23-TC01 |
| KF13 | KNF07, KNF10 | UC06 | C05 – LowonganPekerjaan<br>C06 – PengajuanPenawaran<br>C07 – TransaksiPekerjaan<br>C21 – PengajuanPenawaranUI<br>C36 – PengajuanPenawaranController | `src/models/LowonganPekerjaan.ts`<br>`src/models/PengajuanPenawaran.ts`<br>`src/models/TransaksiPekerjaan.ts`<br>`src/views/penawaran/DialogPenawaran.tsx`<br>`src/controllers/PengajuanPenawaranController.ts` | UC06-TC01, UC06-TC02 | INT-TC06, INT-TC07, INT-TC08, INT-TC09, INT-TC10, C07-UT01, C07-UT02, C07-UT03, C07-UT04, C07-UT05, C07-UT06, C07-UT07, C07-UT08, C07-UT09, C07-UT10, INT-TC11, INT-TC12, KNF07-TC01, KNF10-TC01 |
| KF14 | KNF10, KNF11, KNF12 | UC07 | C07 – TransaksiPekerjaan<br>C09 – TagihanPembayaran<br>C15 – PaymentGateway<br>C24 – TagihanPembayaranUI<br>C39 – TagihanPembayaranController<br>C45 – PaymentGatewayController | `src/models/TransaksiPekerjaan.ts`<br>`src/models/TagihanPembayaran.ts`<br>`src/controllers/PaymentGatewayController.ts`<br>`src/views/transaksi/TagihanPembayaranUI.tsx`<br>`src/controllers/TagihanPembayaranController.ts` | UC07-TC01, UC07-TC02, UC07-TC03 | C07-UT01, C07-UT02, C07-UT03, C07-UT04, C07-UT05, C07-UT06, C07-UT07, C07-UT08, C07-UT09, C07-UT10, INT-TC11, INT-TC12, INT-TC16, INT-TC19, INT-TC17, C15-UT01, C15-UT04, C15-UT05, C15-UT06, C15-UT07, C15-UT08, C15-UT09, C15-UT10, C15-UT11, C15-UT12, C15-UT13, KNF11-TC01, KNF10-TC01, KNF12-TC01 |
| KF15 | KNF10, KNF11, KNF12 | UC07 | C07 – TransaksiPekerjaan<br>C09 – TagihanPembayaran<br>C15 – PaymentGateway<br>C24 – TagihanPembayaranUI<br>C39 – TagihanPembayaranController<br>C45 – PaymentGatewayController | `src/models/TransaksiPekerjaan.ts`<br>`src/models/TagihanPembayaran.ts`<br>`src/controllers/PaymentGatewayController.ts`<br>`src/views/transaksi/TagihanPembayaranUI.tsx`<br>`src/controllers/TagihanPembayaranController.ts`<br>Status dan riwayat dicatat dari transaksi simulasi. | UC07-TC01, UC07-TC02, UC07-TC03 | C07-UT01, C07-UT02, C07-UT03, C07-UT04, C07-UT05, C07-UT06, C07-UT07, C07-UT08, C07-UT09, C07-UT10, INT-TC11, INT-TC12, INT-TC16, INT-TC19, INT-TC17, C15-UT01, C15-UT04, C15-UT05, C15-UT06, C15-UT07, C15-UT08, C15-UT09, C15-UT10, C15-UT11, C15-UT12, C15-UT13, KNF11-TC01, KNF10-TC01, KNF12-TC01 |
| KF16 | KNF13, KNF14, KNF22 | UC08 | C07 – TransaksiPekerjaan<br>C08 – BuktiPenyerahan<br>C23 – BuktiPenyerahanUI<br>C38 – BuktiPenyerahanController | `src/models/TransaksiPekerjaan.ts`<br>`src/models/BuktiPenyerahan.ts`<br>`src/views/transaksi/DetailTransaksi.tsx`<br>`src/controllers/TransaksiBuktiController.ts` | UC08-TC01, UC08-TC02, UC08-TC03 | C07-UT01, C07-UT02, C07-UT03, C07-UT04, C07-UT05, C07-UT06, C07-UT07, C07-UT08, C07-UT09, C07-UT10, INT-TC11, INT-TC12, C08-UT01, C08-UT02, C08-UT03, C08-UT04, C08-UT05, C08-UT06, C08-UT07, C08-UT08, C08-UT09, INT-TC14, INT-TC15, KNF13-TC01, KNF14-TC01, KNF22-TC01 |
| KF17 | KNF15 | UC09 | C07 – TransaksiPekerjaan<br>C08 – BuktiPenyerahan<br>C14 – Notifikasi<br>C22 – TransaksiPekerjaanUI<br>C37 – TransaksiPekerjaanController<br>C44 – NotifikasiController | `src/models/TransaksiPekerjaan.ts`<br>`src/models/BuktiPenyerahan.ts`<br>`src/models/Notifikasi.ts`<br>`src/views/transaksi/HalamanDaftarTransaksi.tsx`<br>`src/controllers/TransaksiPekerjaanController.ts`<br>`src/controllers/NotifikasiController.ts`<br>Penyelesaian otomatis mengkredit saldo; pencairan rekening diajukan terpisah. | UC09-TC01, UC09-TC02, UC09-TC03 | C07-UT01, C07-UT02, C07-UT03, C07-UT04, C07-UT05, C07-UT06, C07-UT07, C07-UT08, C07-UT09, C07-UT10, INT-TC11, INT-TC12, C08-UT01, C08-UT02, C08-UT03, C08-UT04, C08-UT05, C08-UT06, C08-UT07, C08-UT08, C08-UT09, INT-TC14, INT-TC15, INT-TC29, KNF15-TC01 |
| KF18 | — | UC09 | C07 – TransaksiPekerjaan<br>C08 – BuktiPenyerahan<br>C14 – Notifikasi<br>C22 – TransaksiPekerjaanUI<br>C37 – TransaksiPekerjaanController<br>C44 – NotifikasiController | `src/models/TransaksiPekerjaan.ts`<br>`src/models/BuktiPenyerahan.ts`<br>`src/models/Notifikasi.ts`<br>`src/views/transaksi/HalamanDaftarTransaksi.tsx`<br>`src/controllers/TransaksiPekerjaanController.ts`<br>`src/controllers/NotifikasiController.ts` | UC09-TC01 | C07-UT01, C07-UT02, C07-UT03, C07-UT04, C07-UT05, C07-UT06, C07-UT07, C07-UT08, C07-UT09, C07-UT10, INT-TC11, INT-TC12, C08-UT01, C08-UT02, C08-UT03, C08-UT04, C08-UT05, C08-UT06, C08-UT07, C08-UT08, C08-UT09, INT-TC14, INT-TC15, INT-TC29 |
| KF19 | KNF16, KNF17 | UC10 | C10 – PencairanDana<br>C15 – PaymentGateway<br>C25 – PencairanDanaUI<br>C40 – PencairanDanaController<br>C45 – PaymentGatewayController | `src/models/PencairanDana.ts`<br>`src/controllers/PaymentGatewayController.ts`<br>`src/views/dompet/HalamanDompet.tsx`<br>`src/controllers/DompetController.ts`<br>Instruksi pencairan diproses oleh Payment Gateway dummy. | UC10-TC01, UC10-TC02, UC10-TC03 | INT-TC22, INT-TC23, INT-TC24, C15-UT01, C15-UT04, C15-UT05, C15-UT06, C15-UT07, C15-UT08, C15-UT09, C15-UT10, C15-UT11, C15-UT12, C15-UT13, INT-TC19, C40-UT01, C40-UT02, C40-UT03, KNF16-TC01, KNF17-TC01 |
| KF20 | KNF16, KNF17 | UC10 | C10 – PencairanDana<br>C15 – PaymentGateway<br>C25 – PencairanDanaUI<br>C40 – PencairanDanaController<br>C45 – PaymentGatewayController | `src/models/PencairanDana.ts`<br>`src/controllers/PaymentGatewayController.ts`<br>`src/views/dompet/HalamanDompet.tsx`<br>`src/controllers/DompetController.ts` | UC10-TC01 | INT-TC22, INT-TC23, INT-TC24, C15-UT01, C15-UT04, C15-UT05, C15-UT06, C15-UT07, C15-UT08, C15-UT09, C15-UT10, C15-UT11, C15-UT12, C15-UT13, INT-TC19, C40-UT01, C40-UT02, C40-UT03, KNF16-TC01, KNF17-TC01 |
| KF21 | — | UC11 | C07 – TransaksiPekerjaan<br>C11 – UlasanRating<br>C26 – UlasanRatingUI<br>C37 – TransaksiPekerjaanController<br>C41 – UlasanRatingController | `src/models/TransaksiPekerjaan.ts`<br>`src/db/migrations/0001_init.sql`<br>`src/views/transaksi/FormUlasanTransaksi.tsx`<br>`src/controllers/TransaksiPekerjaanController.ts` | UC11-TC01, UC11-TC03 | C07-UT01, C07-UT02, C07-UT03, C07-UT04, C07-UT05, C07-UT06, C07-UT07, C07-UT08, C07-UT09, C07-UT10, INT-TC11, INT-TC12, INT-TC25 |
| KF22 | — | UC11 | C07 – TransaksiPekerjaan<br>C11 – UlasanRating<br>C26 – UlasanRatingUI<br>C37 – TransaksiPekerjaanController<br>C41 – UlasanRatingController | `src/models/TransaksiPekerjaan.ts`<br>`src/db/migrations/0001_init.sql`<br>`src/views/transaksi/FormUlasanTransaksi.tsx`<br>`src/controllers/TransaksiPekerjaanController.ts` | UC11-TC02 | C07-UT01, C07-UT02, C07-UT03, C07-UT04, C07-UT05, C07-UT06, C07-UT07, C07-UT08, C07-UT09, C07-UT10, INT-TC11, INT-TC12, INT-TC25 |
| KF23 | KNF18 | UC11 | C07 – TransaksiPekerjaan<br>C11 – UlasanRating<br>C26 – UlasanRatingUI<br>C37 – TransaksiPekerjaanController<br>C41 – UlasanRatingController | `src/models/TransaksiPekerjaan.ts`<br>`src/db/migrations/0001_init.sql`<br>`src/views/transaksi/FormUlasanTransaksi.tsx`<br>`src/controllers/TransaksiPekerjaanController.ts` | UC11-TC01 | C07-UT01, C07-UT02, C07-UT03, C07-UT04, C07-UT05, C07-UT06, C07-UT07, C07-UT08, C07-UT09, C07-UT10, INT-TC11, INT-TC12, INT-TC25, KNF18-TC01 |
| KF24 | — | UC12 | C12 – TiketSengketa<br>C13 – RiwayatSengketa<br>C19 – CustomerServiceUI<br>C27 – TiketSengketaUI<br>C42 – TiketSengketaController<br>C43 – RiwayatSengketaController | `src/models/TiketSengketa.ts`<br>`src/db/migrations/0001_init.sql`<br>`src/app/cs/page.tsx`<br>`src/app/tiket/[id]/page.tsx`<br>`src/controllers/TiketSengketaController.ts` | UC12-TC01, UC12-TC04 | INT-TC26, INT-TC27 |
| KF25 | — | UC12 | C12 – TiketSengketa<br>C13 – RiwayatSengketa<br>C19 – CustomerServiceUI<br>C27 – TiketSengketaUI<br>C42 – TiketSengketaController<br>C43 – RiwayatSengketaController | `src/models/TiketSengketa.ts`<br>`src/db/migrations/0001_init.sql`<br>`src/app/cs/page.tsx`<br>`src/app/tiket/[id]/page.tsx`<br>`src/controllers/TiketSengketaController.ts` | UC12-TC01 | INT-TC26, INT-TC27 |
| KF26 | KNF19, KNF20 | UC12 | C12 – TiketSengketa<br>C13 – RiwayatSengketa<br>C19 – CustomerServiceUI<br>C27 – TiketSengketaUI<br>C42 – TiketSengketaController<br>C43 – RiwayatSengketaController | `src/models/TiketSengketa.ts`<br>`src/db/migrations/0001_init.sql`<br>`src/app/cs/page.tsx`<br>`src/app/tiket/[id]/page.tsx`<br>`src/controllers/TiketSengketaController.ts` | UC12-TC01, UC12-TC02, UC12-TC03, UC12-TC04 | INT-TC26, INT-TC27, KNF19-TC01, KNF20-TC01 |

Tabel 5.2. Matriks Kerunutan KNF terhadap Pengujian

| ID KNF | Parameter | KF/UC Terkait | Test Case |
| :--- | :--- | :--- | :--- |
| KNF01 | Security | KF03 / UC01 | KNF01-TC01 |
| KNF02 | Security | KF04 / UC02 | KNF02-TC01 |
| KNF03 | Response time | KF06 / UC02 | KNF03-TC01 |
| KNF04 | Response Time | KF09 / UC04 | KNF04-TC01 |
| KNF05 | Ergonomy | KF07 / UC03, KF10 / UC05 | KNF05-TC01 |
| KNF06 | Security | KF12 / UC06 | KNF06-TC01 |
| KNF07 | Reliability | KF12 / UC06, KF13 / UC06 | KNF07-TC01 |
| KNF08 | Memory | KF09 / UC04, KF12 / UC06 | KNF08-TC01 |
| KNF09 | Safety | KF07 / UC03, KF08 / UC03 | KNF09-TC01 |
| KNF10 | Availability | KF07 / UC03, KF08 / UC03, KF09 / UC04, KF10 / UC05, KF11 / UC05, KF12 / UC06, KF13 / UC06, KF14 / UC07, KF15 / UC07 | KNF10-TC01 |
| KNF11 | Reliability | KF14 / UC07, KF15 / UC07 | KNF11-TC01 |
| KNF12 | Security | KF14 / UC07, KF15 / UC07 | KNF12-TC01 |
| KNF13 | Response Time | KF16 / UC08 | KNF13-TC01 |
| KNF14 | Security | KF16 / UC08 | KNF14-TC01 |
| KNF15 | Reliability | KF17 / UC09 | KNF15-TC01 |
| KNF16 | Reliability | KF19 / UC10, KF20 / UC10 | KNF16-TC01 |
| KNF17 | Security | KF19 / UC10, KF20 / UC10 | KNF17-TC01 |
| KNF18 | Response time | KF23 / UC11 | KNF18-TC01 |
| KNF19 | Security | KF26 / UC12 | KNF19-TC01 |
| KNF20 | Reliability | KF26 / UC12 | KNF20-TC01 |
| KNF21 | Portability | KF01 / UC01, KF09 / UC04, KF12 / UC06 | KNF21-TC01 |
| KNF22 | Memory | KF04 / UC02, KF16 / UC08 | KNF22-TC01 |
| KNF23 | Availability | KF06 / UC02, KF12 / UC06 | KNF23-TC01 |
