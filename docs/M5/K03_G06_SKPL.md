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

Perangkat lunak Kerja-In merupakan platform marketplace jasa berbasis web yang mempertemukan Penyedia Kerja dengan Tenaga Kerja untuk pekerjaan onsite maupun remote. Penyedia Kerja dapat membuat lowongan dalam satu bidang pekerjaan, menentukan tarif awal dan jumlah pekerja yang dibutuhkan, serta memilih tenaga kerja berdasarkan profil, portofolio, reputasi, dan penawaran upah. Tenaga Kerja dapat melengkapi profil dan portofolio setelah registrasi, mencari lowongan yang sesuai, serta mengajukan penawaran sebesar tarif awal atau lebih tinggi. Kedua jenis pengguna wajib menjalani verifikasi identitas menggunakan foto KTP yang diperiksa oleh Customer Service.

Setelah penawaran diterima, Penyedia Kerja membayar upah yang disepakati beserta biaya admin melalui layanan pembayaran. Hasil pekerjaan dinilai secara terpisah untuk setiap pekerja, dan upah diteruskan setelah hasil disetujui. Sistem juga membantu mengatur jadwal pekerjaan, menyediakan rating dan ulasan untuk membangun reputasi, serta memfasilitasi penanganan keluhan oleh Customer Service. Aplikasi dirancang responsif agar dapat diakses melalui browser pada ponsel maupun komputer.

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

| Pengguna | Kebutuhan |
| :--- | :--- |
| Tenaga Kerja | Melengkapi profil/KTP/portofolio, mengajukan penawaran, mengerjakan penugasan, menerima upah otomatis, memberi ulasan, dan melapor kendala. |
| Penyedia Kerja | Melengkapi profil/KTP, membuat lowongan satu bidang, memilih beberapa pekerja, membayar per pekerja, menilai hasil, dan memberi ulasan/keluhan. |
| Customer Service | Memeriksa KTP kedua peran, meninjau bukti keluhan, mencatat keputusan dan mengawasi tindak lanjut dana. |

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

Tabel 3.1. Daftar Kebutuhan Fungsional

| ID KF | ID Kebutuhan | Penjelasan |
| :--- | :--- | :--- |
| KF01 | R01, R03 | Ketika pengguna mendaftar, sistem harus menyimpan data diri dan tepat satu peran publik (Tenaga Kerja atau Penyedia Kerja) setelah persetujuan kebijakan privasi; portofolio dilengkapi setelah registrasi. |
| KF02 | R02 | Jika usia pendaftar kurang dari 17 tahun atau email sudah digunakan, sistem harus menolak registrasi dan menjelaskan isian yang perlu diperbaiki. |
| KF03 | R04 | Ketika pengguna login, sistem harus memverifikasi kredensial dan membuat sesi autentikasi sesuai peran akun. |
| KF04 | R05, R07 | Ketika Tenaga Kerja atau Penyedia Kerja mengajukan verifikasi, sistem harus memvalidasi kelengkapan profil dan foto KTP, lalu mencatat status MenungguPersetujuan. |
| KF05 | R06 | Ketika Customer Service memutuskan verifikasi, sistem harus menyimpan pemeriksa, waktu, status Terverifikasi atau Ditolak, serta alasan jika ditolak. Verifikasi email tidak menggantikan persetujuan KTP. |
| KF06 | R08 | Selama akun belum Terverifikasi, sistem harus menolak publikasi lowongan oleh penyedia dan pengajuan penawaran oleh pekerja; akses profil, verifikasi, dan penelusuran lowongan tetap tersedia. |
| KF07 | R09, R10 | Ketika penyedia terverifikasi memublikasikan lowongan valid, sistem harus menyimpan satu bidang pekerjaan, kuota, tarif awal per pekerja, serta menetapkan status Open. |
| KF08 | R11 | Jika rincian wajib lowongan tidak lengkap atau tidak valid (judul, deskripsi, satu bidang, keterampilan, kuota positif, tarif per pekerja positif, mode kerja, jadwal, batas pengajuan, serta lokasi untuk onsite), sistem harus menolak penyimpanan serta menunjukkan kesalahan pada isian. |
| KF09 | R12, R13 | Ketika pengguna mencari lowongan, sistem harus menampilkan lowongan Open yang masih menerima pengajuan dan sesuai kata kunci, bidang/keterampilan, mode kerja, serta filter lokasi atau tarif yang dipilih. |
| KF10 | R08, R15 | Ketika pekerja mengajukan penawaran, sistem harus memeriksa verifikasi, profil lengkap, minimal satu portofolio valid yang dipilih, ketersediaan lowongan, dan konflik dengan penugasan yang sudah diterima. |
| KF11 | R14, R16 | Ketika penawaran valid dikirim, sistem harus menyimpan nominal minimal sebesar tarif awal, pesan dan pengalaman opsional, ringkasan portofolio saat dikirim, serta waktu dan status Menunggu; salinan portofolio tetap tersimpan meskipun atribut portofolio pada profil diubah. |
| KF12 | R17, R18, R19 | Ketika pemilik lowongan menerima penawaran Menunggu, sistem harus memeriksa ulang kuota dan konflik jadwal secara atomik, mencatat penawaran Diterima, dan membuat satu TransaksiPekerjaan berstatus Assigned tanpa konfirmasi ulang pekerja. |
| KF13 | R18, R19 | Ketika kuota terisi, sistem harus menetapkan lowongan Full dan menutup pengajuan baru. Jika penugasan dibatalkan, sistem harus menghitung ulang kuota dan membuka lowongan jika batas pengajuan belum lewat. |
| KF14 | R20, R21, R23 | Ketika penyedia membayar tagihan, sistem harus menyediakan metode yang didukung integrasi pembayaran dan memulai pekerjaan hanya setelah pembayaran berhasil diverifikasi. |
| KF15 | R20, R22, R23 | Sistem harus mencatat referensi dan status pembayaran dari layanan pembayaran, dengan totalBayar = upahDisepakati + biayaAdmin (nominal biaya admin belum ditetapkan); dana dikelola melalui layanan pembayaran dan upah pekerja tidak dipotong biaya admin. |
| KF16 | R24, R25, R26 | Ketika pekerja yang ditugaskan menyerahkan hasil untuk penugasan InProgress, sistem harus menyimpan deskripsi dan bukti sebagai versi baru, mencatat waktu, dan mengubah status pekerjaan menjadi Submitted. |
| KF17 | R27, R28, R29 | Ketika penyedia menyetujui hasil Submitted tanpa sengketa dana aktif, sistem harus mengubah status menjadi Completed dan memicu pencairan otomatis sebesar upahDisepakati. |
| KF18 | R30, R32 | Ketika hasil disetujui atau status pencairan berubah, sistem harus menampilkan notifikasi yang membedakan pekerjaan selesai, pencairan diproses, dan upah berhasil ditransfer. |
| KF19 | R28, R30, R31, R32 | Ketika penugasan Completed memenuhi syarat pencairan dan tidak ditahan sengketa, sistem harus memvalidasi tujuan pembayaran lalu mengirim instruksi pencairan otomatis; tidak ada pengajuan penarikan saldo manual. |
| KF20 | R32 | Ketika layanan pembayaran mengirim status pencairan, sistem harus memverifikasi dan mencatat nominal, penerima, waktu, referensi, dan status untuk ditampilkan pada riwayat pekerja. |
| KF21 | R33 | Ketika penugasan Completed, sistem harus menyediakan rating 1–5 dan ulasan bagi kedua pihak pada penugasan tersebut. |
| KF22 | R34 | Jika pemberi telah memberikan ulasan kepada penerima untuk penugasan yang sama, sistem harus menolak ulasan duplikat tanpa menghalangi ulasan pihak lainnya. |
| KF23 | R35 | Ketika ulasan disimpan, sistem harus menghitung ulang rata-rata rating penerima dan menampilkan reputasinya pada profil. |
| KF24 | R36, R38 | Ketika pengguna mengirim keluhan, sistem harus membuat tiket dengan kategori, deskripsi, bukti bila tersedia, serta referensi penugasan jika terkait pekerjaan. |
| KF25 | R37, R39 | Ketika CS memutuskan sengketa, sistem harus mencatat alasan, memeriksa status dana dan kewenangan, lalu meneruskan instruksi refund atau pencairan sesuai keputusan yang sah tanpa mengeksekusi keduanya untuk dana yang sama. |
| KF26 | R38 | Setiap tindakan penanganan tiket harus dicatat kronologis dengan pelaku, waktu, bukti tambahan, dan perubahan status serta diberitahukan kepada pihak terkait. |
| KF27 | R09, R11 | Sistem harus membedakan mode Onsite/Remote dan jadwal Tetap/Fleksibel; Onsite wajib memiliki lokasi serta jadwal Tetap, sedangkan Remote dapat menggunakan jadwal Tetap atau tenggat Fleksibel. |
| KF28 | R14, R15, R16 | Sistem harus mengizinkan pengajuan tanpa batas harian, tetapi hanya satu penawaran Menunggu atau Diterima per pekerja per lowongan; riwayat Ditolak melarang pengajuan ulang pada lowongan yang sama. |
| KF29 | R14, R16 | Ketika pekerja mengedit atau menarik penawaran Menunggu, sistem harus memvalidasi kepemilikan dan menyimpan perubahan; penawaran yang sudah Diterima atau Ditolak tidak dapat diedit atau ditarik melalui fitur penawaran. |
| KF30 | R14, R16 | Ketika pekerja mengajukan ulang setelah penawaran Ditarik atau DibatalkanSistem, sistem harus memvalidasi syarat pengajuan kembali dan membuat catatan baru tanpa menghapus riwayat sebelumnya. |
| KF31 | R15, R18, R19 | Sistem harus menolak jadwal tetap yang bertumpang tindih dengan penugasan yang diterima, serta mensyaratkan jeda minimal 120 menit jika salah satu pekerjaan Onsite (tepat 120 menit diperbolehkan); dua pekerjaan Remote cukup tidak bertumpang tindih; persetujuan pertama yang berhasil tercatat membatalkan penawaran Menunggu lain yang konflik. |
| KF32 | R19, R20, R23 | Ketika penawaran diterima, sistem harus menerbitkan satu tagihan per penugasan dengan salinan upah, rincian pekerjaan, jadwal, dan biaya admin yang berlaku saat kesepakatan. |
| KF33 | R19, R21, R23 | Ketika invoice belum dibayar dibatalkan atau kedaluwarsa, sistem harus membatalkan penugasan, melepas jadwal dan kuota; penawaran lain yang sebelumnya dibatalkan tidak diaktifkan otomatis. |
| KF34 | R27, R29, R36, R37 | Ketika hasil perlu diperbaiki, sistem harus menyimpan catatan revisi dan mengembalikan Submitted ke InProgress; pembatalan setelah pembayaran atau perselisihan ruang lingkup diproses melalui UC12. |
| KF35 | R01, R05, R08 | Setelah registrasi, sistem harus menyediakan pengelolaan profil sesuai peran dan tujuan penerimaan upah pekerja; perubahan data identitas terverifikasi memerlukan pemeriksaan ulang sebelum aksi baru yang mensyaratkan verifikasi. |
| KF36 | R01, R15 | Sistem harus menyediakan pengelolaan portofolio pekerja berisi judul, deskripsi, bidang, dan minimal foto atau tautan bukti, termasuk pengalaman informal; kelengkapan portofolio dipisahkan dari status verifikasi KTP. |

---

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

| Aktor | Deskripsi |
| :--- | :--- |
| Tenaga Kerja | Melengkapi profil/KTP/portofolio, mengajukan penawaran, mengerjakan penugasan, menerima upah otomatis, memberi ulasan, dan melapor kendala. |
| Penyedia Kerja | Melengkapi profil/KTP, membuat lowongan satu bidang, memilih beberapa pekerja, membayar per pekerja, menilai hasil, dan memberi ulasan/keluhan. |
| Customer Service | Memeriksa KTP kedua peran, meninjau bukti keluhan, mencatat keputusan dan mengawasi tindak lanjut dana. |

## 4.2 Identifikasi Use Case

| ID UC | Nama Use Case | Deskripsi Singkat | Aktor | ID KF |
| :--- | :--- | :--- | :--- | :--- |
| UC01 | Melakukan Registrasi dan Login | Registrasi data diri dengan satu peran dan autentikasi untuk mengakses profil. | Tenaga Kerja, Penyedia Kerja | KF01, KF02, KF03 |
| UC02 | Mengelola Verifikasi Identitas | Kedua peran mengunggah KTP dan CS menyetujui atau menolak verifikasi. | Tenaga Kerja, Penyedia Kerja, Customer Service | KF04, KF05, KF06 |
| UC03 | Mengelola Lowongan Pekerjaan | Penyedia memublikasikan lowongan satu bidang, kuota dan tarif per pekerja. | Penyedia Kerja | KF07, KF08, KF27 |
| UC04 | Mencari Lowongan Pekerjaan | Pengguna menelusuri lowongan yang masih menerima pengajuan. | Tenaga Kerja | KF09 |
| UC05 | Mengajukan dan Mengelola Penawaran Pekerjaan | Pekerja mengirim, mengedit atau menarik penawaran sesuai status dan syarat. | Tenaga Kerja | KF10, KF11, KF28, KF29, KF30, KF31 |
| UC06 | Memilih Tenaga Kerja | Penyedia menerima kandidat; sistem memesan jadwal dan menerbitkan invoice per pekerja. | Penyedia Kerja | KF12, KF13, KF31, KF32 |
| UC07 | Melakukan Pembayaran Pekerjaan | Penyedia membayar upah disepakati beserta biaya admin tambahan. | Penyedia Kerja | KF14, KF15, KF32, KF33 |
| UC08 | Menyerahkan Hasil Pekerjaan | Pekerja menyerahkan deskripsi hasil dan bukti per penugasan. | Tenaga Kerja | KF16 |
| UC09 | Memverifikasi Penyelesaian Pekerjaan | Penyedia menyetujui hasil atau meminta revisi per pekerja. | Penyedia Kerja | KF17, KF18, KF34 |
| UC10 | Memantau Pencairan Upah Otomatis | Sistem menyalurkan upah otomatis; pekerja memantau status dan riwayat. | Tenaga Kerja | KF19, KF20 |
| UC11 | Memberikan Penilaian Kerja | Kedua pihak memberi rating dan ulasan per penugasan selesai. | Tenaga Kerja, Penyedia Kerja | KF21, KF22, KF23 |
| UC12 | Menangani Keluhan dan Sengketa | Pengguna melaporkan kendala dan CS meninjau bukti serta menetapkan tindak lanjut. | Tenaga Kerja, Penyedia Kerja, Customer Service | KF24, KF25, KF26, KF34 |
| UC13 | Mengelola Profil dan Portofolio | Pengguna melengkapi profil; pekerja mengelola portofolio setelah registrasi. | Tenaga Kerja, Penyedia Kerja | KF35, KF36 |

## 4.3 Use Case Diagram

<br>
<p align="center">
<img alt="Contoh Activity Diagram" src="./assets/diagram/Diagram uc/uc-diagram.jpg" width="100%">
</p>
<p align="center">
<i>Gambar 1. Use Case Diagram</i>
</p>
<br>

## 4.4 Skenario Use Case

### 4.4.1 Skenario UC01

**Nama Use Case:** Melakukan Registrasi dan Login


**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| --- | --- | --- |
| 1 | Pengguna membuka registrasi. | Sistem menampilkan formulir nama, email, password, tanggal lahir, nomor telepon, pilihan satu peran, dan persetujuan kebijakan privasi. |
| 2 | Pengguna mengisi data diri, memilih satu peran, menyetujui privasi, dan mengirim. | Sistem memvalidasi usia/email, menyimpan passwordHash dan akun BelumDiajukan; portofolio belum diperlukan. |
| 3 | Pengguna login. | Sistem memverifikasi kredensial dan membuka profil untuk dilengkapi melalui UC13. |

**Skenario Alternatif 1: Usia/email/isian tidak valid**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Usia/email/isian tidak valid | Tolak registrasi dan tampilkan alasan; tidak membuat akun parsial. |

**Skenario Alternatif 2: Kredensial salah**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Kredensial salah | Tolak login dan izinkan percobaan berikutnya sesuai pembatasan keamanan. |

### 4.4.2 Skenario UC02

**Nama Use Case:** Mengelola Verifikasi Identitas


**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Tenaga Kerja atau Penyedia Kerja melengkapi profil lalu mengunggah foto KTP. | Sistem memvalidasi kelengkapan data diri dan foto KTP, menyimpan berkas privat, dan mencatat MenungguPersetujuan. |
| 2 | Customer Service memeriksa kesesuaian data dan menyetujui. | Sistem mencatat pemeriksa/waktu dan Terverifikasi serta mengirim notifikasi. Kelayakan melamar masih memerlukan portofolio lengkap. |

**Skenario Alternatif 1: Berkas tidak valid**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Berkas tidak valid | Tolak unggahan dan tampilkan alasan; usulan batas foto KTP JPG/PNG maksimal 5 MB. |

**Skenario Alternatif 2: KTP tidak sesuai/buram**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | KTP tidak sesuai/buram | CS menolak dengan alasan; pengguna boleh memperbaiki dan mengajukan ulang. |

**Skenario Alternatif 3: Belum terverifikasi**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Belum terverifikasi | Blokir publikasi/pengajuan; tetap izinkan profil dan katalog. |

### 4.4.3 Skenario UC03

**Nama Use Case:** Mengelola Lowongan Pekerjaan


**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| --- | --- | --- |
| 1 | Penyedia terverifikasi membuka form lowongan. | Sistem menampilkan formulir judul, deskripsi, bidang, keterampilan, kuota, tarif awal per pekerja, mode kerja, lokasi onsite, jenis jadwal, waktu mulai–selesai atau tenggat hasil, dan batas pengajuan. |
| 2 | Penyedia mengisi satu bidang, kuota, tarif per pekerja, mode/lokasi, jadwal, dan batas pengajuan. | Sistem memvalidasi satu bidang, kuota dan tarif positif, waktu selesai setelah mulai, serta batas pengajuan sebelum pekerjaan mulai atau tenggat hasil, menyimpan lowongan Open, dan menampilkannya dalam pencarian. |

**Skenario Alternatif 1: Bidang/jadwal/lokasi tidak valid**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Bidang/jadwal/lokasi tidak valid | Tolak penyimpanan dan tampilkan isian yang perlu diperbaiki. |

**Skenario Alternatif 2: Mengedit lowongan yang telah memiliki penawaran**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Mengedit lowongan yang telah memiliki penawaran | Usulan: tolak perubahan substantif setelah ada pengajuan dan arahkan membuat lowongan baru. |

### 4.4.4 Skenario UC04

**Nama Use Case:** Mencari Lowongan Pekerjaan


**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| --- | --- | --- |
| 1 | Pengguna membuka katalog dan memilih kata kunci atau filter. | Sistem mencari lowongan Open yang belum melewati batas pengajuan. |
| 2 | Pengguna membuka detail lowongan. | Sistem menampilkan rincian, tarif awal, kuota, mode dan jadwal; akses mengajukan tetap mengikuti peran, verifikasi, dan portofolio. |

