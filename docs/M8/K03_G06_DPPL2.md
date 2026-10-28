<h1>
IF2150 REKAYASA PERANGKAT LUNAK
<br>
TUGAS 5
<br>
DESKRIPSI PERANCANGAN PERANGKAT LUNAK (DPPL)
</h1>
<br>

## Kerja-In
<p align="center">
<img alt="Logo Kerja-In" src="../M7/assets/logo.jpeg" width="100%">
</p>
<p align="center">

### Untuk: Agatha Tatianingseto

Dipersiapkan oleh:
| Informasi | Keterangan |
| --- | --- |
| Kelas | 03 |
| Kelompok | Shifu |

| NIM | Nama |
| --- | --- |
| 13525033 | Davin Farel Santoso |
| 13525039 | Aditya Rasyid |
| 13525096 | Muhammad Ridwan Nasir Firdaus |
| 13525102 | Karmel Tua Haloho |
| 13525123 | Sebastio Nugroho |
---

## Daftar Perubahan

| Revisi | Deskripsi |
| :--- | :--- |
| *A* | Menggabungkan beberapa method yang memiliki fungsi sama, namun nama berbeda. |
| *B* |  |
| *C* |  |
| ... |  |

---

<br>

> **Petunjuk pengerjaan:** *[Silahkan hapus bagian ini setelah selesai mengerjakan]*
>
> Dokumen ini melanjutkan **Deskripsi Perancangan Perangkat Lunak**. Gunakan nama, ID, kebutuhan, dan use case yang konsisten dengan kedua dokumen tersebut. Contoh pola ID baru di bawah dapat disesuaikan dengan kesepakatan kelompok, ID yang sudah ada tetap dipertahankan.

<br>

---


# BAB 1: Pendahuluan

## 1.1 Tujuan Penulisan Dokumen
Dokumen Deskripsi Perancangan Perangkat Lunak (DPPL) disusun untuk menjelaskan arsitektur perangkat lunak yang digunakan, interaksi antara pengguna dengan sistem, proses sistem dalam memenuhi seluruh kebutuhan fungsional maupun non-fungsional, dan interaksi antar kelas beserta method dan atribut yang digunakan. Dokumen ini akan dijadikan sebagai acuan oleh tim pengembang dalam melakukan perancangan, implementasi, hingga pengujian.

## 1.2 Lingkup Masalah
Kerja-In merupakan platform marketplace jasa berbasis web yang mempertemukan Penyedia Kerja dengan Tenaga Kerja sektor informal untuk mempermudah pencarian dan penyediaan pekerjaan harian. Aplikasi ini mendukung registrasi dan verifikasi identitas, pengelolaan lowongan, pengajuan penawaran, pemilihan tenaga kerja, pembayaran melalui Payment Gateway, penyerahan dan pemeriksaan hasil pekerjaan, serta pencairan upah. Rating, ulasan, dan portofolio membantu pengguna menilai reputasi tenaga kerja, sedangkan Customer Service membantu menangani keluhan dan sengketa terkait penggunaan platform.

## 1.3 Definisi, Istilah, dan Singkatan
Tabel 1.3. Definisi Istilah dan Singkatan

| Singkatan, Akronim, atau Istilah | Penjelasan |
| :--- | :--- |
| P/L | Perangkat Lunak, yaitu aplikasi yang menyediakan fungsi sesuai kebutuhan pengguna. |
| SKPL | Spesifikasi Kebutuhan Perangkat Lunak, yaitu dokumen yang menjelaskan kebutuhan perangkat lunak sebagai acuan pengembangan. |
| KF | Kebutuhan Fungsional, yaitu fungsi atau layanan yang harus disediakan sistem. |
| KNF | Kebutuhan Non-Fungsional, yaitu persyaratan kualitas dan batasan operasional sistem, seperti keamanan, ketersediaan, dan waktu respons. |
| UC / Use Case | Gambaran interaksi aktor dengan sistem untuk mencapai suatu tujuan. |
| EARS | Easy Approach to Requirements Syntax, yaitu pola penulisan kebutuhan berdasarkan kondisi atau pemicu dan respons sistem. |
| Aktor | Peran pengguna yang berinteraksi langsung dengan perangkat lunak. |
| Tenaga Kerja | Pengguna yang mencari lowongan, mengajukan penawaran, melaksanakan pekerjaan, dan menerima upah setelah hasil pekerjaan diverifikasi. |
| Penyedia Kerja | Pengguna yang membuat lowongan, memilih tenaga kerja, membayar pekerjaan, dan memeriksa hasilnya. |
| CS / Customer Service | Petugas internal yang membantu menangani kendala akun, pekerjaan, pembayaran, serta keluhan dan sengketa pengguna. |
| Lowongan Pekerjaan | Informasi kebutuhan pekerjaan yang memuat deskripsi, kuota tenaga kerja, lokasi, dan upah. |
| Pengajuan Penawaran | Pengajuan Tenaga Kerja untuk melamar suatu lowongan, disertai pesan penawaran dan data pelamar. |
| Transaksi Pekerjaan | Catatan kesepakatan antara Penyedia Kerja dan Tenaga Kerja terpilih beserta status pelaksanaan pekerjaannya. |
| Portofolio | Rekam jejak pengalaman dan hasil pekerjaan yang menunjukkan kemampuan serta reputasi pengguna. |
| Rating dan Ulasan | Penilaian berupa bintang 1-5 dan komentar setelah pekerjaan selesai. |
| Payment Gateway | Layanan eksternal yang digunakan sistem untuk memproses pembayaran dan penyaluran dana. |
| Dummy | Simulasi layanan atau sistem eksternal untuk menjalankan alur aplikasi tanpa menggunakan layanan produksi yang sesungguhnya. |
| Commission Fee | Biaya layanan platform yang dikenakan dalam transaksi pekerjaan. |
| Invoice | Tagihan yang memuat rincian upah, biaya layanan, dan total pembayaran. |
| E-wallet | Dompet digital yang digunakan sebagai sarana pembayaran atau tujuan pencairan dana. |
| Disbursement | Penyaluran dana ke rekening bank atau e-wallet penerima melalui layanan pembayaran. |
| Refund | Pengembalian dana kepada pihak pembayar sesuai tindak lanjut transaksi atau keputusan sengketa. |
| Dispute / Sengketa | Perselisihan terkait pekerjaan atau pembayaran yang ditangani oleh Customer Service. |
| Timestamp | Catatan tanggal dan waktu terjadinya suatu aktivitas sistem. |
| API | Application Programming Interface, yaitu antarmuka untuk pertukaran data dan permintaan layanan antarsistem. |
| UI | User Interface, yaitu antarmuka untuk memasukkan data dan menampilkan informasi kepada pengguna. |
| Entitas | Kelas yang merepresentasikan data dan perilaku objek dalam sistem. |
| Controller | Kelas yang mengendalikan pemrosesan tindakan pengguna sesuai fungsi yang ditangani. |
| Traceability | Keterlacakan hubungan antara kebutuhan fungsional, use case, dan kelas yang mendukungnya. |

## 1.4 Aturan Penomoran
Tabel 1.4. Aturan Penomoran

| Hal/Bagian | Penomoran | Keterangan |
| :--- | :--- | :--- |
| Kebutuhan | RXX | Mengacu pada ID dalam tabel Pemetaan Kebutuhan pada dokumen Requirement Gathering, misalnya R01. |
| Kebutuhan Fungsional | KFXX | Menandai fungsi atau layanan sistem, misalnya KF01. |
| Kebutuhan Non-Fungsional | KNFXX | Menandai persyaratan kualitas atau batasan operasional sistem, misalnya KNF01. |
| Aktor | AXX | Menandai peran pengguna: A01 untuk Tenaga Kerja, A02 untuk Penyedia Kerja, dan A03 untuk Customer Service. |
| Use Case | UCXX | Menandai use case beserta skenarionya, misalnya UC01 untuk Melakukan Registrasi. |
| Kelas | CXX | Menandai kelas pada identifikasi, diagram kelas, dan traceability, misalnya C01. |

## 1.5 Referensi
Dokumen dan sumber yang digunakan sebagai acuan penyusunan DPPL Kerja-In adalah sebagai berikut:

