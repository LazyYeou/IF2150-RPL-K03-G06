<h1>
IF2150 REKAYASA PERANGKAT LUNAK
<br>
TUGAS 5
<br>
SPESIFIKASI KEBUTUHAN PERANGKAT LUNAK (SKPL)
</h1>
<br>

## *Nama Perangkat Lunak*: Kerja-In

### Untuk: Agatha Tatianingseto

Dipersiapkan oleh:

| Informasi | Keterangan |
| --- | --- |
| Kelas | 03 |
| Kelompok | Shifu  |

| NIM | Nama |
| --- | --- |
| 13525033 | Davin Farel Santoso |
| 13525039 | Aditya Rasyid|
| 13525096 | Muhammad Ridwan Nasir Firdaus |
| 13525102 | Karmel Tua Haloho |
| 13525123 | Sebastio Nugroho |
---

## Daftar Perubahan

| Revisi | Deskripsi |
| :--- | :--- |
| *A* | *Deskripsikan perubahan yang dilakukan dari dokumen sebelumnya pada dokumen ini. Jika tidak terdapat perubahan, harap kosongkan tabel.* |
| *B* |  |
| *C* |  |
| ... |  |

<br>

# BAB 1: Pendahuluan

## 1.1 Tujuan Penulisan Dokumen
Tuliskan dengan ringkas tujuan dokumen SKPL ini dibuat dan siapa saja yang akan menggunakan dokumen ini.

## 1.2 Lingkup Masalah
Tuliskan dengan ringkas nama aplikasi dan deskripsi singkatnya. Bagian ini maksimal berisi satu paragraf, dapat diringkas dari BAB 1 *Analisis Permasalahan* pada dokumen *Topic Brainstorming*.

## 1.3 Definisi, Istilah, dan Singkatan
Semua definisi dan singkatan yang digunakan dalam dokumen ini beserta penjelasannya.

Tabel 1.3. Definisi Istilah dan Singkatan

| Singkatan, Akronim, atau Istilah | Penjelasan |
| :--- | :--- |
| *P/L* | *Singkatan dari Perangkat Lunak, yaitu aplikasi yang memberikan perintah kepada komputer untuk menjalankan tugas tertentu.* |
| *SKPL* | *Singkatan dari Spesifikasi Kebutuhan Perangkat Lunak, yaitu dokumen yang merangkum kriteria-kriteria yang diperlukan untuk membangun aplikasi menjalankan tugasnya.* |
| *KF* | *Singkatan dari Kebutuhan Fungsional.* |
| *KNF* | *Singkatan dari Kebutuhan Non-Fungsional.* |
| *UC* | *Singkatan dari Use Case.* |
| *EARS* | *Easy Approach to Requirements Syntax, yaitu pola penulisan kebutuhan agar konsisten dan mudah diuji.* |
| *...* | *...* |

## 1.4 Aturan Penomoran
Tuliskan aturan penomoran (ID) yang digunakan dalam dokumen ini. Gunakan pola ID yang **sama** dengan yang sudah dipakai pada dokumen-dokumen sebelumnya, jangan membuat pola baru di dokumen ini.

Tabel 1.4. Aturan Penomoran

| Hal/Bagian | Penomoran | Keterangan |
| :--- | :--- | :--- |
| *Kebutuhan Fungsional* | *KFXX* | |
| *Kebutuhan Non-Fungsional* | *KNFXX* | |
| *Aktor* | *AXX* | |
| *Use Case* | *UCXX* | |
| *Kelas* | *CXX* | |
| *...* | *...* |

## 1.5 Referensi
Dokumentasi P/L yang dirujuk oleh dokumen ini. Referensi dapat berupa buku, panduan, ataupun dokumentasi lain yang dipakai dalam pengembangan P/L ini.

## 1.6 Deskripsi Umum Dokumen (Ikhtisar)
Tuliskan sistematika pembahasan dokumen SKPL ini secara runut (misalnya: BAB 2 membahas deskripsi umum P/L, BAB 3 membahas kebutuhan fungsional dan non-fungsional, dst).

---

# BAB 2: Deskripsi Perangkat Lunak

## 2.1 Deskripsi Umum Sistem
Bagian ini dapat disalin dari BAB 1.1 *Deskripsi Umum Sistem* pada dokumen *Requirement Gathering*, disesuaikan bila ada perubahan alur bisnis. Lengkapi dengan gambaran proses bisnis dalam bentuk *Activity Diagram* (boleh disalin dan diperbarui dari 3.3 *Model Proses Bisnis* pada dokumen *Topic Brainstorming*).

<p align="center">
<img alt="Contoh Activity Diagram" src="./assets/diagram/diagram-act-1.avif" width="70%">
</p>
<p align="center">
<i>Gambar 1. Contoh Activity Diagram Proses Bisnis</i>
</p>

## 2.2 Deskripsi Umum Perangkat Lunak
Diisi dengan deskripsi umum perangkat lunak untuk mendukung proses bisnis yang telah diuraikan pada sub-bab sebelumnya. Uraian harus menunjukkan lingkup perangkat lunak, mencakup keterkaitan perangkat lunak dengan sistem lain di luar (misalnya *Payment Gateway* atau layanan pihak ketiga lain yang dipakai).

*Contoh narasi:* "*[Nama P/L]* merupakan aplikasi *[deskripsi singkat]* yang berinteraksi dengan *Payment Gateway (dummy)* untuk memproses otorisasi pembayaran. Sistem menerima input dari *Pelanggan* melalui antarmuka aplikasi dan mengirimkan permintaan transaksi ke *Payment Gateway* setiap kali pelanggan melakukan checkout."

## 2.3 Pengguna dan Kebutuhan Pengguna Perangkat Lunak
Tuliskan seluruh jenis pengguna (*role*/aktor) yang terlibat dalam perangkat lunak (P/L), beserta kebutuhannya secara umum. Bagian ini dapat disalin dari 1.2 *Deskripsi Pengguna Perangkat Lunak* (dokumen Requirement Gathering) atau 3.1 *Identifikasi Aktor* (dokumen Use Case), pastikan sudah konsisten dengan aktor final yang dipakai di BAB 4.

| Pengguna | Kebutuhan |
| :--- | :--- |
| *Pelanggan* | *Pelanggan harus dapat memesan produk, mengelola keranjang, dan menyelesaikan pembayaran melalui sistem.* |
| *...* | *...* |

## 2.4 Batasan Perangkat Lunak
Batasan yang harus dituliskan, di antaranya:
1. *P/L harus memakai file data/API dari sistem lain (sebutkan, misal Payment Gateway dummy).*
2. *P/L harus memakai format data yang sama dengan sistem lain.*
3. *P/L harus berfungsi pada platform tertentu (misal: web browser modern, atau desktop Windows dan Linux).*
4. *...*

## 2.5 Lingkungan Operasi Perangkat Lunak
Spesifikasi *operating system* atau lingkungan yang dibutuhkan P/L untuk beroperasi. Bagian ini digunakan untuk memastikan pengguna memiliki spesifikasi yang cukup untuk menjalankan P/L. Misalnya mencakup komponen server, client, OS, DBMS, tetapi tidak menutupi kemungkinan komponen lain.