**Skenario Alternatif 1: Tidak ada hasil**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Tidak ada hasil | Tampilkan daftar kosong dan opsi mengubah filter. |

### 4.4.5 Skenario UC05

**Nama Use Case:** Mengajukan dan Mengelola Penawaran Pekerjaan


**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| --- | --- | --- |
| 1 | Pekerja terverifikasi memilih lowongan dan menekan Ajukan Penawaran. | Sistem memeriksa profil, portofolio, riwayat penolakan, penawaran aktif, dan konflik penugasan; menampilkan formulir nominal upah, pilihan portofolio, persetujuan rincian/jadwal, serta pesan dan pengalaman opsional; nominal awal terisi tarif lowongan. |
| 2 | Pekerja memilih portofolio dan mempertahankan/menaikkan nominal; pesan dan pengalaman boleh kosong. | Sistem menampilkan ringkasan dan konsekuensi penerimaan terhadap jadwal serta penawaran lain. |
| 3 | Pekerja menyetujui rincian lalu mengirim. | Sistem memvalidasi ulang dan menyimpan Menunggu beserta ringkasan portofolio serta notifikasi kepada penyedia. |

**Skenario Alternatif 1: Nominal di bawah tarif/profil atau portofolio belum lengkap**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Nominal di bawah tarif/profil atau portofolio belum lengkap | Tolak dan jelaskan persyaratan. |

**Skenario Alternatif 2: Sudah Ditolak di lowongan yang sama**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Sudah Ditolak di lowongan yang sama | Tolak pengajuan ulang. |

**Skenario Alternatif 3: Ada penawaran aktif atau konflik penugasan termasuk jeda onsite**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Ada penawaran aktif atau konflik penugasan termasuk jeda onsite | Tolak pengajuan. Penawaran Menunggu pada lowongan lain belum memesan jadwal. |

**Skenario Alternatif 4: Edit atau tarik sebelum keputusan**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Edit atau tarik sebelum keputusan | Periksa status Menunggu secara atomik; edit divalidasi ulang, penarikan mengubah status Ditarik. |

**Skenario Alternatif 5: Ajukan ulang setelah Ditarik/DibatalkanSistem**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Ajukan ulang setelah Ditarik/DibatalkanSistem | Buat catatan baru jika semua syarat terpenuhi; simpan riwayat lama. |

### 4.4.6 Skenario UC06

**Nama Use Case:** Memilih Tenaga Kerja


**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| --- | --- | --- |
| 1 | Penyedia membuka daftar pelamar lowongan miliknya. | Sistem menampilkan profil, rating, ringkasan portofolio, nominal, dan status penawaran. |
| 2 | Penyedia memilih kandidat dan mengonfirmasi nominal berikut fee yang ditampilkan. | Sistem memeriksa kepemilikan, penawaran Menunggu, kelayakan pekerja, kuota, jadwal, dan konfigurasi invoice secara atomik. |
| 3 | Tidak ada aksi tambahan dari pekerja. | Sistem menetapkan Diterima, membuat TransaksiPekerjaan Assigned dan invoice, memesan kuota/jadwal, membatalkan penawaran Menunggu pekerja yang konflik, memperbarui status lowongan, dan mengirim notifikasi. |

**Skenario Alternatif 1: Kuota penuh, status berubah, atau dua penyedia menerima bersamaan**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Kuota penuh, status berubah, atau dua penyedia menerima bersamaan | Hanya persetujuan pertama yang sah berhasil; lainnya ditolak dengan alasan dan data terbaru. |

**Skenario Alternatif 2: Penyedia menolak kandidat**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Penyedia menolak kandidat | Ubah Menunggu menjadi Ditolak dan beri notifikasi; kandidat tidak boleh melamar ulang. |

**Skenario Alternatif 3: Penawaran lain konflik dengan penugasan baru**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Penawaran lain konflik dengan penugasan baru | Ubah menjadi DibatalkanSistem, simpan alasan dan kirim notifikasi; tidak menghapus riwayat. |

**Skenario Alternatif 4: Fee atau tenggat invoice belum dikonfigurasi**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Fee atau tenggat invoice belum dikonfigurasi | Jangan menerima kandidat tanpa invoice valid; tampilkan konfigurasi yang belum tersedia. |

### 4.4.7 Skenario UC07

**Nama Use Case:** Melakukan Pembayaran Pekerjaan


**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| --- | --- | --- |
| 1 | Penyedia membuka invoice per pekerja. | Sistem menampilkan upahDisepakati, biayaAdmin tambahan, totalBayar, dan waktuKedaluwarsa. |
| 2 | Penyedia memilih metode dan menyelesaikan pembayaran. | Sistem meminta instruksi gateway; setelah callback sah dan cocok dengan invoice/nominal, sistem mencatat Berhasil dan mengubah Assigned menjadi InProgress. Dana belum diteruskan kepada pekerja. |

**Skenario Alternatif 1: Pembayaran gagal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Pembayaran gagal | Catat status dan izinkan percobaan ulang selama invoice belum kedaluwarsa; hanya satu pembayaran berhasil diperbolehkan. |

**Skenario Alternatif 2: Invoice kedaluwarsa/dibatalkan sebelum bayar**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Invoice kedaluwarsa/dibatalkan sebelum bayar | Rekonsiliasi status gateway, batalkan penugasan jika belum dibayar, lepas kuota/jadwal, tanpa memulihkan penawaran lain. |

**Skenario Alternatif 3: Callback terlambat setelah pembatalan atau pembayaran ganda**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Callback terlambat setelah pembatalan atau pembayaran ganda | Catat untuk rekonsiliasi/refund; jangan mengaktifkan penugasan yang sudah dibatalkan atau menggandakan upah. |

### 4.4.8 Skenario UC08

**Nama Use Case:** Menyerahkan Hasil Pekerjaan


**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| --- | --- | --- |
| 1 | Pekerja membuka penugasan InProgress miliknya. | Sistem menampilkan formulir deskripsi hasil dan lampiran bukti yang wajib diisi. |
| 2 | Pekerja mengirim deskripsi dan lampiran bukti. | Sistem memvalidasi otorisasi/berkas, membuat versi BuktiPenyerahan baru, mengubah pekerjaan menjadi Submitted, dan memberi notifikasi penyedia. |

**Skenario Alternatif 1: Bukti kosong atau ukuran/format salah**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Bukti kosong atau ukuran/format salah | Tolak penyerahan dan pertahankan InProgress. |

**Skenario Alternatif 2: Pekerja lain atau status bukan InProgress**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Pekerja lain atau status bukan InProgress | Tolak akses/aksi. |

**Skenario Alternatif 3: Pengiriman setelah revisi**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Pengiriman setelah revisi | Buat versi berikutnya; bukti versi lama tetap tersimpan. |

### 4.4.9 Skenario UC09

**Nama Use Case:** Memverifikasi Penyelesaian Pekerjaan


**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| --- | --- | --- |
| 1 | Penyedia membuka hasil Submitted dari pekerja tertentu. | Sistem menampilkan deskripsi kesepakatan dan seluruh versi bukti. |
| 2 | Penyedia mengonfirmasi hasil sesuai. | Sistem memeriksa tidak ada sengketa dana aktif, menetapkan Completed, memicu proses pencairan otomatis UC10, dan menampilkan pemberitahuan pencairan Diproses setelah instruksi diterima gateway. |
| 3 | Penyedia memilih memberi ulasan. | Sistem membuka UC11. Keberhasilan transfer dilaporkan terpisah setelah callback gateway. |

**Skenario Alternatif 1: Hasil belum sesuai**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Hasil belum sesuai | Penyedia mengisi catatan revisi; sistem mengubah Submitted ke InProgress dan memberi notifikasi pekerja. |

**Skenario Alternatif 2: Sengketa atau tidak ada respons**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Sengketa atau tidak ada respons | Buka UC12; tidak ada persetujuan/pencairan otomatis karena waktu berlalu. |

**Skenario Alternatif 3: Instruksi transfer gagal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Instruksi transfer gagal | Pekerjaan tetap Completed, pencairan tercatat Gagal/Diproses sesuai status eksternal; jangan mengirim notifikasi uang diterima. |

### 4.4.10 Skenario UC10

**Nama Use Case:** Memantau Pencairan Upah Otomatis


**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| --- | --- | --- |
| 1 | Pemicu otomatis: hasil disetujui melalui UC09 atau keputusan CS yang memenuhi syarat. | Sistem memvalidasi pembayaran Berhasil, penugasan Completed, tujuan pencairan, serta tidak ada penahanan/refund atau pencairan berhasil sebelumnya, lalu mencatat satu PencairanDana. |
| 2 | Tidak ada pengajuan tarik saldo dari pekerja. | Sistem mengirim instruksi sebesar upahDisepakati dengan kunci idempotensi; callback sah memperbarui status transfer. |
| 3 | Pekerja membuka riwayat pencairan. | Sistem menampilkan nominal, tujuan, waktu, dan status nyata serta notifikasi ketika transfer Berhasil. |

**Skenario Alternatif 1: Tujuan pembayaran tidak valid**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Tujuan pembayaran tidak valid | Tahan pencairan dan minta pekerja memperbaiki data lewat UC13, lalu proses ulang otomatis setelah valid. |

**Skenario Alternatif 2: Timeout atau callback berulang**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Timeout atau callback berulang | Rekonsiliasi dan gunakan identitas pencairan yang sama; tidak membuat transfer kedua. |

**Skenario Alternatif 3: Ada tiket dana aktif/refund**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Ada tiket dana aktif/refund | Tunda pencairan sampai syarat terpenuhi; refund dan pencairan saling mengunci. |

### 4.4.11 Skenario UC11

**Nama Use Case:** Memberikan Penilaian Kerja


**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| --- | --- | --- |
| 1 | Salah satu pihak membuka penugasan Completed dan memilih Beri Ulasan. | Sistem memeriksa keterlibatan pengguna dan keunikan pemberi/penerima/penugasan lalu menampilkan formulir rating wajib 1–5 dan teks ulasan opsional. |
| 2 | Pengguna mengirim rating dan ulasan opsional. | Sistem menyimpan penilaian dan memperbarui rata-rata rating penerima; pihak lain tetap dapat memberi ulasannya sendiri. |

**Skenario Alternatif 1: Rating di luar 1–5, ulasan ganda, atau pengguna bukan pihak penugasan**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Rating di luar 1–5, ulasan ganda, atau pengguna bukan pihak penugasan | Tolak dan jelaskan alasan tanpa mengubah agregat rating. |

### 4.4.12 Skenario UC12

**Nama Use Case:** Menangani Keluhan dan Sengketa


**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Pengguna mengirim kategori masalah, deskripsi keluhan, referensi penugasan jika terkait pekerjaan, dan bukti jika tersedia. | Sistem membuat tiket MenungguPeninjauan dan, jika menyangkut dana penugasan yang belum disalurkan, menahan penyaluran. |
| 2 | Customer Service memeriksa bukti dan mencatat keputusan beserta alasan. | Sistem memvalidasi otorisasi serta status dana. Refund upah membatalkan penugasan dan memicu refund; persetujuan penerusan upah menyelesaikan penugasan jika diperlukan lalu memicu pencairan; tidak ada tindakan dana untuk kendala akun. |
| 3 | Pihak terkait membuka tiket. | Sistem menampilkan keputusan, riwayat, dan status pelaksanaan dana. Keputusan tidak dianggap bukti bahwa transfer eksternal telah selesai. |

**Skenario Alternatif 1: Bukti belum cukup**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Bukti belum cukup | CS meminta bukti; sistem mencatat MenungguBukti dan menyimpan tambahan pada riwayat. |

**Skenario Alternatif 2: Keluhan ditolak**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Keluhan ditolak | Simpan alasan dan lepas penahanan hanya bila tidak ada tiket aktif lain; pencairan hanya jika pekerjaan sudah Completed. |

**Skenario Alternatif 3: Pelapor membatalkan tiket MenungguPeninjauan**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Pelapor membatalkan tiket MenungguPeninjauan | Ubah Dibatalkan dan evaluasi penahanan dana; tidak otomatis menyetujui hasil. |

**Skenario Alternatif 4: Upah terasa tidak sesuai effort**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Upah terasa tidak sesuai effort | Jika ruang lingkup tetap, nominal mengikuti kesepakatan. Tambahan ruang lingkup dapat ditolak/dilaporkan. |

**Skenario Alternatif 5: Dana sudah disalurkan**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Dana sudah disalurkan | CS meninjau secara manual; sistem tidak menjanjikan pengembalian otomatis dari rekening pekerja. |

**Skenario Alternatif 6: Refund/pencairan eksternal gagal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Refund/pencairan eksternal gagal | Catat kegagalan dan lakukan rekonsiliasi; keputusan tiket dan status dana ditampilkan terpisah. |

### 4.4.13 Skenario UC13

**Nama Use Case:** Mengelola Profil dan Portofolio


**Skenario Normal**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| --- | --- | --- |
| 1 | Pengguna yang sudah login membuka profil. | Sistem menampilkan data sesuai peran; pekerja mendapat menu portofolio dan tujuan pencairan. |
| 2 | Pengguna melengkapi profil; pekerja menambahkan portofolio dengan deskripsi dan foto/tautan bukti. | Sistem memvalidasi kepemilikan dan profil sesuai peran dan portofolio yang memuat judul, deskripsi, bidang, serta foto atau tautan bukti, menyimpan profil/portofolio, dan menampilkan kelengkapan terpisah dari status verifikasi. |
| 3 | Pekerja memilih portofolio saat melamar. | Sistem hanya menawarkan portofolio lengkap milik pekerja; pengalaman informal diperbolehkan. |

**Skenario Alternatif 1: Portofolio tanpa deskripsi/bukti atau bukan milik pengguna**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Portofolio tanpa deskripsi/bukti atau bukan milik pengguna | Tolak penyimpanan/pemilihan. |

**Skenario Alternatif 2: Data identitas terverifikasi berubah**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Data identitas terverifikasi berubah | Kembalikan kebutuhan pemeriksaan identitas sebelum publikasi/pengajuan baru; pekerjaan berjalan tetap tercatat. |

**Skenario Alternatif 3: Portofolio diubah/dihapus setelah melamar**

| No | Aksi Aktor | Reaksi Perangkat Lunak |
| :--- | :--- | :--- |
| 1 | Portofolio diubah/dihapus setelah melamar | Ringkasan pada penawaran lama tetap tersimpan; pengajuan baru memerlukan minimal satu portofolio lengkap. |


---

# BAB 5: Pemodelan Kelas

## 5.1 Identifikasi Kelas

| ID Kelas | Nama Kelas | Deskripsi Kelas | ID Use Case |
| --- | --- | --- | --- |
| C01 | Pengguna | Entitas abstrak akun; identitas dan status verifikasi digunakan bersama oleh kedua peran publik. Akun CS disediakan internal. | UC01, UC02, UC03, UC05, UC12, UC13 |
| C02 | TenagaKerja | Turunan Pengguna yang menyimpan keahlian, tujuan pencairan, rating, dan atribut portofolio berupa daftar judul, deskripsi, bidang pekerjaan, serta foto atau tautan bukti pengalaman. | UC01, UC02, UC04, UC05, UC06, UC08, UC10, UC11, UC13 |
| C03 | PenyediaKerja | Turunan Pengguna yang memublikasikan lowongan dan membayar tagihan per pekerja. | UC01, UC02, UC03, UC06, UC07, UC09, UC11, UC13 |
| C04 | CustomerService | Turunan Pengguna untuk petugas internal yang memeriksa KTP dan menangani sengketa. | UC02, UC12 |
| C05 | LowonganPekerjaan | Kebutuhan tenaga kerja dalam tepat satu bidang, dengan kuota dan tarif awal per pekerja. | UC03, UC04, UC05, UC06, UC07, UC12 |
| C06 | PengajuanPenawaran | Penawaran pekerja pada lowongan; menyimpan nominal, portofolio saat pengajuan, serta riwayat keputusan. | UC05, UC06, UC07 |
| C07 | TransaksiPekerjaan | Kesepakatan pelaksanaan pekerjaan oleh satu pekerja yang penawarannya diterima, mencakup upah, jadwal, ruang lingkup, dan status pengerjaan. | UC05, UC06, UC07, UC08, UC09, UC10, UC11, UC12 |
| C08 | BuktiPenyerahan | Satu versi penyerahan hasil milik satu penugasan; pengiriman ulang setelah revisi membuat versi baru. | UC08, UC09 |
| C09 | TagihanPembayaran | Invoice per penugasan berisi upah yang disetujui dan biaya admin tambahan. | UC06, UC07, UC09, UC10, UC12 |
| C10 | PencairanDana | Catatan penyaluran otomatis seluruh upah yang disepakati ke tujuan pembayaran pekerja setelah persetujuan hasil. | UC09, UC10, UC12 |
| C11 | UlasanRating | Penilaian satu pemberi kepada satu penerima untuk satu penugasan yang selesai. | UC11 |
| C12 | TiketSengketa | Keluhan akun atau sengketa pekerjaan; idTransaksi opsional untuk kendala akun. | UC12 |
| C13 | RiwayatSengketa | Catatan kronologis tindakan, bukti tambahan, dan perubahan status selama penanganan tiket keluhan. | UC12 |
| C14 | Notifikasi | Pesan kepada pengguna tentang verifikasi, penawaran, pekerjaan, pembayaran, atau sengketa. | UC02, UC05, UC06, UC07, UC08, UC09, UC10, UC12 |
| C15 | PaymentGateway | Representasi integrasi layanan pembayaran eksternal. Bukan penyimpan dana milik platform; UI dan Controller dipertahankan mengikuti struktur asistensi. | UC07, UC09, UC10, UC12 |
| C16 | PenggunaUI | Antarmuka untuk Pengguna; hanya menangani masukan dan penyajian informasi. | UC01, UC02, UC03, UC05, UC12, UC13 |
| C17 | TenagaKerjaUI | Antarmuka profil pekerja, pengelolaan dan pemilihan portofolio, serta riwayat pekerjaan. | UC01, UC02, UC04, UC05, UC06, UC08, UC10, UC11, UC13 |
| C18 | PenyediaKerjaUI | Antarmuka untuk PenyediaKerja; hanya menangani masukan dan penyajian informasi. | UC01, UC02, UC03, UC06, UC07, UC09, UC11, UC13 |
| C19 | CustomerServiceUI | Antarmuka untuk CustomerService; hanya menangani masukan dan penyajian informasi. | UC02, UC12 |
| C20 | LowonganPekerjaanUI | Antarmuka untuk LowonganPekerjaan; hanya menangani masukan dan penyajian informasi. | UC03, UC04, UC05, UC06, UC07, UC12 |
| C21 | PengajuanPenawaranUI | Antarmuka untuk PengajuanPenawaran; hanya menangani masukan dan penyajian informasi. | UC05, UC06, UC07 |
| C22 | TransaksiPekerjaanUI | Antarmuka untuk TransaksiPekerjaan; hanya menangani masukan dan penyajian informasi. | UC05, UC06, UC07, UC08, UC09, UC10, UC11, UC12 |
| C23 | BuktiPenyerahanUI | Antarmuka untuk BuktiPenyerahan; hanya menangani masukan dan penyajian informasi. | UC08, UC09 |
| C24 | TagihanPembayaranUI | Antarmuka untuk TagihanPembayaran; hanya menangani masukan dan penyajian informasi. | UC06, UC07, UC09, UC10, UC12 |
| C25 | PencairanDanaUI | Antarmuka untuk PencairanDana; hanya menangani masukan dan penyajian informasi. | UC09, UC10, UC12 |
| C26 | UlasanRatingUI | Antarmuka untuk UlasanRating; hanya menangani masukan dan penyajian informasi. | UC11 |
| C27 | TiketSengketaUI | Antarmuka untuk TiketSengketa; hanya menangani masukan dan penyajian informasi. | UC12 |
| C28 | RiwayatSengketaUI | Antarmuka untuk RiwayatSengketa; hanya menangani masukan dan penyajian informasi. | UC12 |
| C29 | NotifikasiUI | Antarmuka untuk Notifikasi; hanya menangani masukan dan penyajian informasi. | UC02, UC05, UC06, UC07, UC08, UC09, UC10, UC12 |
| C30 | PaymentGatewayUI | Antarmuka untuk PaymentGateway; hanya menangani masukan dan penyajian informasi. | UC07, UC09, UC10, UC12 |
| C31 | PenggunaController | Pengendali alur Pengguna; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. | UC01, UC02, UC03, UC05, UC12, UC13 |
| C32 | TenagaKerjaController | Pengendali profil dan atribut portofolio pekerja, termasuk validasi kepemilikan, kelengkapan, dan kelayakan melamar. | UC01, UC02, UC04, UC05, UC06, UC08, UC10, UC11, UC13 |
| C33 | PenyediaKerjaController | Pengendali alur PenyediaKerja; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. | UC01, UC02, UC03, UC06, UC07, UC09, UC11, UC13 |
| C34 | CustomerServiceController | Pengendali alur CustomerService; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. | UC02, UC12 |
| C35 | LowonganPekerjaanController | Pengendali alur LowonganPekerjaan; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. | UC03, UC04, UC05, UC06, UC07, UC12 |
| C36 | PengajuanPenawaranController | Pengendali alur PengajuanPenawaran; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. | UC05, UC06, UC07 |
| C37 | TransaksiPekerjaanController | Pengendali alur TransaksiPekerjaan; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. | UC05, UC06, UC07, UC08, UC09, UC10, UC11, UC12 |
| C38 | BuktiPenyerahanController | Pengendali alur BuktiPenyerahan; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. | UC08, UC09 |
| C39 | TagihanPembayaranController | Pengendali alur TagihanPembayaran; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. | UC06, UC07, UC09, UC10, UC12 |
| C40 | PencairanDanaController | Pengendali alur PencairanDana; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. | UC09, UC10, UC12 |
| C41 | UlasanRatingController | Pengendali alur UlasanRating; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. | UC11 |
| C42 | TiketSengketaController | Pengendali alur TiketSengketa; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. | UC12 |
| C43 | RiwayatSengketaController | Pengendali alur RiwayatSengketa; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. | UC12 |
| C44 | NotifikasiController | Pengendali alur Notifikasi; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. | UC02, UC05, UC06, UC07, UC08, UC09, UC10, UC12 |
| C45 | PaymentGatewayController | Pengendali alur PaymentGateway; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. | UC07, UC09, UC10, UC12 |