1. [K03 G06 Final TB - Topic Brainstorming](../M1/K03_G06_FInal_TB.md), sebagai acuan latar belakang masalah, tujuan, dan gagasan awal perangkat lunak Kerja-In.
2. [K03 G06 RG - Requirement Gathering](../M2/K03_G06_RG.md), sebagai acuan identifikasi pengguna, kebutuhan pengguna, kebutuhan fungsional, dan kebutuhan non-fungsional.
3. [K03 G06 UC - Use Case & Scenario Use Case](../M3/K03_G06_UC.md), sebagai acuan identifikasi aktor, use case, diagram use case, serta skenario normal dan alternatif.
4. [K03 G06 CD - Class Diagram](../M4/K03_G06_CD.md), sebagai acuan identifikasi kelas, atribut, operasi, hubungan antarkelas, dan diagram kelas.
5. [draw.io](https://www.drawio.com/), sebagai alat untuk membuat dan menyunting diagram UML yang digunakan dalam dokumen.
6. [Badan Perencanaan Pembangunan Nasional - Tujuan 8: Pekerjaan Layak dan Pertumbuhan Ekonomi](https://sdgs.bappenas.go.id/17-goals/08), sebagai acuan konteks pembangunan berkelanjutan dan permasalahan pekerjaan layak yang melatarbelakangi pengembangan Kerja-In.
7. [Bank Indonesia - Perizinan Sistem Pembayaran](https://www.bi.go.id/id/fungsi-utama/sistem-pembayaran/perizinan/default.aspx), sebagai acuan batasan penggunaan layanan pembayaran dan keterlibatan penyelenggara jasa pembayaran dalam sistem.
8. [Undang-Undang Republik Indonesia Nomor 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik](https://peraturan.bpk.go.id/details/37589/uu-no-11-tahun-2008), sebagai acuan umum penyelenggaraan informasi dan transaksi elektronik pada platform.
9. [Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Perlindungan Data Pribadi](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022), sebagai acuan perlindungan data pribadi pengguna, termasuk data identitas dan data pembayaran.
10. [PostgreSQL Documentation - Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html), sebagai acuan pengelolaan transaksi basis data yang konsisten, terutama untuk pembayaran, pencairan dana, dan perubahan status pekerjaan.
11. [OWASP Cheat Sheet Series - Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), sebagai acuan penerapan autentikasi, pengelolaan sesi, kata sandi, dan perlindungan akun pengguna.
12. [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), sebagai acuan aksesibilitas antarmuka web, navigasi, formulir, serta pencegahan kesalahan pada proses transaksi.

## 1.6 Deskripsi Umum Dokumen (Ikhtisar)
Dokumen Deskripsi Perancangan Perangkat Lunak (DPPL) Kerja-In disusun dalam lima bab. Bab 1 Pendahuluan menjelaskan tujuan penulisan dokumen, lingkup masalah, definisi dan istilah, aturan penomoran, referensi, serta sistematika pembahasan. Bab 2 Perancangan Arsitektur menguraikan lingkungan implementasi, pola arsitektur acuan, identifikasi komponen, modul, atau subsistem, serta model arsitektur perangkat lunak yang mengacu pada dokumen APL. Bab 3 Realisasi Use Case menjabarkan perancangan setiap use case berdasarkan SKPL melalui identifikasi kelas, sequence diagram untuk skenario normal dan alternatif, serta diagram kelas terkait. Bab 4 Diagram Kelas Keseluruhan menyajikan diagram kelas perancangan sistem secara menyeluruh beserta daftar kelas, atribut, dan metode atau operasinya. Bab 5 Matriks Kerunutan memetakan hubungan antara kelas perancangan dan use case untuk menunjukkan keterlacakan hasil perancangan terhadap fungsi sistem.

<br>

---

# BAB 2: Perancangan Arsitektur

## 2.1 Rancangan Lingkungan Implementasi
Tabel 2.1. Rancangan Lingkungan Implementasi

| Komponen | Spesifikasi |
| --- | --- |
| Backend | Node.js dengan framework Next.js. API Route Handlers digunakan untuk menangani permintaan dari client, menjalankan logika aplikasi, dan mengakses layanan Supabase. |
| Frontend | React dalam framework Next.js untuk membangun antarmuka pengguna berbasis web. |
| Bahasa Pemrograman | TypeScript untuk frontend dan backend, serta HTML dan CSS untuk struktur dan tampilan antarmuka. |
| Client | Web browser modern yang mendukung JavaScript, seperti Google Chrome, Mozilla Firefox, Microsoft Edge, dan Safari versi terbaru. |
| DBMS | PostgreSQL yang disediakan melalui layanan Supabase. |
| Authentication | Supabase Auth sebagai layanan autentikasi dan pengelolaan sesi pengguna. |
| File Storage | Supabase Storage untuk menyimpan berkas pengguna, seperti foto profil, dokumen verifikasi identitas, portofolio, dan bukti penyerahan hasil pekerjaan. |
| OS Server | Windows sebagai sistem operasi untuk menjalankan server aplikasi Node.js dan Next.js. |
| OS Client | Windows, Linux, macOS, Android, dan iOS melalui web browser yang mendukung aplikasi. |
| Development Tools | Visual Studio Code sebagai editor kode, Git untuk pengelolaan versi kode sumber, dan npm untuk pengelolaan dependensi serta menjalankan perintah pengembangan dan build aplikasi. |

## 2.2 Style/Pattern Arsitektur Acuan
<p align="center">
<img alt="Contoh Arsitektur MVC" src="../M7/assets/diagram/MVC.png" width="40%">
</p>
<p align="center">
<i>Gambar 2.2.1. Arsitektur MVC Kerja-In</i>
</p>

Pemilihan arsitektur Model-View-Controller (MVC) sebagai acuan untuk perangkat lunak Kerja-In didasarkan pada kesesuaiannya yang kuat dengan karakteristik pengguna, alur proses bisnis, serta lingkungan teknologi sistem. Sebagai aplikasi marketplace jasa, Kerja-In melayani tiga jenis pengguna dengan kebutuhan antarmuka yang berbeda yakni Tenaga Kerja, Penyedia Kerja, dan Customer Service (CS). Pola MVC memungkinkan sistem untuk menyajikan antarmuka (View) dan logika pemrosesan (Controller) yang spesifik untuk masing-masing peran, tetapi tetap terintegrasi secara terpusat pada pengelolaan entitas data (Model) yang sama. Hal ini efektif mencegah duplikasi data dan memastikan konsistensi informasi lintas pengguna.

Selain itu, alur proses bisnis pada aplikasi ini sangat interaktif dan sepenuhnya digerakkan oleh aksi pengguna, seperti pengajuan pekerjaan, konfirmasi penyelesaian, penanganan sengketa, hingga proses pembayaran. Arsitektur MVC dirancang secara natural untuk menangani siklus permintaan dan repons yang dinamis ini, View menangkap interaksi pengguna, Controller bertindak sebagai penengah untuk memvalidasi dan memproses logika bisnis, dan Model memperbarui status pada basis data secara aman.

Dari segi pengembangan, MVC menerapkan pemisahan tanggung jawab yang tegas antara tampilan antarmuka, logika bisnis, dan aturan data. Pemisahan ini sangat menguntungkan tim pengembang karena memungkinkan pengerjaan frontend dan backend dilakukan secara paralel dan modular tanpa saling mengganggu. Terakhir, MVC merupakan fondasi bawaan dari mayoritas framework web modern yang menjadi lingkungan operasi perangkat lunak ini. Dengan menerapkan MVC, pengembangan sistem tidak hanya mematuhi standard industri, tetapi juga menjamin skalabilitas dan kemudahan pemeliharaan perangkat lunak di masa depan.

## 2.3 Identifikasi Komponen / Modul / Subsistem
Komponen Kerja-In dikelompokkan berdasarkan pola MVC menjadi Model, View, dan Controller. Kelas yang memiliki fungsi berkaitan ditempatkan dalam satu komponen dengan nama kelas utama yang mewakilinya. Komponen autentikasi, basis data, dan penyimpanan berkas mendukung pengoperasian aplikasi.

Tabel 2.3. Identifikasi Komponen/Modul/Subsistem

| Nama Komponen/Modul/Subsistem | Jenis | Penjelasan |
| :--- | :--- | :--- |
| Pengguna | Model | Mengelola identitas akun, profil sesuai peran, portofolio, saldo, dan status verifikasi pengguna. Mencakup kelas Pengguna, TenagaKerja, PenyediaKerja dan CustomerService. |
| LowonganPekerjaan | Model | Model yang menyimpan spesifikasi pekerjaan meliputi judul, deskripsi, batas kuota, nominal upah, dan status (*Open/Closed*). |
| PengajuanPenawaran | Model | Model yang menyimpan data lamaran dari Tenaga Kerja, berisi pesan penawaran, *timestamp*, dan status lamaran. |
| TransaksiPekerjaan | Model | Mengelola kesepakatan, status pengerjaan, deskripsi hasil, lampiran bukti, dan waktu penyerahan. Mencakup kelas TransaksiPekerjaan dan BuktiPenyerahan. |
| TagihanPembayaran | Model | Mengelola tagihan, upah dan biaya layanan, permintaan penarikan pendapatan, tujuan transfer, serta catatan dan status transaksi pembayaran. Mencakup kelas TagihanPembayaran, PencairanDana dan PaymentGateway. |
| UlasanRating | Model | Model yang menyimpan data penilaian pasca-pekerjaan (skala 1-5) dan ulasan teks untuk mencegah *double review*. |
| TiketSengketa | Model | Mengelola laporan keluhan, bukti, status tiket, keputusan, dan riwayat penanganan. Mencakup kelas TiketSengketa dan RiwayatSengketa. |
| Notifikasi | Model | Model yang menyimpan pesan pemberitahuan ke *dashboard* pengguna terkait aktivitas akun maupun transaksi. |
| PenggunaUI | View | Menampilkan formulir registrasi/login, profil, dashboard pengguna, dan pengajuan serta pemeriksaan identitas. Mencakup kelas PenggunaUI, TenagaKerjaUI, PenyediaKerjaUI dan CustomerServiceUI. |
| LowonganPekerjaanUI | View | Antarmuka yang menyediakan formulir pembuatan lowongan dan katalog pencarian pekerjaan. Meneruskan aksi pengguna yang terkait ke LowonganPekerjaanController. |
| PengajuanPenawaranUI | View | Antarmuka yang menampilkan formulir pengisian pesan penawaran bagi Tenaga Kerja. Meneruskan aksi pengguna yang terkait ke PengajuanPenawaranController. |
| TransaksiPekerjaanUI | View | Menampilkan rincian dan status pekerjaan, formulir unggah hasil, serta pilihan persetujuan atau revisi. Mencakup kelas TransaksiPekerjaanUI dan BuktiPenyerahanUI. |
| TagihanPembayaranUI | View | Menampilkan invoice, metode dan instruksi pembayaran, formulir penarikan pendapatan, serta status transaksi dana. Mencakup kelas TagihanPembayaranUI, PencairanDanaUI dan PaymentGatewayUI. |
| UlasanRatingUI | View | Antarmuka yang merender formulir pemberian bintang dan komentar ulasan. Meneruskan aksi pengguna yang terkait ke UlasanRatingController. |
| TiketSengketaUI | View | Menampilkan formulir dan rincian keluhan, bukti tambahan, keputusan, serta urutan aktivitas penanganan. Mencakup kelas TiketSengketaUI dan RiwayatSengketaUI. |
| NotifikasiUI | View | Antarmuka berupa *pop-up*, bel, atau menu *dropdown* pesan masuk bagi pengguna. Meneruskan aksi pengguna yang terkait ke NotifikasiController. |
| PenggunaController | Controller | Memproses registrasi/login, pembaruan profil, pemeriksaan hak akses, dan keputusan verifikasi identitas. Mencakup kelas PenggunaController, TenagaKerjaController, PenyediaKerjaController dan CustomerServiceController. |
| LowonganPekerjaanController | Controller | Pengendali untuk memvalidasi isian *create* lowongan, pemfilteran pencarian, dan kalkulasi sisa kuota. |
| PengajuanPenawaranController | Controller | Pengendali untuk memvalidasi persyaratan melamar dan merekam data pelamar ke *database*. |
| TransaksiPekerjaanController | Controller | Memproses perubahan status pekerjaan, validasi dan penyimpanan bukti, serta konfirmasi penyelesaian atau permintaan revisi. Mencakup kelas TransaksiPekerjaanController dan BuktiPenyerahanController. |
| TagihanPembayaranController | Controller | Menghitung tagihan, memvalidasi saldo serta tujuan transfer, mengirim instruksi pembayaran, pencairan atau refund, dan memproses konfirmasi layanan pembayaran eksternal. Mencakup kelas TagihanPembayaranController, PencairanDanaController dan PaymentGatewayController. |
| UlasanRatingController | Controller | Pengendali untuk mencegah ulasan ganda dan merekapitulasi rata-rata rating. |
| TiketSengketaController | Controller | Memvalidasi laporan serta kewenangan petugas, mencatat keputusan dan riwayat, serta memproses tindak lanjut penyelesaian sengketa. Mencakup kelas TiketSengketaController dan RiwayatSengketaController. |
| NotifikasiController | Controller | Pengendali untuk memicu pengiriman pesan otomatis secara *real-time* ke penerima yang tepat. |
| Autentikasi | Pendukung | Memverifikasi kredensial dan mengelola sesi pengguna agar akses aplikasi sesuai dengan identitas serta hak pengguna. |
| Database | Penyimpanan Data | Menyimpan data aplikasi secara persisten, termasuk akun, lowongan, penawaran, pekerjaan, pembayaran, penilaian, keluhan, dan riwayat aktivitas. |
| PenyimpananBerkas | Penyimpanan Data | Menyimpan dokumen identitas, lampiran hasil pekerjaan, dan bukti keluhan serta menyediakan akses berkas sesuai hak pengguna. |

## 2.4 Model Arsitektur Perangkat Lunak
### 2.4.1 Logical View
Logical View dipilih karena dapat menggambarkan struktur fungsional Kerja-In melalui pembagian tanggung jawab dan hubungan antarkomponen berdasarkan pola Model-View-Controller (MVC). Kerja-In memiliki fitur yang saling berkaitan, seperti pengelolaan lowongan, pengajuan penawaran, pelaksanaan pekerjaan, pembayaran, dan penanganan sengketa. Melalui Logical View, tim pengembang dapat memahami komponen yang mendukung setiap fungsi serta ketergantungan antarkomponen tersebut. Representasi ini membantu pembagian tugas pengembangan, penelusuran dampak perubahan, serta penyusunan diagram kelas dan sequence diagram pada tahap perancangan terperinci.

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/Logical View Class DIagram.png" width="50%">
</p>
<p align="center">
<i>Gambar 2.4.1. Logical View pada Kerja-In</i>
</p>

<br>

---

# BAB 3: Realisasi Use Case

## 3.1 Use Case Melakukan Registrasi

**ID Use Case:** UC01

**Nama Use Case:** Melakukan Registrasi

### 3.1.1 Identifikasi Kelas
Tabel 3.1. Identifikasi Kelas Use Case UC01

| No | Nama Kelas Perancangan | Nama Kelas Analisis Terkait |
|:--- | :--- | :--- |
| 1 | Pengguna | C01 - Pengguna |
| 2 | TenagaKerja | C02 - TenagaKerja |
| 3 | PenyediaKerja | C03 - PenyediaKerja |
| 4 | PenggunaUI | C16 - PenggunaUI |
| 5 | TenagaKerjaUI | C17 - TenagaKerjaUI |
| 6 | PenyediaKerjaUI | C18 - PenyediaKerjaUI |
| 7 | PenggunaController | C31 - PenggunaController |
| 8 | TenagaKerjaController | C32 - TenagaKerjaController |
| 9 | PenyediaKerjaController | C33 - PenyediaKerjaController |

### 3.1.2 Sequence Diagram

- **Skenario Normal**

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/sequence diagram sn uc01.png" width="50%">
</p>
<p align="center">
<i>Gambar 3.1.1. Sequence Diagram UC01</i>
</p>

- **Skenario Alternatif 1: Batas Usia Tidak Valid**

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/sequence diagram sa1 uc01.png" width="50%">
</p>
<p align="center">
<i>Gambar 3.1.2. Sequence Diagram UC01 - Batas Usia Tidak Valid</i>
</p>

- **Skenario Alternatif 2: Email Sudah Terdaftar**

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/sequence diagram sa2 uc01.png" width="50%">
</p>
<p align="center">
<i>Gambar 3.1.3. Sequence Diagram UC01 - Email Sudah Terdaftar</i>
</p>


### 3.1.3 Diagram Kelas

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/class diagram uc01.png" width="35%">
</p>
<p align="center">
<i>Gambar 3.1.4. Diagram Kelas Melakukan Registrasi</i>
</p>

## 3.2 Use Case Mengelola Verifikasi Identitas

**ID Use Case:** UC02

**Nama Use Case:** Mengelola Verifikasi Identitas

### 3.2.1 Identifikasi Kelas

Tabel 3.2. Identifikasi Kelas Use Case UC02

| No | Nama Kelas Perancangan | Nama Kelas Analisis Terkait |
| :--- | :--- | :--- |
| 1 | TenagaKerja | C02 - TenagaKerja |
| 2 | CustomerService | C04 - CustomerService |
| 3 | Notifikasi | C14 - Notifikasi |
| 4 | TenagaKerjaUI | C17 - TenagaKerjaUI |
| 5 | CustomerServiceUI | C19 - CustomerServiceUI |
| 6 | NotifikasiUI | C29 - NotifikasiUI |
| 7 | TenagaKerjaController | C32 - TenagaKerjaController |
| 8 | CustomerServiceController | C34 - CustomerServiceController |
| 9 | NotifikasiController | C44 - NotifikasiController |

### 3.2.2 Sequence Diagram

- **Skenario Normal**

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/sequence diagram sn uc02.png" width="50%">
</p>
<p align="center">
<i>Gambar 3.2.1. Sequence Diagram UC02</i>
</p>

- **Skenario Alternatif 1: Format atau Ukuran Dokumen Tidak Valid**

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/sequence diagram sa1 uc02.png" width="50%">
</p>
<p align="center">
<i>Gambar 3.2.2. Sequence Diagram UC02 - Format atau Ukuran Dokumen Tidak Valid</i>
</p>

- **Skenario Alternatif 2: Dokumen Ditolak oleh Customer Service**

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/sequence diagram sa2 uc02.png" width="50%">
</p>
<p align="center">
<i>Gambar 3.2.3. Sequence Diagram UC02 - Dokumen Ditolak oleh Customer Service</i>
</p>

- **Skenario Alternatif 3: Mengakses Fitur Utama Sebelum Terverifikasi**

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/sequence diagram sa3 uc02.png" width="50%">
</p>
<p align="center">
<i>Gambar 3.2.4. Sequence Diagram UC02 - Mengakses Fitur Utama Sebelum Terverifikasi</i>
</p>

### 3.2.3 Diagram Kelas

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/class diagram uc02.png" width="35%">
</p>
<p align="center">
<i>Gambar 3.2.5. Diagram Kelas Mengelola Verifikasi Identitas</i>
</p>

## 3.3 Use Case Mengelola Lowongan Pekerjaan

**ID Use Case:** UC03

**Nama Use Case:** Mengelola Lowongan Pekerjaan

### 3.3.1 Identifikasi Kelas

Tabel 3.3. Identifikasi Kelas Use Case UC03

| No | Nama Kelas Perancangan | Nama Kelas Analisis Terkait |
|:--- | :--- | :--- |
| 1 | PenyediaKerja | PenyediaKerja |
| 2 | LowonganPekerjaan | LowonganPekerjaan |
| 3 | PenyediaKerjaUI | PenyediaKerjaUI |
| 4 | LowonganPekerjaanUI | LowonganPekerjaanUI |
| 5 | PenyediaKerjaController | PenyediaKerjaController |
| 6 | LowonganPekerjaanController | LowonganPekerjaanController |

### 3.3.2 Sequence Diagram

- **Skenario Normal**

<p align="center">
<img alt="Sequence Diagram UC03 Skenario Normal" src="../M7/assets/diagram/sequence diagram sn uc03.png" width="70%">
</p>
<p align="center"><i>Gambar 3.3.1. Sequence Diagram UC03 - Skenario Normal</i></p>

- **Skenario Alternatif 1: Isian Formulir Kosong atau Tidak Valid**

<p align="center">
<img alt="Sequence Diagram UC03 Alternatif 1" src="../M7/assets/diagram/sequence diagram sa1 uc03.png" width="70%">
</p>
<p align="center"><i>Gambar 3.3.2. Sequence Diagram UC03 - Isian Formulir Tidak Valid</i></p>

- **Skenario Alternatif 2: Membatalkan Pembuatan Lowongan**

<p align="center">
<img alt="Sequence Diagram UC03 Alternatif 2" src="../M7/assets/diagram/sequence diagram sa2 uc03.png" width="70%">
</p>
<p align="center"><i>Gambar 3.3.3. Sequence Diagram UC03 - Membatalkan Pembuatan Lowongan</i></p>

### 3.3.3 Diagram Kelas

<p align="center">
<img alt="Diagram Kelas UC03" src="../M4/assets/diagram/class-diagram-uc03.png" width="70%">
</p>
<p align="center"><i>Gambar 3.3.4. Diagram Kelas Mengelola Lowongan Pekerjaan</i></p>

## 3.4 Use Case Mencari Lowongan Pekerjaan

**ID Use Case:** UC04

**Nama Use Case:** Mencari Lowongan Pekerjaan

### 3.4.1 Identifikasi Kelas

Tabel 3.4. Identifikasi Kelas Use Case UC04

| No | Nama Kelas Perancangan | Nama Kelas Analisis Terkait |
|:--- | :--- | :--- |
| 1 | TenagaKerja | TenagaKerja |
| 2 | LowonganPekerjaan | LowonganPekerjaan |
| 3 | TenagaKerjaUI | TenagaKerjaUI |
| 4 | LowonganPekerjaanUI | LowonganPekerjaanUI |
| 5 | TenagaKerjaController | TenagaKerjaController |
| 6 | LowonganPekerjaanController | LowonganPekerjaanController |

### 3.4.2 Sequence Diagram

- **Skenario Normal**

<p align="center">
<img alt="Sequence Diagram UC04 Skenario Normal" src="../M7/assets/diagram/sequence diagram sn uc04.png" width="70%">
</p>
<p align="center"><i>Gambar 3.4.1. Sequence Diagram UC04 - Skenario Normal</i></p>

- **Skenario Alternatif 1: Pencarian Tidak Ditemukan**

<p align="center">
<img alt="Sequence Diagram UC04 Alternatif 1" src="../M7/assets/diagram/sequence diagram sa1 uc04.png" width="70%">
</p>
<p align="center"><i>Gambar 3.4.2. Sequence Diagram UC04 - Pencarian Tidak Ditemukan</i></p>

### 3.4.3 Diagram Kelas

<p align="center">
<img alt="Diagram Kelas UC04" src="../M4/assets/diagram/class-diagram-uc04.png" width="70%">
</p>
<p align="center"><i>Gambar 3.4.3. Diagram Kelas Mencari Lowongan Pekerjaan</i></p>

## 3.5 Use Case Mengajukan Penawaran Pekerjaan

**ID Use Case:** UC05

**Nama Use Case:** Mengajukan Penawaran Pekerjaan

### 3.5.1 Identifikasi Kelas

Tabel 3.5. Identifikasi Kelas Use Case UC05

| No | Nama Kelas Perancangan | Nama Kelas Analisis Terkait |
|:--- | :--- | :--- |
| 1 | TenagaKerja | TenagaKerja |
| 2 | LowonganPekerjaan | LowonganPekerjaan |
| 3 | PengajuanPenawaran | PengajuanPenawaran |
| 4 | Notifikasi | Notifikasi |
| 5 | PengajuanPenawaranUI | PengajuanPenawaranUI |
| 6 | NotifikasiUI | NotifikasiUI |
| 7 | PengajuanPenawaranController | PengajuanPenawaranController |
| 8 | NotifikasiController | NotifikasiController |

### 3.5.2 Sequence Diagram

- **Skenario Normal**

<p align="center">
<img alt="Sequence Diagram UC05 Skenario Normal" src="../M7/assets/diagram/sequence diagram sn uc05.png">
</p>
<p align="center"><i>Gambar 3.5.1. Sequence Diagram UC05 - Skenario Normal</i></p>

- **Skenario Alternatif 1: Akun Belum Terverifikasi**

<p align="center">
<img alt="Sequence Diagram UC05 Alternatif 1" src="../M7/assets/diagram/sequence diagram sa1 uc05.png">
</p>
<p align="center"><i>Gambar 3.5.2. Sequence Diagram UC05 - Akun Belum Terverifikasi</i></p>

- **Skenario Alternatif 2: Pembatalan Pengajuan**

<p align="center">
<img alt="Sequence Diagram UC05 Alternatif 2" src="../M7/assets/diagram/sequence diagram sa2 uc05.png">
</p>
<p align="center"><i>Gambar 3.5.3. Sequence Diagram UC05 - Pembatalan Pengajuan</i></p>

### 3.5.3 Diagram Kelas

<p align="center">
<img alt="Diagram Kelas UC05" src="../M4/assets/diagram/class-diagram-uc05.png" width="70%">
</p>
<p align="center"><i>Gambar 3.5.4. Diagram Kelas Mengajukan Penawaran Pekerjaan</i></p>
## 3.6 Use Case Memilih Tenaga Kerja

**ID Use Case:** UC06   
**Nama Use Case:** Memilih Tenaga Kerja

### 3.6.1 Identifikasi Kelas

Tabel 3.6. Identifikasi Kelas Use Case UC06

| No | Nama Kelas Perancangan | Nama Kelas Analisis Terkait |
|:--- | :--- | :--- |
| 1 | PenyediaKerja | PenyediaKerja |
| 2 | LowonganPekerjaan | LowonganPekerjaan |
| 3 | PengajuanPenawaran | PengajuanPenawaran |
| 4 | TransaksiPekerjaan | TransaksiPekerjaan |
| 5 | Notifikasi | Notifikasi |
| 6 | PenyediaKerjaUI | PenyediaKerjaUI |
| 7 | LowonganPekerjaanUI | LowonganPekerjaanUI |
| 8 | PengajuanPenawaranUI | PengajuanPenawaranUI |
| 9 | TransaksiPekerjaanUI | TransaksiPekerjaanUI |
| 10 | NotifikasiUI | NotifikasiUI |
| 11 | PenyediaKerjaController | PenyediaKerjaController |
| 12 | LowonganPekerjaanController | LowonganPekerjaanController |
| 13 | PengajuanPenawaranController | PengajuanPenawaranController |
| 14 | TransaksiPekerjaanController | TransaksiPekerjaanController |
| 15 | NotifikasiController | NotifikasiController |

### 3.6.2 Sequence Diagram

- **Skenario Normal**
<p align="center">
<img alt="Sequence Diagram SN UC06" src="../M7/assets/diagram/sequence diagram sn uc06.png" width="55%">
</p>
<p align="center">
<i>Gambar 3.6.1. Sequence Diagram UC06 - Skenario Normal</i>
</p>

- **Skenario Alternatif 1: Kuota Lowongan Sudah Penuh Saat Konfirmasi**
<p align="center">
<img alt="Sequence Diagram SA1 UC06" src="../M7/assets/diagram/sequence diagram sa1 uc06.png" width="55%">
</p>
<p align="center">
<i>Gambar 3.6.2. Sequence Diagram UC06 - Kuota Lowongan Sudah Penuh Saat Konfirmasi</i>
</p>

- **Skenario Alternatif 2: Penyedia Kerja Membatalkan Pemilihan Pelamar**
<p align="center">
<img alt="Sequence Diagram SA2 UC06" src="../M7/assets/diagram/sequence diagram sa2 uc06.png" width="55%">
</p>
<p align="center">
<i>Gambar 3.6.3. Sequence Diagram UC06 - Penyedia Kerja Membatalkan Pemilihan Pelamar</i>
</p>

### 3.6.3 Diagram Kelas
<p align="center">
<img alt="Diagram Kelas UC06" src="../M7/assets/diagram/class diagram uc 06.png" width="40%">
</p>
<p align="center">
<i>Gambar 3.6.4. Diagram Kelas Memilih Tenaga Kerja</i>
</p>


## 3.7 Use Case Melakukan Pembayaran Pekerjaan

**ID Use Case:** UC07   
**Nama Use Case:** Melakukan Pembayaran Pekerjaan

### 3.7.1 Identifikasi Kelas

Tabel 3.7. Identifikasi Kelas Use Case UC07

| No | Nama Kelas Perancangan | Nama Kelas Analisis Terkait |
|:--- | :--- | :--- |
| 1 | PenyediaKerja | PenyediaKerja |
| 2 | TransaksiPekerjaan | TransaksiPekerjaan |
| 3 | TagihanPembayaran | TagihanPembayaran |
| 4 | Notifikasi | Notifikasi |
| 5 | PaymentGateway | PaymentGateway |
| 6 | PenyediaKerjaUI | PenyediaKerjaUI |
| 7 | TransaksiPekerjaanUI | TransaksiPekerjaanUI |
| 8 | TagihanPembayaranUI | TagihanPembayaranUI |
| 9 | NotifikasiUI | NotifikasiUI |
| 10 | PaymentGatewayUI | PaymentGatewayUI |
| 11 | PenyediaKerjaController | PenyediaKerjaController |
| 12 | TransaksiPekerjaanController | TransaksiPekerjaanController |
| 13 | TagihanPembayaranController | TagihanPembayaranController |
| 14 | NotifikasiController | NotifikasiController |
| 15 | PaymentGatewayController | PaymentGatewayController |

### 3.7.2 Sequence Diagram

- **Skenario Normal**
<p align="center">
<img alt="Sequence Diagram SN UC07" src="../M7/assets/diagram/sequence diagram sn uc07.png" width="55%">
</p>
<p align="center">
<i>Gambar 3.7.1. Sequence Diagram UC07 - Skenario Normal</i>
</p>

- **Skenario Alternatif 1: Pembayaran Gagal atau Dibatalkan oleh Payment Gateway**
<p align="center">
<img alt="Sequence Diagram SA1 UC07" src="../M7/assets/diagram/sequence diagram sa1 uc07.png" width="55%">
</p>
<p align="center">
<i>Gambar 3.7.2. Sequence Diagram UC07 - Pembayaran Gagal atau Dibatalkan oleh Payment Gateway</i>
</p>

- **Skenario Alternatif 2 : Waktu Pembayaran Habis (Timeout / Expired)**
<p align="center">
<img alt="Sequence Diagram SA2 UC07" src="../M7/assets/diagram/sequence diagram sa2 uc07.png" width="55%">
</p>
<p align="center">
<i>Gambar 3.7.3. Sequence Diagram UC07 - Waktu Pembayaran Habis (Timeout / Expired)</i>
</p>

### 3.7.3 Diagram Kelas
<p align="center">
<img alt="Diagram Kelas UC07" src="../M7/assets/diagram/class diagram uc 07.png" width="40%">
</p>
<p align="center">
<i>Gambar 3.7.4. Diagram Kelas Melakukan Pembayaran Pekerjaan</i>
</p>


## 3.8 Use Case Menyerahkan Hasil Pekerjaan

**ID Use Case:** UC08   
**Nama Use Case:** Menyerahkan Hasil Pekerjaan

### 3.8.1 Identifikasi Kelas

Tabel 3.8. Identifikasi Kelas Use Case UC08

| No | Nama Kelas Perancangan | Nama Kelas Analisis Terkait |
|:--- | :--- | :--- |
| 1 | TenagaKerja | TenagaKerja |
| 2 | TransaksiPekerjaan | TransaksiPekerjaan |
| 3 | BuktiPenyerahan | BuktiPenyerahan |
| 4 | Notifikasi | Notifikasi |
| 5 | TenagaKerjaUI | TenagaKerjaUI |
| 6 | TransaksiPekerjaanUI | TransaksiPekerjaanUI |
| 7 | BuktiPenyerahanUI | BuktiPenyerahanUI |
| 8 | NotifikasiUI | NotifikasiUI |
| 9 | TenagaKerjaController | TenagaKerjaController |
| 10 | TransaksiPekerjaanController | TransaksiPekerjaanController |
| 11 | BuktiPenyerahanController | BuktiPenyerahanController |
| 12 | NotifikasiController | NotifikasiController |

### 3.8.2 Sequence Diagram

- **Skenario Normal**
<p align="center">
<img alt="Sequence Diagram SN UC08" src="../M7/assets/diagram/sequence diagram sn uc08.png" width="55%">
</p>
<p align="center">
<i>Gambar 3.8.1. Sequence Diagram UC08 - Skenario Normal</i>
</p>

- **Skenario Alternatif 1: Ukuran Berkas Melebihi Batas Maksimal**
<p align="center">
<img alt="Sequence Diagram SA1 UC08" src="../M7/assets/diagram/sequence diagram sa1 uc08.png" width="55%">
</p>
<p align="center">
<i>Gambar 3.8.2. Sequence Diagram UC08 - Ukuran Berkas Melebihi Batas Maksimal</i>
</p>

- **Skenario Alternatif 2: Tenaga Kerja Belum Mengunggah Berkas Wajib**
<p align="center">
<img alt="Sequence Diagram SA2 UC08" src="../M7/assets/diagram/sequence diagram sa2 uc08.png" width="55%">
</p>
<p align="center">
<i>Gambar 3.8.3. Sequence Diagram UC08 - Tenaga Kerja Belum Mengunggah Berkas Wajib</i>
</p>

### 3.8.3 Diagram Kelas
<p align="center">
<img alt="Diagram Kelas UC08" src="../M7/assets/diagram/class diagram uc 08.png" width="40%">
</p>
<p align="center">
<i>Gambar 3.8.4. Diagram Kelas Menyerahkan Hasil Pekerjaan</i>
</p>

## 3.9 Use Case Memverifikasi Penyelesaian Pekerjaan

**ID Use Case:** UC09  
**Nama Use Case:** Memverifikasi Penyelesaian Pekerjaan

### 3.9.1 Identifikasi Kelas

Tabel 3.9. Identifikasi Kelas Use Case UC09

| No | Nama Kelas Perancangan | Nama Kelas Analisis Terkait |
|:--- | :--- | :--- |
| 1 | PenyediaKerja | PenyediaKerja |
| 2 | TransaksiPekerjaan | TransaksiPekerjaan |
| 3 | BuktiPenyerahan | BuktiPenyerahan |
| 4 | Notifikasi | Notifikasi |
| 5 | PenyediaKerjaUI | PenyediaKerjaUI |
| 6 | TransaksiPekerjaanUI | TransaksiPekerjaanUI |
| 7 | BuktiPenyerahanUI | BuktiPenyerahanUI |
| 8 | NotifikasiUI | NotifikasiUI |
| 9 | PenyediaKerjaController | PenyediaKerjaController |
| 10 | TransaksiPekerjaanController | TransaksiPekerjaanController |
| 11 | BuktiPenyerahanController | BuktiPenyerahanController |
| 12 | NotifikasiController | NotifikasiController |

### 3.9.2 Sequence Diagram

- **Skenario Normal**

<p align="center">
<img alt="Sequence Diagram UC09 - Skenario Normal" src="../M7/assets/diagram/sequence diagram sn uc09 (1).png" width="50%">
</p>
<p align="center">
<i>Gambar 3.9.1. Sequence Diagram UC09 - Skenario Normal</i>
</p>

- **Skenario Alternatif 1 : Hasil Pekerjaan Belum Sesuai (Penyedia Kerja Meminta Revisi)**

<p align="center">
<img alt="Sequence Diagram UC09 - Permintaan Revisi" src="../M7/assets/diagram/sequence diagram sa1 uc09 (1).png" width="50%">
</p>
<p align="center">
<i>Gambar 3.9.2. Sequence Diagram UC09 - Hasil Pekerjaan Belum Sesuai (Penyedia Kerja Meminta Revisi)</i>
</p>

- **Skenario Alternatif 2 : Terjadi Ketidaksepakatan / Perselisihan Hasil Kerja**

<p align="center">
<img alt="Sequence Diagram UC09 - Perselisihan Hasil Kerja" src="../M7/assets/diagram/sequence diagram sa2 uc09 (1).png" width="50%">
</p>
<p align="center">
<i>Gambar 3.9.3. Sequence Diagram UC09 - Terjadi Ketidaksepakatan / Perselisihan Hasil Kerja</i>
</p>

### 3.9.3 Diagram Kelas

<p align="center">
<img alt="Diagram Kelas UC09" src="../M7/assets/diagram/class diagram uc09.png" width="35%">
</p>
<p align="center">
<i>Gambar 3.9.4. Diagram Kelas Memverifikasi Penyelesaian Pekerjaan</i>
</p>

## 3.10 Use Case Melakukan Pencairan Dana

**ID Use Case:** UC10
**Nama Use Case:** Melakukan Pencairan Dana

### 3.10.1 Identifikasi Kelas

Tabel 3.10. Identifikasi Kelas Use Case UC10

| No | Nama Kelas Perancangan | Nama Kelas Analisis Terkait |
|:--- | :--- | :--- |
| 1 | TenagaKerja | TenagaKerja |
| 2 | PencairanDana | PencairanDana |
| 3 | PaymentGateway | PaymentGateway |
| 4 | Notifikasi | Notifikasi |
| 5 | TenagaKerjaUI | TenagaKerjaUI |
| 6 | PencairanDanaUI | PencairanDanaUI |
| 7 | PaymentGatewayUI | PaymentGatewayUI |
| 8 | NotifikasiUI | NotifikasiUI |
| 9 | TenagaKerjaController | TenagaKerjaController |
| 10 | PencairanDanaController | PencairanDanaController |
| 11 | PaymentGatewayController | PaymentGatewayController |
| 12 | NotifikasiController | NotifikasiController |

### 3.10.2 Sequence Diagram 

- **Skenario Normal**

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/sequence diagram sn uc10.png" width="50%">
</p>
<p align="center">
<i>Gambar 3.10.1. Sequence Diagram UC10</i>
</p>

- **Skenario Alternatif 1 : Data Rekening/E-wallet Tidak Valid**

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/sequence diagram sa1 uc10.png" width="50%">
</p>
<p align="center">
<i>Gambar 3.10.2. Sequence Diagram UC10 - Data Rekening/E-wallet Tidak Valid</i>
</p>

- **Skenario Alternatif 2 : Nominal Penarikan Melebihi Saldo**

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/sequence diagram  sa2 uc10.png" width="50%">
</p>
<p align="center">
<i>Gambar 3.10.3. Sequence Diagram UC10 - Nominal Penarikan Melebihi Saldo</i>
</p>

### 3.10.3 Diagram Kelas

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/class diagram uc10.png" width="35%">
</p>
<p align="center">
<i>Gambar 3.10.4. Diagram Kelas Melakukan Pencairan Dana</i>
</p>

## 3.11 Use Case Memberikan Penilaian Kerja

**ID Use Case:** UC11
**Nama Use Case:** Memberikan Penilaian Kerja

### 3.11.1 Identifikasi Kelas

Tabel 3.11. Identifikasi Kelas Use Case UC11

| No | Nama Kelas Perancangan | Nama Kelas Analisis Terkait |
|:--- | :--- | :--- |
| 1 | Pengguna | Pengguna |
| 2 | TransaksiPekerjaan | TransaksiPekerjaan |
| 3 | UlasanRating | UlasanRating |
| 4 | PenggunaUI | PenggunaUI |
| 5 | TransaksiPekerjaanUI | TransaksiPekerjaanUI |
| 6 | UlasanRatingUI | UlasanRatingUI |
| 7 | PenggunaController | PenggunaController |
| 8 | TransaksiPekerjaanController | TransaksiPekerjaanController |
| 9 | UlasanRatingController | UlasanRatingController |

### 3.11.2 Sequence Diagram 

- **Skenario Normal dan Skenario Alternatif 1**

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/sequence diagram sn_sa1 uc11.png" width="50%">
</p>
<p align="center">
<i>Gambar 3.11.1. Sequence Diagram UC11</i>
</p>

- **Skenario Alternatif 2 : Rating Tidak Diisi**

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/sequence diagram sa2 uc11.png" width="50%">
</p>
<p align="center">
<i>Gambar 3.11.2. Sequence Diagram UC11 - Rating Tidak Diisi</i>
</p>

### 3.11.3 Diagram Kelas 

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/class diagram uc11.png" width="35%">
</p>
<p align="center">
<i>Gambar 3.11.3. Diagram Kelas Memberikan Penilaian Kerja</i>
</p>

## 3.12 Use Case Menangani Keluhan

**ID Use Case:** UC12

**Nama Use Case:** Menangani Keluhan

### 3.12.1 Identifikasi Kelas

Tabel 3.12. Identifikasi Kelas Use Case UC12

| No | Nama Kelas Perancangan | Nama Kelas Analisis Terkait |
|:--- | :--- | :--- |
| 1 | TenagaKerja | TenagaKerja |
| 2 | PencairanDana | PencairanDana |
| 3 | PaymentGateway | PaymentGateway |
| 4 | Notifikasi | Notifikasi |
| 5 | TenagaKerjaUI | TenagaKerjaUI |
| 6 | PencairanDanaUI | PencairanDanaUI |
| 7 | PaymentGatewayUI | PaymentGatewayUI |
| 8 | NotifikasiUI | NotifikasiUI |
| 9 | TenagaKerjaController | TenagaKerjaController |
| 10 | PencairanDanaController | PencairanDanaController |
| 11 | PaymentGatewayController | PaymentGatewayController |
| 12 | NotifikasiController | NotifikasiController |

### 3.12.2 Sequence Diagram 

- **Skenario Normal dan Skenario Alternatif 1**

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/sequence diagram sn uc12.png" width="50%">
</p>
<p align="center">
<i>Gambar 3.12.1. Sequence Diagram UC12</i>
</p>

- **Skenario Alternatif 1 dan 2 : Permintaan Bukti Tambahan & Ditolak**

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/sequence diagram sa1_sa2 uc12.png" width="50%">
</p>
<p align="center">
<i>Gambar 3.12.2. Sequence Diagram UC12 - Permintaan Bukti Tambahan & Ditolak</i>
</p>

- **Skenario Alternatif 3 : Pengguna Membatalkan Tiket Keluhan**

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/sequence diagram sa3 uc12.png" width="50%">
</p>
<p align="center">
<i>Gambar 3.12.3. Sequence Diagram UC12 - Pengguna Membatalkan Tiket Keluhan</i>
</p>

### 3.12.3 Diagram Kelas 

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="../M7/assets/diagram/class diagram uc12.png" width="35%">
</p>
<p align="center">
<i>Gambar 3.12.4. Diagram Kelas Menangani Keluhan</i>
</p>

<br>

---

# BAB 4: Diagram Kelas Keseluruhan

## 4.1 Diagram Kelas

<p align="center">
<img alt="Diagram Kelas Perancangan Keseluruhan Kerja-In" src="../M7/assets/diagram/class-diagram.jpg" width="100%">
</p>
<p align="center">
<i>Gambar 4.1.1. Diagram Kelas Perancangan Keseluruhan Kerja-In</i>
</p>

Tabel 4.1. Daftar Kelas Perancangan Keseluruhan


| ID Kelas | Nama Kelas | Atribut | Metode/Operasi |
| :--- | :--- | :--- | :--- |
| C01 | Pengguna | `# id_pengguna: String`<br>`# nama: String`<br>`# email: String`<br>`# password: String`<br>`# tanggal_lahir: Date`<br>`# token_auth: String`<br>`# idPengguna: String`<br>`- akumulasiRating: Float` | `+ registrasi(): void`<br>`+ validasiUsia(): Boolean`<br>`+ login(): Boolean`<br>`+ generateToken(): String`<br>`+ berikanUlasan(idTransaksi, nilai, deskripsi): void` |
| C02 | TenagaKerja | `# idPengguna: String`<br>`# nama: String`<br>`- status_verifikasi: String`<br>`- saldo_pendapatan: Decimal`<br>`- rating_akumulatif: Float`<br>`# email: String`<br>`- idTenagaKerja: String`<br>`- saldoPendapatan: Decimal`<br>`- rekeningTujuan: String` | `+ cariLowongan(kataKunci): List<LowonganPekerjaan>`<br>`+ filterLowongan(kategori): List<LowonganPekerjaan>`<br>`+ buatProfil(): void`<br>`+ ajukanVerifikasi(): void`<br>`+ perbaruiStatusVerifikasi(): void`<br>`+ ajukanPenawaran(idLowongan, pesan): void`<br>`+ batalkanPengajuan(): void`<br>`+ serahkanPekerjaan(idTransaksi, deskripsi, berkas): void`<br>`+ terimaUpah(nominal): void`<br>`+ ajukanPencairan(nominal): void` |
| C03 | PenyediaKerja | `# idPengguna: String`<br>`# nama: String`<br>`# email: String`<br>`- idPenyedia: String` | `+ buatLowonganBaru(judul, deskripsi, kuota, lokasi, upah): void`<br>`+ batalkanLowongan(): void`<br>`+ buatProfil(): void`<br>`+ lihatDaftarPelamar(): List<PengajuanPenawaran>`<br>`+ pilihPelamar(idPenawaran): void`<br>`+ bayarTagihan(idTagihan, metode): void`<br>`+ setujuiHasilPekerjaan(): void` |
| C04 | CustomerService | `- idPengguna: String`<br>`- nama: String`<br>`- peran: String` | `+ tinjauVerifikasi(): void`<br>`+ setujuiVerifikasi(): void`<br>`+ tolakVerifikasi(): void`<br>`+ tinjauTiket(idTiket): void`<br>`+ putuskanSengketa(idTiket, keputusan): void` |
| C05 | LowonganPekerjaan | `- idLowongan: String`<br>`- judul: String`<br>`- deskripsi: String`<br>`- kuota: Integer`<br>`- lokasi: String`<br>`- upah: Decimal`<br>`- status: String`<br>`- kategori: String`<br>`- jumlahDiterima: Integer` | `- validasiIsianFormulir(): Boolean`<br>`+ simpanLowongan(): void`<br>`- setStatusDefault(): void`<br>`+ tampilkanDaftarLowongan(filter): List<LowonganPekerjaan>`<br>`+ cekStatusOpen(): Boolean`<br>`+ tampilkanTombolAjukan(): void`<br>`+ cekKuotaSisa(): Integer`<br>`# updateStatusLowongan(): void`<br>`- kurangiKuota(): void` |
| C06 | PengajuanPenawaran | `- idPenawaran: String`<br>`- idLowongan: String`<br>`- idTenagaKerja: String`<br>`- pesanPenawaran: String`<br>`- timestamp: Timestamp`<br>`- status: String`<br>`- pesan: String` | `+ simpanPengajuan(): void`<br>`- validasiStatusAkun(): Boolean`<br>`+ setStatusPersetujuan(status): void` |
| C07 | TransaksiPekerjaan | `- idTransaksi: String`<br>`- idLowongan: String`<br>`- idTenagaKerja: String`<br>`- idPenyediaKerja: String`<br>`- statusPekerjaan: String`<br>`- nominalUpah: Decimal`<br>`- statusPengerjaan: String` | `+ buatTransaksiBaru(): void`<br>`# updateStatusPekerjaan(status): void`<br>`+ verifikasiSelesai(): void`<br>`+ picuPembayaranUpah(): void`<br>`+ cekStatusSelesai(): Boolean`<br>`+ validasiUlasanGanda(): Boolean`<br>`+ getDetailTransaksi(): TransaksiPekerjaan` |
| C08 | BuktiPenyerahan | `- idPenyerahan: String`<br>`- idTransaksi: String`<br>`- deskripsiPengerjaan: String`<br>`- fileUrl: String`<br>`- ukuranFile: Integer`<br>`- timestampPengiriman: Timestamp` | `+ validasiUkuranFile(): Boolean`<br>`+ simpanBukti(): void` |
| C09 | TagihanPembayaran | `- idTagihan: String`<br>`- idTransaksi: String`<br>`- nominalUpah: Decimal`<br>`- commissionFee: Decimal`<br>`- totalBayar: Decimal`<br>`- expiryTimestamp: Timestamp`<br>`- statusBayar: String` | `+ hitungTotalTagihan(): Decimal`<br>`+ buatInvoice(): void`<br>`# updateStatusPembayaran(): void` |
| C10 | PencairanDana | `- idPencairan: String`<br>`- idTenagaKerja: String`<br>`- nominal: Decimal`<br>`- statusPencairan: String`<br>`- waktuPengajuan: Timestamp` | `+ buatTransaksiPencairan(): void`<br>`+ updateStatusPencairan(status): void` |
| C11 | UlasanRating | `- idUlasan: String`<br>`- idTransaksi: String`<br>`- nilai: Integer`<br>`- deskripsiUlasan: String` | `+ simpanUlasan(): void` |
| C12 | TiketSengketa | `- idTiket: String`<br>`- idTransaksi: String`<br>`- idPelapor: String`<br>`- kategoriMasalah: String`<br>`- deskripsiKomplain: String`<br>`- statusTiket: String` | `+ buatTiket(): void`<br>`+ updateStatus(statusBaru): void` |
| C13 | RiwayatSengketa | `- idRiwayat: String`<br>`- idTiket: String`<br>`- logAktivitas: String`<br>`- timestamp: Timestamp` | `+ catatRiwayat(aktivitas): void` |
| C14 | Notifikasi | `- id_notifikasi: String`<br>`- pesan_notifikasi: String`<br>`- waktu_kirim: Timestamp`<br>`- idPenerima: String`<br>`- pesan: String`<br>`- status_baca: Boolean`<br>`- idNotifikasi: String`<br>`- statusBaca: Boolean`<br>`- waktu: Timestamp`<br>`- idPengguna: String` | `+ kirimNotifikasi(): void`<br>`+ kirimNotifikasiPengajuanBaru(): void`<br>`+ kirimNotifikasiPenerimaan(): void`<br>`+ kirimNotifikasiSiapKerja(): void`<br>`+ kirimNotifikasiPeninjauan(): void`<br>`+ kirimNotifPenerimaanUpah(idTenagaKerja): void`<br>`+ kirimNotifPencairan(status): void`<br>`+ kirimNotifikasi(pesan): void` |
| C15 | PaymentGateway | `- idGateway: String`<br>`- namaProvider: String`<br>`- statusKoneksi: String` | `+ prosesPembayaran(): void`<br>`+ dapatkanCallbackStatus(): String`<br>`+ prosesTransferDana(rekening, nominal): void` |

<br>

---

# BAB 5: Perancangan Rinci Kelas

Bagian ini diisi dengan daftar seluruh kelas dalam tabel berikut:

Tabel 5.1. Daftar Kelas Perancangan dan Kelas Analisis Terkait

| No | Nama Kelas Perancangan | Nama Kelas Analisis Terkait |
| :--- | :--- | :--- |
| 1 | Pengguna | C01 - Pengguna |
| 2 | TenagaKerja | C02 - TenagaKerja |
| 3 | PenyediaKerja | C03 - PenyediaKerja |
| 4 | CustomerService | C04 - CustomerService |
| 5 | LowonganPekerjaan | C05 - LowonganPekerjaan |
| 6 | PengajuanPenawaran | C06 - PengajuanPenawaran |
| 7 | TransaksiPekerjaan | C07 - TransaksiPekerjaan |
| 8 | BuktiPenyerahan | C08 - BuktiPenyerahan |
| 9 | TagihanPembayaran | C09 - TagihanPembayaran |
| 10 | PencairanDana | C10 - PencairanDana |
| 11 | UlasanRating | C11 - UlasanRating |
| 12 | TiketSengketa | C12 - TiketSengketa |
| 13 | RiwayatSengketa | C13 - RiwayatSengketa |
| 14 | Notifikasi | C14 - Notifikasi |
| 15 | PaymentGateway | C15 - PaymentGateway |
| 16 | PenggunaUI | C16 - PenggunaUI |
| 17 | TenagaKerjaUI | C17 - TenagaKerjaUI |
| 18 | PenyediaKerjaUI | C18 - PenyediaKerjaUI |
| 19 | CustomerServiceUI | C19 - CustomerServiceUI |
| 20 | LowonganPekerjaanUI | C20 - LowonganPekerjaanUI |
| 21 | PengajuanPenawaranUI | C21 - PengajuanPenawaranUI |
| 22 | TransaksiPekerjaanUI | C22 - TransaksiPekerjaanUI |
| 23 | BuktiPenyerahanUI | C23 - BuktiPenyerahanUI |
| 24 | TagihanPembayaranUI | C24 - TagihanPembayaranUI |
| 25 | PencairanDanaUI | C25 - PencairanDanaUI |
| 26 | UlasanRatingUI | C26 - UlasanRatingUI |
| 27 | TiketSengketaUI | C27 - TiketSengketaUI |
| 28 | RiwayatSengketaUI | C28 - RiwayatSengketaUI |
| 29 | NotifikasiUI | C29 - NotifikasiUI |
| 30 | PaymentGatewayUI | C30 - PaymentGatewayUI |
| 31 | PenggunaController | C31 - PenggunaController |
| 32 | TenagaKerjaController | C32 - TenagaKerjaController |
| 33 | PenyediaKerjaController | C33 - PenyediaKerjaController |
| 34 | CustomerServiceController | C34 - CustomerServiceController |
| 35 | LowonganPekerjaanController | C35 - LowonganPekerjaanController |
| 36 | PengajuanPenawaranController | C36 - PengajuanPenawaranController |
| 37 | TransaksiPekerjaanController | C37 - TransaksiPekerjaanController |
| 38 | BuktiPenyerahanController | C38 - BuktiPenyerahanController |
| 39 | TagihanPembayaranController | C39 - TagihanPembayaranController |
| 40 | PencairanDanaController | C40 - PencairanDanaController |
| 41 | UlasanRatingController | C41 - UlasanRatingController |
| 42 | TiketSengketaController | C42 - TiketSengketaController |
| 43 | RiwayatSengketaController | C43 - RiwayatSengketaController |
| 44 | NotifikasiController | C44 - NotifikasiController |
| 45 | PaymentGatewayController | C45 - PaymentGatewayController |

Untuk **setiap kelas**, identifikasi operasi berdasarkan tanggung jawab kelas beserta *visibility*-nya, serta atribut beserta *visibility* dan tipenya. Buat subbab tersendiri untuk setiap kelas.

## 5.1 Kelas Pengguna

**Nama Kelas:** Pengguna  
**ID Kelas:** C01

Tabel 5.1.1. Operasi Kelas Pengguna

| Nama Operasi | Visibility |
| :--- | :--- |
| `getUsia(): Integer` | public |
| `setToken(tokenAuth: string): void` | public |
| `getNama(): string` | public |
| `getEmail(): string` | public |
| `perbaruiAkumulasiRating(): void` | public |

Tabel 5.1.2. Atribut Kelas Pengguna

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| `idPengguna` | protected | `string` |
| `nama` | protected | `string` |
| `email` | protected | `string` |
| `password` | protected | `string` |
| `tanggalLahir` | protected | `Date` |
| `tokenAuth` | protected | `string` |
| `akumulasiRating` | private | `Float` |

### 5.1.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** Pengguna  
**Nama Operasi:** `getUsia(): Integer`  
**ID Algoritma:** Algo-001

```text
function getUsia() -> Integer
    hariIni <- currentDate()
    if not isValidDate(this.tanggalLahir) or this.tanggalLahir > hariIni then
        throw Error("Tanggal lahir tidak valid")
    usia <- year(hariIni) - year(this.tanggalLahir)
    if (month(hariIni), day(hariIni)) < (month(this.tanggalLahir), day(this.tanggalLahir)) then
        usia <- usia - 1
    -> usia
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.1.1. Query Operasi getUsia

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| - | - | Tidak menggunakan query; operasi dilakukan pada atribut objek. |

### 5.1.2 Algoritma/Query

**Nama Kelas:** Pengguna  
**Nama Operasi:** `setToken(tokenAuth: string): void`  
**ID Algoritma:** Algo-002

```text
function setToken(tokenAuth: string) -> void
    if not isString(tokenAuth) then
        throw Error("Token tidak valid")
    this.tokenAuth <- tokenAuth
    { Token kosong menghapus token pada objek saat sesi berakhir; tidak memerlukan SQL. }
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.1.2. Query Operasi setToken

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| - | - | Tidak menggunakan query; operasi dilakukan pada atribut objek. |

### 5.1.3 Algoritma/Query

**Nama Kelas:** Pengguna  
**Nama Operasi:** `getNama(): string`  
**ID Algoritma:** Algo-003

```text
function getNama() -> string
    -> this.nama
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.1.3. Query Operasi getNama

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| - | - | Tidak menggunakan query; operasi dilakukan pada atribut objek. |

### 5.1.4 Algoritma/Query

**Nama Kelas:** Pengguna  
**Nama Operasi:** `getEmail(): string`  
**ID Algoritma:** Algo-004

```text
function getEmail() -> string
    -> this.email
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.1.4. Query Operasi getEmail

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| - | - | Tidak menggunakan query; operasi dilakukan pada atribut objek. |

### 5.1.5 Algoritma/Query

**Nama Kelas:** Pengguna  
**Nama Operasi:** `perbaruiAkumulasiRating(): void`  
**ID Algoritma:** Algo-005

```text
function perbaruiAkumulasiRating() -> void
    transaction
        hasil <- queryOne("Q-001", this.idPengguna)
        ratingBaru <- hasil.rating
        wajibAda(queryOne("Q-002", this.idPengguna, ratingBaru))
    this.akumulasiRating <- ratingBaru
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.1.5. Query Operasi perbaruiAkumulasiRating

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-001 | `SELECT COALESCE(AVG(nilai), 0) AS rating FROM ulasan_rating WHERE "idPenerima" = $1;` | perbaruiAkumulasiRating(): rata-rata ulasan penerima; $1 = idPengguna. |
| Q-002 | `UPDATE pengguna SET "akumulasiRating" = $2 WHERE "idPengguna" = $1 RETURNING "akumulasiRating";` | perbaruiAkumulasiRating(): menyimpan rata-rata; $1 = idPengguna, $2 = rating. |

## 5.2 Kelas TenagaKerja

**Nama Kelas:** TenagaKerja  
**ID Kelas:** C02

Tabel 5.2.1. Operasi Kelas TenagaKerja

| Nama Operasi | Visibility |
| :--- | :--- |
| `buatProfil(dataProfil: Record<string, unknown>, kataSandiHash: string): void` | public |
| `getStatusVerifikasi(): string` | public |
| `setStatusVerifikasi(status: string): void` | public |
| `setDokumenIdentitas(dokumen: File): void` | public |
| `getDokumenIdentitas(): File` | public |
| `getSaldoPendapatan(): Decimal` | public |
| `tambahSaldoPendapatan(nominal: Decimal): void` | public |
| `kurangiSaldoPendapatan(nominal: Decimal): void` | public |

Tabel 5.2.2. Atribut Kelas TenagaKerja

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| `idTenagaKerja` | private | `string` |
| `statusVerifikasi` | private | `string` |
| `dokumenIdentitas` | private | `File` |
| `waktuPengajuanVerifikasi` | private | `Date` |
| `alasanPenolakanVerifikasi` | private | `string` |
| `saldoPendapatan` | private | `Decimal` |
| `rekeningTujuan` | private | `string` |

### 5.2.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** TenagaKerja  
**Nama Operasi:** `buatProfil(dataProfil: Record<string, unknown>, kataSandiHash: string): void`  
**ID Algoritma:** Algo-006

```text
function buatProfil(dataProfil: Record<string, unknown>, kataSandiHash: string) -> void
    { Validasi registrasi umum telah dilakukan Controller. }
    if not lengkap(dataProfil, ["nama", "email", "tanggalLahir"]) or isBlank(kataSandiHash) then
        throw Error("Data profil atau hash kata sandi belum lengkap")
    idPenggunaBaru <- uuid()
    idProfilBaru <- uuid()
    transaction
        execute("Q-003", idPenggunaBaru, dataProfil.nama, dataProfil.email,
                kataSandiHash, dataProfil.tanggalLahir, "", 0)
        execute("Q-004", idProfilBaru, idPenggunaBaru, "Belum Terverifikasi", "", "")
    this.idPengguna <- idPenggunaBaru
    this.idTenagaKerja <- idProfilBaru
    this.nama <- dataProfil.nama
    this.email <- dataProfil.email
    this.tanggalLahir <- dataProfil.tanggalLahir
    this.password <- kataSandiHash
    this.tokenAuth <- ""
    this.akumulasiRating <- 0
    this.statusVerifikasi <- "Belum Terverifikasi"
    this.saldoPendapatan <- 0
    this.rekeningTujuan <- ""
    this.dokumenIdentitas <- null
    this.waktuPengajuanVerifikasi <- null
    this.alasanPenolakanVerifikasi <- ""
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.2.1. Query Operasi buatProfil

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-003 | `INSERT INTO pengguna ("idPengguna", nama, email, password, "tanggalLahir", "tokenAuth", "akumulasiRating") VALUES ($1, $2, $3, $4, $5, $6, $7);` | buatProfil(): $1?$7 = idPengguna, nama, email, hash kata sandi, tanggalLahir, tokenAuth, akumulasiRating. |
| Q-004 | `INSERT INTO tenaga_kerja ("idTenagaKerja", "idPengguna", "statusVerifikasi", "saldoPendapatan", "rekeningTujuan", "dokumenIdentitas", "waktuPengajuanVerifikasi", "alasanPenolakanVerifikasi") VALUES ($1, $2, $3, 0, $4, NULL, NULL, $5);` | buatProfil(): $1?$5 = idTenagaKerja, idPengguna, status awal, rekeningTujuan, alasan awal. |

### 5.2.2 Algoritma/Query

**Nama Kelas:** TenagaKerja  
**Nama Operasi:** `getStatusVerifikasi(): string`  
**ID Algoritma:** Algo-007

```text
function getStatusVerifikasi() -> string
    -> this.statusVerifikasi
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.2.2. Query Operasi getStatusVerifikasi

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| - | - | Tidak menggunakan query; operasi dilakukan pada atribut objek. |

### 5.2.3 Algoritma/Query

**Nama Kelas:** TenagaKerja  
**Nama Operasi:** `setStatusVerifikasi(status: string): void`  
**ID Algoritma:** Algo-008

```text
function setStatusVerifikasi(status: string) -> void
    { Otorisasi dan transisi status telah diperiksa Controller. }
    if status not in STATUS_VERIFIKASI then
        throw Error("Status verifikasi tidak valid")
    wajibAda(queryOne("Q-005", this.idTenagaKerja, status))
    this.statusVerifikasi <- status
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.2.3. Query Operasi setStatusVerifikasi

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-005 | `UPDATE tenaga_kerja SET "statusVerifikasi" = $2 WHERE "idTenagaKerja" = $1 RETURNING "statusVerifikasi";` | setStatusVerifikasi(): $1 = idTenagaKerja, $2 = status yang sudah divalidasi Controller. |

### 5.2.4 Algoritma/Query

**Nama Kelas:** TenagaKerja  
**Nama Operasi:** `setDokumenIdentitas(dokumen: File): void`  
**ID Algoritma:** Algo-009

```text
function setDokumenIdentitas(dokumen: File) -> void
    { Controller telah memvalidasi format, ukuran, dan persetujuan. }
    if dokumen = null or dokumen.size = 0 then
        throw Error("Dokumen identitas belum tersedia")
    pathBaru <- storage.uploadPrivate(dokumen)
    waktuBaru <- now()
    try
        wajibAda(queryOne("Q-006", this.idTenagaKerja, pathBaru, waktuBaru))
    catch error
        storage.deleteIfUnreferenced(pathBaru)
        throw error
    this.dokumenIdentitas <- dokumen
    this.waktuPengajuanVerifikasi <- waktuBaru
    { Database menyimpan path; objek memuat File. Controller mengatur status pengajuan. }
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.2.4. Query Operasi setDokumenIdentitas

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-006 | `UPDATE tenaga_kerja SET "dokumenIdentitas" = $2, "waktuPengajuanVerifikasi" = $3 WHERE "idTenagaKerja" = $1 RETURNING "waktuPengajuanVerifikasi";` | setDokumenIdentitas(): $1 = idTenagaKerja, $2 = path berkas pada storage privat, $3 = waktu pengajuan; isi File tidak disimpan langsung sebagai kolom. |

### 5.2.5 Algoritma/Query

**Nama Kelas:** TenagaKerja  
**Nama Operasi:** `getDokumenIdentitas(): File`  
**ID Algoritma:** Algo-010

```text
function getDokumenIdentitas() -> File
    { Controller telah memeriksa hak akses dan memuat berkas dari storage privat. }
    if this.dokumenIdentitas = null then
        throw Error("Dokumen identitas belum tersedia")
    -> this.dokumenIdentitas
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.2.5. Query Operasi getDokumenIdentitas

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| - | - | Tidak menggunakan query; operasi dilakukan pada atribut objek. |

### 5.2.6 Algoritma/Query

**Nama Kelas:** TenagaKerja  
**Nama Operasi:** `getSaldoPendapatan(): Decimal`  
**ID Algoritma:** Algo-011

```text
function getSaldoPendapatan() -> Decimal
    -> this.saldoPendapatan
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.2.6. Query Operasi getSaldoPendapatan

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| - | - | Tidak menggunakan query; operasi dilakukan pada atribut objek. |

### 5.2.7 Algoritma/Query

**Nama Kelas:** TenagaKerja  
**Nama Operasi:** `tambahSaldoPendapatan(nominal: Decimal): void`  
**ID Algoritma:** Algo-012

```text
function tambahSaldoPendapatan(nominal: Decimal) -> void
    if not isFinite(nominal) or nominal <= 0 then
        throw Error("Nominal tidak valid")
    { Controller menjamin upah/pencairan yang sama hanya diproses satu kali. }
    transaction
        data <- wajibAda(queryOne("Q-007", this.idTenagaKerja))
        saldoBaru <- data.saldoPendapatan + nominal
        wajibAda(queryOne("Q-008", this.idTenagaKerja, saldoBaru))
    this.saldoPendapatan <- saldoBaru
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.2.7. Query Operasi tambahSaldoPendapatan

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-007 | `SELECT "saldoPendapatan" FROM tenaga_kerja WHERE "idTenagaKerja" = $1 FOR UPDATE;` | tambahSaldoPendapatan()/kurangiSaldoPendapatan(): mengunci saldo; $1 = idTenagaKerja. |
| Q-008 | `UPDATE tenaga_kerja SET "saldoPendapatan" = $2 WHERE "idTenagaKerja" = $1 RETURNING "saldoPendapatan";` | tambahSaldoPendapatan()/kurangiSaldoPendapatan(): $1 = idTenagaKerja, $2 = saldo baru dalam transaksi yang sama. |

### 5.2.8 Algoritma/Query

**Nama Kelas:** TenagaKerja  
**Nama Operasi:** `kurangiSaldoPendapatan(nominal: Decimal): void`  
**ID Algoritma:** Algo-013

```text
function kurangiSaldoPendapatan(nominal: Decimal) -> void
    if not isFinite(nominal) or nominal <= 0 then
        throw Error("Nominal tidak valid")
    { Controller menjamin upah/pencairan yang sama hanya diproses satu kali. }
    transaction
        data <- wajibAda(queryOne("Q-009", this.idTenagaKerja))
        if data.saldoPendapatan < nominal then
            throw Error("Saldo tidak cukup")
        saldoBaru <- data.saldoPendapatan - nominal
        wajibAda(queryOne("Q-010", this.idTenagaKerja, saldoBaru))
    this.saldoPendapatan <- saldoBaru
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.2.8. Query Operasi kurangiSaldoPendapatan

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-009 | `SELECT "saldoPendapatan" FROM tenaga_kerja WHERE "idTenagaKerja" = $1 FOR UPDATE;` | tambahSaldoPendapatan()/kurangiSaldoPendapatan(): mengunci saldo; $1 = idTenagaKerja. |
| Q-010 | `UPDATE tenaga_kerja SET "saldoPendapatan" = $2 WHERE "idTenagaKerja" = $1 RETURNING "saldoPendapatan";` | tambahSaldoPendapatan()/kurangiSaldoPendapatan(): $1 = idTenagaKerja, $2 = saldo baru dalam transaksi yang sama. |

## 5.3 Kelas PenyediaKerja

**Nama Kelas:** PenyediaKerja  
**ID Kelas:** C03

Tabel 5.3.1. Operasi Kelas PenyediaKerja

| Nama Operasi | Visibility |
| :--- | :--- |
| `buatProfil(dataProfil: Record<string, unknown>, kataSandiHash: string): void` | public |

Tabel 5.3.2. Atribut Kelas PenyediaKerja

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| `idPenyediaKerja` | private | `string` |

### 5.3.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** PenyediaKerja  
**Nama Operasi:** `buatProfil(dataProfil: Record<string, unknown>, kataSandiHash: string): void`  
**ID Algoritma:** Algo-014

```text
function buatProfil(dataProfil: Record<string, unknown>, kataSandiHash: string) -> void
    { Validasi registrasi umum telah dilakukan Controller. }
    if not lengkap(dataProfil, ["nama", "email", "tanggalLahir"]) or isBlank(kataSandiHash) then
        throw Error("Data profil atau hash kata sandi belum lengkap")
    idPenggunaBaru <- uuid()
    idProfilBaru <- uuid()
    transaction
        execute("Q-011", idPenggunaBaru, dataProfil.nama, dataProfil.email,
                kataSandiHash, dataProfil.tanggalLahir, "", 0)
        execute("Q-012", idProfilBaru, idPenggunaBaru)
    this.idPengguna <- idPenggunaBaru
    this.idPenyediaKerja <- idProfilBaru
    this.nama <- dataProfil.nama
    this.email <- dataProfil.email
    this.tanggalLahir <- dataProfil.tanggalLahir
    this.password <- kataSandiHash
    this.tokenAuth <- ""
    this.akumulasiRating <- 0
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.3.1. Query Operasi buatProfil

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-011 | `INSERT INTO pengguna ("idPengguna", nama, email, password, "tanggalLahir", "tokenAuth", "akumulasiRating") VALUES ($1, $2, $3, $4, $5, $6, $7);` | buatProfil(): $1?$7 = idPengguna, nama, email, hash kata sandi, tanggalLahir, tokenAuth, akumulasiRating. |
| Q-012 | `INSERT INTO penyedia_kerja ("idPenyediaKerja", "idPengguna") VALUES ($1, $2);` | buatProfil(): $1 = idPenyediaKerja, $2 = idPengguna; satu transaksi dengan penyimpanan pengguna. |

## 5.4 Kelas CustomerService

**Nama Kelas:** CustomerService  
**ID Kelas:** C04

Tabel 5.4.1. Operasi Kelas CustomerService

| Nama Operasi | Visibility |
| :--- | :--- |
| `tinjauVerifikasi(idTenagaKerja: string): void` | public |
| `setujuiVerifikasi(idTenagaKerja: string): void` | public |
| `tolakVerifikasi(idTenagaKerja: string, alasan: string): void` | public |
| `tinjauTiket(idTiket: string): void` | public |
| `putuskanSengketa(idTiket: string, keputusan: string): void` | public |

Tabel 5.4.2. Atribut Kelas CustomerService

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| `idAdmin` | private | `string` |
| `hakAkses` | private | `string` |
| `peran` | private | `string` |

### 5.4.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** CustomerService  
**Nama Operasi:** `tinjauVerifikasi(idTenagaKerja: string): void`  
**ID Algoritma:** Algo-015

```text
function tinjauVerifikasi(idTenagaKerja: string) -> void
    requirePermission(this.hakAkses, "tinjauVerifikasi")
    data <- wajibAda(queryOne("Q-013", idTenagaKerja))
    if isBlank(data.dokumenIdentitas) then
        throw Error("Pengajuan verifikasi tidak ditemukan")
    { Controller/UI memuat dokumen privat dari path data.dokumenIdentitas. }
    { Tidak mengubah status dan tidak mengembalikan nilai karena signature void. }
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.4.1. Query Operasi tinjauVerifikasi

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-013 | `SELECT "idTenagaKerja", "dokumenIdentitas", "statusVerifikasi", "waktuPengajuanVerifikasi", "alasanPenolakanVerifikasi" FROM tenaga_kerja WHERE "idTenagaKerja" = $1;` | tinjauVerifikasi(): $1 = idTenagaKerja; Controller/UI memuat berkas melalui storage privat. |

### 5.4.2 Algoritma/Query

**Nama Kelas:** CustomerService  
**Nama Operasi:** `setujuiVerifikasi(idTenagaKerja: string): void`  
**ID Algoritma:** Algo-016

```text
function setujuiVerifikasi(idTenagaKerja: string) -> void
    requirePermission(this.hakAkses, "setujuiVerifikasi")
    transaction
        data <- wajibAda(queryOne("Q-014", idTenagaKerja))
        if data.statusVerifikasi != "Menunggu Verifikasi" or isBlank(data.dokumenIdentitas) then
            throw Error("Pengajuan tidak dapat diproses")
        wajibAda(queryOne("Q-015", idTenagaKerja, "Terverifikasi", ""))
    { Controller mengirim notifikasi setelah transaksi berhasil. }
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.4.2. Query Operasi setujuiVerifikasi

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-014 | `SELECT "dokumenIdentitas", "statusVerifikasi" FROM tenaga_kerja WHERE "idTenagaKerja" = $1 FOR UPDATE;` | setujuiVerifikasi()/tolakVerifikasi(): mengunci pengajuan; $1 = idTenagaKerja. |
| Q-015 | `UPDATE tenaga_kerja SET "statusVerifikasi" = $2, "alasanPenolakanVerifikasi" = $3 WHERE "idTenagaKerja" = $1 RETURNING "statusVerifikasi";` | setujuiVerifikasi()/tolakVerifikasi(): $1 = idTenagaKerja, $2 = status hasil pemeriksaan, $3 = alasan atau string kosong. |

### 5.4.3 Algoritma/Query

**Nama Kelas:** CustomerService  
**Nama Operasi:** `tolakVerifikasi(idTenagaKerja: string, alasan: string): void`  
**ID Algoritma:** Algo-017

```text
function tolakVerifikasi(idTenagaKerja: string, alasan: string) -> void
    requirePermission(this.hakAkses, "tolakVerifikasi")
    if isBlank(alasan) then
        throw Error("Alasan penolakan wajib diisi")
    transaction
        data <- wajibAda(queryOne("Q-016", idTenagaKerja))
        if data.statusVerifikasi != "Menunggu Verifikasi" or isBlank(data.dokumenIdentitas) then
            throw Error("Pengajuan tidak dapat diproses")
        wajibAda(queryOne("Q-017", idTenagaKerja, "Ditolak", trim(alasan)))
    { Controller mengirim notifikasi setelah transaksi berhasil. }
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.4.3. Query Operasi tolakVerifikasi

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-016 | `SELECT "dokumenIdentitas", "statusVerifikasi" FROM tenaga_kerja WHERE "idTenagaKerja" = $1 FOR UPDATE;` | setujuiVerifikasi()/tolakVerifikasi(): mengunci pengajuan; $1 = idTenagaKerja. |
| Q-017 | `UPDATE tenaga_kerja SET "statusVerifikasi" = $2, "alasanPenolakanVerifikasi" = $3 WHERE "idTenagaKerja" = $1 RETURNING "statusVerifikasi";` | setujuiVerifikasi()/tolakVerifikasi(): $1 = idTenagaKerja, $2 = status hasil pemeriksaan, $3 = alasan atau string kosong. |

### 5.4.4 Algoritma/Query

**Nama Kelas:** CustomerService  
**Nama Operasi:** `tinjauTiket(idTiket: string): void`  
**ID Algoritma:** Algo-018

```text
function tinjauTiket(idTiket: string) -> void
    requirePermission(this.hakAkses, "tinjauTiket")
    tiket <- wajibAda(queryOne("Q-018", idTiket))
    transaksi <- wajibAda(queryOne("Q-019", tiket.idTransaksi))
    bukti <- queryAll("Q-020", tiket.idTransaksi)
    riwayat <- queryAll("Q-021", idTiket)
    { Controller/UI menyajikan tiket.urlBukti, bukti pekerjaan, transaksi, dan riwayat. }
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.4.4. Query Operasi tinjauTiket

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-018 | `SELECT * FROM tiket_sengketa WHERE "idTiket" = $1;` | tinjauTiket(): $1 = idTiket. |
| Q-019 | `SELECT * FROM transaksi_pekerjaan WHERE "idTransaksi" = $1;` | tinjauTiket(): $1 = idTransaksi pada tiket. |
| Q-020 | `SELECT * FROM bukti_penyerahan WHERE "idTransaksi" = $1 ORDER BY "timestampPengiriman" DESC;` | tinjauTiket(): mengambil bukti pekerjaan; $1 = idTransaksi; bukti laporan juga ada pada urlBukti tiket. |
| Q-021 | `SELECT * FROM riwayat_sengketa WHERE "idTiket" = $1 ORDER BY timestamp ASC, "idRiwayat" ASC;` | tinjauTiket(): $1 = idTiket. |

### 5.4.5 Algoritma/Query

**Nama Kelas:** CustomerService  
**Nama Operasi:** `putuskanSengketa(idTiket: string, keputusan: string): void`  
**ID Algoritma:** Algo-019

```text
function putuskanSengketa(idTiket: string, keputusan: string) -> void
    requirePermission(this.hakAkses, "putuskanSengketa")
    if keputusan not in KEPUTUSAN_SENGKETA then
        throw Error("Keputusan tidak valid")
    { Controller telah memastikan bukti cukup dan keputusan sesuai hasil pemeriksaan. }
    transaction
        tiket <- wajibAda(queryOne("Q-022", idTiket))
        if tiket.statusTiket in ["Ditutup", "Ditolak", "Dibatalkan"] or not isBlank(tiket.keputusan) then
            throw Error("Tiket sudah final atau keputusan telah dicatat")
        wajibAda(queryOne("Q-023", idTiket, keputusan))
        aktivitas <- "Keputusan: " + keputusan + "; petugas: " + this.idAdmin
        execute("Q-024", uuid(), idTiket, aktivitas, now())
    { Controller menindaklanjuti refund/pencairan, penutupan tiket, dan notifikasi. }
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.4.5. Query Operasi putuskanSengketa

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-022 | `SELECT * FROM tiket_sengketa WHERE "idTiket" = $1 FOR UPDATE;` | putuskanSengketa(): mengunci tiket; $1 = idTiket. |
| Q-023 | `UPDATE tiket_sengketa SET keputusan = $2 WHERE "idTiket" = $1 RETURNING keputusan;` | putuskanSengketa(): $1 = idTiket, $2 = keputusan; dipakai setelah pemeriksaan status dan keputusan lama. |
| Q-024 | `INSERT INTO riwayat_sengketa ("idRiwayat", "idTiket", "logAktivitas", timestamp) VALUES ($1, $2, $3, $4);` | putuskanSengketa(): $1?$4 = id riwayat baru, idTiket, teks keputusan beserta idAdmin, waktu pencatatan. |

## 5.5 Kelas LowonganPekerjaan

**Nama Kelas:** LowonganPekerjaan  
**ID Kelas:** C05

Tabel 5.5.1. Operasi Kelas LowonganPekerjaan

| Nama Operasi | Visibility |
| :--- | :--- |
| `validasiDataLowongan(): boolean` | private |
| `simpanLowongan(): void` | public |
| `setStatusAwal(): void` | private |
| `getDaftarLowongan(kriteria: Record<string, unknown>): Array<LowonganPekerjaan>` | public |
| `cekStatusTerbuka(): boolean` | public |
| `getSisaKuota(): Integer` | public |
| `cekKuotaTersedia(): boolean` | public |
| `kurangiKuota(jumlah: Integer): void` | public |
| `setStatusLowongan(status: string): void` | public |

Tabel 5.5.2. Atribut Kelas LowonganPekerjaan

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| `idLowongan` | private | `string` |
| `idPenyediaKerja` | private | `string` |
| `judul` | private | `string` |
| `deskripsi` | private | `string` |
| `kuota` | private | `Integer` |
| `lokasi` | private | `string` |
| `upah` | private | `Decimal` |
| `statusLowongan` | private | `string` |
| `kategori` | private | `string` |
| `jumlahDiterima` | private | `Integer` |

### 5.5.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** LowonganPekerjaan  
**Nama Operasi:** `validasiDataLowongan(): boolean`  
**ID Algoritma:** Algo-020

```text
function validasiDataLowongan() -> boolean
    for nilai in [this.judul, this.deskripsi, this.lokasi, this.kategori, this.idPenyediaKerja] do
        if isBlank(nilai) then
            -> false
    if not isInteger(this.kuota) or this.kuota <= 0 then
        -> false
    if not isFinite(this.upah) or this.upah <= 0 then
        -> false
    -> isInteger(this.jumlahDiterima) and 0 <= this.jumlahDiterima and this.jumlahDiterima <= this.kuota
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.5.1. Query Operasi validasiDataLowongan

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| - | - | Tidak menggunakan query; operasi dilakukan pada atribut objek. |

### 5.5.2 Algoritma/Query

**Nama Kelas:** LowonganPekerjaan  
**Nama Operasi:** `simpanLowongan(): void`  
**ID Algoritma:** Algo-021

```text
function simpanLowongan() -> void
    { Hanya untuk objek baru; Controller telah memeriksa pemilik lowongan. }
    this.jumlahDiterima <- 0
    if not validasiDataLowongan() then
        throw Error("Data lowongan tidak valid")
    this.idLowongan <- uuid()
    setStatusAwal()
    execute("Q-025", this.idLowongan, this.idPenyediaKerja, this.judul,
            this.deskripsi, this.kuota, this.lokasi, this.upah, this.statusLowongan, this.kategori)
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.5.2. Query Operasi simpanLowongan

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-025 | `INSERT INTO lowongan_pekerjaan ("idLowongan", "idPenyediaKerja", judul, deskripsi, kuota, lokasi, upah, "statusLowongan", kategori, "jumlahDiterima") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0);` | simpanLowongan(): $1?$9 = idLowongan, idPenyediaKerja, judul, deskripsi, kuota, lokasi, upah, status awal, kategori. |

### 5.5.3 Algoritma/Query

**Nama Kelas:** LowonganPekerjaan  
**Nama Operasi:** `setStatusAwal(): void`  
**ID Algoritma:** Algo-022

```text
function setStatusAwal() -> void
    { Dipanggil hanya sebelum lowongan baru disimpan. }
    this.statusLowongan <- "Open"
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.5.3. Query Operasi setStatusAwal

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| - | - | Tidak menggunakan query; operasi dilakukan pada atribut objek. |

### 5.5.4 Algoritma/Query

**Nama Kelas:** LowonganPekerjaan  
**Nama Operasi:** `getDaftarLowongan(kriteria: Record<string, unknown>): Array<LowonganPekerjaan>`  
**ID Algoritma:** Algo-023

```text
function getDaftarLowongan(kriteria: Record<string, unknown>) -> Array<LowonganPekerjaan>
    if not semuaKeyDiizinkan(kriteria, ["kataKunci", "kategori"]) then
        throw Error("Filter tidak valid")
    kataKunci <- kriteria.get("kataKunci", "")
    kategori <- kriteria.get("kategori", null)
    if isBlank(kataKunci) then
        pola <- null
    else
        pola <- "%" + escapeLike(kataKunci) + "%"
    if isBlank(kategori) then
        kategori <- null
    -> mapToObjects(LowonganPekerjaan, queryAll("Q-026", pola, kategori))
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.5.4. Query Operasi getDaftarLowongan

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-026 | `SELECT * FROM lowongan_pekerjaan WHERE "statusLowongan" = 'Open' AND "jumlahDiterima" < kuota AND ($1::text IS NULL OR judul ILIKE $1 OR deskripsi ILIKE $1) AND ($2::text IS NULL OR kategori = $2);` | getDaftarLowongan(): $1 = pola kata kunci atau NULL, $2 = kategori atau NULL; wildcard input di-escape sebelum ditambah % untuk pencarian substring. |

### 5.5.5 Algoritma/Query

**Nama Kelas:** LowonganPekerjaan  
**Nama Operasi:** `cekStatusTerbuka(): boolean`  
**ID Algoritma:** Algo-024

```text
function cekStatusTerbuka() -> boolean
    -> this.statusLowongan = "Open"
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.5.5. Query Operasi cekStatusTerbuka

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| - | - | Tidak menggunakan query; operasi dilakukan pada atribut objek. |

### 5.5.6 Algoritma/Query

**Nama Kelas:** LowonganPekerjaan  
**Nama Operasi:** `getSisaKuota(): Integer`  
**ID Algoritma:** Algo-025

```text
function getSisaKuota() -> Integer
    if this.jumlahDiterima < 0 or this.jumlahDiterima > this.kuota then
        throw Error("Data kuota tidak konsisten")
    -> this.kuota - this.jumlahDiterima
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.5.6. Query Operasi getSisaKuota

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| - | - | Tidak menggunakan query; operasi dilakukan pada atribut objek. |

### 5.5.7 Algoritma/Query

**Nama Kelas:** LowonganPekerjaan  
**Nama Operasi:** `cekKuotaTersedia(): boolean`  
**ID Algoritma:** Algo-026

```text
function cekKuotaTersedia() -> boolean
    -> cekStatusTerbuka() and getSisaKuota() > 0
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.5.7. Query Operasi cekKuotaTersedia

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| - | - | Tidak menggunakan query; operasi dilakukan pada atribut objek. |

### 5.5.8 Algoritma/Query

**Nama Kelas:** LowonganPekerjaan  
**Nama Operasi:** `kurangiKuota(jumlah: Integer): void`  
**ID Algoritma:** Algo-027

```text
function kurangiKuota(jumlah: Integer) -> void
    if not isInteger(jumlah) or jumlah <= 0 then
        throw Error("Jumlah tenaga kerja tidak valid")
    { Wajib bergabung dengan transaksi pemilihan pelamar pada Controller. }
    transaction
        data <- wajibAda(queryOne("Q-027", this.idLowongan))
        if data.statusLowongan != "Open" or jumlah > data.kuota - data.jumlahDiterima then
            throw Error("Lowongan ditutup atau kuota tidak cukup")
        jumlahBaru <- data.jumlahDiterima + jumlah
        statusBaru <- data.statusLowongan
        if jumlahBaru = data.kuota then
            statusBaru <- "Closed/Full"
        wajibAda(queryOne("Q-028", this.idLowongan, jumlahBaru, statusBaru))
    this.jumlahDiterima <- jumlahBaru
    this.statusLowongan <- statusBaru
    { Kapasitas total kuota tetap; yang bertambah adalah jumlahDiterima. }
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.5.8. Query Operasi kurangiKuota

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-027 | `SELECT kuota, "jumlahDiterima", "statusLowongan" FROM lowongan_pekerjaan WHERE "idLowongan" = $1 FOR UPDATE;` | kurangiKuota()/setStatusLowongan(): $1 = idLowongan; kunci bertahan sampai transaksi selesai. |
| Q-028 | `UPDATE lowongan_pekerjaan SET "jumlahDiterima" = $2, "statusLowongan" = $3 WHERE "idLowongan" = $1 RETURNING "jumlahDiterima", "statusLowongan";` | kurangiKuota(): $1 = idLowongan, $2 = jumlahDiterima baru, $3 = status baru. |

### 5.5.9 Algoritma/Query

**Nama Kelas:** LowonganPekerjaan  
**Nama Operasi:** `setStatusLowongan(status: string): void`  
**ID Algoritma:** Algo-028

```text
function setStatusLowongan(status: string) -> void
    if status not in ["Open", "Closed/Full"] then
        throw Error("Status lowongan tidak valid")
    transaction
        data <- wajibAda(queryOne("Q-029", this.idLowongan))
        if status = "Open" and data.jumlahDiterima >= data.kuota then
            throw Error("Kuota sudah penuh")
        wajibAda(queryOne("Q-030", this.idLowongan, status))
    this.statusLowongan <- status
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.5.9. Query Operasi setStatusLowongan

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-029 | `SELECT kuota, "jumlahDiterima", "statusLowongan" FROM lowongan_pekerjaan WHERE "idLowongan" = $1 FOR UPDATE;` | kurangiKuota()/setStatusLowongan(): $1 = idLowongan; kunci bertahan sampai transaksi selesai. |
| Q-030 | `UPDATE lowongan_pekerjaan SET "statusLowongan" = $2 WHERE "idLowongan" = $1 RETURNING "statusLowongan";` | setStatusLowongan(): $1 = idLowongan, $2 = status. |

## 5.6 Kelas PengajuanPenawaran

**Nama Kelas:** PengajuanPenawaran  
**ID Kelas:** C06

Tabel 5.6.1. Operasi Kelas PengajuanPenawaran

| Nama Operasi | Visibility |
| :--- | :--- |
| `simpanPengajuan(): void` | public |
| `setStatusPersetujuan(status: string): void` | public |
| `getDetailPenawaran(): PengajuanPenawaran` | public |

Tabel 5.6.2. Atribut Kelas PengajuanPenawaran

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| `idPenawaran` | private | `string` |
| `idLowongan` | private | `string` |
| `idTenagaKerja` | private | `string` |
| `pesanPenawaran` | private | `string` |
| `timestamp` | private | `Date` |
| `statusPenawaran` | private | `string` |

### 5.6.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** PengajuanPenawaran  
**Nama Operasi:** `simpanPengajuan(): void`  
**ID Algoritma:** Algo-029

```text
function simpanPengajuan() -> void
    { Controller telah memvalidasi akun terverifikasi dan lowongan terbuka. }
    if isBlank(this.idLowongan) or isBlank(this.idTenagaKerja) or isBlank(this.pesanPenawaran) then
        throw Error("Data pengajuan belum lengkap")
    idBaru <- uuid()
    waktuBaru <- now()
    execute("Q-031", idBaru, this.idLowongan, this.idTenagaKerja,
            this.pesanPenawaran, waktuBaru, "Menunggu Pemilihan")
    this.idPenawaran <- idBaru
    this.timestamp <- waktuBaru
    this.statusPenawaran <- "Menunggu Pemilihan"
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.6.1. Query Operasi simpanPengajuan

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-031 | `INSERT INTO pengajuan_penawaran ("idPenawaran", "idLowongan", "idTenagaKerja", "pesanPenawaran", timestamp, "statusPenawaran") VALUES ($1, $2, $3, $4, $5, $6);` | simpanPengajuan(): $1?$6 = idPenawaran, idLowongan, idTenagaKerja, pesanPenawaran, waktu pengajuan, status awal. |

### 5.6.2 Algoritma/Query

**Nama Kelas:** PengajuanPenawaran  
**Nama Operasi:** `setStatusPersetujuan(status: string): void`  
**ID Algoritma:** Algo-030

```text
function setStatusPersetujuan(status: string) -> void
    if status not in STATUS_PENAWARAN then
        throw Error("Status penawaran tidak valid")
    { Penerimaan bergabung dengan transaksi pengurangan kuota dan pembuatan pekerjaan. }
    transaction
        data <- wajibAda(queryOne("Q-032", this.idPenawaran))
        if data.statusPenawaran != status then
            if not transisiDiizinkan("penawaran", data.statusPenawaran, status) then
                throw Error("Perubahan status tidak diizinkan")
            wajibAda(queryOne("Q-033", this.idPenawaran, status))
    this.statusPenawaran <- status
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.6.2. Query Operasi setStatusPersetujuan

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-032 | `SELECT "statusPenawaran" FROM pengajuan_penawaran WHERE "idPenawaran" = $1 FOR UPDATE;` | setStatusPersetujuan(): $1 = idPenawaran. |
| Q-033 | `UPDATE pengajuan_penawaran SET "statusPenawaran" = $2 WHERE "idPenawaran" = $1 RETURNING "statusPenawaran";` | setStatusPersetujuan(): $1 = idPenawaran, $2 = status. |

### 5.6.3 Algoritma/Query

**Nama Kelas:** PengajuanPenawaran  
**Nama Operasi:** `getDetailPenawaran(): PengajuanPenawaran`  
**ID Algoritma:** Algo-031

```text
function getDetailPenawaran() -> PengajuanPenawaran
    -> mapToObject(PengajuanPenawaran, wajibAda(queryOne("Q-034", this.idPenawaran)))
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.6.3. Query Operasi getDetailPenawaran

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-034 | `SELECT * FROM pengajuan_penawaran WHERE "idPenawaran" = $1;` | getDetailPenawaran(): $1 = idPenawaran. |

## 5.7 Kelas TransaksiPekerjaan

**Nama Kelas:** TransaksiPekerjaan  
**ID Kelas:** C07

Tabel 5.7.1. Operasi Kelas TransaksiPekerjaan

| Nama Operasi | Visibility |
| :--- | :--- |
| `createTransaksi(): void` | public |
| `setStatusPekerjaan(status: string): void` | public |
| `tandaiSelesai(): void` | public |
| `cekStatusSelesai(): boolean` | public |
| `isUlasanGanda(idPenilai: string): boolean` | public |
| `getDetailTransaksi(): TransaksiPekerjaan` | public |
| `validasiStatus(statusDiharapkan: string): boolean` | public |

Tabel 5.7.2. Atribut Kelas TransaksiPekerjaan

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| `idTransaksi` | private | `string` |
| `idLowongan` | private | `string` |
| `idTenagaKerja` | private | `string` |
| `idPenyediaKerja` | private | `string` |
| `statusPekerjaan` | private | `string` |
| `nominalUpah` | private | `Decimal` |

### 5.7.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** TransaksiPekerjaan  
**Nama Operasi:** `createTransaksi(): void`  
**ID Algoritma:** Algo-032

```text
function createTransaksi() -> void
    { Controller memvalidasi penawaran diterima, pihak terkait, dan pembuatan hanya sekali. }
    if isBlank(this.idLowongan) or isBlank(this.idTenagaKerja) or isBlank(this.idPenyediaKerja) then
        throw Error("Data pihak transaksi belum lengkap")
    if not isFinite(this.nominalUpah) or this.nominalUpah <= 0 then
        throw Error("Nominal upah tidak valid")
    { Wajib berada dalam transaksi pemilihan pelamar bersama pengurangan kuota. }
    idBaru <- uuid()
    execute("Q-035", idBaru, this.idLowongan, this.idTenagaKerja,
            this.idPenyediaKerja, "Menunggu Pembayaran", this.nominalUpah)
    this.idTransaksi <- idBaru
    this.statusPekerjaan <- "Menunggu Pembayaran"
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.7.1. Query Operasi createTransaksi

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-035 | `INSERT INTO transaksi_pekerjaan ("idTransaksi", "idLowongan", "idTenagaKerja", "idPenyediaKerja", "statusPekerjaan", "nominalUpah") VALUES ($1, $2, $3, $4, $5, $6);` | createTransaksi(): $1?$6 = idTransaksi, idLowongan, idTenagaKerja, idPenyediaKerja, status awal, nominalUpah. |

### 5.7.2 Algoritma/Query

**Nama Kelas:** TransaksiPekerjaan  
**Nama Operasi:** `setStatusPekerjaan(status: string): void`  
**ID Algoritma:** Algo-033

```text
function setStatusPekerjaan(status: string) -> void
    { Controller telah memeriksa hak akses dan prasyarat bisnis status tujuan. }
    if status not in STATUS_PEKERJAAN then
        throw Error("Status pekerjaan tidak valid")
    transaction
        data <- wajibAda(queryOne("Q-036", this.idTransaksi))
        if data.statusPekerjaan != status then
            if not transisiDiizinkan("pekerjaan", data.statusPekerjaan, status) then
                throw Error("Perubahan status tidak diizinkan")
            wajibAda(queryOne("Q-037", this.idTransaksi, status))
    this.statusPekerjaan <- status
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.7.2. Query Operasi setStatusPekerjaan

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-036 | `SELECT "statusPekerjaan" FROM transaksi_pekerjaan WHERE "idTransaksi" = $1 FOR UPDATE;` | setStatusPekerjaan(): $1 = idTransaksi. |
| Q-037 | `UPDATE transaksi_pekerjaan SET "statusPekerjaan" = $2 WHERE "idTransaksi" = $1 RETURNING "statusPekerjaan";` | setStatusPekerjaan()/tandaiSelesai(): $1 = idTransaksi, $2 = status yang prasyaratnya sudah diperiksa Controller. |

### 5.7.3 Algoritma/Query

**Nama Kelas:** TransaksiPekerjaan  
**Nama Operasi:** `tandaiSelesai(): void`  
**ID Algoritma:** Algo-034

```text
function tandaiSelesai() -> void
    { Controller telah memeriksa persetujuan penyedia; transisi diperiksa ulang pada data terkunci. }
    setStatusPekerjaan("Completed")
    { Controller mengatur pembayaran upah tepat satu kali setelah persetujuan sah. }
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.7.3. Query Operasi tandaiSelesai

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| - | - | Tidak menggunakan query; operasi dilakukan pada atribut objek. |

### 5.7.4 Algoritma/Query

**Nama Kelas:** TransaksiPekerjaan  
**Nama Operasi:** `cekStatusSelesai(): boolean`  
**ID Algoritma:** Algo-035

```text
function cekStatusSelesai() -> boolean
    -> this.statusPekerjaan = "Completed"
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.7.4. Query Operasi cekStatusSelesai

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| - | - | Tidak menggunakan query; operasi dilakukan pada atribut objek. |

### 5.7.5 Algoritma/Query

**Nama Kelas:** TransaksiPekerjaan  
**Nama Operasi:** `isUlasanGanda(idPenilai: string): boolean`  
**ID Algoritma:** Algo-036

```text
function isUlasanGanda(idPenilai: string) -> boolean
    if idPenilai != this.idTenagaKerja and idPenilai != this.idPenyediaKerja then
        throw Error("Penilai tidak terkait dengan transaksi")
    hasil <- queryOne("Q-038", this.idTransaksi, idPenilai)
    -> hasil.ada
    { Penyimpanan ulasan juga memakai UNIQUE(idTransaksi, idPenilai). }
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.7.5. Query Operasi isUlasanGanda

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-038 | `SELECT EXISTS (SELECT 1 FROM ulasan_rating WHERE "idTransaksi" = $1 AND "idPenilai" = $2) AS ada;` | isUlasanGanda(): $1 = idTransaksi, $2 = idPenilai. |

### 5.7.6 Algoritma/Query

**Nama Kelas:** TransaksiPekerjaan  
**Nama Operasi:** `getDetailTransaksi(): TransaksiPekerjaan`  
**ID Algoritma:** Algo-037

```text
function getDetailTransaksi() -> TransaksiPekerjaan
    -> mapToObject(TransaksiPekerjaan, wajibAda(queryOne("Q-039", this.idTransaksi)))
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.7.6. Query Operasi getDetailTransaksi

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-039 | `SELECT * FROM transaksi_pekerjaan WHERE "idTransaksi" = $1;` | getDetailTransaksi(): $1 = idTransaksi. |

### 5.7.7 Algoritma/Query

**Nama Kelas:** TransaksiPekerjaan  
**Nama Operasi:** `validasiStatus(statusDiharapkan: string): boolean`  
**ID Algoritma:** Algo-038

```text
function validasiStatus(statusDiharapkan: string) -> boolean
    -> this.statusPekerjaan = statusDiharapkan
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.7.7. Query Operasi validasiStatus

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| - | - | Tidak menggunakan query; operasi dilakukan pada atribut objek. |

## 5.8 Kelas BuktiPenyerahan

**Nama Kelas:** BuktiPenyerahan  
**ID Kelas:** C08

Tabel 5.8.1. Operasi Kelas BuktiPenyerahan

| Nama Operasi | Visibility |
| :--- | :--- |
| `simpanBukti(): void` | public |
| `getDetailBukti(): BuktiPenyerahan` | public |

Tabel 5.8.2. Atribut Kelas BuktiPenyerahan

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| `idPenyerahan` | private | `string` |
| `idTransaksi` | private | `string` |
| `deskripsiPengerjaan` | private | `string` |
| `fileUrl` | private | `string` |
| `ukuranFile` | private | `Integer` |
| `timestampPengiriman` | private | `Date` |

### 5.8.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** BuktiPenyerahan  
**Nama Operasi:** `simpanBukti(): void`  
**ID Algoritma:** Algo-039

```text
function simpanBukti() -> void
    { Controller telah memvalidasi pemilik pekerjaan, berkas, dan status pekerjaan. }
    if isBlank(this.idTransaksi) or isBlank(this.fileUrl) then
        throw Error("Data bukti belum lengkap")
    if not isFinite(this.ukuranFile) or this.ukuranFile <= 0 then
        throw Error("Ukuran berkas tidak valid")
    if not storage.exists(this.fileUrl) then
        throw Error("Berkas belum berhasil disimpan")
    idBaru <- uuid()
    waktuBaru <- now()
    { Wajib berada dalam transaksi penyerahan bersama status pekerjaan Submitted. }
    execute("Q-040", idBaru, this.idTransaksi, this.deskripsiPengerjaan,
            this.fileUrl, this.ukuranFile, waktuBaru)
    this.idPenyerahan <- idBaru
    this.timestampPengiriman <- waktuBaru
    { Penyerahan revisi menjadi catatan baru; bukti sebelumnya tetap tersimpan. }
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.8.1. Query Operasi simpanBukti

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-040 | `INSERT INTO bukti_penyerahan ("idPenyerahan", "idTransaksi", "deskripsiPengerjaan", "fileUrl", "ukuranFile", "timestampPengiriman") VALUES ($1, $2, $3, $4, $5, $6);` | simpanBukti(): $1?$6 = idPenyerahan, idTransaksi, deskripsiPengerjaan, fileUrl, ukuranFile, timestampPengiriman. |

### 5.8.2 Algoritma/Query

**Nama Kelas:** BuktiPenyerahan  
**Nama Operasi:** `getDetailBukti(): BuktiPenyerahan`  
**ID Algoritma:** Algo-040

```text
function getDetailBukti() -> BuktiPenyerahan
    -> mapToObject(BuktiPenyerahan, wajibAda(queryOne("Q-041", this.idPenyerahan)))
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.8.2. Query Operasi getDetailBukti

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-041 | `SELECT * FROM bukti_penyerahan WHERE "idPenyerahan" = $1;` | getDetailBukti(): $1 = idPenyerahan; Controller memeriksa hak akses. |

## 5.9 Kelas TagihanPembayaran

**Nama Kelas:** TagihanPembayaran  
**ID Kelas:** C09

Tabel 5.9.1. Operasi Kelas TagihanPembayaran

| Nama Operasi | Visibility |
| :--- | :--- |
| `hitungTotalTagihan(): Decimal` | public |
| `buatTagihan(): void` | public |
| `setStatusPembayaran(status: string): void` | public |

Tabel 5.9.2. Atribut Kelas TagihanPembayaran

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| `idTagihan` | private | `string` |
| `idTransaksi` | private | `string` |
| `nominalUpah` | private | `Decimal` |
| `commissionFee` | private | `Decimal` |
| `totalBayar` | private | `Decimal` |
| `expiryTimestamp` | private | `Date` |
| `statusPembayaran` | private | `string` |

### 5.9.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** TagihanPembayaran  
**Nama Operasi:** `hitungTotalTagihan(): Decimal`  
**ID Algoritma:** Algo-041

```text
function hitungTotalTagihan() -> Decimal
    if not isFinite(this.nominalUpah) or this.nominalUpah <= 0 then
        throw Error("Nominal upah tidak valid")
    if not isFinite(this.commissionFee) or this.commissionFee < 0 then
        throw Error("Biaya layanan tidak valid")
    total <- this.nominalUpah + this.commissionFee
    if not isFinite(total) then
        throw Error("Total tagihan tidak valid")
    -> total
    { commissionFee berupa nominal rupiah, bukan persentase. }
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.9.1. Query Operasi hitungTotalTagihan

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| - | - | Tidak menggunakan query; operasi dilakukan pada atribut objek. |

### 5.9.2 Algoritma/Query

**Nama Kelas:** TagihanPembayaran  
**Nama Operasi:** `buatTagihan(): void`  
**ID Algoritma:** Algo-042

```text
function buatTagihan() -> void
    if isBlank(this.idTransaksi) or not isValidDate(this.expiryTimestamp) or this.expiryTimestamp <= now() then
        throw Error("Data tagihan atau batas pembayaran tidak valid")
    totalBaru <- hitungTotalTagihan()
    idBaru <- uuid()
    transaction
        pekerjaan <- wajibAda(queryOne("Q-042", this.idTransaksi))
        if pekerjaan.statusPekerjaan != "Menunggu Pembayaran" then
            throw Error("Pekerjaan tidak dapat ditagihkan")
        if queryOne("Q-043", this.idTransaksi).ada then
            throw Error("Tagihan aktif atau lunas sudah ada")
        execute("Q-044", idBaru, this.idTransaksi, this.nominalUpah,
                this.commissionFee, totalBaru, this.expiryTimestamp, "Menunggu Pembayaran")
    this.idTagihan <- idBaru
    this.totalBayar <- totalBaru
    this.statusPembayaran <- "Menunggu Pembayaran"
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.9.2. Query Operasi buatTagihan

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-042 | `SELECT "statusPekerjaan" FROM transaksi_pekerjaan WHERE "idTransaksi" = $1 FOR UPDATE;` | buatTagihan(): $1 = idTransaksi; semua pembuatan tagihan untuk pekerjaan yang sama wajib mengambil kunci ini. |
| Q-043 | `SELECT EXISTS (SELECT 1 FROM tagihan_pembayaran WHERE "idTransaksi" = $1 AND "statusPembayaran" IN ('Menunggu Pembayaran', 'Diproses', 'Berhasil')) AS ada;` | buatTagihan(): $1 = idTransaksi; mencegah tagihan aktif atau lunas dibuat ulang. |
| Q-044 | `INSERT INTO tagihan_pembayaran ("idTagihan", "idTransaksi", "nominalUpah", "commissionFee", "totalBayar", "expiryTimestamp", "statusPembayaran") VALUES ($1, $2, $3, $4, $5, $6, $7);` | buatTagihan(): $1?$7 = idTagihan, idTransaksi, nominalUpah, commissionFee, totalBayar, expiryTimestamp, status awal. |

### 5.9.3 Algoritma/Query

**Nama Kelas:** TagihanPembayaran  
**Nama Operasi:** `setStatusPembayaran(status: string): void`  
**ID Algoritma:** Algo-043

```text
function setStatusPembayaran(status: string) -> void
    { Controller memverifikasi callback gateway atau hasil pemeriksaan kedaluwarsa. }
    if status not in STATUS_PEMBAYARAN then
        throw Error("Status pembayaran tidak valid")
    transaction
        data <- wajibAda(queryOne("Q-045", this.idTagihan))
        if data.statusPembayaran != status then
            if not transisiDiizinkan("pembayaran", data.statusPembayaran, status) then
                throw Error("Perubahan status pembayaran tidak diizinkan")
            wajibAda(queryOne("Q-046", this.idTagihan, status))
    this.statusPembayaran <- status
    { Controller menyelaraskan status pekerjaan dalam transaksi yang sama bila diperlukan. }
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.9.3. Query Operasi setStatusPembayaran

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-045 | `SELECT "statusPembayaran" FROM tagihan_pembayaran WHERE "idTagihan" = $1 FOR UPDATE;` | setStatusPembayaran(): $1 = idTagihan. |
| Q-046 | `UPDATE tagihan_pembayaran SET "statusPembayaran" = $2 WHERE "idTagihan" = $1 RETURNING "statusPembayaran";` | setStatusPembayaran(): $1 = idTagihan, $2 = status hasil validasi. |

## 5.10 Kelas PencairanDana

**Nama Kelas:** PencairanDana  
**ID Kelas:** C10

Tabel 5.10.1. Operasi Kelas PencairanDana

| Nama Operasi | Visibility |
| :--- | :--- |
| `createPencairanDana(idTenagaKerja: string, nominal: Decimal, rekeningTujuan: string): void` | public |
| `setStatusPencairan(status: string): void` | public |

Tabel 5.10.2. Atribut Kelas PencairanDana

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| `idPencairan` | private | `string` |
| `idTenagaKerja` | private | `string` |
| `nominal` | private | `Decimal` |
| `rekeningTujuan` | private | `string` |
| `statusPencairan` | private | `string` |
| `waktuPengajuan` | private | `Date` |

### 5.10.1 Algoritma/Query

**Nama Kelas:** PencairanDana  
**Nama Operasi:** createPencairanDana(idTenagaKerja: string, nominal: number, rekeningTujuan: string): void
**ID Algoritma:** Algo-010-01

```text
procedure createPencairanDana(idTenagaKerja: string, nominal: number, rekeningTujuan: string)
    this.idPencairan <- generateUUID()
    this.idTenagaKerja <- idTenagaKerja
    this.nominal <- nominal
    this.rekeningTujuan <- rekeningTujuan
    this.statusPencairan <- "Menunggu Proses"
    this.waktuPengajuan <- getCurrentTimestamp()

    execute Q-010a with (this.idPencairan, this.idTenagaKerja, this.nominal, this.rekeningTujuan, this.statusPencairan, this.waktuPengajuan)
end procedure
```

Tabel 5.10.3. Query Operasi createPencairanDana(idTenagaKerja: string, nominal: number, rekeningTujuan: string): void

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-010-01 | INSERT INTO pencairanDana (idPencairan, idTenagaKerja, nominal, rekeningTujuan, statusPencairan, waktuPengajuan) VALUES (:idPencairan, :idTenagaKerja, :nominal, :rekeningTujuan, :statusPencairan, :waktuPengajuan); | Menyimpan permohonan pencairan dana baru tenaga kerja ke basis data. |

### 5.10.2 Algoritma/Query

**Nama Kelas:** PencairanDana  
**Nama Operasi:** setStatusPencairan(status: string): void
**ID Algoritma:** Algo-010-02

```text
procedure setStatusPencairan(status: string)
    this.statusPencairan <- status
    execute Q-010b with (status, this.idPencairan)
end procedure
```

Tabel 5.10.4. Query Operasi setStatusPencairan(status: string): void

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| Q-010-02 | UPDATE pencairanDana SET statusPencairan = :status WHERE idPencairan = :idPencairan; | Memperbarui status pemrosesan pencairan dana. |


## 5.11 Kelas UlasanRating

**Nama Kelas:** UlasanRating  
**ID Kelas:** C11

Tabel 5.11.1. Operasi Kelas UlasanRating

| Nama Operasi | Visibility |
| :--- | :--- |
| `simpanUlasan(): void` | public |

Tabel 5.11.2. Atribut Kelas UlasanRating

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| `idUlasan` | private | `string` |
| `idTransaksi` | private | `string` |
| `idPenilai` | private | `string` |
| `idPenerima` | private | `string` |
| `nilai` | private | `Integer` |
| `deskripsiUlasan` | private | `string` |

### 5.11.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** UlasanRating  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-011]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.11.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-011]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.11.2 Algoritma/Query

*[Ulangi pola 5.11.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.12 Kelas TiketSengketa

**Nama Kelas:** TiketSengketa  
**ID Kelas:** C12

Tabel 5.12.1. Operasi Kelas TiketSengketa

| Nama Operasi | Visibility |
| :--- | :--- |
| `buatTiket(): void` | public |
| `setStatusTiket(status: string): void` | public |

Tabel 5.12.2. Atribut Kelas TiketSengketa

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| `idTiket` | private | `string` |
| `idTransaksi` | private | `string` |
| `idPelapor` | private | `string` |
| `kategoriMasalah` | private | `string` |
| `deskripsiKomplain` | private | `string` |
| `urlBukti` | private | `string` |
| `statusTiket` | private | `string` |
| `keputusan` | private | `string` |

### 5.12.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** TiketSengketa  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-012]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.12.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-012]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.12.2 Algoritma/Query

*[Ulangi pola 5.12.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.13 Kelas RiwayatSengketa

**Nama Kelas:** RiwayatSengketa  
**ID Kelas:** C13

Tabel 5.13.1. Operasi Kelas RiwayatSengketa

| Nama Operasi | Visibility |
| :--- | :--- |
| `catatRiwayat(aktivitas: string): void` | public |

Tabel 5.13.2. Atribut Kelas RiwayatSengketa

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| `idRiwayat` | private | `string` |
| `idTiket` | private | `string` |
| `logAktivitas` | private | `string` |
| `timestamp` | private | `Date` |

### 5.13.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** RiwayatSengketa  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-013]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.13.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-013]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.13.2 Algoritma/Query

*[Ulangi pola 5.13.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.14 Kelas Notifikasi

**Nama Kelas:** Notifikasi  
**ID Kelas:** C14

Tabel 5.14.1. Operasi Kelas Notifikasi

| Nama Operasi | Visibility |
| :--- | :--- |
| `simpanNotifikasi(): void` | public |
| `tandaiSudahDibaca(): void` | public |

Tabel 5.14.2. Atribut Kelas Notifikasi

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| `idNotifikasi` | private | `string` |
| `idPenerima` | private | `string` |
| `pesanNotifikasi` | private | `string` |
| `statusBaca` | private | `boolean` |
| `waktuKirim` | private | `Date` |

### 5.14.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** Notifikasi  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-014]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.14.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-014]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.14.2 Algoritma/Query

*[Ulangi pola 5.14.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.15 Kelas PaymentGateway

**Nama Kelas:** PaymentGateway  
**ID Kelas:** C15

Tabel 5.15.1. Operasi Kelas PaymentGateway

| Nama Operasi | Visibility |
| :--- | :--- |
| `prosesPembayaran(idTagihan: string, nominal: Decimal): boolean` | public |
| `getStatusPembayaran(idTagihan: string): string` | public |
| `transferDana(rekeningTujuan: string, nominal: Decimal): boolean` | public |

Tabel 5.15.2. Atribut Kelas PaymentGateway

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| `idGateway` | private | `string` |
| `namaProvider` | private | `string` |
| `statusKoneksi` | private | `string` |

### 5.15.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** PaymentGateway  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-015]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.15.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-015]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.15.2 Algoritma/Query

*[Ulangi pola 5.15.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.16 Kelas PenggunaUI

**Nama Kelas:** PenggunaUI  
**ID Kelas:** C16

Tabel 5.16.1. Operasi Kelas PenggunaUI

| Nama Operasi | Visibility |
| :--- | :--- |
| `tampilkanFormRegistrasi(): void` | public |
| `tampilkanFormLogin(): void` | public |
| `kirimDataRegistrasi(dataProfil: Record<string, unknown>, peran: string, persetujuanPrivasi: boolean): void` | public |
| `kirimDataLogin(email: string, kataSandi: string): void` | public |
| `tampilkanPesanKesalahan(pesan: string): void` | public |
| `tampilkanPesanBerhasil(pesan: string): void` | public |

Tabel 5.16.2. Atribut Kelas PenggunaUI

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.16.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** PenggunaUI  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-016]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.16.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-016]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.16.2 Algoritma/Query

*[Ulangi pola 5.16.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.17 Kelas TenagaKerjaUI

**Nama Kelas:** TenagaKerjaUI  
**ID Kelas:** C17

Tabel 5.17.1. Operasi Kelas TenagaKerjaUI

| Nama Operasi | Visibility |
| :--- | :--- |
| `tampilkanFormProfil(): void` | public |
| `tampilkanFormUnggahDokumen(): void` | public |
| `kirimDokumenIdentitas(dokumen: File, persetujuan: boolean): void` | public |
| `aksesFiturUtama(namaFitur: string): void` | public |
| `tampilkanHalamanPencarian(): void` | public |
| `tampilkanHalamanPenyerahan(): void` | public |
| `pilihPencairanDana(): void` | public |

Tabel 5.17.2. Atribut Kelas TenagaKerjaUI

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.17.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** TenagaKerjaUI  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-017]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.17.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-017]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.17.2 Algoritma/Query

*[Ulangi pola 5.17.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.18 Kelas PenyediaKerjaUI

**Nama Kelas:** PenyediaKerjaUI  
**ID Kelas:** C18

Tabel 5.18.1. Operasi Kelas PenyediaKerjaUI

| Nama Operasi | Visibility |
| :--- | :--- |
| `tampilkanFormProfil(): void` | public |
| `pilihPembuatanLowongan(): void` | public |
| `tampilkanDaftarPelamar(pelamar: Array<PengajuanPenawaran>): void` | public |
| `tampilkanHalamanPembayaran(): void` | public |

Tabel 5.18.2. Atribut Kelas PenyediaKerjaUI

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.18.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** PenyediaKerjaUI  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-018]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.18.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-018]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.18.2 Algoritma/Query

*[Ulangi pola 5.18.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.19 Kelas CustomerServiceUI

**Nama Kelas:** CustomerServiceUI  
**ID Kelas:** C19

Tabel 5.19.1. Operasi Kelas CustomerServiceUI

| Nama Operasi | Visibility |
| :--- | :--- |
| `tampilkanDaftarAntreanVerifikasi(pengajuan: Array<TenagaKerja>): void` | public |
| `pilihPersetujuanVerifikasi(idTenagaKerja: string): void` | public |
| `pilihPenolakanVerifikasi(idTenagaKerja: string, alasan: string): void` | public |
| `tampilkanHalamanSengketa(): void` | public |

Tabel 5.19.2. Atribut Kelas CustomerServiceUI

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.19.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** CustomerServiceUI  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-019]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.19.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-019]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.19.2 Algoritma/Query

*[Ulangi pola 5.19.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.20 Kelas LowonganPekerjaanUI

**Nama Kelas:** LowonganPekerjaanUI  
**ID Kelas:** C20

Tabel 5.20.1. Operasi Kelas LowonganPekerjaanUI

| Nama Operasi | Visibility |
| :--- | :--- |
| `tampilkanFormLowongan(): void` | public |
| `kirimDataLowongan(dataLowongan: Record<string, unknown>): void` | public |
| `batalkanPengisian(): void` | public |
| `kirimPencarian(kataKunci: string): void` | public |
| `kirimFilter(kategori: string): void` | public |
| `tampilkanDaftarLowongan(lowongan: Array<LowonganPekerjaan>): void` | public |
| `tampilkanPesanKuotaPenuh(): void` | public |
| `tampilkanPesanKesalahan(pesan: string): void` | public |
| `tampilkanPesanBerhasil(pesan: string): void` | public |

Tabel 5.20.2. Atribut Kelas LowonganPekerjaanUI

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.20.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** LowonganPekerjaanUI  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-020]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.20.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-020]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.20.2 Algoritma/Query

*[Ulangi pola 5.20.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.21 Kelas PengajuanPenawaranUI

**Nama Kelas:** PengajuanPenawaranUI  
**ID Kelas:** C21

Tabel 5.21.1. Operasi Kelas PengajuanPenawaranUI

| Nama Operasi | Visibility |
| :--- | :--- |
| `tampilkanTombolAjukan(diizinkan: boolean): void` | public |
| `tampilkanFormPenawaran(): void` | public |
| `kirimPenawaran(idLowongan: string, pesan: string): void` | public |
| `batalkanPengisian(): void` | public |
| `tampilkanDetailPenawaran(penawaran: PengajuanPenawaran): void` | public |
| `konfirmasiPilihan(idPenawaran: string): void` | public |
| `tampilkanPesanKesalahan(pesan: string): void` | public |
| `tampilkanPesanBerhasil(pesan: string): void` | public |

Tabel 5.21.2. Atribut Kelas PengajuanPenawaranUI

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.21.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** PengajuanPenawaranUI  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-021]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.21.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-021]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.21.2 Algoritma/Query

*[Ulangi pola 5.21.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.22 Kelas TransaksiPekerjaanUI

**Nama Kelas:** TransaksiPekerjaanUI  
**ID Kelas:** C22

Tabel 5.22.1. Operasi Kelas TransaksiPekerjaanUI

| Nama Operasi | Visibility |
| :--- | :--- |
| `tampilkanDetailTransaksi(transaksi: TransaksiPekerjaan): void` | public |
| `tampilkanStatusTransaksi(status: string): void` | public |
| `tampilkanHalamanPenyerahan(): void` | public |
| `tampilkanKonfirmasi(): void` | public |
| `konfirmasiPersetujuan(idTransaksi: string): void` | public |
| `pilihPermintaanRevisi(): void` | public |
| `tampilkanFormRevisi(): void` | public |
| `kirimRevisi(idTransaksi: string, catatan: string): void` | public |
| `pilihPengajuanKeluhan(): void` | public |
| `arahkanKeFormKeluhan(idTransaksi: string): void` | public |
| `arahkanKeFormUlasan(idTransaksi: string): void` | public |
| `pilihPemberianUlasan(idTransaksi: string): void` | public |
| `tampilkanHalamanBerhasil(): void` | public |
| `tampilkanPesanKesalahan(pesan: string): void` | public |

Tabel 5.22.2. Atribut Kelas TransaksiPekerjaanUI

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.22.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** TransaksiPekerjaanUI  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-022]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.22.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-022]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.22.2 Algoritma/Query

*[Ulangi pola 5.22.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.23 Kelas BuktiPenyerahanUI

**Nama Kelas:** BuktiPenyerahanUI  
**ID Kelas:** C23

Tabel 5.23.1. Operasi Kelas BuktiPenyerahanUI

| Nama Operasi | Visibility |
| :--- | :--- |
| `tampilkanFormUnggah(): void` | public |
| `kirimBukti(idTransaksi: string, deskripsi: string, berkas: File): void` | public |
| `tampilkanBerkasBukti(bukti: BuktiPenyerahan): void` | public |
| `tampilkanPesanKesalahan(pesan: string): void` | public |

Tabel 5.23.2. Atribut Kelas BuktiPenyerahanUI

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.23.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** BuktiPenyerahanUI  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-023]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.23.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-023]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.23.2 Algoritma/Query

*[Ulangi pola 5.23.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.24 Kelas TagihanPembayaranUI

**Nama Kelas:** TagihanPembayaranUI  
**ID Kelas:** C24

Tabel 5.24.1. Operasi Kelas TagihanPembayaranUI

| Nama Operasi | Visibility |
| :--- | :--- |
| `tampilkanInstruksiPembayaran(tagihan: TagihanPembayaran): void` | public |
| `kirimPembayaran(idTagihan: string, metode: string): void` | public |
| `tampilkanStatusKedaluwarsa(): void` | public |
| `tampilkanPesanKesalahan(pesan: string): void` | public |

Tabel 5.24.2. Atribut Kelas TagihanPembayaranUI

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.24.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** TagihanPembayaranUI  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-024]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.24.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-024]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.24.2 Algoritma/Query

*[Ulangi pola 5.24.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.25 Kelas PencairanDanaUI

**Nama Kelas:** PencairanDanaUI  
**ID Kelas:** C25

Tabel 5.25.1. Operasi Kelas PencairanDanaUI

| Nama Operasi | Visibility |
| :--- | :--- |
| `tampilkanFormPencairan(): void` | public |
| `kirimPencairan(nominal: Decimal, rekeningTujuan: string): void` | public |
| `konfirmasiPencairan(idPencairan: string): void` | public |
| `tampilkanHalamanBerhasil(): void` | public |
| `tampilkanPesanKesalahan(pesan: string): void` | public |

Tabel 5.25.2. Atribut Kelas PencairanDanaUI

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.25.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** PencairanDanaUI  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-025]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.25.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-025]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.25.2 Algoritma/Query

*[Ulangi pola 5.25.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.26 Kelas UlasanRatingUI

**Nama Kelas:** UlasanRatingUI  
**ID Kelas:** C26

Tabel 5.26.1. Operasi Kelas UlasanRatingUI

| Nama Operasi | Visibility |
| :--- | :--- |
| `tampilkanFormUlasan(idTransaksi: string): void` | public |
| `kirimUlasan(idTransaksi: string, nilai: Integer, deskripsi: string): void` | public |
| `tampilkanPesanBerhasil(pesan: string): void` | public |
| `tampilkanPesanKesalahan(pesan: string): void` | public |

Tabel 5.26.2. Atribut Kelas UlasanRatingUI

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.26.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** UlasanRatingUI  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-026]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.26.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-026]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.26.2 Algoritma/Query

*[Ulangi pola 5.26.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.27 Kelas TiketSengketaUI

**Nama Kelas:** TiketSengketaUI  
**ID Kelas:** C27

Tabel 5.27.1. Operasi Kelas TiketSengketaUI

| Nama Operasi | Visibility |
| :--- | :--- |
| `kirimLaporan(idTransaksi: string, kategori: string, deskripsi: string, bukti: File): void` | public |
| `tampilkanTiketDasbor(tiket: Array<TiketSengketa>): void` | public |
| `kirimKeputusanSengketa(idTiket: string, keputusan: string): void` | public |
| `pilihPermintaanBukti(idTiket: string): void` | public |
| `tampilkanStatusTiket(status: string): void` | public |
| `pilihPenolakanLaporan(idTiket: string, alasan: string): void` | public |
| `pilihPembatalan(idTiket: string): void` | public |
| `tampilkanKonfirmasiPembatalan(): void` | public |
| `konfirmasiPembatalanTiket(idTiket: string): void` | public |
| `tampilkanPesanKesalahan(pesan: string): void` | public |

Tabel 5.27.2. Atribut Kelas TiketSengketaUI

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.27.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** TiketSengketaUI  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-027]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.27.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-027]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.27.2 Algoritma/Query

*[Ulangi pola 5.27.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.28 Kelas RiwayatSengketaUI

**Nama Kelas:** RiwayatSengketaUI  
**ID Kelas:** C28

Tabel 5.28.1. Operasi Kelas RiwayatSengketaUI

| Nama Operasi | Visibility |
| :--- | :--- |
| `tampilkanRiwayat(riwayat: Array<RiwayatSengketa>): void` | public |

Tabel 5.28.2. Atribut Kelas RiwayatSengketaUI

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.28.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** RiwayatSengketaUI  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-028]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.28.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-028]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.28.2 Algoritma/Query

*[Ulangi pola 5.28.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.29 Kelas NotifikasiUI

**Nama Kelas:** NotifikasiUI  
**ID Kelas:** C29

Tabel 5.29.1. Operasi Kelas NotifikasiUI

| Nama Operasi | Visibility |
| :--- | :--- |
| `tampilkanNotifikasi(pesan: string): void` | public |
| `bacaNotifikasi(idNotifikasi: string): void` | public |

Tabel 5.29.2. Atribut Kelas NotifikasiUI

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.29.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** NotifikasiUI  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-029]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.29.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-029]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.29.2 Algoritma/Query

*[Ulangi pola 5.29.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.30 Kelas PaymentGatewayUI

**Nama Kelas:** PaymentGatewayUI  
**ID Kelas:** C30

Tabel 5.30.1. Operasi Kelas PaymentGatewayUI

| Nama Operasi | Visibility |
| :--- | :--- |
| `tampilkanHalamanPembayaranEksternal(): void` | public |
| `tampilkanStatusGateway(status: string): void` | public |

Tabel 5.30.2. Atribut Kelas PaymentGatewayUI

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.30.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** PaymentGatewayUI  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-030]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.30.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-030]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.30.2 Algoritma/Query

*[Ulangi pola 5.30.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.31 Kelas PenggunaController

**Nama Kelas:** PenggunaController  
**ID Kelas:** C31

Tabel 5.31.1. Operasi Kelas PenggunaController

| Nama Operasi | Visibility |
| :--- | :--- |
| `registrasi(dataProfil: Record<string, unknown>, peran: string, persetujuanPrivasi: boolean): void` | public |
| `validasiBatasUsia(tanggalLahir: Date): boolean` | private |
| `cekEmailTerdaftar(email: string): boolean` | private |
| `hashKataSandi(kataSandi: string): string` | private |
| `prosesLogin(email: string, kataSandi: string): string` | public |
| `validasiKredensial(email: string, kataSandi: string): boolean` | private |
| `buatToken(idPengguna: string): string` | private |

Tabel 5.31.2. Atribut Kelas PenggunaController

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.31.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** PenggunaController  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-031]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.31.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-031]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.31.2 Algoritma/Query

*[Ulangi pola 5.31.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.32 Kelas TenagaKerjaController

**Nama Kelas:** TenagaKerjaController  
**ID Kelas:** C32

Tabel 5.32.1. Operasi Kelas TenagaKerjaController

| Nama Operasi | Visibility |
| :--- | :--- |
| `simpanProfilTenagaKerja(dataProfil: Record<string, unknown>, kataSandiHash: string): void` | public |
| `prosesPengajuanVerifikasi(idTenagaKerja: string, dokumen: File, persetujuan: boolean): void` | public |
| `validasiFormatDokumen(dokumen: File): boolean` | private |
| `validasiUkuranDokumen(dokumen: File): boolean` | private |
| `periksaAksesFitur(idTenagaKerja: string, namaFitur: string): boolean` | public |
| `arahkanKePenyerahan(idTransaksi: string): void` | public |
| `ajukanPencairan(idTenagaKerja: string): void` | public |

Tabel 5.32.2. Atribut Kelas TenagaKerjaController

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| `batasUkuranDokumen` | private | `Integer` |
| `formatDokumenDiizinkan` | private | `Array<string>` |

### 5.32.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** TenagaKerjaController  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-032]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.32.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-032]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.32.2 Algoritma/Query

*[Ulangi pola 5.32.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.33 Kelas PenyediaKerjaController

**Nama Kelas:** PenyediaKerjaController  
**ID Kelas:** C33

Tabel 5.33.1. Operasi Kelas PenyediaKerjaController

| Nama Operasi | Visibility |
| :--- | :--- |
| `simpanProfilPenyediaKerja(dataProfil: Record<string, unknown>, kataSandiHash: string): void` | public |
| `arahkanKeFormLowongan(): void` | public |
| `arahkanKeDaftarPelamar(idLowongan: string): Array<PengajuanPenawaran>` | public |
| `arahkanKePembayaran(idTransaksi: string): void` | public |

Tabel 5.33.2. Atribut Kelas PenyediaKerjaController

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.33.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** PenyediaKerjaController  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-033]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.33.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-033]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.33.2 Algoritma/Query

*[Ulangi pola 5.33.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.34 Kelas CustomerServiceController

**Nama Kelas:** CustomerServiceController  
**ID Kelas:** C34

Tabel 5.34.1. Operasi Kelas CustomerServiceController

| Nama Operasi | Visibility |
| :--- | :--- |
| `tinjauDokumenIdentitas(idTenagaKerja: string): File` | public |
| `prosesPersetujuanVerifikasi(idTenagaKerja: string): void` | public |
| `prosesPenolakanVerifikasi(idTenagaKerja: string, alasan: string): void` | public |
| `prosesTiketSengketa(idTiket: string): TiketSengketa` | public |

Tabel 5.34.2. Atribut Kelas CustomerServiceController

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.34.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** CustomerServiceController  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-034]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.34.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-034]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.34.2 Algoritma/Query

*[Ulangi pola 5.34.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.35 Kelas LowonganPekerjaanController

**Nama Kelas:** LowonganPekerjaanController  
**ID Kelas:** C35

Tabel 5.35.1. Operasi Kelas LowonganPekerjaanController

| Nama Operasi | Visibility |
| :--- | :--- |
| `prosesPembuatanLowongan(dataLowongan: Record<string, unknown>): LowonganPekerjaan` | public |
| `prosesCariLowongan(kataKunci: string): Array<LowonganPekerjaan>` | public |
| `prosesFilterLowongan(kategori: string): Array<LowonganPekerjaan>` | public |
| `validasiKuota(idLowongan: string): boolean` | public |

Tabel 5.35.2. Atribut Kelas LowonganPekerjaanController

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.35.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** LowonganPekerjaanController  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-035]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.35.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-035]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.35.2 Algoritma/Query

*[Ulangi pola 5.35.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.36 Kelas PengajuanPenawaranController

**Nama Kelas:** PengajuanPenawaranController  
**ID Kelas:** C36

Tabel 5.36.1. Operasi Kelas PengajuanPenawaranController

| Nama Operasi | Visibility |
| :--- | :--- |
| `prosesPengajuanPenawaran(idLowongan: string, idTenagaKerja: string, pesan: string): void` | public |
| `validasiStatusAkun(idTenagaKerja: string): boolean` | private |
| `prosesPemilihanPelamar(idPenawaran: string): void` | public |
| `batalkanPemilihan(): void` | public |

Tabel 5.36.2. Atribut Kelas PengajuanPenawaranController

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.36.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** PengajuanPenawaranController  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-036]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.36.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-036]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.36.2 Algoritma/Query

*[Ulangi pola 5.36.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.37 Kelas TransaksiPekerjaanController

**Nama Kelas:** TransaksiPekerjaanController  
**ID Kelas:** C37

Tabel 5.37.1. Operasi Kelas TransaksiPekerjaanController

| Nama Operasi | Visibility |
| :--- | :--- |
| `prosesPembuatanTransaksi(idPenawaran: string): TransaksiPekerjaan` | public |
| `prosesInisiasiPembayaran(idTransaksi: string): void` | public |
| `getTransaksi(idTransaksi: string): TransaksiPekerjaan` | public |
| `prosesPenyerahanHasil(idTransaksi: string): void` | public |
| `prosesPersetujuanHasil(idTransaksi: string): void` | public |
| `prosesPembayaranUpah(idTransaksi: string): void` | public |
| `prosesPermintaanRevisi(idTransaksi: string, catatan: string): void` | public |
| `inisiasiKeluhan(idTransaksi: string): void` | public |
| `tahanStatusDana(idTransaksi: string): void` | public |
| `validasiKelayakanUlasan(idTransaksi: string, idPenilai: string): boolean` | public |

Tabel 5.37.2. Atribut Kelas TransaksiPekerjaanController

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.37.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** TransaksiPekerjaanController  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-037]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.37.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-037]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.37.2 Algoritma/Query

*[Ulangi pola 5.37.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.38 Kelas BuktiPenyerahanController

**Nama Kelas:** BuktiPenyerahanController  
**ID Kelas:** C38

Tabel 5.38.1. Operasi Kelas BuktiPenyerahanController

| Nama Operasi | Visibility |
| :--- | :--- |
| `prosesUnggahBukti(idTransaksi: string, deskripsi: string, berkas: File): boolean` | public |
| `validasiUkuranBerkas(berkas: File): boolean` | private |
| `validasiKeberadaanBerkas(berkas: File): boolean` | private |
| `getBuktiPenyerahan(idTransaksi: string): BuktiPenyerahan` | public |

Tabel 5.38.2. Atribut Kelas BuktiPenyerahanController

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| `batasUkuranBerkas` | private | `Integer` |

### 5.38.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** BuktiPenyerahanController  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-038]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.38.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-038]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.38.2 Algoritma/Query

*[Ulangi pola 5.38.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.39 Kelas TagihanPembayaranController

**Nama Kelas:** TagihanPembayaranController  
**ID Kelas:** C39

Tabel 5.39.1. Operasi Kelas TagihanPembayaranController

| Nama Operasi | Visibility |
| :--- | :--- |
| `prosesPembuatanTagihan(idTransaksi: string): TagihanPembayaran` | public |
| `cekBatasWaktu(idTagihan: string): boolean` | public |
| `prosesKegagalanPembayaran(idTagihan: string): void` | public |
| `prosesPembayaranTagihan(idTagihan: string, metode: string): boolean` | public |

Tabel 5.39.2. Atribut Kelas TagihanPembayaranController

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.39.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** TagihanPembayaranController  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-039]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.39.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-039]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.39.2 Algoritma/Query

*[Ulangi pola 5.39.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.40 Kelas PencairanDanaController

**Nama Kelas:** PencairanDanaController  
**ID Kelas:** C40

Tabel 5.40.1. Operasi Kelas PencairanDanaController

| Nama Operasi | Visibility |
| :--- | :--- |
| `prosesPencairan(idTenagaKerja: string, nominal: Decimal, rekeningTujuan: string): PencairanDana` | public |
| `konfirmasiPencairan(idPencairan: string): void` | public |
| `validasiSaldo(idTenagaKerja: string, nominal: Decimal): boolean` | private |
| `cekKeberhasilanTransfer(idPencairan: string): boolean` | public |
| `tolakPencairan(idPencairan: string, alasan: string): void` | public |

Tabel 5.40.2. Atribut Kelas PencairanDanaController

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.40.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** PencairanDanaController  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-040]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.40.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-040]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.40.2 Algoritma/Query

*[Ulangi pola 5.40.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.41 Kelas UlasanRatingController

**Nama Kelas:** UlasanRatingController  
**ID Kelas:** C41

Tabel 5.41.1. Operasi Kelas UlasanRatingController

| Nama Operasi | Visibility |
| :--- | :--- |
| `prosesPemberianUlasan(idTransaksi: string, idPenilai: string, nilai: Integer, deskripsi: string): void` | public |
| `validasiNilaiUlasan(nilai: Integer): boolean` | private |

Tabel 5.41.2. Atribut Kelas UlasanRatingController

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.41.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** UlasanRatingController  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-041]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.41.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-041]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.41.2 Algoritma/Query

*[Ulangi pola 5.41.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.42 Kelas TiketSengketaController

**Nama Kelas:** TiketSengketaController  
**ID Kelas:** C42

Tabel 5.42.1. Operasi Kelas TiketSengketaController

| Nama Operasi | Visibility |
| :--- | :--- |
| `prosesPembuatanTiket(idTransaksi: string, idPelapor: string, kategori: string, deskripsi: string, bukti: File): TiketSengketa` | public |
| `prosesKeputusanSengketa(idTiket: string, keputusan: string): void` | public |
| `mintaBuktiTambahan(idTiket: string, pesan: string): void` | public |
| `tolakTiket(idTiket: string, alasan: string): void` | public |
| `batalkanTiket(idTiket: string): void` | public |

Tabel 5.42.2. Atribut Kelas TiketSengketaController

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.42.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** TiketSengketaController  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-042]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.42.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-042]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.42.2 Algoritma/Query

*[Ulangi pola 5.42.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.43 Kelas RiwayatSengketaController

**Nama Kelas:** RiwayatSengketaController  
**ID Kelas:** C43

Tabel 5.43.1. Operasi Kelas RiwayatSengketaController

| Nama Operasi | Visibility |
| :--- | :--- |
| `prosesPencatatanRiwayat(idTiket: string, aktivitas: string): void` | public |
| `getRiwayatSengketa(idTiket: string): Array<RiwayatSengketa>` | public |

Tabel 5.43.2. Atribut Kelas RiwayatSengketaController

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.43.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** RiwayatSengketaController  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-043]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.43.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-043]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.43.2 Algoritma/Query

*[Ulangi pola 5.43.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.44 Kelas NotifikasiController

**Nama Kelas:** NotifikasiController  
**ID Kelas:** C44

Tabel 5.44.1. Operasi Kelas NotifikasiController

| Nama Operasi | Visibility |
| :--- | :--- |
| `kirimNotifikasi(idPenerima: string, pesan: string): void` | public |
| `buatNotifikasiVerifikasi(idTenagaKerja: string, status: string, alasan: string): void` | public |
| `prosesPembacaanNotifikasi(idNotifikasi: string): void` | public |

Tabel 5.44.2. Atribut Kelas NotifikasiController

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.44.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** NotifikasiController  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-044]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.44.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-044]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.44.2 Algoritma/Query

*[Ulangi pola 5.44.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


## 5.45 Kelas PaymentGatewayController

**Nama Kelas:** PaymentGatewayController  
**ID Kelas:** C45

Tabel 5.45.1. Operasi Kelas PaymentGatewayController

| Nama Operasi | Visibility |
| :--- | :--- |
| `kirimPermintaanPembayaran(idTagihan: string, nominal: Decimal): boolean` | public |
| `prosesNotifikasiPembayaran(idTagihan: string, status: string): void` | public |
| `kirimPermintaanPencairan(rekeningTujuan: string, nominal: Decimal): boolean` | public |

Tabel 5.45.2. Atribut Kelas PaymentGatewayController

| Nama Atribut | Visibility | Tipe |
| :--- | :--- | :--- |
| - | - | Tidak ada atribut khusus yang ditetapkan pada rancangan ini. |

### 5.45.1 Algoritma/Query

Bagian ini diisi untuk kerangka algoritma proses yang dianggap cukup penting. Algoritma dapat dituliskan sebagai *pseudocode*. Implementasi *skeleton code* juga dapat digunakan untuk kelas yang sudah terdefinisi pada bahasa pemrograman tertentu.

**Nama Kelas:** PaymentGatewayController  
**Nama Operasi:** *[Signature operasi]*  
**ID Algoritma:** *[Algo-045]*

```text
[Tuliskan pseudocode algoritma operasi di sini.]
```

Jika operasi mengacu pada query tertentu, lengkapi tabel berikut.

Tabel 5.45.3. Query Operasi [Nama Operasi]

| No Query | Query | Keterangan |
| :--- | :--- | :--- |
| *[Q-045]* | *[Tuliskan query]* | *[Fungsi query]* |
| *...* | *...* | *...* |

### 5.45.2 Algoritma/Query

*[Ulangi pola 5.45.1 untuk operasi penting berikutnya pada kelas yang sama, jika ada.]*


<br>

---

# BAB 6: Perancangan Antarmuka

## 6.1 Rancangan Antarmuka [ID Layar 1]

Masukkan versi awal prototipe antarmuka, dimana untuk setiap antarmuka/layar, tuliskan spesifikasi rinci objek yang ditampilkan dan reaksi sistem terhadap interaksi pengguna.

**Antarmuka:** *[ID layar]*  
**Nama Layar:** *[Nama layar]*

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="./assets/diagram/contoh-design.png" width="50%">
</p>
<p align="center">
<i>Gambar 6.1. Rancangan Antarmuka [ID Layar] - [Nama Layar]</i>
</p>

Tabel 6.1. Spesifikasi Objek Antarmuka [ID Layar]

| Id_Objek | Jenis | Konten | Keterangan |
| :--- | :--- | :--- | :--- |
| *[ID objek]* | *[Jenis objek, misalnya Button, RTF Box, dll]* | *[String yang tampil pada layar]* | *[Reaksi sistem, layar tujuan, tautan, atau ID algoritma yang dijalankan]* |
| *[ID objek]* | *[Jenis objek]* | *[Konten yang ditampilkan]* | *[Reaksi sistem atau nama file terkait beserta deskripsi ringkasnya]* |
| *...* | *...* | *...* | *...* |


## 6.X Rancangan Antarmuka [ID Layar X]

*[Ulangi pola 6.1 untuk layar berikutnya sampai semua layar teridentifikasi]*

## 6.Y Rancangan Antarmuka Keseluruhan

Tuliskan daftar gambar seluruh antarmuka. Berikan ID unik untuk setiap tampilan dan gunakan ID yang sama pada subbab perancangan antarmuka masing-masing.

Tabel 6.Y. Rancangan Antarmuka Keseluruhan

| No | Tampilan Antarmuka |
| :--- | :--- |
| *[I-01]* | <img src="./assets/diagram/contoh-design.png" alt="Contoh Desain" width="400"> |
| *[I-02]* | *[Sisipkan gambar antarmuka I-02]* |
| *[I-XX]* | *[Sisipkan gambar antarmuka berikutnya]* |

<br>

---

# BAB 7: Matriks Kerunutan

Matriks berikut memetakan kelas perancangan ke use case yang didukung berdasarkan Bab 6 Traceability SKPL dan identifikasi kelas pada Bab 3 DPPL.

Tabel 7.1. Matriks Kerunutan Kelas terhadap Use Case

| Kelas | Use Case Terkait |
| :--- | :--- |
| C01 - Pengguna | UC01 - Melakukan Registrasi<br>UC11 - Memberikan Penilaian Kerja |
| C02 - TenagaKerja | UC01 - Melakukan Registrasi<br>UC02 - Mengelola Verifikasi Identitas<br>UC04 - Mencari Lowongan Pekerjaan<br>UC05 - Mengajukan Penawaran Pekerjaan<br>UC08 - Menyerahkan Hasil Pekerjaan<br>UC10 - Melakukan Pencairan Dana<br>UC11 - Memberikan Penilaian Kerja |
| C03 - PenyediaKerja | UC01 - Melakukan Registrasi<br>UC03 - Mengelola Lowongan Pekerjaan<br>UC06 - Memilih Tenaga Kerja<br>UC07 - Melakukan Pembayaran Pekerjaan<br>UC09 - Memverifikasi Penyelesaian Pekerjaan<br>UC11 - Memberikan Penilaian Kerja |
| C04 - CustomerService | UC02 - Mengelola Verifikasi Identitas<br>UC12 - Menangani Keluhan |
| C05 - LowonganPekerjaan | UC03 - Mengelola Lowongan Pekerjaan<br>UC04 - Mencari Lowongan Pekerjaan<br>UC05 - Mengajukan Penawaran Pekerjaan<br>UC06 - Memilih Tenaga Kerja |
| C06 - PengajuanPenawaran | UC05 - Mengajukan Penawaran Pekerjaan<br>UC06 - Memilih Tenaga Kerja |
| C07 - TransaksiPekerjaan | UC06 - Memilih Tenaga Kerja<br>UC07 - Melakukan Pembayaran Pekerjaan<br>UC08 - Menyerahkan Hasil Pekerjaan<br>UC09 - Memverifikasi Penyelesaian Pekerjaan<br>UC11 - Memberikan Penilaian Kerja<br>UC12 - Menangani Keluhan |
| C08 - BuktiPenyerahan | UC08 - Menyerahkan Hasil Pekerjaan<br>UC09 - Memverifikasi Penyelesaian Pekerjaan |
| C09 - TagihanPembayaran | UC07 - Melakukan Pembayaran Pekerjaan |
| C10 - PencairanDana | UC10 - Melakukan Pencairan Dana |
| C11 - UlasanRating | UC11 - Memberikan Penilaian Kerja |
| C12 - TiketSengketa | UC12 - Menangani Keluhan |
| C13 - RiwayatSengketa | UC12 - Menangani Keluhan |
| C14 - Notifikasi | UC02 - Mengelola Verifikasi Identitas<br>UC05 - Mengajukan Penawaran Pekerjaan<br>UC06 - Memilih Tenaga Kerja<br>UC07 - Melakukan Pembayaran Pekerjaan<br>UC08 - Menyerahkan Hasil Pekerjaan<br>UC09 - Memverifikasi Penyelesaian Pekerjaan<br>UC10 - Melakukan Pencairan Dana<br>UC12 - Menangani Keluhan |
| C15 - PaymentGateway | UC07 - Melakukan Pembayaran Pekerjaan<br>UC10 - Melakukan Pencairan Dana |
| C16 - PenggunaUI | UC01 - Melakukan Registrasi<br>UC11 - Memberikan Penilaian Kerja |
| C17 - TenagaKerjaUI | UC01 - Melakukan Registrasi<br>UC02 - Mengelola Verifikasi Identitas<br>UC04 - Mencari Lowongan Pekerjaan<br>UC08 - Menyerahkan Hasil Pekerjaan<br>UC10 - Melakukan Pencairan Dana |
| C18 - PenyediaKerjaUI | UC01 - Melakukan Registrasi<br>UC03 - Mengelola Lowongan Pekerjaan<br>UC06 - Memilih Tenaga Kerja<br>UC07 - Melakukan Pembayaran Pekerjaan<br>UC09 - Memverifikasi Penyelesaian Pekerjaan |
| C19 - CustomerServiceUI | UC02 - Mengelola Verifikasi Identitas<br>UC12 - Menangani Keluhan |
| C20 - LowonganPekerjaanUI | UC03 - Mengelola Lowongan Pekerjaan<br>UC04 - Mencari Lowongan Pekerjaan<br>UC06 - Memilih Tenaga Kerja |
| C21 - PengajuanPenawaranUI | UC05 - Mengajukan Penawaran Pekerjaan<br>UC06 - Memilih Tenaga Kerja |
| C22 - TransaksiPekerjaanUI | UC06 - Memilih Tenaga Kerja<br>UC07 - Melakukan Pembayaran Pekerjaan<br>UC08 - Menyerahkan Hasil Pekerjaan<br>UC09 - Memverifikasi Penyelesaian Pekerjaan<br>UC11 - Memberikan Penilaian Kerja<br>UC12 - Menangani Keluhan |
| C23 - BuktiPenyerahanUI | UC08 - Menyerahkan Hasil Pekerjaan<br>UC09 - Memverifikasi Penyelesaian Pekerjaan |
| C24 - TagihanPembayaranUI | UC07 - Melakukan Pembayaran Pekerjaan |
| C25 - PencairanDanaUI | UC10 - Melakukan Pencairan Dana |
| C26 - UlasanRatingUI | UC11 - Memberikan Penilaian Kerja |
| C27 - TiketSengketaUI | UC12 - Menangani Keluhan |
| C28 - RiwayatSengketaUI | UC12 - Menangani Keluhan |
| C29 - NotifikasiUI | UC02 - Mengelola Verifikasi Identitas<br>UC05 - Mengajukan Penawaran Pekerjaan<br>UC06 - Memilih Tenaga Kerja<br>UC07 - Melakukan Pembayaran Pekerjaan<br>UC08 - Menyerahkan Hasil Pekerjaan<br>UC09 - Memverifikasi Penyelesaian Pekerjaan<br>UC10 - Melakukan Pencairan Dana<br>UC12 - Menangani Keluhan |
| C30 - PaymentGatewayUI | UC07 - Melakukan Pembayaran Pekerjaan<br>UC10 - Melakukan Pencairan Dana |
| C31 - PenggunaController | UC01 - Melakukan Registrasi<br>UC11 - Memberikan Penilaian Kerja |
| C32 - TenagaKerjaController | UC01 - Melakukan Registrasi<br>UC02 - Mengelola Verifikasi Identitas<br>UC04 - Mencari Lowongan Pekerjaan<br>UC08 - Menyerahkan Hasil Pekerjaan<br>UC10 - Melakukan Pencairan Dana |
| C33 - PenyediaKerjaController | UC01 - Melakukan Registrasi<br>UC03 - Mengelola Lowongan Pekerjaan<br>UC06 - Memilih Tenaga Kerja<br>UC07 - Melakukan Pembayaran Pekerjaan<br>UC09 - Memverifikasi Penyelesaian Pekerjaan |
| C34 - CustomerServiceController | UC02 - Mengelola Verifikasi Identitas<br>UC12 - Menangani Keluhan |
| C35 - LowonganPekerjaanController | UC03 - Mengelola Lowongan Pekerjaan<br>UC04 - Mencari Lowongan Pekerjaan<br>UC06 - Memilih Tenaga Kerja |
| C36 - PengajuanPenawaranController | UC05 - Mengajukan Penawaran Pekerjaan<br>UC06 - Memilih Tenaga Kerja |
| C37 - TransaksiPekerjaanController | UC06 - Memilih Tenaga Kerja<br>UC07 - Melakukan Pembayaran Pekerjaan<br>UC08 - Menyerahkan Hasil Pekerjaan<br>UC09 - Memverifikasi Penyelesaian Pekerjaan<br>UC11 - Memberikan Penilaian Kerja<br>UC12 - Menangani Keluhan |
| C38 - BuktiPenyerahanController | UC08 - Menyerahkan Hasil Pekerjaan<br>UC09 - Memverifikasi Penyelesaian Pekerjaan |
| C39 - TagihanPembayaranController | UC07 - Melakukan Pembayaran Pekerjaan |
| C40 - PencairanDanaController | UC10 - Melakukan Pencairan Dana |
| C41 - UlasanRatingController | UC11 - Memberikan Penilaian Kerja |
| C42 - TiketSengketaController | UC12 - Menangani Keluhan |
| C43 - RiwayatSengketaController | UC12 - Menangani Keluhan |
| C44 - NotifikasiController | UC02 - Mengelola Verifikasi Identitas<br>UC05 - Mengajukan Penawaran Pekerjaan<br>UC06 - Memilih Tenaga Kerja<br>UC07 - Melakukan Pembayaran Pekerjaan<br>UC08 - Menyerahkan Hasil Pekerjaan<br>UC09 - Memverifikasi Penyelesaian Pekerjaan<br>UC10 - Melakukan Pencairan Dana<br>UC12 - Menangani Keluhan |
| C45 - PaymentGatewayController | UC07 - Melakukan Pembayaran Pekerjaan<br>UC10 - Melakukan Pencairan Dana 