| Komponen | Spesifikasi |
| :--- | :--- |
| *Server* | *[contoh: Node.js v20, dijalankan pada layanan cloud]* |
| *Client* | *[contoh: Web Browser modern (Chrome, Firefox terbaru)]* |
| *DBMS* | *[contoh: PostgreSQL 15]* |
| *OS* | *[contoh: Cross-platform (Windows/Linux/MacOS) melalui browser]* |
| *...* | *...* |

---

# BAB 3: Deskripsi Kebutuhan Perangkat Lunak

## 3.1 Kebutuhan Fungsional (KF)
Berikut merupakan kebutuhan non-fungsional yang telah disesuaikan dengan pemetaan kebutuhan perangkat lunak:

| ID KF | ID Kebutuhan | Penjelasan |
| :--- | :--- | :--- |
| KF01 | R01, R03 | Ketika pengguna melakukan registrasi, sistem harus menyediakan pilihan peran (Tenaga Kerja atau Penyedia Kerja), formulir pengisian profil, dan meminta persetujuan terhadap kebijakan privasi. |
| KF02 | R02 | Bila tanggal lahir yang dimasukkan menunjukkan usia di bawah 17 tahun saat registrasi, maka sistem harus menampilkan pesan kesalahan dan memblokir pendaftaran. |
| KF03 | R04 | Ketika pengguna melakukan *login*, sistem harus memverifikasi kredensial dan menerbitkan token autentikasi. |
| KF04 | R05, R07 | Ketika Tenaga Kerja mengajukan verifikasi, sistem harus menyediakan antarmuka pengunggahan dokumen identitas yang relevan berdasarkan persetujuan pengguna. |
| KF05 | R06 | Ketika pengguna mengklik tautan verifikasi email atau ketika admin menyetujui verifikasi manual, sistem harus memperbarui status verifikasi identitas pengguna. |
| KF06 | R08 | Selama status verifikasi Tenaga Kerja belum disetujui, sistem harus membatasi akses ke fitur-fitur utama platform. |
| KF07 | R12, R13 | Ketika Penyedia Kerja berhasil menyimpan data lowongan baru melalui antarmuka formulir, sistem harus menetapkan status lowongan tersebut menjadi Open secara bawaan. |
| KF08 | R14 | Jika terdapat isian formulir lowongan (judul, deskripsi, kuota, lokasi, atau upah) yang kosong atau tidak valid saat disimpan, sistem harus menampilkan pesan peringatan dan menggagalkan penyimpanan. |
| KF09 | R15, R16 | Ketika Tenaga Kerja melakukan pencarian atau pemfilteran (berdasarkan kategori/keterampilan), sistem harus hanya menampilkan daftar lowongan yang berstatus Open secara bawaan. |
| KF10 | R17, R18 | Selama akun pengguna berstatus Terverifikasi dan bertindak sebagai Tenaga Kerja, sistem harus menyediakan akses ke tombol Ajukan Penawaran pada halaman detail pekerjaan. |
| KF11 | R19 | Ketika Tenaga Kerja menekan konfirmasi pengajuan penawaran, sistem harus menyimpan data pengajuan (ID Tenaga Kerja, ID Lowongan, pesan penawaran, dan timestamp) ke dalam basis data. |
| KF12 | R20, R21 | Ketika Penyedia Kerja menyetujui (accept) seorang pelamar pada antarmuka daftar pelamar, sistem harus menghasilkan dan menyimpan entri ID Transaksi Pekerjaan yang unik untuk pelamar tersebut, selama batas kuota lowongan belum terlampaui. |
| KF13 | R22 | Ketika jumlah Tenaga Kerja yang disetujui telah mencapai batas kuota dari sebuah lowongan, sistem harus secara otomatis mengubah status lowongan tersebut dari Open menjadi Closed/Full. |
| KF14 | R23, R24 | Ketika Penyedia Kerja menekan tombol bayar upah dan commission fee, sistem harus meneruskan pembayaran ke Payment Gateway lalu mengubah status pekerjaan menjadi "In Progress" setelah pembayaran berhasil dikonfirmasi. |
| KF15 | R25, R26 | Sistem harus meneruskan seluruh dana transaksi langsung ke Payment Gateway, serta mencatat status dan riwayat setiap transaksi pembayaran yang terjadi. |
| KF16 | R27, R28, R29 | Ketika Tenaga Kerja mengunggah dan mengirimkan hasil pekerjaan, sistem harus menyimpan lampiran tersebut, mencatat waktu pengiriman, dan mengubah status pekerjaan menjadi "Submitted". |
| KF17 | R30, R31, R32 | Ketika Penyedia Kerja memeriksa hasil pekerjaan dan menekan tombol konfirmasi penyelesaian, sistem harus mengubah status pekerjaan menjadi "Completed" dan langsung memicu proses pencairan dana ke Tenaga Kerja. |
| KF18 | R33 | Ketika pekerjaan telah selesai diverifikasi oleh Penyedia Kerja, sistem harus menampilkan notifikasi penerimaan upah dan memperbarui saldo pada antarmuka Tenaga Kerja. |
| KF19 | R34 | Ketika Tenaga Kerja mengajukan pencairan dana, sistem harus memvalidasi rekening bank/e-wallet tujuan dan mengirimkan instruksi disbursement ke API Payment Gateway. |
| KF20 | R35 | Ketika instruksi pencairan diproses oleh Payment Gateway, sistem harus mencatat rincian transaksi (ID transaksi, nominal upah, identitas penerima, waktu, dan status transfer) ke log pencairan. |
| KF21 | R36 | Ketika status transaksi pekerjaan selesai, sistem harus menyediakan antarmuka formulir rating (skala 1–5) dan ulasan bagi Tenaga Kerja maupun Penyedia Kerja. |
| KF22 | R37 | Bila pengguna telah mengirimkan ulasan untuk suatu pekerjaan, maka sistem harus mengunci formulir ulasan dan menolak pengiriman ulasan tambahan pada pekerjaan yang sama. |
| KF23 | R38 | Ketika ulasan baru berhasil disimpan, sistem harus menghitung ulang rata-rata rating dan langsung memperbarui tampilan portofolio pada profil pengguna. |
| KF24 | R39 | Ketika pengguna mengirimkan laporan keluhan atau sengketa, sistem harus menerbitkan tiket sengketa dan menampilkannya pada dashboard Customer Service. |
| KF25 | R40 | Ketika Customer Service menetapkan keputusan sengketa, sistem harus mengeksekusi tindakan pengembalian dana (refund) kepada Penyedia Kerja atau pencairan dana kepada Tenaga Kerja sesuai bukti. |
| KF26 | R41 | Ketika Customer Service menangani tiket sengketa, sistem harus mencatat unggahan bukti pendukung, perubahan status penanganan, dan riwayat aktivitas penanganan secara kronologis. |
| ... | ... | ... |

## 3.2 Kebutuhan Non-Fungsional (KNF)
Berikut merupakan kebutuhan non-fungsional yang telah disesuaikan dengan parameter yang ada dan pemetaan kebutuhan perangkat lunak:

Tabel 3.2. Kebutuhan Non-Fungsional