## 5.2 Diagram Kelas per Use Case

### 5.2.1 Use Case UC01

**Nama Use Case:** Melakukan Registrasi dan Login

#### Identifikasi Kelas

| ID Kelas | Nama Kelas | Deskripsi Kelas |
| --- | --- | --- |
| C01 | Pengguna | Entitas abstrak akun; identitas dan status verifikasi digunakan bersama oleh kedua peran publik. Akun CS disediakan internal. |
| C02 | TenagaKerja | Turunan Pengguna yang menyimpan keahlian, tujuan pencairan, rating, dan atribut portofolio berupa daftar judul, deskripsi, bidang pekerjaan, serta foto atau tautan bukti pengalaman. |
| C03 | PenyediaKerja | Turunan Pengguna yang memublikasikan lowongan dan membayar tagihan per pekerja. |
| C16 | PenggunaUI | Antarmuka untuk Pengguna; hanya menangani masukan dan penyajian informasi. |
| C17 | TenagaKerjaUI | Antarmuka profil pekerja, pengelolaan dan pemilihan portofolio, serta riwayat pekerjaan. |
| C18 | PenyediaKerjaUI | Antarmuka untuk PenyediaKerja; hanya menangani masukan dan penyajian informasi. |
| C31 | PenggunaController | Pengendali alur Pengguna; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C32 | TenagaKerjaController | Pengendali profil dan atribut portofolio pekerja, termasuk validasi kepemilikan, kelengkapan, dan kelayakan melamar. |
| C33 | PenyediaKerjaController | Pengendali alur PenyediaKerja; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |

#### Diagram Kelas

<p align="center">
<img alt="Class Diagram UC01" src="./assets/diagram/Diagram uc/class-diagram-uc01.png" width="70%">
</p>
<p align="center">
<i>Gambar 2. Diagram Kelas Use Case UC01</i>
</p>
<br>

| ID Kelas | Nama Kelas | Atribut | Metode/Operasi |
| --- | --- | --- | --- |
| C01 | Pengguna | -idPengguna-nama-email-passwordHash-tanggalLahir-nomorTelepon-peran-fotoKtpUrl-statusVerifikasi-alasanPenolakan-waktuPengajuanVerifikasi-waktuVerifikasi-idPemeriksa | +hitungUsia()<br>+perbaruiProfil(dataProfil)<br>+ajukanVerifikasi(fotoKtpUrl)<br>+perbaruiStatusVerifikasi(statusVerifikasi, alasanPenolakan, idPemeriksa)<br>+cekTerverifikasi() |
| C02 | TenagaKerja | -portofolio-keahlian-ringkasanProfil-tujuanPencairan-ratingRataRata | +perbaruiPortofolio(dataPortofolio)<br>+hapusPortofolio(indeksPortofolio)<br>+cekKelengkapanPortofolio()<br>+perbaruiProfilPekerja(dataProfil)<br>+cekKelengkapanProfil()<br>+perbaruiTujuanPencairan(tujuanPencairan)<br>+perbaruiRating(ratingRataRata) |
| C03 | PenyediaKerja | -deskripsiPenyedia-ratingRataRata | +perbaruiProfilPenyedia(dataProfil)<br>+perbaruiRating(ratingRataRata) |
| C16 | PenggunaUI | — | +tampilkanFormRegistrasi()<br>+tampilkanFormLogin()<br>+tampilkanProfil()<br>+tampilkanFormVerifikasi() |
| C17 | TenagaKerjaUI | — | +tampilkanFormProfilPekerja()<br>+tampilkanDaftarPortofolio()<br>+tampilkanFormPortofolio()<br>+tampilkanPilihanPortofolio()<br>+tampilkanRiwayatPekerjaan() |
| C18 | PenyediaKerjaUI | — | +tampilkanFormProfilPenyedia()<br>+tampilkanDashboardPenyedia() |
| C31 | PenggunaController | — | +prosesRegistrasi(dataRegistrasi)<br>+prosesLogin(email, password)<br>+simpanProfil(idPengguna, dataProfil)<br>+ajukanVerifikasi(idPengguna, fotoKtpUrl)<br>+validasiBerkas(berkas, jenisBerkas) |
| C32 | TenagaKerjaController | — | +simpanProfilPekerja(idPengguna, dataProfil)<br>+simpanPortofolio(idTenagaKerja, dataPortofolio)<br>+hapusPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiPortofolio(idTenagaKerja, indeksPortofolio)<br>+ambilRingkasanPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiKelayakanMelamar(idTenagaKerja) |
| C33 | PenyediaKerjaController | — | +simpanProfilPenyedia(idPengguna, dataProfil)<br>+validasiKelayakanPublikasi(idPenyediaKerja) |

### 5.2.2 Use Case UC02

**Nama Use Case:** Mengelola Verifikasi Identitas

#### Identifikasi Kelas

| ID Kelas | Nama Kelas | Deskripsi Kelas |
| --- | --- | --- |
| C01 | Pengguna | Entitas abstrak akun; identitas dan status verifikasi digunakan bersama oleh kedua peran publik. Akun CS disediakan internal. |
| C02 | TenagaKerja | Turunan Pengguna yang menyimpan keahlian, tujuan pencairan, rating, dan atribut portofolio berupa daftar judul, deskripsi, bidang pekerjaan, serta foto atau tautan bukti pengalaman. |
| C03 | PenyediaKerja | Turunan Pengguna yang memublikasikan lowongan dan membayar tagihan per pekerja. |
| C04 | CustomerService | Turunan Pengguna untuk petugas internal yang memeriksa KTP dan menangani sengketa. |
| C14 | Notifikasi | Pesan kepada pengguna tentang verifikasi, penawaran, pekerjaan, pembayaran, atau sengketa. |
| C16 | PenggunaUI | Antarmuka untuk Pengguna; hanya menangani masukan dan penyajian informasi. |
| C17 | TenagaKerjaUI | Antarmuka profil pekerja, pengelolaan dan pemilihan portofolio, serta riwayat pekerjaan. |
| C18 | PenyediaKerjaUI | Antarmuka untuk PenyediaKerja; hanya menangani masukan dan penyajian informasi. |
| C19 | CustomerServiceUI | Antarmuka untuk CustomerService; hanya menangani masukan dan penyajian informasi. |
| C29 | NotifikasiUI | Antarmuka untuk Notifikasi; hanya menangani masukan dan penyajian informasi. |
| C31 | PenggunaController | Pengendali alur Pengguna; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C32 | TenagaKerjaController | Pengendali profil dan atribut portofolio pekerja, termasuk validasi kepemilikan, kelengkapan, dan kelayakan melamar. |
| C33 | PenyediaKerjaController | Pengendali alur PenyediaKerja; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C34 | CustomerServiceController | Pengendali alur CustomerService; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C44 | NotifikasiController | Pengendali alur Notifikasi; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |

#### Diagram Kelas

<p align="center">
<img alt="Class Diagram UC01" src="./assets/diagram/Diagram uc/class-diagram-uc02.png" width="70%">
</p>
<p align="center">
<i>Gambar 3. Diagram Kelas Use Case UC02</i>
</p>
<br>

| ID Kelas | Nama Kelas | Atribut | Metode/Operasi |
| --- | --- | --- | --- |
| C01 | Pengguna | -idPengguna-nama-email-passwordHash-tanggalLahir-nomorTelepon-peran-fotoKtpUrl-statusVerifikasi-alasanPenolakan-waktuPengajuanVerifikasi-waktuVerifikasi-idPemeriksa | +hitungUsia()<br>+perbaruiProfil(dataProfil)<br>+ajukanVerifikasi(fotoKtpUrl)<br>+perbaruiStatusVerifikasi(statusVerifikasi, alasanPenolakan, idPemeriksa)<br>+cekTerverifikasi() |
| C02 | TenagaKerja | -portofolio-keahlian-ringkasanProfil-tujuanPencairan-ratingRataRata | +perbaruiPortofolio(dataPortofolio)<br>+hapusPortofolio(indeksPortofolio)<br>+cekKelengkapanPortofolio()<br>+perbaruiProfilPekerja(dataProfil)<br>+cekKelengkapanProfil()<br>+perbaruiTujuanPencairan(tujuanPencairan)<br>+perbaruiRating(ratingRataRata) |
| C03 | PenyediaKerja | -deskripsiPenyedia-ratingRataRata | +perbaruiProfilPenyedia(dataProfil)<br>+perbaruiRating(ratingRataRata) |
| C04 | CustomerService | -hakAkses | +cekHakAkses(aksi) |
| C14 | Notifikasi | -idNotifikasi-idPenerima-pesan-sudahDibaca-waktuKirim | +tandaiDibaca() |
| C16 | PenggunaUI | — | +tampilkanFormRegistrasi()<br>+tampilkanFormLogin()<br>+tampilkanProfil()<br>+tampilkanFormVerifikasi() |
| C17 | TenagaKerjaUI | — | +tampilkanFormProfilPekerja()<br>+tampilkanDaftarPortofolio()<br>+tampilkanFormPortofolio()<br>+tampilkanPilihanPortofolio()<br>+tampilkanRiwayatPekerjaan() |
| C18 | PenyediaKerjaUI | — | +tampilkanFormProfilPenyedia()<br>+tampilkanDashboardPenyedia() |
| C19 | CustomerServiceUI | — | +tampilkanAntreanVerifikasi()<br>+tampilkanDashboardKeluhan() |
| C29 | NotifikasiUI | — | +tampilkanNotifikasi() |
| C31 | PenggunaController | — | +prosesRegistrasi(dataRegistrasi)<br>+prosesLogin(email, password)<br>+simpanProfil(idPengguna, dataProfil)<br>+ajukanVerifikasi(idPengguna, fotoKtpUrl)<br>+validasiBerkas(berkas, jenisBerkas) |
| C32 | TenagaKerjaController | — | +simpanProfilPekerja(idPengguna, dataProfil)<br>+simpanPortofolio(idTenagaKerja, dataPortofolio)<br>+hapusPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiPortofolio(idTenagaKerja, indeksPortofolio)<br>+ambilRingkasanPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiKelayakanMelamar(idTenagaKerja) |
| C33 | PenyediaKerjaController | — | +simpanProfilPenyedia(idPengguna, dataProfil)<br>+validasiKelayakanPublikasi(idPenyediaKerja) |
| C34 | CustomerServiceController | — | +putuskanVerifikasi(idPengguna, keputusan, alasan)<br>+otorisasiPetugas(idPetugas, aksi) |
| C44 | NotifikasiController | — | +kirimNotifikasi(idPenerima, pesan)<br>+tandaiDibaca(idNotifikasi) |

### 5.2.3 Use Case UC03

**Nama Use Case:** Mengelola Lowongan Pekerjaan

#### Identifikasi Kelas

| ID Kelas | Nama Kelas | Deskripsi Kelas |
| --- | --- | --- |
| C01 | Pengguna | Entitas abstrak akun; identitas dan status verifikasi digunakan bersama oleh kedua peran publik. Akun CS disediakan internal. |
| C03 | PenyediaKerja | Turunan Pengguna yang memublikasikan lowongan dan membayar tagihan per pekerja. |
| C05 | LowonganPekerjaan | Kebutuhan tenaga kerja dalam tepat satu bidang, dengan kuota dan tarif awal per pekerja. |
| C16 | PenggunaUI | Antarmuka untuk Pengguna; hanya menangani masukan dan penyajian informasi. |
| C18 | PenyediaKerjaUI | Antarmuka untuk PenyediaKerja; hanya menangani masukan dan penyajian informasi. |
| C20 | LowonganPekerjaanUI | Antarmuka untuk LowonganPekerjaan; hanya menangani masukan dan penyajian informasi. |
| C31 | PenggunaController | Pengendali alur Pengguna; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C33 | PenyediaKerjaController | Pengendali alur PenyediaKerja; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C35 | LowonganPekerjaanController | Pengendali alur LowonganPekerjaan; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |

#### Diagram Kelas

<p align="center">
<img alt="Class Diagram UC03" src="./assets/diagram/Diagram uc/class-diagram-uc03.png" width="70%">
</p>

<p align="center"><i>Gambar 4. Diagram Kelas Use Case UC03</i></p>
<br>

| ID Kelas | Nama Kelas | Atribut | Metode/Operasi |
| --- | --- | --- | --- |
| C01 | Pengguna | -idPengguna-nama-email-passwordHash-tanggalLahir-nomorTelepon-peran-fotoKtpUrl-statusVerifikasi-alasanPenolakan-waktuPengajuanVerifikasi-waktuVerifikasi-idPemeriksa | +hitungUsia()<br>+perbaruiProfil(dataProfil)<br>+ajukanVerifikasi(fotoKtpUrl)<br>+perbaruiStatusVerifikasi(statusVerifikasi, alasanPenolakan, idPemeriksa)<br>+cekTerverifikasi() |
| C03 | PenyediaKerja | -deskripsiPenyedia-ratingRataRata | +perbaruiProfilPenyedia(dataProfil)<br>+perbaruiRating(ratingRataRata) |
| C05 | LowonganPekerjaan | -idLowongan-idPenyediaKerja-judul-deskripsi-bidangPekerjaan-keterampilan-kuota-tarifAwal-modeKerja-lokasi-jenisJadwal-waktuMulai-waktuSelesai-tenggatHasil-batasPengajuan-statusLowongan | +cekTerbuka(waktuSekarang)<br>+hitungSisaKuota(jumlahPenugasan)<br>+perbaruiStatusLowongan(statusLowongan)<br>+perbaruiLowongan(dataLowongan) |
| C16 | PenggunaUI | — | +tampilkanFormRegistrasi()<br>+tampilkanFormLogin()<br>+tampilkanProfil()<br>+tampilkanFormVerifikasi() |
| C18 | PenyediaKerjaUI | — | +tampilkanFormProfilPenyedia()<br>+tampilkanDashboardPenyedia() |
| C20 | LowonganPekerjaanUI | — | +tampilkanFormLowongan()<br>+tampilkanDaftarLowongan()<br>+tampilkanDetailLowongan() |
| C31 | PenggunaController | — | +prosesRegistrasi(dataRegistrasi)<br>+prosesLogin(email, password)<br>+simpanProfil(idPengguna, dataProfil)<br>+ajukanVerifikasi(idPengguna, fotoKtpUrl)<br>+validasiBerkas(berkas, jenisBerkas) |
| C33 | PenyediaKerjaController | — | +simpanProfilPenyedia(idPengguna, dataProfil)<br>+validasiKelayakanPublikasi(idPenyediaKerja) |
| C35 | LowonganPekerjaanController | — | +buatLowongan(idPenyediaKerja, dataLowongan)<br>+ubahLowongan(idLowongan, dataLowongan)<br>+cariLowongan(filter)<br>+validasiDataLowongan(dataLowongan)<br>+perbaruiKetersediaan(idLowongan) |

### 5.2.4 Use Case UC04

**Nama Use Case:** Mencari Lowongan Pekerjaan

#### Identifikasi Kelas

| ID Kelas | Nama Kelas | Deskripsi Kelas |
| --- | --- | --- |
| C02 | TenagaKerja | Turunan Pengguna yang menyimpan keahlian, tujuan pencairan, rating, dan atribut portofolio berupa daftar judul, deskripsi, bidang pekerjaan, serta foto atau tautan bukti pengalaman. |
| C05 | LowonganPekerjaan | Kebutuhan tenaga kerja dalam tepat satu bidang, dengan kuota dan tarif awal per pekerja. |
| C17 | TenagaKerjaUI | Antarmuka profil pekerja, pengelolaan dan pemilihan portofolio, serta riwayat pekerjaan. |
| C20 | LowonganPekerjaanUI | Antarmuka untuk LowonganPekerjaan; hanya menangani masukan dan penyajian informasi. |
| C32 | TenagaKerjaController | Pengendali profil dan atribut portofolio pekerja, termasuk validasi kepemilikan, kelengkapan, dan kelayakan melamar. |
| C35 | LowonganPekerjaanController | Pengendali alur LowonganPekerjaan; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |

#### Diagram Kelas

<p align="center">
<img alt="Class Diagram UC04" src="./assets/diagram/Diagram uc/class-diagram-uc04.png" width="70%">
</p>

<p align="center"><i>Gambar 5. Diagram Kelas Use Case UC04</i></p>
<br>

| ID Kelas | Nama Kelas | Atribut | Metode/Operasi |
| --- | --- | --- | --- |
| C02 | TenagaKerja | -portofolio-keahlian-ringkasanProfil-tujuanPencairan-ratingRataRata | +perbaruiPortofolio(dataPortofolio)<br>+hapusPortofolio(indeksPortofolio)<br>+cekKelengkapanPortofolio()<br>+perbaruiProfilPekerja(dataProfil)<br>+cekKelengkapanProfil()<br>+perbaruiTujuanPencairan(tujuanPencairan)<br>+perbaruiRating(ratingRataRata) |
| C05 | LowonganPekerjaan | -idLowongan-idPenyediaKerja-judul-deskripsi-bidangPekerjaan-keterampilan-kuota-tarifAwal-modeKerja-lokasi-jenisJadwal-waktuMulai-waktuSelesai-tenggatHasil-batasPengajuan-statusLowongan | +cekTerbuka(waktuSekarang)<br>+hitungSisaKuota(jumlahPenugasan)<br>+perbaruiStatusLowongan(statusLowongan)<br>+perbaruiLowongan(dataLowongan) |
| C17 | TenagaKerjaUI | — | +tampilkanFormProfilPekerja()<br>+tampilkanDaftarPortofolio()<br>+tampilkanFormPortofolio()<br>+tampilkanPilihanPortofolio()<br>+tampilkanRiwayatPekerjaan() |
| C20 | LowonganPekerjaanUI | — | +tampilkanFormLowongan()<br>+tampilkanDaftarLowongan()<br>+tampilkanDetailLowongan() |
| C32 | TenagaKerjaController | — | +simpanProfilPekerja(idPengguna, dataProfil)<br>+simpanPortofolio(idTenagaKerja, dataPortofolio)<br>+hapusPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiPortofolio(idTenagaKerja, indeksPortofolio)<br>+ambilRingkasanPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiKelayakanMelamar(idTenagaKerja) |
| C35 | LowonganPekerjaanController | — | +buatLowongan(idPenyediaKerja, dataLowongan)<br>+ubahLowongan(idLowongan, dataLowongan)<br>+cariLowongan(filter)<br>+validasiDataLowongan(dataLowongan)<br>+perbaruiKetersediaan(idLowongan) |

### 5.2.5 Use Case UC05

**Nama Use Case:** Mengajukan dan Mengelola Penawaran Pekerjaan

#### Identifikasi Kelas

| ID Kelas | Nama Kelas | Deskripsi Kelas |
| --- | --- | --- |
| C01 | Pengguna | Entitas abstrak akun; identitas dan status verifikasi digunakan bersama oleh kedua peran publik. Akun CS disediakan internal. |
| C02 | TenagaKerja | Turunan Pengguna yang menyimpan keahlian, tujuan pencairan, rating, dan atribut portofolio berupa daftar judul, deskripsi, bidang pekerjaan, serta foto atau tautan bukti pengalaman. |
| C05 | LowonganPekerjaan | Kebutuhan tenaga kerja dalam tepat satu bidang, dengan kuota dan tarif awal per pekerja. |
| C06 | PengajuanPenawaran | Penawaran pekerja pada lowongan; menyimpan nominal, portofolio saat pengajuan, serta riwayat keputusan. |
| C07 | TransaksiPekerjaan | Kesepakatan pelaksanaan pekerjaan oleh satu pekerja yang penawarannya diterima, mencakup upah, jadwal, ruang lingkup, dan status pengerjaan. |
| C14 | Notifikasi | Pesan kepada pengguna tentang verifikasi, penawaran, pekerjaan, pembayaran, atau sengketa. |
| C16 | PenggunaUI | Antarmuka untuk Pengguna; hanya menangani masukan dan penyajian informasi. |
| C17 | TenagaKerjaUI | Antarmuka profil pekerja, pengelolaan dan pemilihan portofolio, serta riwayat pekerjaan. |
| C20 | LowonganPekerjaanUI | Antarmuka untuk LowonganPekerjaan; hanya menangani masukan dan penyajian informasi. |
| C21 | PengajuanPenawaranUI | Antarmuka untuk PengajuanPenawaran; hanya menangani masukan dan penyajian informasi. |
| C22 | TransaksiPekerjaanUI | Antarmuka untuk TransaksiPekerjaan; hanya menangani masukan dan penyajian informasi. |
| C29 | NotifikasiUI | Antarmuka untuk Notifikasi; hanya menangani masukan dan penyajian informasi. |
| C31 | PenggunaController | Pengendali alur Pengguna; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C32 | TenagaKerjaController | Pengendali profil dan atribut portofolio pekerja, termasuk validasi kepemilikan, kelengkapan, dan kelayakan melamar. |
| C35 | LowonganPekerjaanController | Pengendali alur LowonganPekerjaan; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C36 | PengajuanPenawaranController | Pengendali alur PengajuanPenawaran; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C37 | TransaksiPekerjaanController | Pengendali alur TransaksiPekerjaan; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C44 | NotifikasiController | Pengendali alur Notifikasi; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |

#### Diagram Kelas

<p align="center">
<img alt="Class Diagram UC05" src="./assets/diagram/Diagram uc/class-diagram-uc05.png" width="70%">
</p>

<p align="center"><i>Gambar 6. Diagram Kelas Use Case UC05</i></p>
<br>

| ID Kelas | Nama Kelas | Atribut | Metode/Operasi |
| --- | --- | --- | --- |
| C01 | Pengguna | -idPengguna-nama-email-passwordHash-tanggalLahir-nomorTelepon-peran-fotoKtpUrl-statusVerifikasi-alasanPenolakan-waktuPengajuanVerifikasi-waktuVerifikasi-idPemeriksa | +hitungUsia()<br>+perbaruiProfil(dataProfil)<br>+ajukanVerifikasi(fotoKtpUrl)<br>+perbaruiStatusVerifikasi(statusVerifikasi, alasanPenolakan, idPemeriksa)<br>+cekTerverifikasi() |
| C02 | TenagaKerja | -portofolio-keahlian-ringkasanProfil-tujuanPencairan-ratingRataRata | +perbaruiPortofolio(dataPortofolio)<br>+hapusPortofolio(indeksPortofolio)<br>+cekKelengkapanPortofolio()<br>+perbaruiProfilPekerja(dataProfil)<br>+cekKelengkapanProfil()<br>+perbaruiTujuanPencairan(tujuanPencairan)<br>+perbaruiRating(ratingRataRata) |
| C05 | LowonganPekerjaan | -idLowongan-idPenyediaKerja-judul-deskripsi-bidangPekerjaan-keterampilan-kuota-tarifAwal-modeKerja-lokasi-jenisJadwal-waktuMulai-waktuSelesai-tenggatHasil-batasPengajuan-statusLowongan | +cekTerbuka(waktuSekarang)<br>+hitungSisaKuota(jumlahPenugasan)<br>+perbaruiStatusLowongan(statusLowongan)<br>+perbaruiLowongan(dataLowongan) |
| C06 | PengajuanPenawaran | -idPenawaran-idLowongan-idTenagaKerja-nominalPenawaran-pesanPenawaran-pengalamanTerkait-ringkasanPortofolio-statusPenawaran-alasanPembatalan-waktuPengajuan-waktuPerubahan | +ubahPenawaran(dataPenawaran)<br>+tarikPenawaran()<br>+terimaPenawaran()<br>+tolakPenawaran()<br>+batalkanKarenaJadwal() |
| C07 | TransaksiPekerjaan | -idTransaksi-idPenawaran-idLowongan-idTenagaKerja-idPenyediaKerja-upahDisepakati-deskripsiDisepakati-modeKerja-lokasi-jenisJadwal-waktuMulai-waktuSelesai-tenggatHasil-statusPekerjaan-danaDitahanSengketa-catatanRevisi | +mulaiPekerjaan()<br>+serahkanHasil()<br>+mintaRevisi(catatanRevisi)<br>+setujuiHasil()<br>+batalkanPekerjaan(alasan)<br>+aturPenahananDana(ditahan) |
| C14 | Notifikasi | -idNotifikasi-idPenerima-pesan-sudahDibaca-waktuKirim | +tandaiDibaca() |
| C16 | PenggunaUI | — | +tampilkanFormRegistrasi()<br>+tampilkanFormLogin()<br>+tampilkanProfil()<br>+tampilkanFormVerifikasi() |
| C17 | TenagaKerjaUI | — | +tampilkanFormProfilPekerja()<br>+tampilkanDaftarPortofolio()<br>+tampilkanFormPortofolio()<br>+tampilkanPilihanPortofolio()<br>+tampilkanRiwayatPekerjaan() |
| C20 | LowonganPekerjaanUI | — | +tampilkanFormLowongan()<br>+tampilkanDaftarLowongan()<br>+tampilkanDetailLowongan() |
| C21 | PengajuanPenawaranUI | — | +tampilkanFormPenawaran()<br>+tampilkanDaftarPelamar()<br>+tampilkanRiwayatPenawaran() |
| C22 | TransaksiPekerjaanUI | — | +tampilkanDetailTransaksi()<br>+tampilkanKonfirmasiPenyelesaian()<br>+tampilkanFormRevisi() |
| C29 | NotifikasiUI | — | +tampilkanNotifikasi() |
| C31 | PenggunaController | — | +prosesRegistrasi(dataRegistrasi)<br>+prosesLogin(email, password)<br>+simpanProfil(idPengguna, dataProfil)<br>+ajukanVerifikasi(idPengguna, fotoKtpUrl)<br>+validasiBerkas(berkas, jenisBerkas) |
| C32 | TenagaKerjaController | — | +simpanProfilPekerja(idPengguna, dataProfil)<br>+simpanPortofolio(idTenagaKerja, dataPortofolio)<br>+hapusPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiPortofolio(idTenagaKerja, indeksPortofolio)<br>+ambilRingkasanPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiKelayakanMelamar(idTenagaKerja) |
| C35 | LowonganPekerjaanController | — | +buatLowongan(idPenyediaKerja, dataLowongan)<br>+ubahLowongan(idLowongan, dataLowongan)<br>+cariLowongan(filter)<br>+validasiDataLowongan(dataLowongan)<br>+perbaruiKetersediaan(idLowongan) |
| C36 | PengajuanPenawaranController | — | +ajukanPenawaran(idTenagaKerja, idLowongan, dataPenawaran)<br>+ubahPenawaran(idPenawaran, dataPenawaran)<br>+tarikPenawaran(idPenawaran)<br>+tolakPenawaran(idPenawaran)<br>+terimaPenawaran(idPenawaran)<br>+batalkanPenawaranKonflik(idTenagaKerja, idTransaksi) |
| C37 | TransaksiPekerjaanController | — | +buatTransaksi(idPenawaran)<br>+cekKonflikJadwal(idTenagaKerja, jadwal)<br>+mulaiPekerjaan(idTransaksi)<br>+serahkanHasil(idTransaksi)<br>+mintaRevisi(idTransaksi, catatanRevisi)<br>+setujuiHasil(idTransaksi)<br>+batalkanSebelumPembayaran(idTransaksi, alasan)<br>+aturPenahananDana(idTransaksi, ditahan) |
| C44 | NotifikasiController | — | +kirimNotifikasi(idPenerima, pesan)<br>+tandaiDibaca(idNotifikasi) |

### 5.2.6 Use Case UC06

**Nama Use Case:** Memilih Tenaga Kerja

#### Identifikasi Kelas

| ID Kelas | Nama Kelas | Deskripsi Kelas |
| --- | --- | --- |
| C02 | TenagaKerja | Turunan Pengguna yang menyimpan keahlian, tujuan pencairan, rating, dan atribut portofolio berupa daftar judul, deskripsi, bidang pekerjaan, serta foto atau tautan bukti pengalaman. |
| C03 | PenyediaKerja | Turunan Pengguna yang memublikasikan lowongan dan membayar tagihan per pekerja. |
| C05 | LowonganPekerjaan | Kebutuhan tenaga kerja dalam tepat satu bidang, dengan kuota dan tarif awal per pekerja. |
| C06 | PengajuanPenawaran | Penawaran pekerja pada lowongan; menyimpan nominal, portofolio saat pengajuan, serta riwayat keputusan. |
| C07 | TransaksiPekerjaan | Kesepakatan pelaksanaan pekerjaan oleh satu pekerja yang penawarannya diterima, mencakup upah, jadwal, ruang lingkup, dan status pengerjaan. |
| C09 | TagihanPembayaran | Invoice per penugasan berisi upah yang disetujui dan biaya admin tambahan. |
| C14 | Notifikasi | Pesan kepada pengguna tentang verifikasi, penawaran, pekerjaan, pembayaran, atau sengketa. |
| C17 | TenagaKerjaUI | Antarmuka profil pekerja, pengelolaan dan pemilihan portofolio, serta riwayat pekerjaan. |
| C18 | PenyediaKerjaUI | Antarmuka untuk PenyediaKerja; hanya menangani masukan dan penyajian informasi. |
| C20 | LowonganPekerjaanUI | Antarmuka untuk LowonganPekerjaan; hanya menangani masukan dan penyajian informasi. |
| C21 | PengajuanPenawaranUI | Antarmuka untuk PengajuanPenawaran; hanya menangani masukan dan penyajian informasi. |
| C22 | TransaksiPekerjaanUI | Antarmuka untuk TransaksiPekerjaan; hanya menangani masukan dan penyajian informasi. |
| C24 | TagihanPembayaranUI | Antarmuka untuk TagihanPembayaran; hanya menangani masukan dan penyajian informasi. |
| C29 | NotifikasiUI | Antarmuka untuk Notifikasi; hanya menangani masukan dan penyajian informasi. |
| C32 | TenagaKerjaController | Pengendali profil dan atribut portofolio pekerja, termasuk validasi kepemilikan, kelengkapan, dan kelayakan melamar. |
| C33 | PenyediaKerjaController | Pengendali alur PenyediaKerja; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C35 | LowonganPekerjaanController | Pengendali alur LowonganPekerjaan; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C36 | PengajuanPenawaranController | Pengendali alur PengajuanPenawaran; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C37 | TransaksiPekerjaanController | Pengendali alur TransaksiPekerjaan; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C39 | TagihanPembayaranController | Pengendali alur TagihanPembayaran; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C44 | NotifikasiController | Pengendali alur Notifikasi; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |

#### Diagram Kelas

<p align="center">
<img alt="Class Diagram UC06" src="./assets/diagram/Diagram uc/class-diagram-uc06.png" width="70%">
</p>
<p align="center">
<i>Gambar 7. Diagram Kelas Use Case UC06</i>
</p>
<br>

| ID Kelas | Nama Kelas | Atribut | Metode/Operasi |
| --- | --- | --- | --- |
| C02 | TenagaKerja | -portofolio-keahlian-ringkasanProfil-tujuanPencairan-ratingRataRata | +perbaruiPortofolio(dataPortofolio)<br>+hapusPortofolio(indeksPortofolio)<br>+cekKelengkapanPortofolio()<br>+perbaruiProfilPekerja(dataProfil)<br>+cekKelengkapanProfil()<br>+perbaruiTujuanPencairan(tujuanPencairan)<br>+perbaruiRating(ratingRataRata) |
| C03 | PenyediaKerja | -deskripsiPenyedia-ratingRataRata | +perbaruiProfilPenyedia(dataProfil)<br>+perbaruiRating(ratingRataRata) |
| C05 | LowonganPekerjaan | -idLowongan-idPenyediaKerja-judul-deskripsi-bidangPekerjaan-keterampilan-kuota-tarifAwal-modeKerja-lokasi-jenisJadwal-waktuMulai-waktuSelesai-tenggatHasil-batasPengajuan-statusLowongan | +cekTerbuka(waktuSekarang)<br>+hitungSisaKuota(jumlahPenugasan)<br>+perbaruiStatusLowongan(statusLowongan)<br>+perbaruiLowongan(dataLowongan) |
| C06 | PengajuanPenawaran | -idPenawaran-idLowongan-idTenagaKerja-nominalPenawaran-pesanPenawaran-pengalamanTerkait-ringkasanPortofolio-statusPenawaran-alasanPembatalan-waktuPengajuan-waktuPerubahan | +ubahPenawaran(dataPenawaran)<br>+tarikPenawaran()<br>+terimaPenawaran()<br>+tolakPenawaran()<br>+batalkanKarenaJadwal() |
| C07 | TransaksiPekerjaan | -idTransaksi-idPenawaran-idLowongan-idTenagaKerja-idPenyediaKerja-upahDisepakati-deskripsiDisepakati-modeKerja-lokasi-jenisJadwal-waktuMulai-waktuSelesai-tenggatHasil-statusPekerjaan-danaDitahanSengketa-catatanRevisi | +mulaiPekerjaan()<br>+serahkanHasil()<br>+mintaRevisi(catatanRevisi)<br>+setujuiHasil()<br>+batalkanPekerjaan(alasan)<br>+aturPenahananDana(ditahan) |
| C09 | TagihanPembayaran | -idTagihan-idTransaksi-upahDisepakati-biayaAdmin-totalBayar-statusPembayaran-referensiGateway-waktuKedaluwarsa | +hitungTotalBayar()<br>+perbaruiStatusPembayaran(statusPembayaran)<br>+cekKedaluwarsa(waktuSekarang) |
| C14 | Notifikasi | -idNotifikasi-idPenerima-pesan-sudahDibaca-waktuKirim | +tandaiDibaca() |
| C17 | TenagaKerjaUI | — | +tampilkanFormProfilPekerja()<br>+tampilkanDaftarPortofolio()<br>+tampilkanFormPortofolio()<br>+tampilkanPilihanPortofolio()<br>+tampilkanRiwayatPekerjaan() |
| C18 | PenyediaKerjaUI | — | +tampilkanFormProfilPenyedia()<br>+tampilkanDashboardPenyedia() |
| C20 | LowonganPekerjaanUI | — | +tampilkanFormLowongan()<br>+tampilkanDaftarLowongan()<br>+tampilkanDetailLowongan() |
| C21 | PengajuanPenawaranUI | — | +tampilkanFormPenawaran()<br>+tampilkanDaftarPelamar()<br>+tampilkanRiwayatPenawaran() |
| C22 | TransaksiPekerjaanUI | — | +tampilkanDetailTransaksi()<br>+tampilkanKonfirmasiPenyelesaian()<br>+tampilkanFormRevisi() |
| C24 | TagihanPembayaranUI | — | +tampilkanTagihan()<br>+tampilkanStatusPembayaran() |
| C29 | NotifikasiUI | — | +tampilkanNotifikasi() |
| C32 | TenagaKerjaController | — | +simpanProfilPekerja(idPengguna, dataProfil)<br>+simpanPortofolio(idTenagaKerja, dataPortofolio)<br>+hapusPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiPortofolio(idTenagaKerja, indeksPortofolio)<br>+ambilRingkasanPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiKelayakanMelamar(idTenagaKerja) |
| C33 | PenyediaKerjaController | — | +simpanProfilPenyedia(idPengguna, dataProfil)<br>+validasiKelayakanPublikasi(idPenyediaKerja) |
| C35 | LowonganPekerjaanController | — | +buatLowongan(idPenyediaKerja, dataLowongan)<br>+ubahLowongan(idLowongan, dataLowongan)<br>+cariLowongan(filter)<br>+validasiDataLowongan(dataLowongan)<br>+perbaruiKetersediaan(idLowongan) |
| C36 | PengajuanPenawaranController | — | +ajukanPenawaran(idTenagaKerja, idLowongan, dataPenawaran)<br>+ubahPenawaran(idPenawaran, dataPenawaran)<br>+tarikPenawaran(idPenawaran)<br>+tolakPenawaran(idPenawaran)<br>+terimaPenawaran(idPenawaran)<br>+batalkanPenawaranKonflik(idTenagaKerja, idTransaksi) |
| C37 | TransaksiPekerjaanController | — | +buatTransaksi(idPenawaran)<br>+cekKonflikJadwal(idTenagaKerja, jadwal)<br>+mulaiPekerjaan(idTransaksi)<br>+serahkanHasil(idTransaksi)<br>+mintaRevisi(idTransaksi, catatanRevisi)<br>+setujuiHasil(idTransaksi)<br>+batalkanSebelumPembayaran(idTransaksi, alasan)<br>+aturPenahananDana(idTransaksi, ditahan) |
| C39 | TagihanPembayaranController | — | +terbitkanTagihan(idTransaksi, biayaAdmin)<br>+prosesPembayaran(idTagihan, metodePembayaran)<br>+tanganiKedaluwarsa(idTagihan)<br>+prosesRefund(idTagihan) |
| C44 | NotifikasiController | — | +kirimNotifikasi(idPenerima, pesan)<br>+tandaiDibaca(idNotifikasi) |

### 5.2.7 Use Case UC07

**Nama Use Case:** Melakukan Pembayaran Pekerjaan

#### Identifikasi Kelas

| ID Kelas | Nama Kelas | Deskripsi Kelas |
| --- | --- | --- |
| C03 | PenyediaKerja | Turunan Pengguna yang memublikasikan lowongan dan membayar tagihan per pekerja. |
| C05 | LowonganPekerjaan | Kebutuhan tenaga kerja dalam tepat satu bidang, dengan kuota dan tarif awal per pekerja. |
| C06 | PengajuanPenawaran | Penawaran pekerja pada lowongan; menyimpan nominal, portofolio saat pengajuan, serta riwayat keputusan. |
| C07 | TransaksiPekerjaan | Kesepakatan pelaksanaan pekerjaan oleh satu pekerja yang penawarannya diterima, mencakup upah, jadwal, ruang lingkup, dan status pengerjaan. |
| C09 | TagihanPembayaran | Invoice per penugasan berisi upah yang disetujui dan biaya admin tambahan. |
| C14 | Notifikasi | Pesan kepada pengguna tentang verifikasi, penawaran, pekerjaan, pembayaran, atau sengketa. |
| C15 | PaymentGateway | Representasi integrasi layanan pembayaran eksternal. Bukan penyimpan dana milik platform; UI dan Controller dipertahankan mengikuti struktur asistensi. |
| C18 | PenyediaKerjaUI | Antarmuka untuk PenyediaKerja; hanya menangani masukan dan penyajian informasi. |
| C20 | LowonganPekerjaanUI | Antarmuka untuk LowonganPekerjaan; hanya menangani masukan dan penyajian informasi. |
| C21 | PengajuanPenawaranUI | Antarmuka untuk PengajuanPenawaran; hanya menangani masukan dan penyajian informasi. |
| C22 | TransaksiPekerjaanUI | Antarmuka untuk TransaksiPekerjaan; hanya menangani masukan dan penyajian informasi. |
| C24 | TagihanPembayaranUI | Antarmuka untuk TagihanPembayaran; hanya menangani masukan dan penyajian informasi. |
| C29 | NotifikasiUI | Antarmuka untuk Notifikasi; hanya menangani masukan dan penyajian informasi. |
| C30 | PaymentGatewayUI | Antarmuka untuk PaymentGateway; hanya menangani masukan dan penyajian informasi. |
| C33 | PenyediaKerjaController | Pengendali alur PenyediaKerja; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C35 | LowonganPekerjaanController | Pengendali alur LowonganPekerjaan; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C36 | PengajuanPenawaranController | Pengendali alur PengajuanPenawaran; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C37 | TransaksiPekerjaanController | Pengendali alur TransaksiPekerjaan; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C39 | TagihanPembayaranController | Pengendali alur TagihanPembayaran; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C44 | NotifikasiController | Pengendali alur Notifikasi; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C45 | PaymentGatewayController | Pengendali alur PaymentGateway; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |

#### Diagram Kelas

<p align="center">
<img alt="Class Diagram UC07" src="./assets/diagram/Diagram uc/class-diagram-uc07.png" width="70%">
</p>
<p align="center">
<i>Gambar 8. Diagram Kelas Use Case UC07</i>
</p>
<br>

| ID Kelas | Nama Kelas | Atribut | Metode/Operasi |
| --- | --- | --- | --- |
| C03 | PenyediaKerja | -deskripsiPenyedia-ratingRataRata | +perbaruiProfilPenyedia(dataProfil)<br>+perbaruiRating(ratingRataRata) |
| C05 | LowonganPekerjaan | -idLowongan-idPenyediaKerja-judul-deskripsi-bidangPekerjaan-keterampilan-kuota-tarifAwal-modeKerja-lokasi-jenisJadwal-waktuMulai-waktuSelesai-tenggatHasil-batasPengajuan-statusLowongan | +cekTerbuka(waktuSekarang)<br>+hitungSisaKuota(jumlahPenugasan)<br>+perbaruiStatusLowongan(statusLowongan)<br>+perbaruiLowongan(dataLowongan) |
| C06 | PengajuanPenawaran | -idPenawaran-idLowongan-idTenagaKerja-nominalPenawaran-pesanPenawaran-pengalamanTerkait-ringkasanPortofolio-statusPenawaran-alasanPembatalan-waktuPengajuan-waktuPerubahan | +ubahPenawaran(dataPenawaran)<br>+tarikPenawaran()<br>+terimaPenawaran()<br>+tolakPenawaran()<br>+batalkanKarenaJadwal() |
| C07 | TransaksiPekerjaan | -idTransaksi-idPenawaran-idLowongan-idTenagaKerja-idPenyediaKerja-upahDisepakati-deskripsiDisepakati-modeKerja-lokasi-jenisJadwal-waktuMulai-waktuSelesai-tenggatHasil-statusPekerjaan-danaDitahanSengketa-catatanRevisi | +mulaiPekerjaan()<br>+serahkanHasil()<br>+mintaRevisi(catatanRevisi)<br>+setujuiHasil()<br>+batalkanPekerjaan(alasan)<br>+aturPenahananDana(ditahan) |
| C09 | TagihanPembayaran | -idTagihan-idTransaksi-upahDisepakati-biayaAdmin-totalBayar-statusPembayaran-referensiGateway-waktuKedaluwarsa | +hitungTotalBayar()<br>+perbaruiStatusPembayaran(statusPembayaran)<br>+cekKedaluwarsa(waktuSekarang) |
| C14 | Notifikasi | -idNotifikasi-idPenerima-pesan-sudahDibaca-waktuKirim | +tandaiDibaca() |
| C15 | PaymentGateway | -namaPenyedia-lingkungan | +buatInstruksiPembayaran(idTagihan, totalBayar, kunciIdempotensi)<br>+kirimPencairan(idPencairan, nominalPencairan, tujuanPencairan, kunciIdempotensi)<br>+kirimRefund(idTagihan, nominalRefund, kunciIdempotensi)<br>+ambilStatusTransaksi(referensiGateway) |
| C18 | PenyediaKerjaUI | — | +tampilkanFormProfilPenyedia()<br>+tampilkanDashboardPenyedia() |
| C20 | LowonganPekerjaanUI | — | +tampilkanFormLowongan()<br>+tampilkanDaftarLowongan()<br>+tampilkanDetailLowongan() |
| C21 | PengajuanPenawaranUI | — | +tampilkanFormPenawaran()<br>+tampilkanDaftarPelamar()<br>+tampilkanRiwayatPenawaran() |
| C22 | TransaksiPekerjaanUI | — | +tampilkanDetailTransaksi()<br>+tampilkanKonfirmasiPenyelesaian()<br>+tampilkanFormRevisi() |
| C24 | TagihanPembayaranUI | — | +tampilkanTagihan()<br>+tampilkanStatusPembayaran() |
| C29 | NotifikasiUI | — | +tampilkanNotifikasi() |
| C30 | PaymentGatewayUI | — | +tampilkanPilihanPembayaran()<br>+tampilkanInstruksiPembayaran() |
| C33 | PenyediaKerjaController | — | +simpanProfilPenyedia(idPengguna, dataProfil)<br>+validasiKelayakanPublikasi(idPenyediaKerja) |
| C35 | LowonganPekerjaanController | — | +buatLowongan(idPenyediaKerja, dataLowongan)<br>+ubahLowongan(idLowongan, dataLowongan)<br>+cariLowongan(filter)<br>+validasiDataLowongan(dataLowongan)<br>+perbaruiKetersediaan(idLowongan) |
| C36 | PengajuanPenawaranController | — | +ajukanPenawaran(idTenagaKerja, idLowongan, dataPenawaran)<br>+ubahPenawaran(idPenawaran, dataPenawaran)<br>+tarikPenawaran(idPenawaran)<br>+tolakPenawaran(idPenawaran)<br>+terimaPenawaran(idPenawaran)<br>+batalkanPenawaranKonflik(idTenagaKerja, idTransaksi) |
| C37 | TransaksiPekerjaanController | — | +buatTransaksi(idPenawaran)<br>+cekKonflikJadwal(idTenagaKerja, jadwal)<br>+mulaiPekerjaan(idTransaksi)<br>+serahkanHasil(idTransaksi)<br>+mintaRevisi(idTransaksi, catatanRevisi)<br>+setujuiHasil(idTransaksi)<br>+batalkanSebelumPembayaran(idTransaksi, alasan)<br>+aturPenahananDana(idTransaksi, ditahan) |
| C39 | TagihanPembayaranController | — | +terbitkanTagihan(idTransaksi, biayaAdmin)<br>+prosesPembayaran(idTagihan, metodePembayaran)<br>+tanganiKedaluwarsa(idTagihan)<br>+prosesRefund(idTagihan) |
| C44 | NotifikasiController | — | +kirimNotifikasi(idPenerima, pesan)<br>+tandaiDibaca(idNotifikasi) |
| C45 | PaymentGatewayController | — | +buatPembayaran(idTagihan, metodePembayaran)<br>+kirimPencairan(idPencairan)<br>+kirimRefund(idTagihan, nominalRefund)<br>+verifikasiCallback(payload)<br>+prosesCallback(payload)<br>+rekonsiliasiTransaksi(referensiGateway) |

### 5.2.8 Use Case UC08

**Nama Use Case:** Menyerahkan Hasil Pekerjaan

#### Identifikasi Kelas

| ID Kelas | Nama Kelas | Deskripsi Kelas |
| --- | --- | --- |
| C02 | TenagaKerja | Turunan Pengguna yang menyimpan keahlian, tujuan pencairan, rating, dan atribut portofolio berupa daftar judul, deskripsi, bidang pekerjaan, serta foto atau tautan bukti pengalaman. |
| C07 | TransaksiPekerjaan | Kesepakatan pelaksanaan pekerjaan oleh satu pekerja yang penawarannya diterima, mencakup upah, jadwal, ruang lingkup, dan status pengerjaan. |
| C08 | BuktiPenyerahan | Satu versi penyerahan hasil milik satu penugasan; pengiriman ulang setelah revisi membuat versi baru. |
| C14 | Notifikasi | Pesan kepada pengguna tentang verifikasi, penawaran, pekerjaan, pembayaran, atau sengketa. |
| C17 | TenagaKerjaUI | Antarmuka profil pekerja, pengelolaan dan pemilihan portofolio, serta riwayat pekerjaan. |
| C22 | TransaksiPekerjaanUI | Antarmuka untuk TransaksiPekerjaan; hanya menangani masukan dan penyajian informasi. |
| C23 | BuktiPenyerahanUI | Antarmuka untuk BuktiPenyerahan; hanya menangani masukan dan penyajian informasi. |
| C29 | NotifikasiUI | Antarmuka untuk Notifikasi; hanya menangani masukan dan penyajian informasi. |
| C32 | TenagaKerjaController | Pengendali profil dan atribut portofolio pekerja, termasuk validasi kepemilikan, kelengkapan, dan kelayakan melamar. |
| C37 | TransaksiPekerjaanController | Pengendali alur TransaksiPekerjaan; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C38 | BuktiPenyerahanController | Pengendali alur BuktiPenyerahan; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C44 | NotifikasiController | Pengendali alur Notifikasi; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |

#### Diagram Kelas

<p align="center">
<img alt="Class Diagram UC08" src="./assets/diagram/Diagram uc/class-diagram-uc08.png" width="70%">
</p>
<p align="center">
<i>Gambar 9. Diagram Kelas Use Case UC08</i>
</p>
<br>

| ID Kelas | Nama Kelas | Atribut | Metode/Operasi |
| --- | --- | --- | --- |
| C02 | TenagaKerja | -portofolio-keahlian-ringkasanProfil-tujuanPencairan-ratingRataRata | +perbaruiPortofolio(dataPortofolio)<br>+hapusPortofolio(indeksPortofolio)<br>+cekKelengkapanPortofolio()<br>+perbaruiProfilPekerja(dataProfil)<br>+cekKelengkapanProfil()<br>+perbaruiTujuanPencairan(tujuanPencairan)<br>+perbaruiRating(ratingRataRata) |
| C07 | TransaksiPekerjaan | -idTransaksi-idPenawaran-idLowongan-idTenagaKerja-idPenyediaKerja-upahDisepakati-deskripsiDisepakati-modeKerja-lokasi-jenisJadwal-waktuMulai-waktuSelesai-tenggatHasil-statusPekerjaan-danaDitahanSengketa-catatanRevisi | +mulaiPekerjaan()<br>+serahkanHasil()<br>+mintaRevisi(catatanRevisi)<br>+setujuiHasil()<br>+batalkanPekerjaan(alasan)<br>+aturPenahananDana(ditahan) |
| C08 | BuktiPenyerahan | -idPenyerahan-idTransaksi-deskripsiHasil-lampiranUrl-nomorVersi-waktuPengiriman | +catatPenyerahan(dataHasil) |
| C14 | Notifikasi | -idNotifikasi-idPenerima-pesan-sudahDibaca-waktuKirim | +tandaiDibaca() |
| C17 | TenagaKerjaUI | — | +tampilkanFormProfilPekerja()<br>+tampilkanDaftarPortofolio()<br>+tampilkanFormPortofolio()<br>+tampilkanPilihanPortofolio()<br>+tampilkanRiwayatPekerjaan() |
| C22 | TransaksiPekerjaanUI | — | +tampilkanDetailTransaksi()<br>+tampilkanKonfirmasiPenyelesaian()<br>+tampilkanFormRevisi() |
| C23 | BuktiPenyerahanUI | — | +tampilkanFormPenyerahan()<br>+tampilkanBuktiPenyerahan() |
| C29 | NotifikasiUI | — | +tampilkanNotifikasi() |
| C32 | TenagaKerjaController | — | +simpanProfilPekerja(idPengguna, dataProfil)<br>+simpanPortofolio(idTenagaKerja, dataPortofolio)<br>+hapusPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiPortofolio(idTenagaKerja, indeksPortofolio)<br>+ambilRingkasanPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiKelayakanMelamar(idTenagaKerja) |
| C37 | TransaksiPekerjaanController | — | +buatTransaksi(idPenawaran)<br>+cekKonflikJadwal(idTenagaKerja, jadwal)<br>+mulaiPekerjaan(idTransaksi)<br>+serahkanHasil(idTransaksi)<br>+mintaRevisi(idTransaksi, catatanRevisi)<br>+setujuiHasil(idTransaksi)<br>+batalkanSebelumPembayaran(idTransaksi, alasan)<br>+aturPenahananDana(idTransaksi, ditahan) |
| C38 | BuktiPenyerahanController | — | +simpanPenyerahan(idTransaksi, dataHasil)<br>+ambilBuktiPenyerahan(idTransaksi) |
| C44 | NotifikasiController | — | +kirimNotifikasi(idPenerima, pesan)<br>+tandaiDibaca(idNotifikasi) |

### 5.2.9 Use Case UC09

**Nama Use Case:** Memverifikasi Penyelesaian Pekerjaan

#### Identifikasi Kelas

| ID Kelas | Nama Kelas | Deskripsi Kelas |
| --- | --- | --- |
| C03 | PenyediaKerja | Turunan Pengguna yang memublikasikan lowongan dan membayar tagihan per pekerja. |
| C07 | TransaksiPekerjaan | Kesepakatan pelaksanaan pekerjaan oleh satu pekerja yang penawarannya diterima, mencakup upah, jadwal, ruang lingkup, dan status pengerjaan. |
| C08 | BuktiPenyerahan | Satu versi penyerahan hasil milik satu penugasan; pengiriman ulang setelah revisi membuat versi baru. |
| C09 | TagihanPembayaran | Invoice per penugasan berisi upah yang disetujui dan biaya admin tambahan. |
| C10 | PencairanDana | Catatan penyaluran otomatis seluruh upah yang disepakati ke tujuan pembayaran pekerja setelah persetujuan hasil. |
| C14 | Notifikasi | Pesan kepada pengguna tentang verifikasi, penawaran, pekerjaan, pembayaran, atau sengketa. |
| C15 | PaymentGateway | Representasi integrasi layanan pembayaran eksternal. Bukan penyimpan dana milik platform; UI dan Controller dipertahankan mengikuti struktur asistensi. |
| C18 | PenyediaKerjaUI | Antarmuka untuk PenyediaKerja; hanya menangani masukan dan penyajian informasi. |
| C22 | TransaksiPekerjaanUI | Antarmuka untuk TransaksiPekerjaan; hanya menangani masukan dan penyajian informasi. |
| C23 | BuktiPenyerahanUI | Antarmuka untuk BuktiPenyerahan; hanya menangani masukan dan penyajian informasi. |
| C24 | TagihanPembayaranUI | Antarmuka untuk TagihanPembayaran; hanya menangani masukan dan penyajian informasi. |
| C25 | PencairanDanaUI | Antarmuka untuk PencairanDana; hanya menangani masukan dan penyajian informasi. |
| C29 | NotifikasiUI | Antarmuka untuk Notifikasi; hanya menangani masukan dan penyajian informasi. |
| C30 | PaymentGatewayUI | Antarmuka untuk PaymentGateway; hanya menangani masukan dan penyajian informasi. |
| C33 | PenyediaKerjaController | Pengendali alur PenyediaKerja; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C37 | TransaksiPekerjaanController | Pengendali alur TransaksiPekerjaan; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C38 | BuktiPenyerahanController | Pengendali alur BuktiPenyerahan; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C39 | TagihanPembayaranController | Pengendali alur TagihanPembayaran; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C40 | PencairanDanaController | Pengendali alur PencairanDana; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C44 | NotifikasiController | Pengendali alur Notifikasi; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C45 | PaymentGatewayController | Pengendali alur PaymentGateway; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |

#### Diagram Kelas

<p align="center">
<img alt="Class Diagram UC09" src="./assets/diagram/Diagram uc/class-diagram-uc-09.png" width="70%">
</p>
<p align="center">
<i>Gambar 10. Diagram Kelas Use Case UC09</i>
</p>
<br>

| ID Kelas | Nama Kelas | Atribut | Metode/Operasi |
| --- | --- | --- | --- |
| C03 | PenyediaKerja | -deskripsiPenyedia-ratingRataRata | +perbaruiProfilPenyedia(dataProfil)<br>+perbaruiRating(ratingRataRata) |
| C07 | TransaksiPekerjaan | -idTransaksi-idPenawaran-idLowongan-idTenagaKerja-idPenyediaKerja-upahDisepakati-deskripsiDisepakati-modeKerja-lokasi-jenisJadwal-waktuMulai-waktuSelesai-tenggatHasil-statusPekerjaan-danaDitahanSengketa-catatanRevisi | +mulaiPekerjaan()<br>+serahkanHasil()<br>+mintaRevisi(catatanRevisi)<br>+setujuiHasil()<br>+batalkanPekerjaan(alasan)<br>+aturPenahananDana(ditahan) |
| C08 | BuktiPenyerahan | -idPenyerahan-idTransaksi-deskripsiHasil-lampiranUrl-nomorVersi-waktuPengiriman | +catatPenyerahan(dataHasil) |
| C09 | TagihanPembayaran | -idTagihan-idTransaksi-upahDisepakati-biayaAdmin-totalBayar-statusPembayaran-referensiGateway-waktuKedaluwarsa | +hitungTotalBayar()<br>+perbaruiStatusPembayaran(statusPembayaran)<br>+cekKedaluwarsa(waktuSekarang) |
| C10 | PencairanDana | -idPencairan-idTransaksi-nominalPencairan-tujuanPencairan-statusPencairan-referensiGateway-kunciIdempotensi-waktuPermintaan-waktuSelesai | +perbaruiStatusPencairan(statusPencairan) |
| C14 | Notifikasi | -idNotifikasi-idPenerima-pesan-sudahDibaca-waktuKirim | +tandaiDibaca() |
| C15 | PaymentGateway | -namaPenyedia-lingkungan | +buatInstruksiPembayaran(idTagihan, totalBayar, kunciIdempotensi)<br>+kirimPencairan(idPencairan, nominalPencairan, tujuanPencairan, kunciIdempotensi)<br>+kirimRefund(idTagihan, nominalRefund, kunciIdempotensi)<br>+ambilStatusTransaksi(referensiGateway) |
| C18 | PenyediaKerjaUI | — | +tampilkanFormProfilPenyedia()<br>+tampilkanDashboardPenyedia() |
| C22 | TransaksiPekerjaanUI | — | +tampilkanDetailTransaksi()<br>+tampilkanKonfirmasiPenyelesaian()<br>+tampilkanFormRevisi() |
| C23 | BuktiPenyerahanUI | — | +tampilkanFormPenyerahan()<br>+tampilkanBuktiPenyerahan() |
| C24 | TagihanPembayaranUI | — | +tampilkanTagihan()<br>+tampilkanStatusPembayaran() |
| C25 | PencairanDanaUI | — | +tampilkanRiwayatPencairan()<br>+tampilkanStatusPencairan() |
| C29 | NotifikasiUI | — | +tampilkanNotifikasi() |
| C30 | PaymentGatewayUI | — | +tampilkanPilihanPembayaran()<br>+tampilkanInstruksiPembayaran() |
| C33 | PenyediaKerjaController | — | +simpanProfilPenyedia(idPengguna, dataProfil)<br>+validasiKelayakanPublikasi(idPenyediaKerja) |
| C37 | TransaksiPekerjaanController | — | +buatTransaksi(idPenawaran)<br>+cekKonflikJadwal(idTenagaKerja, jadwal)<br>+mulaiPekerjaan(idTransaksi)<br>+serahkanHasil(idTransaksi)<br>+mintaRevisi(idTransaksi, catatanRevisi)<br>+setujuiHasil(idTransaksi)<br>+batalkanSebelumPembayaran(idTransaksi, alasan)<br>+aturPenahananDana(idTransaksi, ditahan) |
| C38 | BuktiPenyerahanController | — | +simpanPenyerahan(idTransaksi, dataHasil)<br>+ambilBuktiPenyerahan(idTransaksi) |
| C39 | TagihanPembayaranController | — | +terbitkanTagihan(idTransaksi, biayaAdmin)<br>+prosesPembayaran(idTagihan, metodePembayaran)<br>+tanganiKedaluwarsa(idTagihan)<br>+prosesRefund(idTagihan) |
| C40 | PencairanDanaController | — | +prosesPencairanOtomatis(idTransaksi)<br>+prosesUlangPencairan(idPencairan)<br>+ambilRiwayatPencairan(idTenagaKerja) |
| C44 | NotifikasiController | — | +kirimNotifikasi(idPenerima, pesan)<br>+tandaiDibaca(idNotifikasi) |
| C45 | PaymentGatewayController | — | +buatPembayaran(idTagihan, metodePembayaran)<br>+kirimPencairan(idPencairan)<br>+kirimRefund(idTagihan, nominalRefund)<br>+verifikasiCallback(payload)<br>+prosesCallback(payload)<br>+rekonsiliasiTransaksi(referensiGateway) |

### 5.2.10 Use Case UC10

**Nama Use Case:** Memantau Pencairan Upah Otomatis

#### Identifikasi Kelas

| ID Kelas | Nama Kelas | Deskripsi Kelas |
| --- | --- | --- |
| C02 | TenagaKerja | Turunan Pengguna yang menyimpan keahlian, tujuan pencairan, rating, dan atribut portofolio berupa daftar judul, deskripsi, bidang pekerjaan, serta foto atau tautan bukti pengalaman. |
| C07 | TransaksiPekerjaan | Kesepakatan pelaksanaan pekerjaan oleh satu pekerja yang penawarannya diterima, mencakup upah, jadwal, ruang lingkup, dan status pengerjaan. |
| C09 | TagihanPembayaran | Invoice per penugasan berisi upah yang disetujui dan biaya admin tambahan. |
| C10 | PencairanDana | Catatan penyaluran otomatis seluruh upah yang disepakati ke tujuan pembayaran pekerja setelah persetujuan hasil. |
| C14 | Notifikasi | Pesan kepada pengguna tentang verifikasi, penawaran, pekerjaan, pembayaran, atau sengketa. |
| C15 | PaymentGateway | Representasi integrasi layanan pembayaran eksternal. Bukan penyimpan dana milik platform; UI dan Controller dipertahankan mengikuti struktur asistensi. |
| C17 | TenagaKerjaUI | Antarmuka profil pekerja, pengelolaan dan pemilihan portofolio, serta riwayat pekerjaan. |
| C22 | TransaksiPekerjaanUI | Antarmuka untuk TransaksiPekerjaan; hanya menangani masukan dan penyajian informasi. |
| C24 | TagihanPembayaranUI | Antarmuka untuk TagihanPembayaran; hanya menangani masukan dan penyajian informasi. |
| C25 | PencairanDanaUI | Antarmuka untuk PencairanDana; hanya menangani masukan dan penyajian informasi. |
| C29 | NotifikasiUI | Antarmuka untuk Notifikasi; hanya menangani masukan dan penyajian informasi. |
| C30 | PaymentGatewayUI | Antarmuka untuk PaymentGateway; hanya menangani masukan dan penyajian informasi. |
| C32 | TenagaKerjaController | Pengendali profil dan atribut portofolio pekerja, termasuk validasi kepemilikan, kelengkapan, dan kelayakan melamar. |
| C37 | TransaksiPekerjaanController | Pengendali alur TransaksiPekerjaan; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C39 | TagihanPembayaranController | Pengendali alur TagihanPembayaran; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C40 | PencairanDanaController | Pengendali alur PencairanDana; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C44 | NotifikasiController | Pengendali alur Notifikasi; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C45 | PaymentGatewayController | Pengendali alur PaymentGateway; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |

#### Diagram Kelas

<p align="center">
<img alt="Class Diagram UC10" src="./assets/diagram/Diagram uc/class-diagram-uc-10.png" width="70%">
</p>
<p align="center">
<i>Gambar 11. Diagram Kelas Use Case UC10</i>
</p>
<br>

| ID Kelas | Nama Kelas | Atribut | Metode/Operasi |
| --- | --- | --- | --- |
| C02 | TenagaKerja | -portofolio-keahlian-ringkasanProfil-tujuanPencairan-ratingRataRata | +perbaruiPortofolio(dataPortofolio)<br>+hapusPortofolio(indeksPortofolio)<br>+cekKelengkapanPortofolio()<br>+perbaruiProfilPekerja(dataProfil)<br>+cekKelengkapanProfil()<br>+perbaruiTujuanPencairan(tujuanPencairan)<br>+perbaruiRating(ratingRataRata) |
| C07 | TransaksiPekerjaan | -idTransaksi-idPenawaran-idLowongan-idTenagaKerja-idPenyediaKerja-upahDisepakati-deskripsiDisepakati-modeKerja-lokasi-jenisJadwal-waktuMulai-waktuSelesai-tenggatHasil-statusPekerjaan-danaDitahanSengketa-catatanRevisi | +mulaiPekerjaan()<br>+serahkanHasil()<br>+mintaRevisi(catatanRevisi)<br>+setujuiHasil()<br>+batalkanPekerjaan(alasan)<br>+aturPenahananDana(ditahan) |
| C09 | TagihanPembayaran | -idTagihan-idTransaksi-upahDisepakati-biayaAdmin-totalBayar-statusPembayaran-referensiGateway-waktuKedaluwarsa | +hitungTotalBayar()<br>+perbaruiStatusPembayaran(statusPembayaran)<br>+cekKedaluwarsa(waktuSekarang) |
| C10 | PencairanDana | -idPencairan-idTransaksi-nominalPencairan-tujuanPencairan-statusPencairan-referensiGateway-kunciIdempotensi-waktuPermintaan-waktuSelesai | +perbaruiStatusPencairan(statusPencairan) |
| C14 | Notifikasi | -idNotifikasi-idPenerima-pesan-sudahDibaca-waktuKirim | +tandaiDibaca() |
| C15 | PaymentGateway | -namaPenyedia-lingkungan | +buatInstruksiPembayaran(idTagihan, totalBayar, kunciIdempotensi)<br>+kirimPencairan(idPencairan, nominalPencairan, tujuanPencairan, kunciIdempotensi)<br>+kirimRefund(idTagihan, nominalRefund, kunciIdempotensi)<br>+ambilStatusTransaksi(referensiGateway) |
| C17 | TenagaKerjaUI | — | +tampilkanFormProfilPekerja()<br>+tampilkanDaftarPortofolio()<br>+tampilkanFormPortofolio()<br>+tampilkanPilihanPortofolio()<br>+tampilkanRiwayatPekerjaan() |
| C22 | TransaksiPekerjaanUI | — | +tampilkanDetailTransaksi()<br>+tampilkanKonfirmasiPenyelesaian()<br>+tampilkanFormRevisi() |
| C24 | TagihanPembayaranUI | — | +tampilkanTagihan()<br>+tampilkanStatusPembayaran() |
| C25 | PencairanDanaUI | — | +tampilkanRiwayatPencairan()<br>+tampilkanStatusPencairan() |
| C29 | NotifikasiUI | — | +tampilkanNotifikasi() |
| C30 | PaymentGatewayUI | — | +tampilkanPilihanPembayaran()<br>+tampilkanInstruksiPembayaran() |
| C32 | TenagaKerjaController | — | +simpanProfilPekerja(idPengguna, dataProfil)<br>+simpanPortofolio(idTenagaKerja, dataPortofolio)<br>+hapusPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiPortofolio(idTenagaKerja, indeksPortofolio)<br>+ambilRingkasanPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiKelayakanMelamar(idTenagaKerja) |
| C37 | TransaksiPekerjaanController | — | +buatTransaksi(idPenawaran)<br>+cekKonflikJadwal(idTenagaKerja, jadwal)<br>+mulaiPekerjaan(idTransaksi)<br>+serahkanHasil(idTransaksi)<br>+mintaRevisi(idTransaksi, catatanRevisi)<br>+setujuiHasil(idTransaksi)<br>+batalkanSebelumPembayaran(idTransaksi, alasan)<br>+aturPenahananDana(idTransaksi, ditahan) |
| C39 | TagihanPembayaranController | — | +terbitkanTagihan(idTransaksi, biayaAdmin)<br>+prosesPembayaran(idTagihan, metodePembayaran)<br>+tanganiKedaluwarsa(idTagihan)<br>+prosesRefund(idTagihan) |
| C40 | PencairanDanaController | — | +prosesPencairanOtomatis(idTransaksi)<br>+prosesUlangPencairan(idPencairan)<br>+ambilRiwayatPencairan(idTenagaKerja) |
| C44 | NotifikasiController | — | +kirimNotifikasi(idPenerima, pesan)<br>+tandaiDibaca(idNotifikasi) |
| C45 | PaymentGatewayController | — | +buatPembayaran(idTagihan, metodePembayaran)<br>+kirimPencairan(idPencairan)<br>+kirimRefund(idTagihan, nominalRefund)<br>+verifikasiCallback(payload)<br>+prosesCallback(payload)<br>+rekonsiliasiTransaksi(referensiGateway) |

### 5.2.11 Use Case UC11

**Nama Use Case:** Memberikan Penilaian Kerja

#### Identifikasi Kelas

| ID Kelas | Nama Kelas | Deskripsi Kelas |
| --- | --- | --- |
| C02 | TenagaKerja | Turunan Pengguna yang menyimpan keahlian, tujuan pencairan, rating, dan atribut portofolio berupa daftar judul, deskripsi, bidang pekerjaan, serta foto atau tautan bukti pengalaman. |
| C03 | PenyediaKerja | Turunan Pengguna yang memublikasikan lowongan dan membayar tagihan per pekerja. |
| C07 | TransaksiPekerjaan | Kesepakatan pelaksanaan pekerjaan oleh satu pekerja yang penawarannya diterima, mencakup upah, jadwal, ruang lingkup, dan status pengerjaan. |
| C11 | UlasanRating | Penilaian satu pemberi kepada satu penerima untuk satu penugasan yang selesai. |
| C17 | TenagaKerjaUI | Antarmuka profil pekerja, pengelolaan dan pemilihan portofolio, serta riwayat pekerjaan. |
| C18 | PenyediaKerjaUI | Antarmuka untuk PenyediaKerja; hanya menangani masukan dan penyajian informasi. |
| C22 | TransaksiPekerjaanUI | Antarmuka untuk TransaksiPekerjaan; hanya menangani masukan dan penyajian informasi. |
| C26 | UlasanRatingUI | Antarmuka untuk UlasanRating; hanya menangani masukan dan penyajian informasi. |
| C32 | TenagaKerjaController | Pengendali profil dan atribut portofolio pekerja, termasuk validasi kepemilikan, kelengkapan, dan kelayakan melamar. |
| C33 | PenyediaKerjaController | Pengendali alur PenyediaKerja; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C37 | TransaksiPekerjaanController | Pengendali alur TransaksiPekerjaan; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C41 | UlasanRatingController | Pengendali alur UlasanRating; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |

#### Diagram Kelas

<p align="center">
<img alt="Class Diagram UC11" src="./assets/diagram/Diagram uc/class-diagram-uc-11.png" width="70%">
</p>
<p align="center">
<i>Gambar 12. Diagram Kelas Use Case UC11</i>
</p>
<br>

| ID Kelas | Nama Kelas | Atribut | Metode/Operasi |
| --- | --- | --- | --- |
| C02 | TenagaKerja | -portofolio-keahlian-ringkasanProfil-tujuanPencairan-ratingRataRata | +perbaruiPortofolio(dataPortofolio)<br>+hapusPortofolio(indeksPortofolio)<br>+cekKelengkapanPortofolio()<br>+perbaruiProfilPekerja(dataProfil)<br>+cekKelengkapanProfil()<br>+perbaruiTujuanPencairan(tujuanPencairan)<br>+perbaruiRating(ratingRataRata) |
| C03 | PenyediaKerja | -deskripsiPenyedia-ratingRataRata | +perbaruiProfilPenyedia(dataProfil)<br>+perbaruiRating(ratingRataRata) |
| C07 | TransaksiPekerjaan | -idTransaksi-idPenawaran-idLowongan-idTenagaKerja-idPenyediaKerja-upahDisepakati-deskripsiDisepakati-modeKerja-lokasi-jenisJadwal-waktuMulai-waktuSelesai-tenggatHasil-statusPekerjaan-danaDitahanSengketa-catatanRevisi | +mulaiPekerjaan()<br>+serahkanHasil()<br>+mintaRevisi(catatanRevisi)<br>+setujuiHasil()<br>+batalkanPekerjaan(alasan)<br>+aturPenahananDana(ditahan) |
| C11 | UlasanRating | -idUlasan-idTransaksi-idPemberi-idPenerima-nilaiRating-isiUlasan-waktuUlasan | +validasiNilaiRating() |
| C17 | TenagaKerjaUI | — | +tampilkanFormProfilPekerja()<br>+tampilkanDaftarPortofolio()<br>+tampilkanFormPortofolio()<br>+tampilkanPilihanPortofolio()<br>+tampilkanRiwayatPekerjaan() |
| C18 | PenyediaKerjaUI | — | +tampilkanFormProfilPenyedia()<br>+tampilkanDashboardPenyedia() |
| C22 | TransaksiPekerjaanUI | — | +tampilkanDetailTransaksi()<br>+tampilkanKonfirmasiPenyelesaian()<br>+tampilkanFormRevisi() |
| C26 | UlasanRatingUI | — | +tampilkanFormUlasan()<br>+tampilkanDaftarUlasan() |
| C32 | TenagaKerjaController | — | +simpanProfilPekerja(idPengguna, dataProfil)<br>+simpanPortofolio(idTenagaKerja, dataPortofolio)<br>+hapusPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiPortofolio(idTenagaKerja, indeksPortofolio)<br>+ambilRingkasanPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiKelayakanMelamar(idTenagaKerja) |
| C33 | PenyediaKerjaController | — | +simpanProfilPenyedia(idPengguna, dataProfil)<br>+validasiKelayakanPublikasi(idPenyediaKerja) |
| C37 | TransaksiPekerjaanController | — | +buatTransaksi(idPenawaran)<br>+cekKonflikJadwal(idTenagaKerja, jadwal)<br>+mulaiPekerjaan(idTransaksi)<br>+serahkanHasil(idTransaksi)<br>+mintaRevisi(idTransaksi, catatanRevisi)<br>+setujuiHasil(idTransaksi)<br>+batalkanSebelumPembayaran(idTransaksi, alasan)<br>+aturPenahananDana(idTransaksi, ditahan) |
| C41 | UlasanRatingController | — | +simpanUlasan(idTransaksi, idPemberi, dataUlasan)<br>+cekUlasanGanda(idTransaksi, idPemberi, idPenerima)<br>+hitungRatingRataRata(idPengguna) |