| ID KNF | ID Kebutuhan | Parameter | Deskripsi Kebutuhan |
| :--- | :--- | :--- | :--- |
| KNF01 | R04 | Security | Sistem harus mengenkripsi kata sandi menggunakan algoritma *hashing* dan mengamankan token autentikasi agar tidak tersimpan sebagai teks biasa. |
| KNF02 | R07 | Security | Sistem harus mengenkripsi berkas dokumen identitas pengguna (*data at rest*) yang tersimpan pada media penyimpanan. |
| KNF03 | R08 | Response time | Ketika Tenaga Kerja mencoba mengakses fitur platform, sistem harus mampu memverifikasi status akses atau verifikasi akun dalam waktu kurang dari 1 detik. |
| KNF04 | R15, R16 | Response Time | Ketika pengguna mengirimkan pencarian atau filtering lowongan pekerjaan, sistem harus merender dan menampilkan hasilnya dalam waktu maksimal 5 detik. |
| KNF05 | R12, R17 | Ergonomy | Sistem harus menampilkan seluruh elemen dengan interaktif seperti tombol Ajukan Penawaran dan input formulir dengan pendekatan design Mobile-First. |
| KNF06 | R18, R21 | Security | Jika pengguna mencoba memanipulasi parameter URL atau ID untuk menyetujui/mengakses lowongan yang bukan miliknya, sistem harus memblokir aksi tersebut berdasarkan validasi otorisasi di backend. |
| KNF07 | R22 | Reliability | Jika terjadi persetujuan ganda secara bersamaan pada sisa satu kuota lowongan terakhir, sistem harus memproses antrean secara atomic dan menjamin lowongan tersebut hanya diberikan kepada satu Tenaga Kerja. |
| KNF08 | R16, R21 | Memory | Ketika sistem memuat halaman daftar lowongan atau daftar pelamar dalam jumlah banyak, sistem harus membatasi penggunaan memori RAM peramban klien maksimal 150 MB untuk mencegah crash pada ponsel berspesifikasi rendah. |
| KNF09 | R12, R14 | Safety | Ketika Penyedia Kerja membuat lowongan yang melibatkan aktivitas berisiko tinggi misal kelistrikan, sistem harus menampilkan kotak centang pernyataan risiko yang wajib disetujui sebelum formulir dapat disimpan. |
| KNF10 | R12 - R22 | Availability | Selama pengguna mengakses platform, sistem harus memastikan basis data lowongan selalu dapat diakses dengan batas maksimal gangguan layanan tidak lebih dari 24 jam dalam satu bulan. |
| KNF11 | R24, R25, R26 | Reliability | Selama proses pembayaran berlangsung, sistem harus memastikan tidak ada pembayaran ganda untuk transaksi yang sama. |
| KNF12 | R23, R25 | Security | Sistem harus mengirimkan seluruh data pembayaran ke Payment Gateway melalui koneksi terenkripsi sehingga data transaksi tidak dapat dilihat atau diubah oleh pihak lain saat proses pengiriman berlangsung. |
| KNF13 | R27, R29 | Response Time | Ketika Tenaga Kerja selesai mengunggah hasil pekerjaan, sistem harus menyimpan lampiran dan memperbarui status pekerjaan dalam rentang waktu yang singkat agar Penyedia Kerja dapat langsung meninjaunya. |
| KNF14 | R28 | Security | Sistem harus memastikan hanya Tenaga Kerja yang ditugaskan pada pekerjaan tersebut yang bisa mengirimkan hasil pekerjaan. |
| KNF15 | R31, R32 | Reliability | Selama Penyedia Kerja belum memberikan konfirmasi penyelesaian pekerjaan, sistem harus menahan dan tidak memproses pencairan dana kepada Tenaga Kerja. |
| KNF16 | R34, R35 | Reliability | Bila terjadi gangguan koneksi atau timeout saat pemanggilan API pencairan dana, maka sistem harus menerapkan idempotency key dan transaksi ACID guna mencegah terjadinya pencairan ganda. |
| KNF17 | R34, R35 | Security | Ketika sistem mentransfer data atau mengirim instruksi ke Payment Gateway, sistem harus menggunakan protokol terenkripsi HTTPS/TLS 1.3 serta mengenkripsi data rekening pengguna. |
| KNF18 | R38 | Response time | Ketika ulasan baru diserahkan oleh pengguna, sistem harus merespons serta memperbarui data agregat rating pada halaman profil dalam waktu singkat. |
| KNF19 | R41 | Security | Selama pengguna tidak memiliki peran (role) Customer Service atau Administrator yang terotentikasi, sistem harus memblokir akses ke modul pengelolaan bukti dan penindakan sengketa. |
| KNF20 | R41 | Reliability | Selama data riwayat penanganan sengketa dan log mutasi pencairan tersimpan di sistem, sistem harus mengunci data tersebut sebagai catatan permanen (tamper-proof) yang tidak dapat diubah maupun dihapus. |
| KNF21 | R01, R12, R17 | Portability | Ketika pengguna mengakses platform untuk tahapan registrasi, membuat lowongan, atau mengajukan penawaran , sistem harus mampu menampilkan tata letak antarmuka secara adaptif dalam setiap perangkat maupun sistem operasi yang berbeda. |
| KNF22 | R05, R27, R29 | Memory | Ketika pengguna mengunggah dokumen bukti identitas diri maupun lampiran hasil penyelesaian pekerjaan, sistem harus secara otomatis mengompresi ukuran berkas maksimum menjadi 10 MB guna menjaga efisiensi ruang penyimpanan server. |
| KNF23 | R08, R18 | Availability | Selama platform beroperasi, sistem harus menjamin ketersediaan akses data status verifikasi akun dengan *uptime* 99,9% agar proses validasi hak akses saat Tenaga Kerja mengajukan penawaran lowongan tidak mengalami kegagalan fungsi. |
| ... | ... | ... | ... |

Dalam memnentukan berbagai kebutuhan non-fungsional yang diperlukan oleh sistem, terdapat beberapa parameter yang digunakan, diantaranya seperti berikut:

| Parameter | Penjelasan |
| :--- | :--- |
| Availability | Ketersediaan aplikasi, misalnya harus terus-menerus beroperasi 7 hari per minggu, 24 jam per hari tanpa gagal. |
| Reliability | Keandalan, misalnya tidak pernah boleh gagal (atau kegagalan yang ditolerir adalah …%) sehingga harus dipikirkan *fault tolerant architecture*. Biasanya hanya perlu untuk *critical application* yang jika gagal akan berakibat fatal. |
| Ergonomy | Kenyamanan pakai bagi pengguna. |
| Portability | Kemudahan untuk dibawa dan dioperasikan ke mesin/sistem operasi/*platform* yang lain. |
| Memory | Jika perhitungan kapasitas memori internal kritis (misalnya untuk P/L yang harus dijadikan *chips* dan ukurannya harus kecil). |
| Response time | Batasan waktu yang harus dipenuhi. Sangat penting untuk aplikasi *real time*. Contoh: "Aplikasi harus mampu menampilkan hasil dalam 4 detik", atau "ATM harus menarik kembali kartu yang tidak diambil dalam waktu 3 menit". |
| Safety | Yang menyangkut keselamatan manusia, misalnya untuk P/L yang dipakai pada sistem kontrol di pabrik. |
| Security | Aspek keamanan yang harus dipenuhi. |

<sub>*Silakan pilih parameter yang relevan dengan P/L kalian (Availability, Reliability, Ergonomy, Portability, Memory, Response time, Safety, Security, dsb), tidak perlu semua parameter diisi. Lihat kembali dokumen Requirement Gathering untuk penjelasan tiap parameter.*<sub>

---

# BAB 4: Pemodelan Use Case

## 4.1 Identifikasi Aktor
Salin ulang daftar aktor final dari BAB 3.1 dokumen *Use Case & Scenario Use Case* atau *Class Diagram*. Tambahkan ID Aktor mengikuti Aturan Penomoran pada 1.4.

| ID Aktor | Aktor | Deskripsi |
| :--- | :--- | :--- |
| A01 | Tenaga Kerja | Pengguna yang dapat mendaftar dan melengkapi profil untuk menawarkan suatu keahlian di bidang tertentu. Aktivitas utamanya adalah mencari dan memilih pekerjaan yang sesuai, mengajukan diri, menyelesaikan pekerjaan sesuai kesepakatan, serta menerima pembayaran upah setelah pekerjaan diverifikasi. |
| A02 | Penyedia Kerja | Pengguna merupakan individu maupun pemilik usaha yang dapat mendaftar dan melengkapi profil untuk mempublikasikan kebutuhan pekerjaan. Aktivitas utamanya adalah menentukan spesifikasi pekerjaan dan upah, mencari serta memilih tenaga kerja terpercaya, menyepakati pekerjaan, membayar upah beserta commission fee, dan memverifikasi hasil pekerjaan. |
| A03 | Customer Service (CS) | Pengguna merupakan tim internal platform yang memegang hak akses operasional untuk menjaga kelancaran transaksi dan interaksi. Aktivitas utamanya meliputi menerima serta menangani pertanyaan, membantu menindaklanjuti kendala akun, pekerjaan, dan pembayaran, serta menengahi sengketa (dispute) atau keluhan pengguna secara cepat dan tepat. |

## 4.2 Identifikasi Use Case
Salin ulang daftar Use Case versi terbaru dari BAB 3.2 dokumen *Class Diagram*, pastikan seluruh ID KF yang dirujuk sudah sesuai dengan tabel pada 3.1.

| ID UC | Nama Use Case | Deskripsi Singkat | Aktor | ID KF |
| :--- | :--- | :--- | :--- | :--- |
| UC01 | Melakukan Registrasi | Pengguna mendaftarkan akun baru, memvalidasi batasan usia, dan melakukan proses login untuk masuk ke dalam sistem. | Tenaga Kerja, Penyedia Kerja | KF01, KF02, KF03 |
| UC02 | Mengelola Verifikasi Identitas | Tenaga Kerja mengunggah dokumen identitas untuk diverifikasi agar mendapatkan akses ke fitur-fitur utama platform. | Tenaga Kerja, Customer Service | KF04, KF05, KF06 |
| UC03 | Mengelola Lowongan Pekerjaan | Penyedia Kerja membuat dan mempublikasikan lowongan pekerjaan baru beserta spesifikasi pekerjaan tersebut melalui isian formulirnya. | Penyedia Kerja | KF07, KF08 |
| UC04 | Mencari Lowongan Pekerjaan | Tenaga Kerja menelusuri dan memfilter daftar lowongan pekerjaan yang sedang aktif. | Tenaga Kerja | KF09 |
| UC05 | Mengajukan Penawaran Pekerjaan | Tenaga Kerja mengirimkan pengajuan penawaran pada pekerjaan yang diinginkan. | Tenaga Kerja | KF10, KF11 |
| UC06 | Memilih Tenaga Kerja | Penyedia Kerja meninjau daftar pelamar dan menyetujui kandidat yang cocok sehingga memicu pembaruan status lowongan secara langsung. | Penyedia Kerja | KF12, KF13 |
| UC07 | Melakukan Pembayaran Pekerjaan | Penyedia Kerja membayarkan upah dan biaya admin melalui Payment Gateway sebelum pekerjaan dimulai. | Penyedia Kerja | KF14, KF15 |
| UC08 | Menyerahkan Hasil Pekerjaan | Tenaga Kerja mengunggah lampiran bukti penyelesaian pekerjaan untuk ditinjau oleh Penyedia Kerja. | Tenaga Kerja | KF16 |
| UC09 | Memverifikasi Penyelesaian Pekerjaan | Penyedia Kerja memeriksa dan menyetujui hasil pekerjaan, yang memicu sistem untuk memberikan notifikasi penerimaan upah. | Penyedia Kerja | KF17, KF18 |
| UC10 | Melakukan Pencairan Dana | Tenaga Kerja menarik upah pendapatan mereka ke rekening bank atau *e-wallet* melalui sistem Payment Gateway. | Tenaga Kerja | KF19, KF20 |
| UC11 | Memberikan Penilaian Kerja | Pengguna memberikan penilaian performa setelah pekerjaan selesai untuk memperbarui portofolio dan reputasi. | Tenaga Kerja, Penyedia Kerja | KF21, KF22, KF23 |
| UC12 | Menangani Keluhan | Pengguna melaporkan kendala yang kemudian ditengahi, diproses, dan diputuskan oleh Customer Service. | Tenaga Kerja, Penyedia Kerja, Customer Service | KF24, KF25, KF26 |

## 4.3 Use Case Diagram
Salin ulang Use Case Diagram dari BAB 3.3 dokumen *Use Case & Scenario Use Case* atau *Class Diagram* (gunakan versi paling akhir/terbaru apabila terdapat perubahan).

<p align="center">
<img alt="Contoh Use Case Diagram" src="./assets/diagram/contoh-uc-diagram.webp" width="70%">
</p>
<p align="center">
<i>Gambar 2. Contoh Use Case Diagram</i>
</p>

## 4.4 Skenario Use Case
Salin ulang skenario **setiap** use case (skenario normal dan alternatif) dari BAB 3.4 dokumen *Use Case & Scenario Use Case*, sesuaikan dengan daftar UC final pada 4.2. Jika use case melibatkan lebih dari satu aktor manusia yang benar-benar berinteraksi langsung (misalnya *Kasir* yang memverifikasi transaksi setelah *Pelanggan* membayar), tambahkan kolom aksi tersendiri untuk aktor tersebut di samping kolom "Reaksi Perangkat Lunak". Sistem eksternal otomatis seperti *payment gateway* **bukan aktor**, sehingga interaksinya cukup dituliskan sebagai bagian dari "Reaksi Perangkat Lunak", bukan kolom aktor terpisah.

### 4.4.1 Skenario UC01

**Nama Use Case:** *Melakukan Registrasi*

**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Pengguna memilih opsi registrasi | Sistem menampilkan formulir registrasi, pilihan peran (Tenaga Kerja atau Penyedia Kerja), dan meminta persetujuan kebijakan privasi |
| 2 | Pengguna mengisi formulir profil lengkap, memasukkan tanggal lahir (usia $\ge$ 17 tahun), dan menyetujui kebijakan privasi lalu menekan daftar | Sistem memvalidasi usia pendaftar dan menyimpan data pengguna |
| 3 | Pengguna melakukan login dengan kredensial yang baru dibuat | Sistem memverifikasi kredensial, menerbitkan token autentikasi, dan menampilkan halaman beranda |

<br>

**Skenario Alternatif 1: Batas Usia Tidak Valid**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Pengguna memilih opsi registrasi | Sistem menampilkan formulir registrasi, pilihan peran, dan kebijakan privasi |
| 2 | Pengguna memasukkan tanggal lahir yang menunjukkan usia di bawah 17 tahun dan menekan daftar | Sistem memblokir pendaftaran dan menampilkan pesan kesalahan bahwa pengguna harus berusia minimal 17 tahun |
| 3 | Pengguna memperbaiki input tanggal lahir menjadi valid | Sistem kembali ke langkah 2 skenario normal |

<br>

**Skenario Alternatif 2: Email Sudah Terdaftar**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Pengguna memilih opsi registrasi | Sistem menampilkan formulir registrasi, pilihan peran, dan kebijakan privasi |
| 2 | Pengguna mengisi formulir dengan email yang sudah ada di basis data dan menekan daftar | Sistem menolak pendaftaran dan menampilkan pesan bahwa email sudah digunakan, serta menyarankan pengguna untuk login |
| 3 | Pengguna memilih opsi menuju halaman login | Sistem mengarahkan pengguna ke halaman login |

<br>

### 4.4.2 Skenario UC02

**Nama Use Case:** *Mengelola Verifikasi Identitas*

**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Tenaga Kerja memilih menu verifikasi identitas | Sistem menampilkan antarmuka pengunggahan dokumen identitas |
| 2 | Tenaga Kerja mengunggah dokumen dan mengirimkan pengajuan | Sistem menyimpan dokumen dan mengubah status menjadi "Menunggu Persetujuan" |
| 3 | Customer Service menekan tombol setuju verifikasi manual pada dashboard | Sistem memperbarui status identitas pengguna menjadi "Terverifikasi" dan membuka akses fitur utama platform |

<br>

**Skenario Alternatif 1: Format atau Ukuran Dokumen Tidak Valid**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Tenaga Kerja memilih menu verifikasi identitas | Sistem menampilkan antarmuka pengunggahan dokumen identitas |
| 2 | Tenaga Kerja mengunggah file dengan ekstensi yang tidak didukung (misal: .exe) atau melebihi batas ukuran (misal: > 5MB) | Sistem menolak unggahan dan menampilkan pesan error format/ukuran file tidak sesuai |

<br>

**Skenario Alternatif 2: Dokumen Ditolak oleh Customer Service**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Tenaga Kerja memilih menu verifikasi identitas | Sistem menampilkan antarmuka pengunggahan dokumen identitas |
| 2 | Tenaga Kerja mengunggah dokumen yang buram atau data tidak cocok | Sistem menyimpan dokumen sebagai "Menunggu Persetujuan" |
| 3 | Customer Service menolak verifikasi pada dashboard dengan memberikan alasan | Sistem memperbarui status menjadi "Ditolak", mengirim notifikasi revisi beserta alasan, dan fitur utama tetap dibatasi |

<br>

**Skenario Alternatif 3: Mengakses Fitur Utama Sebelum Terverifikasi**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Tenaga Kerja (dengan status belum terverifikasi) mencoba menekan menu fitur utama platform | Sistem mendeteksi status akun belum disetujui |
| 2 | Sistem memblokir akses ke halaman tersebut | Sistem menampilkan pop-up peringatan bahwa akun harus diverifikasi dan mengarahkan pengguna ke halaman verifikasi |

### 4.4.3 Skenario UC03

**Nama Use Case:** *Mengelola Lowongan Pekerjaan*

**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Penyedia Kerja memilih opsi buat lowongan baru | Sistem menampilkan antarmuka formulir lowongan pekerjaan |
| 2 | Penyedia Kerja mengisi seluruh isian (judul, deskripsi, kuota, lokasi, upah) secara lengkap lalu menekan simpan | Sistem memvalidasi isian, menyimpan lowongan, dan menetapkan status bawaan menjadi "Open" |

<br>

**Skenario Alternatif 1: Isian Formulir Kosong atau Tidak Valid**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Penyedia Kerja memilih opsi buat lowongan baru | Sistem menampilkan antarmuka formulir lowongan pekerjaan |
| 2 | Penyedia Kerja mengosongkan bagian upah atau kuota dan menekan simpan | Sistem mendeteksi isian tidak valid, menggagalkan penyimpanan, dan menampilkan pesan peringatan atribut mana yang masih kosong |
| 3 | Penyedia Kerja melengkapi isian yang kosong dengan data valid | Sistem kembali ke langkah 2 skenario normal |

<br>

**Skenario Alternatif 2: Membatalkan Pembuatan Lowongan**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Penyedia Kerja memilih opsi buat lowongan baru | Sistem menampilkan antarmuka formulir lowongan pekerjaan |
| 2 | Penyedia Kerja mengisi sebagian isian, lalu menekan tombol batal | Sistem membuang isian yang belum disimpan dan mengarahkan pengguna kembali ke halaman beranda/daftar lowongan |

### 4.4.4 Skenario UC04

**Nama Use Case:** *Mencari Lowongan Pekerjaan*

**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Tenaga Kerja membuka halaman pencarian pekerjaan atau memasukkan parameter filter seperti kategori/keterampilan | Sistem memproses kriteria pencarian dari pengguna |
| 2 | Tenaga Kerja menekan tombol cari/terapkan filter | Sistem merender dan menampilkan daftar lowongan pekerjaan yang berstatus "Open" sesuai dengan kriteria yang diminta |

<br>

**Skenario Alternatif 1: Pencarian Tidak Ditemukan**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Tenaga Kerja memasukkan kata kunci keterampilan yang sangat spesifik di kolom pencarian | Sistem memfilter lowongan berstatus "Open" dan tidak menemukan kecocokan data |
| 2 | Tenaga Kerja menekan tombol cari | Sistem menampilkan halaman kosong dengan pesan "Tidak ada lowongan yang sesuai dengan pencarian Anda" |

<br>

### 4.4.5 Skenario UC05

**Nama Use Case:** *Mengajukan Penawaran Pekerjaan*

**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Tenaga Kerja dengan status akun Terverifikasi membuka halaman detail lowongan pekerjaan | Sistem memvalidasi status akun dan menampilkan tombol "Ajukan Penawaran" pada halaman tersebut |
| 2 | Tenaga Kerja menekan tombol "Ajukan Penawaran" | Sistem menampilkan antarmuka formulir pengajuan penawaran |
| 3 | Tenaga Kerja mengisi pesan penawaran dan menekan tombol konfirmasi pengajuan | Sistem menyimpan data pengajuan (ID Tenaga Kerja, ID Lowongan, pesan, dan timestamp) ke basis data, lalu menampilkan notifikasi keberhasilan |

<br>

**Skenario Alternatif 1: Akun Belum Terverifikasi**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Tenaga Kerja dengan status akun Belum Terverifikasi membuka halaman detail lowongan pekerjaan | Sistem tidak menampilkan tombol "Ajukan Penawaran" atau menonaktifkannya dan memunculkan peringatan bahwa pengguna harus menyelesaikan verifikasi identitas terlebih dahulu |

**Skenario Alternatif 2: Pembatalan Pengajuan**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Tenaga Kerja menekan tombol "Ajukan Penawaran" pada detail pekerjaan | Sistem menampilkan antarmuka formulir pengajuan penawaran |
| 2 | Tenaga Kerja berubah pikiran dan menekan tombol "Batal" atau "Kembali" | Sistem menutup formulir pengajuan dan mengembalikan tampilan ke halaman detail pekerjaan tanpa menyimpan data apapun |

<br>

### 4.4.6 Skenario UC06

**Nama Use Case:** *Memilih Tenaga Kerja*
**Aktor:** Penyedia Kerja
**Deskripsi:** Penyedia Kerja meninjau daftar pelamar yang mengajukan penawaran pada lowongan pekerjaannya dan menyetujui kandidat yang sesuai, memicu pencatatan ID transaksi unik serta pembaruan status lowongan menjadi *Closed/Full* jika kuota telah terpenuhi.
**Kebutuhan Terkait:** KF12, KF13

**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Penyedia Kerja membuka halaman lowongan miliknya dan memilih tab "Daftar Pelamar". | Sistem memuat dan menampilkan daftar pelamar yang telah mengajukan penawaran beserta profil singkat, pesan penawaran, rating, dan portofolio pelamar. |
| 2 | Penyedia Kerja meninjau profil pelamar dan menekan tombol "Pilih" pada salah satu kandidat yang cocok. | Sistem menampilkan dialog konfirmasi persetujuan pelamar beserta rincian lowongan dan sisa kuota yang tersedia. |
| 3 | Penyedia Kerja mengonfirmasi persetujuan kandidat tersebut. | Sistem memvalidasi sisa kuota lowongan, membuat entri ID Transaksi Pekerjaan yang unik antara Penyedia Kerja dan Tenaga Kerja terpilih, serta mengubah status pelamar menjadi "Accepted". |
| 4 | - | Sistem memeriksa jumlah pelamar yang disetujui. Karena kuota telah terpenuhi, sistem secara otomatis mengubah status lowongan dari "Open" menjadi "Closed/Full" dan menampilkan pesan berhasil. |

<br>

**Skenario Alternatif 1: Kuota Lowongan Sudah Penuh Saat Konfirmasi**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Penyedia Kerja membuka daftar pelamar dan menekan tombol "Pilih" pada kandidat. | Sistem menampilkan dialog konfirmasi persetujuan. |
| 2 | Penyedia Kerja mengonfirmasi persetujuan kandidat. | Sistem mendeteksi bahwa kuota penerimaan untuk lowongan tersebut sudah penuh. |
| 3 | - | Sistem membatalkan aksi persetujuan, memperbarui status lowongan menjadi "Closed/Full", dan menampilkan pesan error bahwa kuota lowongan telah penuh. |

<br>

**Skenario Alternatif 2: Penyedia Kerja Membatalkan Pemilihan Pelamar**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Penyedia Kerja menekan tombol "Pilih" pada kandidat. | Sistem menampilkan dialog konfirmasi persetujuan kandidat. |
| 2 | Penyedia Kerja menekan tombol "Batal". | Sistem menutup dialog konfirmasi dan mempertahankan status daftar pelamar tanpa ada perubahan data. |

---

### 4.4.7 Skenario UC07

**Nama Use Case:** *Melakukan Pembayaran Pekerjaan*
**Aktor:** Penyedia Kerja
**Deskripsi:** Penyedia Kerja melakukan pembayaran upah pekerjaan beserta biaya komisi (*commission fee*) melalui *Payment Gateway* sebelum pekerjaan dapat dimulai (*In Progress*).
**Kebutuhan Terkait:** KF14, KF15

**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Penyedia Kerja membuka rincian transaksi pekerjaan yang telah disepakati dan menekan tombol "Bayar". | Sistem menghitung total rincian tagihan (upah tenaga kerja + *commission fee* platform) dan menampilkan rincian pembayaran beserta tombol instruksi pembayaran. |
| 2 | Penyedia Kerja memilih metode pembayaran dan menekan "Lanjutkan Pembayaran". | Sistem menghubungi API Payment Gateway, menerbitkan ID tagihan/pembayaran, dan menampilkan kode pembayaran / tautan transaksi. |
| 3 | Penyedia Kerja menyelesaikan pembayaran melalui metode pembayaran yang dipilih. | Sistem menerima notifikasi konfirmasi pembayaran berhasil dari Payment Gateway. |
| 4 | - | Sistem memverifikasi pembayaran, mencatat riwayat transaksi, mengubah status pekerjaan dari "Assigned" menjadi "In Progress", serta mengirimkan notifikasi kepada Tenaga Kerja bahwa pekerjaan siap dimulai. |

<br>

**Skenario Alternatif 1: Pembayaran Gagal atau Dibatalkan oleh Payment Gateway**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Penyedia Kerja memilih metode pembayaran dan menekan "Lanjutkan Pembayaran". | Sistem mengarahkan Penyedia Kerja ke halaman transaksi Payment Gateway. |
| 2 | Pembayaran gagal diproses oleh saluran pembayaran (misal: saldo tidak mencukupi atau transaksi ditolak). | Sistem menerima notifikasi kegagalan transaksi dari Payment Gateway, mencatat status transaksi sebagai "Failed", dan menampilkan pesan kesalahan kepada Penyedia Kerja beserta opsi untuk mencoba metode pembayaran lain. |
| 3 | Penyedia Kerja memilih opsi metode pembayaran lain. | Sistem kembali ke langkah 2 skenario normal untuk membuat instruksi pembayaran baru. |

<br>

**Skenario Alternatif 2: Waktu Pembayaran Habis (Timeout / Expired)**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Penyedia Kerja mendapatkan kode pembayaran dengan batas waktu tertentu. | Sistem mencatat batas waktu pembayaran (*expiry timestamp*) dan menunggu konfirmasi pembayaran. |
| 2 | Penyedia Kerja tidak melakukan pembayaran hingga batas waktu terlewati. | Sistem menerima notifikasi kedaluwarsa dari Payment Gateway, mencatat status pembayaran "Expired", dan mengembalikan status transaksi ke antrean tagihan yang belum dibayar. |

---

### 4.4.8 Skenario UC08

**Nama Use Case:** *Menyerahkan Hasil Pekerjaan*
**Aktor:** Tenaga Kerja
**Deskripsi:** Tenaga Kerja mengunggah berkas bukti atau lampiran penyelesaian tugas ke sistem untuk diserahkan kepada Penyedia Kerja, mengubah status pekerjaan menjadi *Submitted*.
**Kebutuhan Terkait:** KF16

**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Tenaga Kerja membuka halaman detail pekerjaan aktif  yang berstatus "In Progress" dan menekan tombol "Serahkan Hasil Pekerjaan". | Sistem menampilkan formulir penyerahan pekerjaan yang berisi catatan penyelesaian dan kolom pengunggahan berkas bukti/lampiran. |
| 2 | Tenaga Kerja mengisi deskripsi pengerjaan, mengunggah berkas bukti (foto/dokumen dengan limit ukuran file), dan menekan tombol "Kirim Hasil Pekerjaan". | Sistem memvalidasi kelengkapan isian serta format dan ukuran berkas yang diunggah. |
| 3 | Tenaga Kerja mengonfirmasi penyerahan pada bukti konfirmasi akhir. | Sistem menyimpan berkas lampiran, mencatat stempel waktu pengiriman (*timestamp*), mengubah status pekerjaan menjadi "Submitted", serta mengirimkan notifikasi peninjauan hasil kepada Penyedia Kerja. |

<br>

**Skenario Alternatif 1: Ukuran Berkas Melebihi Batas Maksimal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Tenaga Kerja memilih berkas bukti yang berukuran lebih besar dari batas ketentuan (misal > 10 MB). | Sistem mendeteksi ukuran berkas melebihi kuota penyimpanan yang diizinkan. |
| 2 | - | Sistem menggagalkan pengunggahan berkas, menampilkan pesan peringatan "Ukuran berkas melebihi batas maksimal 10 MB", dan meminta Tenaga Kerja memilih berkas lain. |
| 3 | Tenaga Kerja memilih berkas baru yang sesuai dengan batasan ukuran. | Sistem memvalidasi berkas baru dan kembali ke langkah 2 skenario normal. |

<br>

**Skenario Alternatif 2: Tenaga Kerja Belum Mengunggah Berkas Wajib**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Tenaga Kerja mengosongkan kolom lampiran bukti dan langsung menekan tombol "Kirim Hasil Pekerjaan". | Sistem mendeteksi bahwa bukti pengerjaan wajib dilampirkan. |
| 2 | - | Sistem menampilkan pesan peringatan bahwa bukti pekerjaan tidak boleh kosong dan menolak pengiriman formulir hingga berkas diunggah. |

---

### 4.4.9 Skenario UC09

**Nama Use Case:** *Memverifikasi Penyelesaian Pekerjaan*
**Aktor:** Penyedia Kerja
**Deskripsi:** Penyedia Kerja meninjau hasil pekerjaan yang diserahkan oleh Tenaga Kerja, mengonfirmasi penyelesaian tugas, mengubah status menjadi *Completed*, dan memicu instruksi pencairan upah ke saldo Tenaga Kerja.
**Kebutuhan Terkait:** KF17, KF18

**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Penyedia Kerja membuka halaman rincian pekerjaan yang berstatus "Submitted". | Sistem menampilkan deskripsi hasil pekerjaan beserta lampiran bukti pengerjaan yang telah diunggah Tenaga Kerja. |
| 2 | Penyedia Kerja memeriksa hasil kerja dan menekan tombol "Konfirmasi Selesai". | Sistem menampilkan bukti konfirmasi penyelesaian pekerjaan dengan peringatan bahwa dana upah akan langsung diteruskan ke Tenaga Kerja. |
| 3 | Penyedia Kerja mengonfirmasi persetujuan hasil kerja. | Sistem mengubah status pekerjaan menjadi "Completed", memicu instruksi penyaluran upah ke akun Tenaga Kerja, memperbarui saldo pendapatan Tenaga Kerja, dan mengirimkan notifikasi penerimaan upah. |
| 4 | - | Sistem secara otomatis mengarahkan Penyedia Kerja ke antarmuka formulir rating dan ulasan (UC10). |

<br>

**Skenario Alternatif 1: Hasil Pekerjaan Belum Sesuai (Penyedia Kerja Meminta Revisi)**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Penyedia Kerja memeriksa hasil kerja dan mendapati hasil pekerjaan belum sesuai kesepakatan. | Penyedia Kerja menekan tombol "Minta Revisi / Perbaikan". |
| 2 | Penyedia Kerja mengisi catatan kekurangan pekerjaan pada kolom deskripsi revisi dan menekan "Kirim Permintaan Revisi". | Sistem menyimpan catatan revisi, mengembalikan status pekerjaan menjadi "In Progress", serta mengirimkan notifikasi permintaan revisi kepada Tenaga Kerja. |

<br>

**Skenario Alternatif 2: Terjadi Ketidaksepakatan / Perselisihan Hasil Kerja**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Penyedia Kerja memeriksa hasil pekerjaan namun Tenaga Kerja tidak menyelesaikan tanggung jawab sama sekali atau melanggar kesepakatan. | Penyedia Kerja menekan tombol "Ajukan Komplain". |
| 2 | - | Sistem mengarahkan Penyedia Kerja ke alur penanganan sengketa (UC11 / Menangani Keluhan dan Sengketa) serta menahan status dana pekerjaan. |

<br>

### 4.4.10 Skenario UC10

**Nama Use Case:** *Melakukan Pencairan Dana*
**Aktor:** Tenaga Kerja
**Deskripsi:** Tenaga Kerja menarik upah yang telah terkumpul ke rekening bank atau e-wallet melalui sistem Payment Gateway.
**Kebutuhan Terkait:** KF19, KF20

**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Tenaga Kerja membuka halaman saldo/dompet dan menekan tombol "Tarik Dana". | Sistem menampilkan formulir pencairan dana beserta saldo yang tersedia dan kolom pilihan rekening bank/e-wallet tujuan. |
| 2 | Tenaga Kerja memilih rekening tujuan, memasukkan nominal penarikan, dan menekan "Ajukan Pencairan". | Sistem memvalidasi data rekening tujuan dan nominal penarikan terhadap saldo yang tersedia. |
| 3 | Tenaga Kerja mengonfirmasi pengajuan pencairan. | Sistem mengubah status pencairan menjadi "Diproses". |
| 4 | - | Sistem menerima konfirmasi transfer berhasil dari Payment Gateway, mencatat log pencairan (ID transaksi, nominal, identitas penerima, waktu, status transfer), mengurangi saldo, dan menampilkan notifikasi bahwa pencairan berhasil. |

<br>

**Skenario Alternatif 1: Data Rekening/E-wallet Tidak Valid**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Tenaga Kerja memasukkan nomor rekening/e-wallet dengan format tidak valid dan menekan "Ajukan Pencairan". | Sistem gagal memvalidasi data rekening tujuan. |
| 2 | - | Sistem menampilkan pesan kesalahan bahwa data rekening tidak valid dan meminta Tenaga Kerja memeriksa kembali data tujuan. |

<br>

**Skenario Alternatif 2: Nominal Penarikan Melebihi Saldo**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Tenaga Kerja memasukkan nominal penarikan yang lebih besar dari saldo yang tersedia. | Sistem mendeteksi nominal melebihi saldo tersedia. |
| 2 | - | Sistem menolak pengajuan, menampilkan pesan peringatan saldo tidak mencukupi, dan menggagalkan pengiriman instruksi ke Payment Gateway. |

<br>

### 4.4.11 Skenario UC11

**Nama Use Case:** *Memberikan Penilaian Kerja*
**Aktor:** Tenaga Kerja, Penyedia Kerja
**Deskripsi:** Pengguna memberikan penilaian performa (rating skala 1–5) dan ulasan setelah suatu pekerjaan selesai, yang digunakan untuk memperbarui portofolio dan reputasi pengguna yang dinilai.
**Kebutuhan Terkait:** KF21, KF22, KF23

**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Pengguna membuka halaman pekerjaan berstatus "Completed" dan menekan "Beri Rating & Ulasan". | Sistem menampilkan formulir rating (skala 1–5) dan kolom ulasan teks. |
| 2 | Pengguna memilih nilai rating, mengisi ulasan, dan menekan "Kirim Ulasan". | Sistem memvalidasi kelengkapan isian dan menyimpan data rating serta ulasan ke basis data. |
| 3 | - | Sistem mengunci formulir ulasan untuk pekerjaan tersebut, menghitung ulang rata-rata rating pengguna yang dinilai, dan memperbarui tampilan portofolio pada profilnya. |

<br>

**Skenario Alternatif 1: Pengiriman Ulasan Ganda**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Pengguna yang sudah pernah mengirim ulasan mencoba membuka kembali formulir ulasan untuk pekerjaan yang sama. | Sistem mendeteksi bahwa ulasan untuk pekerjaan tersebut sudah pernah dikirim. |
| 2 | - | Sistem mengunci formulir, menampilkan pesan bahwa ulasan sudah pernah diberikan, dan menolak pengiriman ulasan tambahan. |

<br>

**Skenario Alternatif 2: Rating Tidak Diisi**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Pengguna mengosongkan kolom rating dan langsung menekan "Kirim Ulasan". | Sistem mendeteksi rating wajib belum dipilih. |
| 2 | - | Sistem menampilkan pesan peringatan bahwa rating wajib diisi dan menggagalkan pengiriman formulir. |

<br>

### 4.4.12 Skenario UC12

**Nama Use Case:** *Menangani Keluhan*
**Aktor:** Tenaga Kerja, Penyedia Kerja, Customer Service
**Deskripsi:** Pengguna melaporkan kendala atau sengketa terkait suatu pekerjaan, yang kemudian ditinjau, ditengahi, dan diputuskan oleh Customer Service, termasuk eksekusi refund atau pencairan dana sesuai bukti.
**Kebutuhan Terkait:** KF24, KF25, KF26

**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Pengguna membuka halaman pekerjaan bermasalah dan menekan "Ajukan Komplain/Keluhan". | Sistem menampilkan formulir laporan berisi kategori masalah, deskripsi, dan kolom unggah bukti pendukung. |
| 2 | Pengguna mengisi deskripsi keluhan, mengunggah bukti pendukung, dan menekan "Kirim Laporan". | Sistem menerbitkan tiket sengketa baru, menyimpan bukti yang diunggah, dan menampilkannya pada dashboard Customer Service. |
| 3 | Customer Service meninjau tiket, memeriksa bukti dari kedua pihak, dan menetapkan keputusan sengketa. | Sistem mengeksekusi tindakan sesuai keputusan (refund ke Penyedia Kerja / pencairan dana ke Tenaga Kerja) dan mencatat perubahan status penanganan. |
| 4 | - | Sistem mencatat riwayat aktivitas penanganan sengketa secara kronologis dan mengirimkan notifikasi hasil keputusan kepada kedua pihak terkait. |

<br>

**Skenario Alternatif 1: Permintaan Bukti Tambahan**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Customer Service menilai bukti yang diberikan belum cukup dan menekan "Minta Bukti Tambahan". | Sistem mengirimkan notifikasi permintaan bukti tambahan kepada pihak terkait dan mencatatnya dalam riwayat penanganan. |
| 2 | Pengguna mengunggah bukti tambahan yang diminta. | Sistem menyimpan bukti baru dan kembali ke langkah 3 skenario normal. |

<br>

**Skenario Alternatif 2: Keluhan Ditolak karena Bukti Tidak Cukup**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Customer Service menetapkan bahwa laporan tidak memiliki dasar/bukti yang valid. | Sistem mengubah status tiket menjadi "Ditolak". |
| 2 | - | Sistem mencatat alasan penolakan dalam riwayat penanganan dan mengirimkan notifikasi penolakan kepada pelapor tanpa mengeksekusi refund/pencairan. |

<br>

**Skenario Alternatif 3: Pengguna Membatalkan Tiket Keluhan**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Pelapor membuka tiket sengketa berstatus "Menunggu Peninjauan" dan menekan "Batalkan Laporan". | Sistem menampilkan konfirmasi pembatalan tiket. |
| 2 | Pelapor mengonfirmasi pembatalan. | Sistem mengubah status tiket menjadi "Dibatalkan", mencatat pembatalan dalam riwayat penanganan, dan melepas penahanan dana pekerjaan (jika ada). |

---

# BAB 5: Pemodelan Kelas

## 5.1 Identifikasi Kelas
Salin ulang seluruh kelas yang telah diidentifikasi dari BAB 4.1 dokumen *Class Diagram*.

| ID Kelas | Nama Kelas | Deskripsi Kelas | ID Use Case |
| :--- | :--- | :--- | :--- |
| *C01* | *Pelanggan* | *Menyimpan data akun pelanggan yang membuat pesanan.* | *UC01, UC05* |
| *C02* | *Pesanan* | *Menyimpan data pesanan beserta status pembayarannya.* | *UC01, UC03, UC05* |
| *C03* | *Keranjang* | *Menyimpan sementara item yang dipilih sebelum checkout.* | *UC01, UC02* |
| *...* | *...* | *...* | *...* |

## 5.2 Diagram Kelas per Use Case
Salin ulang diagram kelas untuk setiap use case dari BAB 4.2 dokumen *Class Diagram*, lengkap dengan tabel atribut dan metode/operasinya.

### 5.2.1 Use Case UC01

**Nama Use Case:** *Memesan Produk*

<p align="center">
<img alt="Contoh Class Diagram" src="./assets/diagram/contoh-class-diagram.webp" width="70%">
</p>
<p align="center">
<i>Gambar 3. Contoh Diagram Kelas Use Case UC01</i>
</p>

| ID Kelas | Nama Kelas | Atribut | Metode/Operasi |
| :--- | :--- | :--- | :--- |
| *C02* | *Pesanan* | *idPesanan, total, status* | *buatPesanan(), hitungTotal()* |
| *C03* | *Keranjang* | *daftarItem* | *tambahItem(), checkout()* |
| *...* | *...* | *...* | *...* |

> Lanjutkan pola **5.2.x** untuk setiap use case pada 4.2.

## 5.3 Diagram Kelas Keseluruhan
Gabungkan seluruh kelas dan hubungan antarkelas dari BAB 4.3 dokumen *Class Diagram* menjadi satu diagram kelas keseluruhan. Pastikan tidak ada kelas yang terduplikasi atau tertinggal.

<p align="center">
<img alt="Contoh Class Diagram Keseluruhan" src="./assets/diagram/contoh-class-diagram.webp" width="70%">
</p>
<p align="center">
<i>Gambar 4. Contoh Diagram Kelas Keseluruhan</i>
</p>

| ID Kelas | Nama Kelas | Atribut | Metode/Operasi |
| :--- | :--- | :--- | :--- |
| *C01* | *Pelanggan* | *idPelanggan, nama, email* | *lihatRiwayatPesanan()* |
| *C02* | *Pesanan* | *idPesanan, total, status* | *hitungTotal(), perbaruiStatus()* |
| *...* | *...* | *...* | *...* |

---

# BAB 6: Traceability
Salin ulang tabel Traceability dari BAB 5 dokumen *Class Diagram*, cocokkan setiap Kebutuhan Fungsional, Use Case, dan Kelas yang saling terkait.

| ID Kelas | ID Use Case | ID KF |
| :--- | :--- | :--- |
| *C01* | *UC01, UC05* | *KF01, KF06* |
| *C02* | *UC01, UC03, UC05* | *KF01, KF02, KF05, KF06* |
| *C03* | *UC01, UC02* | *KF01, KF02* |
| *...* | *...* | *...* |

---

# Referensi
- Diagram UML: [https://www.drawio.com/](https://www.drawio.com/), [https://staruml.io/](https://staruml.io/)