### 5.2.12 Use Case UC12

**Nama Use Case:** Menangani Keluhan dan Sengketa

#### Identifikasi Kelas

| ID Kelas | Nama Kelas | Deskripsi Kelas |
| --- | --- | --- |
| C01 | Pengguna | Entitas abstrak akun; identitas dan status verifikasi digunakan bersama oleh kedua peran publik. Akun CS disediakan internal. |
| C04 | CustomerService | Turunan Pengguna untuk petugas internal yang memeriksa KTP dan menangani sengketa. |
| C05 | LowonganPekerjaan | Kebutuhan tenaga kerja dalam tepat satu bidang, dengan kuota dan tarif awal per pekerja. |
| C07 | TransaksiPekerjaan | Kesepakatan pelaksanaan pekerjaan oleh satu pekerja yang penawarannya diterima, mencakup upah, jadwal, ruang lingkup, dan status pengerjaan. |
| C09 | TagihanPembayaran | Invoice per penugasan berisi upah yang disetujui dan biaya admin tambahan. |
| C10 | PencairanDana | Catatan penyaluran otomatis seluruh upah yang disepakati ke tujuan pembayaran pekerja setelah persetujuan hasil. |
| C12 | TiketSengketa | Keluhan akun atau sengketa pekerjaan; idTransaksi opsional untuk kendala akun. |
| C13 | RiwayatSengketa | Catatan kronologis tindakan, bukti tambahan, dan perubahan status selama penanganan tiket keluhan. |
| C14 | Notifikasi | Pesan kepada pengguna tentang verifikasi, penawaran, pekerjaan, pembayaran, atau sengketa. |
| C15 | PaymentGateway | Representasi integrasi layanan pembayaran eksternal. Bukan penyimpan dana milik platform; UI dan Controller dipertahankan mengikuti struktur asistensi. |
| C16 | PenggunaUI | Antarmuka untuk Pengguna; hanya menangani masukan dan penyajian informasi. |
| C19 | CustomerServiceUI | Antarmuka untuk CustomerService; hanya menangani masukan dan penyajian informasi. |
| C20 | LowonganPekerjaanUI | Antarmuka untuk LowonganPekerjaan; hanya menangani masukan dan penyajian informasi. |
| C22 | TransaksiPekerjaanUI | Antarmuka untuk TransaksiPekerjaan; hanya menangani masukan dan penyajian informasi. |
| C24 | TagihanPembayaranUI | Antarmuka untuk TagihanPembayaran; hanya menangani masukan dan penyajian informasi. |
| C25 | PencairanDanaUI | Antarmuka untuk PencairanDana; hanya menangani masukan dan penyajian informasi. |
| C27 | TiketSengketaUI | Antarmuka untuk TiketSengketa; hanya menangani masukan dan penyajian informasi. |
| C28 | RiwayatSengketaUI | Antarmuka untuk RiwayatSengketa; hanya menangani masukan dan penyajian informasi. |
| C29 | NotifikasiUI | Antarmuka untuk Notifikasi; hanya menangani masukan dan penyajian informasi. |
| C30 | PaymentGatewayUI | Antarmuka untuk PaymentGateway; hanya menangani masukan dan penyajian informasi. |
| C31 | PenggunaController | Pengendali alur Pengguna; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C34 | CustomerServiceController | Pengendali alur CustomerService; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C35 | LowonganPekerjaanController | Pengendali alur LowonganPekerjaan; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C37 | TransaksiPekerjaanController | Pengendali alur TransaksiPekerjaan; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C39 | TagihanPembayaranController | Pengendali alur TagihanPembayaran; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C40 | PencairanDanaController | Pengendali alur PencairanDana; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C42 | TiketSengketaController | Pengendali alur TiketSengketa; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C43 | RiwayatSengketaController | Pengendali alur RiwayatSengketa; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C44 | NotifikasiController | Pengendali alur Notifikasi; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C45 | PaymentGatewayController | Pengendali alur PaymentGateway; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |

#### Diagram Kelas

<p align="center">
<img alt="Class Diagram UC12" src="./assets/diagram/Diagram uc/class-diagram-uc-12.png" width="70%">
</p>
<p align="center">
<i>Gambar 13. Diagram Kelas Use Case UC12</i>
</p>
<br>

| ID Kelas | Nama Kelas | Atribut | Metode/Operasi |
| --- | --- | --- | --- |
| C01 | Pengguna | -idPengguna-nama-email-passwordHash-tanggalLahir-nomorTelepon-peran-fotoKtpUrl-statusVerifikasi-alasanPenolakan-waktuPengajuanVerifikasi-waktuVerifikasi-idPemeriksa | +hitungUsia()<br>+perbaruiProfil(dataProfil)<br>+ajukanVerifikasi(fotoKtpUrl)<br>+perbaruiStatusVerifikasi(statusVerifikasi, alasanPenolakan, idPemeriksa)<br>+cekTerverifikasi() |
| C04 | CustomerService | -hakAkses | +cekHakAkses(aksi) |
| C05 | LowonganPekerjaan | -idLowongan-idPenyediaKerja-judul-deskripsi-bidangPekerjaan-keterampilan-kuota-tarifAwal-modeKerja-lokasi-jenisJadwal-waktuMulai-waktuSelesai-tenggatHasil-batasPengajuan-statusLowongan | +cekTerbuka(waktuSekarang)<br>+hitungSisaKuota(jumlahPenugasan)<br>+perbaruiStatusLowongan(statusLowongan)<br>+perbaruiLowongan(dataLowongan) |
| C07 | TransaksiPekerjaan | -idTransaksi-idPenawaran-idLowongan-idTenagaKerja-idPenyediaKerja-upahDisepakati-deskripsiDisepakati-modeKerja-lokasi-jenisJadwal-waktuMulai-waktuSelesai-tenggatHasil-statusPekerjaan-danaDitahanSengketa-catatanRevisi | +mulaiPekerjaan()<br>+serahkanHasil()<br>+mintaRevisi(catatanRevisi)<br>+setujuiHasil()<br>+batalkanPekerjaan(alasan)<br>+aturPenahananDana(ditahan) |
| C09 | TagihanPembayaran | -idTagihan-idTransaksi-upahDisepakati-biayaAdmin-totalBayar-statusPembayaran-referensiGateway-waktuKedaluwarsa | +hitungTotalBayar()<br>+perbaruiStatusPembayaran(statusPembayaran)<br>+cekKedaluwarsa(waktuSekarang) |
| C10 | PencairanDana | -idPencairan-idTransaksi-nominalPencairan-tujuanPencairan-statusPencairan-referensiGateway-kunciIdempotensi-waktuPermintaan-waktuSelesai | +perbaruiStatusPencairan(statusPencairan) |
| C12 | TiketSengketa | -idTiket-idTransaksi-idPelapor-idPetugas-kategoriMasalah-deskripsiKeluhan-buktiUrl-statusTiket-keputusan-alasanKeputusan-waktuPembuatan | +perbaruiStatusTiket(statusTiket)<br>+catatKeputusan(keputusan, alasanKeputusan) |
| C13 | RiwayatSengketa | -idRiwayat-idTiket-idPelaku-aktivitas-buktiTambahanUrl-waktuAktivitas | +catatAktivitas(aktivitas, buktiTambahanUrl) |
| C14 | Notifikasi | -idNotifikasi-idPenerima-pesan-sudahDibaca-waktuKirim | +tandaiDibaca() |
| C15 | PaymentGateway | -namaPenyedia-lingkungan | +buatInstruksiPembayaran(idTagihan, totalBayar, kunciIdempotensi)<br>+kirimPencairan(idPencairan, nominalPencairan, tujuanPencairan, kunciIdempotensi)<br>+kirimRefund(idTagihan, nominalRefund, kunciIdempotensi)<br>+ambilStatusTransaksi(referensiGateway) |
| C16 | PenggunaUI | — | +tampilkanFormRegistrasi()<br>+tampilkanFormLogin()<br>+tampilkanProfil()<br>+tampilkanFormVerifikasi() |
| C19 | CustomerServiceUI | — | +tampilkanAntreanVerifikasi()<br>+tampilkanDashboardKeluhan() |
| C20 | LowonganPekerjaanUI | — | +tampilkanFormLowongan()<br>+tampilkanDaftarLowongan()<br>+tampilkanDetailLowongan() |
| C22 | TransaksiPekerjaanUI | — | +tampilkanDetailTransaksi()<br>+tampilkanKonfirmasiPenyelesaian()<br>+tampilkanFormRevisi() |
| C24 | TagihanPembayaranUI | — | +tampilkanTagihan()<br>+tampilkanStatusPembayaran() |
| C25 | PencairanDanaUI | — | +tampilkanRiwayatPencairan()<br>+tampilkanStatusPencairan() |
| C27 | TiketSengketaUI | — | +tampilkanFormKeluhan()<br>+tampilkanDetailTiket() |
| C28 | RiwayatSengketaUI | — | +tampilkanRiwayatSengketa() |
| C29 | NotifikasiUI | — | +tampilkanNotifikasi() |
| C30 | PaymentGatewayUI | — | +tampilkanPilihanPembayaran()<br>+tampilkanInstruksiPembayaran() |
| C31 | PenggunaController | — | +prosesRegistrasi(dataRegistrasi)<br>+prosesLogin(email, password)<br>+simpanProfil(idPengguna, dataProfil)<br>+ajukanVerifikasi(idPengguna, fotoKtpUrl)<br>+validasiBerkas(berkas, jenisBerkas) |
| C34 | CustomerServiceController | — | +putuskanVerifikasi(idPengguna, keputusan, alasan)<br>+otorisasiPetugas(idPetugas, aksi) |
| C35 | LowonganPekerjaanController | — | +buatLowongan(idPenyediaKerja, dataLowongan)<br>+ubahLowongan(idLowongan, dataLowongan)<br>+cariLowongan(filter)<br>+validasiDataLowongan(dataLowongan)<br>+perbaruiKetersediaan(idLowongan) |
| C37 | TransaksiPekerjaanController | — | +buatTransaksi(idPenawaran)<br>+cekKonflikJadwal(idTenagaKerja, jadwal)<br>+mulaiPekerjaan(idTransaksi)<br>+serahkanHasil(idTransaksi)<br>+mintaRevisi(idTransaksi, catatanRevisi)<br>+setujuiHasil(idTransaksi)<br>+batalkanSebelumPembayaran(idTransaksi, alasan)<br>+aturPenahananDana(idTransaksi, ditahan) |
| C39 | TagihanPembayaranController | — | +terbitkanTagihan(idTransaksi, biayaAdmin)<br>+prosesPembayaran(idTagihan, metodePembayaran)<br>+tanganiKedaluwarsa(idTagihan)<br>+prosesRefund(idTagihan) |
| C40 | PencairanDanaController | — | +prosesPencairanOtomatis(idTransaksi)<br>+prosesUlangPencairan(idPencairan)<br>+ambilRiwayatPencairan(idTenagaKerja) |
| C42 | TiketSengketaController | — | +buatTiket(idPelapor, dataKeluhan)<br>+mintaBuktiTambahan(idTiket)<br>+putuskanSengketa(idTiket, keputusan, alasan)<br>+batalkanTiket(idTiket)<br>+eksekusiKeputusan(idTiket) |
| C43 | RiwayatSengketaController | — | +catatRiwayat(idTiket, idPelaku, aktivitas, buktiTambahanUrl) |
| C44 | NotifikasiController | — | +kirimNotifikasi(idPenerima, pesan)<br>+tandaiDibaca(idNotifikasi) |
| C45 | PaymentGatewayController | — | +buatPembayaran(idTagihan, metodePembayaran)<br>+kirimPencairan(idPencairan)<br>+kirimRefund(idTagihan, nominalRefund)<br>+verifikasiCallback(payload)<br>+prosesCallback(payload)<br>+rekonsiliasiTransaksi(referensiGateway) |

### 5.2.13 Use Case UC13

**Nama Use Case:** Mengelola Profil dan Portofolio

#### Identifikasi Kelas

| ID Kelas | Nama Kelas | Deskripsi Kelas |
| --- | --- | --- |
| C01 | Pengguna | Entitas abstrak akun; identitas dan status verifikasi digunakan bersama oleh kedua peran publik. Akun CS disediakan internal. |
| C02 | TenagaKerja | Turunan Pengguna yang menyimpan keahlian, tujuan pencairan, rating, dan atribut portofolio berupa daftar judul, deskripsi, bidang pekerjaan, serta foto atau tautan bukti pengalaman. |
| C03 | PenyediaKerja | Turunan Pengguna yang memublikasikan lowongan dan membayar tagihan per pekerja. |
| C16 | PenggunaUI | Antarmuka untuk Pengguna; hanya menangani masukan dan penyajian informasi. |
| C17 | TenagaKerjaUI | Antarmuka profil pekerja, pengelolaan dan pemilihan portofolio, serta riwayat pekerjaan. |
| C18 | PenyediaKerjaUI | Antarmuka untuk PenyediaKerja; hanya menangani masukan dan penyajian informasi. |
| C31 | PenggunaController | Pengendali alur Pengguna; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |
| C32 | TenagaKerjaController | Pengendali profil dan atribut portofolio pekerja, termasuk validasi kepemilikan, kelengkapan, dan kelayakan melamar. |
| C33 | PenyediaKerjaController | Pengendali alur PenyediaKerja; memeriksa otorisasi dan mengoordinasikan entitas/integrasi terkait. |

#### Diagram Kelas

<!-- Diagram UC13 belum tersedia. -->

| ID Kelas | Nama Kelas | Atribut | Metode/Operasi |
| --- | --- | --- | --- |
| C01 | Pengguna | -idPengguna-nama-email-passwordHash-tanggalLahir-nomorTelepon-peran-fotoKtpUrl-statusVerifikasi-alasanPenolakan-waktuPengajuanVerifikasi-waktuVerifikasi-idPemeriksa | +hitungUsia()<br>+perbaruiProfil(dataProfil)<br>+ajukanVerifikasi(fotoKtpUrl)<br>+perbaruiStatusVerifikasi(statusVerifikasi, alasanPenolakan, idPemeriksa)<br>+cekTerverifikasi() |
| C02 | TenagaKerja | -portofolio-keahlian-ringkasanProfil-tujuanPencairan-ratingRataRata | +perbaruiPortofolio(dataPortofolio)<br>+hapusPortofolio(indeksPortofolio)<br>+cekKelengkapanPortofolio()<br>+perbaruiProfilPekerja(dataProfil)<br>+cekKelengkapanProfil()<br>+perbaruiTujuanPencairan(tujuanPencairan)<br>+perbaruiRating(ratingRataRata) |
| C03 | PenyediaKerja | -deskripsiPenyedia-ratingRataRata | +perbaruiProfilPenyedia(dataProfil)<br>+perbaruiRating(ratingRataRata) |
| C16 | PenggunaUI | — | +tampilkanFormRegistrasi()<br>+tampilkanFormLogin()<br>+tampilkanProfil()<br>+tampilkanFormVerifikasi() |
| C17 | TenagaKerjaUI | — | +tampilkanFormProfilPekerja()<br>+tampilkanDaftarPortofolio()<br>+tampilkanFormPortofolio()<br>+tampilkanPilihanPortofolio()<br>+tampilkanRiwayatPekerjaan() |
| C18 | PenyediaKerjaUI | — | +tampilkanFormProfilPenyedia()<br>+tampilkanDashboardPenyedia() |
| C31 | PenggunaController | — | +prosesRegistrasi(dataRegistrasi)<br>+prosesLogin(email, password)<br>+simpanProfil(idPengguna, dataProfil)<br>+ajukanVerifikasi(idPengguna, fotoKtpUrl)<br>+validasiBerkas(berkas, jenisBerkas) |
| C32 | TenagaKerjaController | — | +simpanProfilPekerja(idPengguna, dataProfil)<br>+simpanPortofolio(idTenagaKerja, dataPortofolio)<br>+hapusPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiPortofolio(idTenagaKerja, indeksPortofolio)<br>+ambilRingkasanPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiKelayakanMelamar(idTenagaKerja) |
| C33 | PenyediaKerjaController | — | +simpanProfilPenyedia(idPengguna, dataProfil)<br>+validasiKelayakanPublikasi(idPenyediaKerja) |

## 5.3 Diagram Kelas Keseluruhan

<p align="center">
<img alt="Class Diagram Keseluruhan" src="./assets/diagram/Diagram uc/contoh-class-diagram.webp" width="70%">
</p>
<p align="center">
<i>Gambar X. Diagram Kelas Keseluruhan</i>
</p>
<br>

| ID Kelas | Nama Kelas | Atribut | Metode/Operasi |
| --- | --- | --- | --- |
| C01 | Pengguna | -idPengguna-nama-email-passwordHash-tanggalLahir-nomorTelepon-peran-fotoKtpUrl-statusVerifikasi-alasanPenolakan-waktuPengajuanVerifikasi-waktuVerifikasi-idPemeriksa | +hitungUsia()<br>+perbaruiProfil(dataProfil)<br>+ajukanVerifikasi(fotoKtpUrl)<br>+perbaruiStatusVerifikasi(statusVerifikasi, alasanPenolakan, idPemeriksa)<br>+cekTerverifikasi() |
| C02 | TenagaKerja | -portofolio-keahlian-ringkasanProfil-tujuanPencairan-ratingRataRata | +perbaruiPortofolio(dataPortofolio)<br>+hapusPortofolio(indeksPortofolio)<br>+cekKelengkapanPortofolio()<br>+perbaruiProfilPekerja(dataProfil)<br>+cekKelengkapanProfil()<br>+perbaruiTujuanPencairan(tujuanPencairan)<br>+perbaruiRating(ratingRataRata) |
| C03 | PenyediaKerja | -deskripsiPenyedia-ratingRataRata | +perbaruiProfilPenyedia(dataProfil)<br>+perbaruiRating(ratingRataRata) |
| C04 | CustomerService | -hakAkses | +cekHakAkses(aksi) |
| C05 | LowonganPekerjaan | -idLowongan-idPenyediaKerja-judul-deskripsi-bidangPekerjaan-keterampilan-kuota-tarifAwal-modeKerja-lokasi-jenisJadwal-waktuMulai-waktuSelesai-tenggatHasil-batasPengajuan-statusLowongan | +cekTerbuka(waktuSekarang)<br>+hitungSisaKuota(jumlahPenugasan)<br>+perbaruiStatusLowongan(statusLowongan)<br>+perbaruiLowongan(dataLowongan) |
| C06 | PengajuanPenawaran | -idPenawaran-idLowongan-idTenagaKerja-nominalPenawaran-pesanPenawaran-pengalamanTerkait-ringkasanPortofolio-statusPenawaran-alasanPembatalan-waktuPengajuan-waktuPerubahan | +ubahPenawaran(dataPenawaran)<br>+tarikPenawaran()<br>+terimaPenawaran()<br>+tolakPenawaran()<br>+batalkanKarenaJadwal() |
| C07 | TransaksiPekerjaan | -idTransaksi-idPenawaran-idLowongan-idTenagaKerja-idPenyediaKerja-upahDisepakati-deskripsiDisepakati-modeKerja-lokasi-jenisJadwal-waktuMulai-waktuSelesai-tenggatHasil-statusPekerjaan-danaDitahanSengketa-catatanRevisi | +mulaiPekerjaan()<br>+serahkanHasil()<br>+mintaRevisi(catatanRevisi)<br>+setujuiHasil()<br>+batalkanPekerjaan(alasan)<br>+aturPenahananDana(ditahan) |
| C08 | BuktiPenyerahan | -idPenyerahan-idTransaksi-deskripsiHasil-lampiranUrl-nomorVersi-waktuPengiriman | +catatPenyerahan(dataHasil) |
| C09 | TagihanPembayaran | -idTagihan-idTransaksi-upahDisepakati-biayaAdmin-totalBayar-statusPembayaran-referensiGateway-waktuKedaluwarsa | +hitungTotalBayar()<br>+perbaruiStatusPembayaran(statusPembayaran)<br>+cekKedaluwarsa(waktuSekarang) |
| C10 | PencairanDana | -idPencairan-idTransaksi-nominalPencairan-tujuanPencairan-statusPencairan-referensiGateway-kunciIdempotensi-waktuPermintaan-waktuSelesai | +perbaruiStatusPencairan(statusPencairan) |
| C11 | UlasanRating | -idUlasan-idTransaksi-idPemberi-idPenerima-nilaiRating-isiUlasan-waktuUlasan | +validasiNilaiRating() |
| C12 | TiketSengketa | -idTiket-idTransaksi-idPelapor-idPetugas-kategoriMasalah-deskripsiKeluhan-buktiUrl-statusTiket-keputusan-alasanKeputusan-waktuPembuatan | +perbaruiStatusTiket(statusTiket)<br>+catatKeputusan(keputusan, alasanKeputusan) |
| C13 | RiwayatSengketa | -idRiwayat-idTiket-idPelaku-aktivitas-buktiTambahanUrl-waktuAktivitas | +catatAktivitas(aktivitas, buktiTambahanUrl) |
| C14 | Notifikasi | -idNotifikasi-idPenerima-pesan-sudahDibaca-waktuKirim | +tandaiDibaca() |
| C15 | PaymentGateway | -namaPenyedia-lingkungan | +buatInstruksiPembayaran(idTagihan, totalBayar, kunciIdempotensi)<br>+kirimPencairan(idPencairan, nominalPencairan, tujuanPencairan, kunciIdempotensi)<br>+kirimRefund(idTagihan, nominalRefund, kunciIdempotensi)<br>+ambilStatusTransaksi(referensiGateway) |
| C16 | PenggunaUI | — | +tampilkanFormRegistrasi()<br>+tampilkanFormLogin()<br>+tampilkanProfil()<br>+tampilkanFormVerifikasi() |
| C17 | TenagaKerjaUI | — | +tampilkanFormProfilPekerja()<br>+tampilkanDaftarPortofolio()<br>+tampilkanFormPortofolio()<br>+tampilkanPilihanPortofolio()<br>+tampilkanRiwayatPekerjaan() |
| C18 | PenyediaKerjaUI | — | +tampilkanFormProfilPenyedia()<br>+tampilkanDashboardPenyedia() |
| C19 | CustomerServiceUI | — | +tampilkanAntreanVerifikasi()<br>+tampilkanDashboardKeluhan() |
| C20 | LowonganPekerjaanUI | — | +tampilkanFormLowongan()<br>+tampilkanDaftarLowongan()<br>+tampilkanDetailLowongan() |
| C21 | PengajuanPenawaranUI | — | +tampilkanFormPenawaran()<br>+tampilkanDaftarPelamar()<br>+tampilkanRiwayatPenawaran() |
| C22 | TransaksiPekerjaanUI | — | +tampilkanDetailTransaksi()<br>+tampilkanKonfirmasiPenyelesaian()<br>+tampilkanFormRevisi() |
| C23 | BuktiPenyerahanUI | — | +tampilkanFormPenyerahan()<br>+tampilkanBuktiPenyerahan() |
| C24 | TagihanPembayaranUI | — | +tampilkanTagihan()<br>+tampilkanStatusPembayaran() |
| C25 | PencairanDanaUI | — | +tampilkanRiwayatPencairan()<br>+tampilkanStatusPencairan() |
| C26 | UlasanRatingUI | — | +tampilkanFormUlasan()<br>+tampilkanDaftarUlasan() |
| C27 | TiketSengketaUI | — | +tampilkanFormKeluhan()<br>+tampilkanDetailTiket() |
| C28 | RiwayatSengketaUI | — | +tampilkanRiwayatSengketa() |
| C29 | NotifikasiUI | — | +tampilkanNotifikasi() |
| C30 | PaymentGatewayUI | — | +tampilkanPilihanPembayaran()<br>+tampilkanInstruksiPembayaran() |
| C31 | PenggunaController | — | +prosesRegistrasi(dataRegistrasi)<br>+prosesLogin(email, password)<br>+simpanProfil(idPengguna, dataProfil)<br>+ajukanVerifikasi(idPengguna, fotoKtpUrl)<br>+validasiBerkas(berkas, jenisBerkas) |
| C32 | TenagaKerjaController | — | +simpanProfilPekerja(idPengguna, dataProfil)<br>+simpanPortofolio(idTenagaKerja, dataPortofolio)<br>+hapusPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiPortofolio(idTenagaKerja, indeksPortofolio)<br>+ambilRingkasanPortofolio(idTenagaKerja, indeksPortofolio)<br>+validasiKelayakanMelamar(idTenagaKerja) |
| C33 | PenyediaKerjaController | — | +simpanProfilPenyedia(idPengguna, dataProfil)<br>+validasiKelayakanPublikasi(idPenyediaKerja) |
| C34 | CustomerServiceController | — | +putuskanVerifikasi(idPengguna, keputusan, alasan)<br>+otorisasiPetugas(idPetugas, aksi) |
| C35 | LowonganPekerjaanController | — | +buatLowongan(idPenyediaKerja, dataLowongan)<br>+ubahLowongan(idLowongan, dataLowongan)<br>+cariLowongan(filter)<br>+validasiDataLowongan(dataLowongan)<br>+perbaruiKetersediaan(idLowongan) |
| C36 | PengajuanPenawaranController | — | +ajukanPenawaran(idTenagaKerja, idLowongan, dataPenawaran)<br>+ubahPenawaran(idPenawaran, dataPenawaran)<br>+tarikPenawaran(idPenawaran)<br>+tolakPenawaran(idPenawaran)<br>+terimaPenawaran(idPenawaran)<br>+batalkanPenawaranKonflik(idTenagaKerja, idTransaksi) |
| C37 | TransaksiPekerjaanController | — | +buatTransaksi(idPenawaran)<br>+cekKonflikJadwal(idTenagaKerja, jadwal)<br>+mulaiPekerjaan(idTransaksi)<br>+serahkanHasil(idTransaksi)<br>+mintaRevisi(idTransaksi, catatanRevisi)<br>+setujuiHasil(idTransaksi)<br>+batalkanSebelumPembayaran(idTransaksi, alasan)<br>+aturPenahananDana(idTransaksi, ditahan) |
| C38 | BuktiPenyerahanController | — | +simpanPenyerahan(idTransaksi, dataHasil)<br>+ambilBuktiPenyerahan(idTransaksi) |
| C39 | TagihanPembayaranController | — | +terbitkanTagihan(idTransaksi, biayaAdmin)<br>+prosesPembayaran(idTagihan, metodePembayaran)<br>+tanganiKedaluwarsa(idTagihan)<br>+prosesRefund(idTagihan) |
| C40 | PencairanDanaController | — | +prosesPencairanOtomatis(idTransaksi)<br>+prosesUlangPencairan(idPencairan)<br>+ambilRiwayatPencairan(idTenagaKerja) |
| C41 | UlasanRatingController | — | +simpanUlasan(idTransaksi, idPemberi, dataUlasan)<br>+cekUlasanGanda(idTransaksi, idPemberi, idPenerima)<br>+hitungRatingRataRata(idPengguna) |
| C42 | TiketSengketaController | — | +buatTiket(idPelapor, dataKeluhan)<br>+mintaBuktiTambahan(idTiket)<br>+putuskanSengketa(idTiket, keputusan, alasan)<br>+batalkanTiket(idTiket)<br>+eksekusiKeputusan(idTiket) |
| C43 | RiwayatSengketaController | — | +catatRiwayat(idTiket, idPelaku, aktivitas, buktiTambahanUrl) |
| C44 | NotifikasiController | — | +kirimNotifikasi(idPenerima, pesan)<br>+tandaiDibaca(idNotifikasi) |
| C45 | PaymentGatewayController | — | +buatPembayaran(idTagihan, metodePembayaran)<br>+kirimPencairan(idPencairan)<br>+kirimRefund(idTagihan, nominalRefund)<br>+verifikasiCallback(payload)<br>+prosesCallback(payload)<br>+rekonsiliasiTransaksi(referensiGateway) |

---

# BAB 6: Traceability

| ID Kelas | ID Use Case | ID KF |
| :--- | :--- | :--- |
| C01 | UC01, UC02, UC03, UC05, UC12, UC13 | KF01, KF02, KF03, KF04, KF05, KF06, KF07, KF08, KF10, KF11, KF24, KF25, KF26, KF27, KF28, KF29, KF30, KF31, KF34, KF35, KF36 |
| C02 | UC01, UC02, UC04, UC05, UC06, UC08, UC10, UC11, UC13 | KF01, KF02, KF03, KF04, KF05, KF06, KF09, KF10, KF11, KF12, KF13, KF16, KF19, KF20, KF21, KF22, KF23, KF28, KF29, KF30, KF31, KF32, KF35, KF36 |
| C03 | UC01, UC02, UC03, UC06, UC07, UC09, UC11, UC13 | KF01, KF02, KF03, KF04, KF05, KF06, KF07, KF08, KF12, KF13, KF14, KF15, KF17, KF18, KF21, KF22, KF23, KF27, KF31, KF32, KF33, KF34, KF35, KF36 |
| C04 | UC02, UC12 | KF04, KF05, KF06, KF24, KF25, KF26, KF34 |
| C05 | UC03, UC04, UC05, UC06, UC07, UC12 | KF07, KF08, KF09, KF10, KF11, KF12, KF13, KF14, KF15, KF24, KF25, KF26, KF27, KF28, KF29, KF30, KF31, KF32, KF33, KF34 |
| C06 | UC05, UC06, UC07 | KF10, KF11, KF12, KF13, KF14, KF15, KF28, KF29, KF30, KF31, KF32, KF33 |
| C07 | UC05, UC06, UC07, UC08, UC09, UC10, UC11, UC12 | KF10, KF11, KF12, KF13, KF14, KF15, KF16, KF17, KF18, KF19, KF20, KF21, KF22, KF23, KF24, KF25, KF26, KF28, KF29, KF30, KF31, KF32, KF33, KF34 |
| C08 | UC08, UC09 | KF16, KF17, KF18, KF34 |
| C09 | UC06, UC07, UC09, UC10, UC12 | KF12, KF13, KF14, KF15, KF17, KF18, KF19, KF20, KF24, KF25, KF26, KF31, KF32, KF33, KF34 |
| C10 | UC09, UC10, UC12 | KF17, KF18, KF19, KF20, KF24, KF25, KF26, KF34 |
| C11 | UC11 | KF21, KF22, KF23 |
| C12 | UC12 | KF24, KF25, KF26, KF34 |
| C13 | UC12 | KF24, KF25, KF26, KF34 |
| C14 | UC02, UC05, UC06, UC07, UC08, UC09, UC10, UC12 | KF04, KF05, KF06, KF10, KF11, KF12, KF13, KF14, KF15, KF16, KF17, KF18, KF19, KF20, KF24, KF25, KF26, KF28, KF29, KF30, KF31, KF32, KF33, KF34 |
| C15 | UC07, UC09, UC10, UC12 | KF14, KF15, KF17, KF18, KF19, KF20, KF24, KF25, KF26, KF32, KF33, KF34 |
| C16 | UC01, UC02, UC03, UC05, UC12, UC13 | KF01, KF02, KF03, KF04, KF05, KF06, KF07, KF08, KF10, KF11, KF24, KF25, KF26, KF27, KF28, KF29, KF30, KF31, KF34, KF35, KF36 |
| C17 | UC01, UC02, UC04, UC05, UC06, UC08, UC10, UC11, UC13 | KF01, KF02, KF03, KF04, KF05, KF06, KF09, KF10, KF11, KF12, KF13, KF16, KF19, KF20, KF21, KF22, KF23, KF28, KF29, KF30, KF31, KF32, KF35, KF36 |
| C18 | UC01, UC02, UC03, UC06, UC07, UC09, UC11, UC13 | KF01, KF02, KF03, KF04, KF05, KF06, KF07, KF08, KF12, KF13, KF14, KF15, KF17, KF18, KF21, KF22, KF23, KF27, KF31, KF32, KF33, KF34, KF35, KF36 |
| C19 | UC02, UC12 | KF04, KF05, KF06, KF24, KF25, KF26, KF34 |
| C20 | UC03, UC04, UC05, UC06, UC07, UC12 | KF07, KF08, KF09, KF10, KF11, KF12, KF13, KF14, KF15, KF24, KF25, KF26, KF27, KF28, KF29, KF30, KF31, KF32, KF33, KF34 |
| C21 | UC05, UC06, UC07 | KF10, KF11, KF12, KF13, KF14, KF15, KF28, KF29, KF30, KF31, KF32, KF33 |
| C22 | UC05, UC06, UC07, UC08, UC09, UC10, UC11, UC12 | KF10, KF11, KF12, KF13, KF14, KF15, KF16, KF17, KF18, KF19, KF20, KF21, KF22, KF23, KF24, KF25, KF26, KF28, KF29, KF30, KF31, KF32, KF33, KF34 |
| C23 | UC08, UC09 | KF16, KF17, KF18, KF34 |
| C24 | UC06, UC07, UC09, UC10, UC12 | KF12, KF13, KF14, KF15, KF17, KF18, KF19, KF20, KF24, KF25, KF26, KF31, KF32, KF33, KF34 |
| C25 | UC09, UC10, UC12 | KF17, KF18, KF19, KF20, KF24, KF25, KF26, KF34 |
| C26 | UC11 | KF21, KF22, KF23 |
| C27 | UC12 | KF24, KF25, KF26, KF34 |
| C28 | UC12 | KF24, KF25, KF26, KF34 |
| C29 | UC02, UC05, UC06, UC07, UC08, UC09, UC10, UC12 | KF04, KF05, KF06, KF10, KF11, KF12, KF13, KF14, KF15, KF16, KF17, KF18, KF19, KF20, KF24, KF25, KF26, KF28, KF29, KF30, KF31, KF32, KF33, KF34 |
| C30 | UC07, UC09, UC10, UC12 | KF14, KF15, KF17, KF18, KF19, KF20, KF24, KF25, KF26, KF32, KF33, KF34 |
| C31 | UC01, UC02, UC03, UC05, UC12, UC13 | KF01, KF02, KF03, KF04, KF05, KF06, KF07, KF08, KF10, KF11, KF24, KF25, KF26, KF27, KF28, KF29, KF30, KF31, KF34, KF35, KF36 |
| C32 | UC01, UC02, UC04, UC05, UC06, UC08, UC10, UC11, UC13 | KF01, KF02, KF03, KF04, KF05, KF06, KF09, KF10, KF11, KF12, KF13, KF16, KF19, KF20, KF21, KF22, KF23, KF28, KF29, KF30, KF31, KF32, KF35, KF36 |
| C33 | UC01, UC02, UC03, UC06, UC07, UC09, UC11, UC13 | KF01, KF02, KF03, KF04, KF05, KF06, KF07, KF08, KF12, KF13, KF14, KF15, KF17, KF18, KF21, KF22, KF23, KF27, KF31, KF32, KF33, KF34, KF35, KF36 |
| C34 | UC02, UC12 | KF04, KF05, KF06, KF24, KF25, KF26, KF34 |
| C35 | UC03, UC04, UC05, UC06, UC07, UC12 | KF07, KF08, KF09, KF10, KF11, KF12, KF13, KF14, KF15, KF24, KF25, KF26, KF27, KF28, KF29, KF30, KF31, KF32, KF33, KF34 |
| C36 | UC05, UC06, UC07 | KF10, KF11, KF12, KF13, KF14, KF15, KF28, KF29, KF30, KF31, KF32, KF33 |
| C37 | UC05, UC06, UC07, UC08, UC09, UC10, UC11, UC12 | KF10, KF11, KF12, KF13, KF14, KF15, KF16, KF17, KF18, KF19, KF20, KF21, KF22, KF23, KF24, KF25, KF26, KF28, KF29, KF30, KF31, KF32, KF33, KF34 |
| C38 | UC08, UC09 | KF16, KF17, KF18, KF34 |
| C39 | UC06, UC07, UC09, UC10, UC12 | KF12, KF13, KF14, KF15, KF17, KF18, KF19, KF20, KF24, KF25, KF26, KF31, KF32, KF33, KF34 |
| C40 | UC09, UC10, UC12 | KF17, KF18, KF19, KF20, KF24, KF25, KF26, KF34 |
| C41 | UC11 | KF21, KF22, KF23 |
| C42 | UC12 | KF24, KF25, KF26, KF34 |
| C43 | UC12 | KF24, KF25, KF26, KF34 |
| C44 | UC02, UC05, UC06, UC07, UC08, UC09, UC10, UC12 | KF04, KF05, KF06, KF10, KF11, KF12, KF13, KF14, KF15, KF16, KF17, KF18, KF19, KF20, KF24, KF25, KF26, KF28, KF29, KF30, KF31, KF32, KF33, KF34 |
| C45 | UC07, UC09, UC10, UC12 | KF14, KF15, KF17, KF18, KF19, KF20, KF24, KF25, KF26, KF32, KF33, KF34 |

---

# Referensi
- Diagram UML: [https://www.drawio.com/](https://www.drawio.com/), [https://staruml.io/](https://staruml.io/)
