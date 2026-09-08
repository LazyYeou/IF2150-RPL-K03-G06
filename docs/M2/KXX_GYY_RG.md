<h1>
IF2150 REKAYASA PERANGKAT LUNAK
<br>
TUGAS 2
<br>
REQUIREMENT GATHERING
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
| *B* | |
| *C* | |
| ... | |

<br>
<br>

# BAB 1: Deskripsi Umum

## 1.1 Deskripsi Umum Sistem

Perangkat lunak yang diusulkan adalah sebuah platform marketplace jasa berbasis web yang mempertemukan pencari jasa (Penyedia Kerja) dengan pekerja sektor informal (Tenaga Kerja) secara langsung. Dari sudut pandang pengguna, Penyedia Kerja dapat dengan mudah mencari, memilih, dan mempekerjakan bantuan harian, seperti tukang kebersihan, kuli angkat, atau asisten perbaikan ringan dengan berdasarkan lokasi, harga, dan ulasan. Sebaliknya, Tenaga kerja dapat membuat profil, menerima tawaran pekerjaan di sekitar mereka, dan membangun reputasi/portofolio dari setiap pekerjaan yang diselesaikan.
Target platform untuk sistem ini adalah Web Application yang responsif. Pemilihan platform tersebut didasarkan pada keunggulannya yang serbaguna dan inklusif. Aplikasi web dapat diakses secara mulus terhadap berbagai macam perangkat, misalnya smartphone, tablet, maupun desktop dan berbagai sistem operasi tanpa kendala kompatibilitas. Khusus bagi Tenaga kerja di sektor informal yang mungkin memiliki ponsel dengan spesifikasi atau kapasitas penyimpanan terbatas, pendekatan ini sangat ideal karena mereka tidak perlu mengunduh atau menginstal aplikasi berat dari toko aplikasi, sistem cukup diakses langsung melalui browser secara instan.
Platform ini dengan unik memberikan ruang bagi pekerja informal untuk memiliki rekam jejak atau portofolio digital yang valid berdasarkan rating dan ulasan dari pengguna jasa. Hal ini menyelesaikan masalah ketiadaan bukti kredibilitas bagi pekerja lepas.

## 1.2 Deskripsi Pengguna Perangkat Lunak

| Aktor | Deskripsi |
| :--- | :--- |
| Tenaga Kerja | Pengguna yang dapat mendaftar dan melengkapi profil untuk menawarkan suatu keahlian di bidang tertentu. Aktivitas utamanya adalah mencari dan memilih pekerjaan yang sesuai, mengajukan diri, menyelesaikan pekerjaan sesuai kesepakatan, serta menerima pembayaran upah setelah pekerjaan diverifikasi. |
| Penyedia Kerja | Pengguna merupakan individu maupun pemilik usaha yang dapat mendaftar dan melengkapi profil untuk mempublikasikan kebutuhan pekerjaan. Aktivitas utamanya adalah menentukan spesifikasi pekerjaan dan upah, mencari serta memilih tenaga kerja terpercaya, menyepakati pekerjaan, membayar upah beserta commission fee, dan memverifikasi hasil pekerjaan. |
| Customer Service (CS) | Pengguna merupakan tim internal platform yang memegang hak akses operasional untuk menjaga kelancaran transaksi dan interaksi. Aktivitas utamanya meliputi menerima serta menangani pertanyaan, membantu menindaklanjuti kendala akun, pekerjaan, dan pembayaran, serta menengahi sengketa (dispute) atau keluhan pengguna secara cepat dan tepat. |

---

# BAB 2: Deskripsi Kebutuhan Perangkat Lunak

## 2.1 Kebutuhan Pengguna Awal

| ID | Aktor | Kebutuhan / Aktivitas | Tujuan / Nilai |
| :--- | :--- | :--- | :--- |
| US-01 | Tenaga Kerja | Melakukan registrasi dan mengisi profil diri | Memiliki profil yang merepresentasikan kemampuan dan pengalaman yang dimiliki |
| US-02 | Tenaga Kerja | Melakukan verifikasi identitas dan berlangganan layanan | Memperoleh akses ke platform sebagai pengguna yang terverifikasi |
| US-03 | Tenaga Kerja | Mencari dan memilih pekerjaan berdasarkan keahlian dan kebutuhan pekerjaan | Memperoleh pekerjaan yang sesuai dengan keterampilan yang dimiliki |
| US-04 | Tenaga Kerja | Mengajukan diri, menerima pekerjaan, dan menyelesaikan pekerjaan sesuai kesepakatan | Memperoleh penghasilan dengan memanfaatkan keterampilan yang dimiliki |
| US-05 | Tenaga Kerja | Menerima pembayaran setelah pekerjaan selesai dan diverifikasi | Memperoleh upah sesuai dengan pekerjaan yang telah diselesaikan |
| US-06 | Penyedia Kerja | Melakukan registrasi dan mengisi profil diri atau usaha | Memiliki identitas yang jelas dan dipercaya dalam menggunakan platform |
| US-07 | Penyedia Kerja | Membuat kebutuhan pekerjaan dengan menentukan spesifikasi, keterampilan, waktu, dan upah | Menemukan tenaga kerja yang sesuai dengan kebutuhan pekerjaan |
| US-08 | Penyedia Kerja | Mencari dan memilih tenaga kerja berdasarkan keterampilan, pengalaman, dan reputasi | Agar pekerjaan dapat dilakukan oleh tenaga kerja yang sesuai dan terpercaya |
| US-09 | Penyedia Kerja | Menyepakati pekerjaan dan melakukan pembayaran upah beserta *commission fee* | Agar pekerjaan dapat dimulai dengan kesepakatan dan pembayaran yang tercatat secara aman |
| US-10 | Penyedia Kerja | Memverifikasi hasil pekerjaan dan mengonfirmasi penyelesaian pekerjaan | Agar pembayaran dapat diberikan setelah pekerjaan selesai sesuai kesepakatan |
| US-11 | Customer Service | Menerima dan menangani pertanyaan serta keluhan dari pengguna | Sehingga pengguna memperoleh bantuan ketika mengalami kendala dalam menggunakan platform |
| US-12 | Customer Service | Membantu menindaklanjuti kendala terkait pekerjaan, pembayaran, atau akun pengguna | Menyelesaikan permasalahan yang dialami pengguna dengan cepat dan tepat |

## 2.2 Deskripsi Aktivitas

| ID | Aktivitas | Penjelasan | ID User Story |
| :--- | :--- | :--- | :--- |
| A01 | Registrasi dan Mengisi Profil | Pengguna membuat akun dan melengkapi profil sesuai perannya sebagai Tenaga Kerja atau Penyedia Kerja. | US-01, US-06 |
| A02 | Mengajukan Verifikasi Identitas | Tenaga Kerja mengunggah data identitas untuk diverifikasi sebelum menggunakan layanan platform. | US-02 |
| A03 | Melakukan Pembayaran Subscription | Tenaga Kerja melakukan pembayaran subscription untuk mengaktifkan akses layanan. | US-02 |
| A04 | Membuat Lowongan Pekerjaan | Penyedia Kerja membuat pekerjaan dengan menentukan deskripsi, keterampilan, waktu, dan upah. | US-07 |
| A05 | Mencari Pekerjaan | Tenaga Kerja mencari dan memilih pekerjaan yang sesuai dengan keterampilan dan kebutuhannya. | US-03 |
| A06 | Mengajukan Penawaran Pekerjaan | Tenaga Kerja mengajukan diri atau memberikan proposal terhadap pekerjaan yang tersedia. | US-04 |
| A07 | Memilih Tenaga Kerja | Penyedia Kerja meninjau kandidat dan memilih Tenaga Kerja yang sesuai untuk menyelesaikan pekerjaan. | US-08 |
| A08 | Melakukan Pembayaran Pekerjaan | Penyedia Kerja melakukan pembayaran upah dan *commission fee* melalui Payment Gateway sebelum pekerjaan dimulai. | US-09 |
| A09 | Melaksanakan dan Mengirimkan Hasil Pekerjaan | Tenaga Kerja mengerjakan pekerjaan sesuai dengan kesepakatan yang telah dibuat, kemudian menyelesaikan dan menyerahkan hasil pekerjaan kepada Penyedia Kerja. | US-04 |
| A10 | Memverifikasi Penyelesaian Pekerjaan | Penyedia Kerja memeriksa hasil pekerjaan dan mengonfirmasi bahwa pekerjaan telah selesai. | US-10 |
| A11 | Mencairkan Pembayaran | Setelah pekerjaan dikonfirmasi selesai, pembayaran diteruskan kepada Tenaga Kerja melalui mekanisme yang tersedia. | US-05 |
| A12 | Memberikan Rating dan Ulasan | Tenaga Kerja dan Penyedia Kerja dapat memberikan rating dan ulasan setelah pekerjaan selesai. | US-05, US-10 |
| A13 | Menangani Keluhan atau Sengketa | Customer Service menangani kendala atau sengketa yang terjadi antara pengguna. | US-11, US-12 |

## 2.3 Pemetaan Kebutuhan

| ID Kebutuhan | ID Aktivitas | Jenis Kebutuhan | Deskripsi Kebutuhan | P/L |
| :--- | :--- | :--- | :--- | :--- |
| R01 | A01 | User | Pengguna dapat melakukan registrasi dan mengisi profil sesuai perannya sebagai Tenaga Kerja atau Penyedia Kerja. | Ya |
| R02 | A01 | Business | Pengguna aktif harus berusia minimal 17 tahun, memiliki KTP yang sah, dan memberikan data profil yang dapat dipertanggungjawabkan. | Ya |
| R03 | A01 | System | Sistem harus meminta persetujuan pengguna terhadap kebijakan privasi saat registrasi. | Ya |
| R04 | A01 | System | Sistem harus menyediakan autentikasi dan enskripsi data seperti kata sandi dan token autentikasi agar tidak tersimpan dalam bentuk teks biasa. | Ya |
| R05 | A02 | User | Tenaga Kerja dapat mengunggah data identitas untuk mengajukan verifikasi. | Ya |
| R06 | A02 | Business | Verifikasi identitas dilakukan melalui verifikasi email dan pemeriksaan manual. | Ya |
| R07 | A02 | System | Sistem hanya boleh mengumpulkan data identitas yang relevan dan memprosesnya berdasarkan persetujuan pengguna. | Ya |
| R08 | A02 | System | Sistem harus menyimpan status verifikasi dan membatasi akses fitur Tenaga Kerja sampai verifikasi disetujui. | Ya |
| R09 | A03 | User | Tenaga Kerja dapat memilih metode pembayaran dan membayar biaya langganan secara digital. | Ya |
| R10 | A03 | Business | Akses layanan Tenaga Kerja hanya diaktifkan setelah pembayaran langganan dinyatakan berhasil. | Ya |
| R11 | A03 | System | Sistem harus terintegrasi dengan lingkungan Payment Gateway dan mencatat status pembayaran langganan. | Ya |
| R12 | A04 | User | Penyedia Kerja dapat membuat lowongan dengan mengisi data yang diperlukan. | Ya |
| R13 | A04 | Business | Hanya Penyedia Kerja yang dapat memublikasikan lowongan, dan lowongan baru harus berstatus Open. | Ya |
| R14 | A04 | System | Sistem harus melakukkn validasi kelengkapan data lowongan dan menyimpannya pada data lowongan pekerjaan. | Ya |
| R15 | A05 | User | Tenaga Kerja dapat mencari dan melakukan filtering pekerjaan berdasarkan kategori atau keterampilan yang dibutuhkan. | Ya |
| R16 | A05 | System | Sistem harus menampilkan hanya lowongan yang masih berstatus Open beserta informasi pekerjaan yang diperlukan untuk memilih lowongan. | Ya |
| R17 | A06 | User | Tenaga Kerja dapat mengajukan penawaran pada lowongan yang tersedia. | Ya |
| R18 | A06 | Business | Hanya Tenaga Kerja yang  terverifikasi yang dapat mengajukan penawaran pada lowongan berstatus Open. | Ya |
| R19 | A06 | System | Sistem harus mencatat isi, waktu, data pengaju, dan lowongan tujuan dari setiap penawaran. | Ya |
| R20 | A07 | User | Penyedia Kerja dapat meninjau kandidat berdasarkan keterampilan, pengalaman, dan reputasi lalu memilih satu Tenaga Kerja. | Ya |
| R21 | A07 | Business | Hanya pemilik lowongan yang dapat memilih kandidat dan satu lowongan tidak boleh diberikan kepada lebih dari satu Tenaga Kerja. | Ya |
| R22 | A07 | System | Sistem harus mengubah status pekerjaan dari Open menjadi Assigned dan mencatat Tenaga Kerja terpilih. | Ya |
| R23 | A08 | User | Penyedia Kerja dapat membayar upah dan commission fee melalui Payment Gateway sebelum pekerjaan dimulai. | Ya |
| R24 | A08 | Business | Pekerjaan hanya dapat dimulai setelah pembayaran upah dan commission fee berhasil diterima. | Ya |
| R25 | A08 | Business | Dana harus diproses melalui Payment Gateway dan dana tidak disimpan oleh platform. | Ya |
| R26 | A08 | System | Sistem harus mengirim permintaan pembayaran, memverifikasi hasil transaksi, dan mencatat riwayat serta status pembayaran. | Ya |
| R27 | A09 | User | Tenaga Kerja dapat melaksanakan pekerjaan lalu mengirimkan hasil pekerjaan dan lmpiran atau bukti kepada Penyedia Kerja. | Ya |
| R28 | A09 | Business | Pengiriman buktu hanya dapat dilakukan untuk pekerjaan yang telah dibayar dan berstatus In Progress, kemudian statusnya menjadi Submitted. | Ya |
| R29 | A09 | System | Sistem harus menyimpan hasil atau lampiran, waktu penyerahan, dan perubahan status pekerjaan. | Ya |
| R30 | A10 | User | Penyedia Kerja dapat memeriksa hasil dan mengonfirmasi penyelesaian pekerjaan. | Ya |
| R31 | A10 | Business | Dana hanya dapat dicairkan kepada Tenaga Kerja setelah Penyedia Kerja mengonfirmasi bahwa pekerjaan selesai. | Ya |
| R32 | A10 | System | Sistem harus mengubah status pekerjaan dari Submitted menjadi Completed dan memicu proses pencairan setelah konfirmasi. | Ya |
| R33 | A11 | User | Tenaga Kerja dapat menerima pembayaran untuk pekerjaan yang telah selesai dan diverifikasi. | Ya |
| R34 | A11 | Business | Pencairan dilakukan melalui Payment Gateway ke rekening atau dompet digital valid milik Tenaga Kerja. | Ya |
| R35 | A11 | System | Sistem harus mengirim instruksi pencairan serta mencatat nominal, penerima, waktu, dan status pencairan. | Ya |
| R36 | A12 | User | Tenaga Kerja dan Penyedia Kerja dapat saling memberikan rating dan ulasan setelah pekerjaan selesai. | Ya |
| R37 | A12 | Business | Setiap pihak hanya dapat memberi satu rating dan ulasan per pekerjaan yang berstatus Completed. | Ya |
| R38 | A12 | System | Sistem harus menyimpan rating dan ulasan serta memperbarui reputasi atau portofolio pengguna yang dinilai. | Ya |
| R39 | A13 | User | Customer Service dapat menerima, meninjau, dan menindaklanjuti keluhan atau sengketa terkait akun, pekerjaan, dan pembayaran. | Ya |
| R40 | A13 | Business | Customer Service dapat memutuskan tindak lanjut seperti pencairan atau pengembalian dana berdasarkan bukti yang tersedia. | Ya |
| R41 | A13 | System | Sistem harus menyediakan akses khusus Customer Service untuk mencatat kasus, bukti, status penanganan, keputusan, dan riwayat aktivitas. | Ya |
| R42 | A13 | Business | Penanganan sengketa oleh platform terbatas pada penyelesaian internal dan tidak mencakup penyelesaian melalui jalur hukum. | Tidak |

## 2.4 Kebutuhan Fungsional (KF)

Untuk setiap kebutuhan yang telah diidentifikasi sebagai "didukung oleh perangkat lunak", buatlah daftar kebutuhan fungsional P/L, lengkap dengan ID Kebutuhan Fungsional (KF) dan penjelasannya. Hubungkan ID Kebutuhan Fungsional dengan ID Pemetaan Kebutuhan dari sistem.

| ID KF | ID Kebutuhan | Penjelasan |
| :--- | :--- | :--- |
| KF01 | R01, R03 | Ketika pengguna melakukan registrasi, sistem harus menyediakan pilihan peran (Tenaga Kerja atau Penyedia Kerja), formulir pengisian profil, dan meminta persetujuan terhadap kebijakan privasi. |
| KF02 | R02 | Bila tanggal lahir yang dimasukkan menunjukkan usia di bawah 17 tahun saat registrasi, maka sistem harus menampilkan pesan kesalahan dan memblokir pendaftaran. |
| KF03 | R04 | Ketika pengguna melakukan *login*, sistem harus memverifikasi kredensial dan menerbitkan token autentikasi. |
| KF04 | R05, R07 | Ketika Tenaga Kerja mengajukan verifikasi, sistem harus menyediakan antarmuka pengunggahan dokumen identitas yang relevan berdasarkan persetujuan pengguna. |
| KF05 | R06 | Ketika pengguna mengklik tautan verifikasi email atau ketika admin menyetujui verifikasi manual, sistem harus memperbarui status verifikasi identitas pengguna. |
| KF06 | R08 | Selama status verifikasi Tenaga Kerja belum disetujui, sistem harus membatasi akses ke fitur-fitur utama platform. |
| KF07 | R09, R11 | Ketika Tenaga Kerja memilih metode pembayaran langganan, sistem harus mengarahkan transaksi ke Payment Gateway dan mencatat draf status pembayaran. |
| KF08 | R10, R11 | Ketika Payment Gateway mengirimkan notifikasi bahwa transaksi pembayaran berhasil, sistem harus mengubah status pembayaran menjadi berhasil dan mengaktifkan akses layanan langganan. |
| KF09 | R11 | Bila proses transaksi pembayaran langganan mengalami kegagalan atau *timeout*, maka sistem harus mencatat status transaksi gagal dan membatalkan aktivasi langganan. |
| KF10 | R33 | Perangkat lunak dapat menampilkan notifikasi dan status penerimaan pembayaran/upah pada halaman dashboard Tenaga Kerja setelah pekerjaan diverifikasi selesai. |
| KF11 | R34 | Perangkat lunak dapat memvalidasi nomor rekening bank atau nomor e-wallet Tenaga Kerja serta mengirimkan instruksi payout/disbursement secara otomatis ke API Payment Gateway. |
| KF12 | R35 | Perangkat lunak dapat mencatat riwayat transaksi pencairan dana secara lengkap (ID transaksi, nominal upah, ID penerima, waktu pencairan, dan status transfer). |
| KF13 | R36 | Perangkat lunak dapat menyediakan formulir penilaian (skala 1–5 dan kolom ulasan teks) bagi Tenaga Kerja dan Penyedia Kerja setelah transaksi pembayaran selesai. |
| KF14 | R37 | Perangkat lunak dapat membatasi pengiriman ulasan sehingga setiap pengguna hanya dapat memberikan maksimal satu kali ulasan untuk satu nomor transaksi pekerjaan yang sama. |
| KF15 | R38 | Perangkat lunak dapat menghitung ulang rata-rata rating secara otomatis dan memperbarui portofolio digital pada profil pengguna secara langsung setelah ulasan baru disimpan. |
| KF16 | R39 | Perangkat lunak dapat menyediakan antarmuka bagi pengguna untuk mengajukan tiket sengketa/keluhan serta dashboard khusus bagi Customer Service untuk melihat antrean keluhan terkait akun, pekerjaan, dan transaksi. |
| KF17 | R40 | Perangkat lunak dapat menyediakan aksi penindakan keputusan sengketa bagi Customer Service untuk mengeksekusi pengembalian dana (*refund*) ke Penyedia Kerja atau pelepasan dana upah ke Tenaga Kerja. |
| KF18 | R41 | Perangkat lunak dapat mencatat data kronologis kasus sengketa, unggahan bukti pendukung (foto/dokumen), status penanganan (*Open*, *Under Review*, *Resolved*), dan riwayat log aktivitas yang dilakukan oleh Customer Service. |
| KF19 | R12, R13 | Ketika Penyedia Kerja berhasil menyimpan data lowongan baru melalui antarmuka formulir, sistem harus menetapkan status lowongan tersebut menjadi Open secara bawaan. |
| KF20 | R14 | Jika terdapat isian formulir lowongan (judul, deskripsi, kuota, lokasi, atau upah) yang kosong atau tidak valid saat disimpan, sistem harus menampilkan pesan peringatan dan menggagalkan penyimpanan. |
| KF21 | R15, R16 | Ketika Tenaga Kerja melakukan pencarian atau pemfilteran (berdasarkan kategori/keterampilan), sistem harus hanya menampilkan daftar lowongan yang berstatus Open secara bawaan. |
| KF22 | R17, R18 | Selama akun pengguna berstatus Terverifikasi dan bertindak sebagai Tenaga Kerja, sistem harus menyediakan akses ke tombol Ajukan Penawaran pada halaman detail pekerjaan. |
| KF23 | R19 | Ketika Tenaga Kerja menekan konfirmasi pengajuan penawaran, sistem harus menyimpan data pengajuan (ID Tenaga Kerja, ID Lowongan, pesan penawaran, dan timestamp) ke dalam basis data. |
| KF24 | R20, R21 | Ketika Penyedia Kerja menyetujui (accept) seorang pelamar pada antarmuka daftar pelamar, sistem harus menghasilkan dan menyimpan entri ID Transaksi Pekerjaan yang unik untuk pelamar tersebut, selama batas kuota lowongan belum terlampaui. |
| KF25 | R22 | Ketika jumlah Tenaga Kerja yang disetujui telah mencapai batas kuota dari sebuah lowongan, sistem harus secara otomatis mengubah status lowongan tersebut dari Open menjadi Closed/Full. |
| KF26 | R23, R24 | Perangkat lunak dapat menyediakan fitur pembayaran upah dan commission fee melalui Payment Gateway bagi Penyedia Kerja, serta menahan status pekerjaan sebelum pembayaran diterima. |
| KF27 | R25, R26 | Perangkat lunak dapat memproses pembayaran melalui Payment Gateway dan menyimpan dana pengguna, serta mencatat riwayat dan status setiap transaksi pembayaran. |
| KF28 | R27, R28, R29 | Perangkat lunak dapat menyediakan fitur bagi Tenaga Kerja untuk mengunggah dan mengirimkan hasil pekerjaan setelah pembayaran diterima. |
| KF29 | R30, R31, R32 | Perangkat lunak dapat menyediakan fitur bagi Penyedia Kerja untuk memeriksa dan mengonfirmasi hasil pekerjaan, yang kemudian mengubah status menjadi "Selesai" dan memicu pencairan dana kepada Tenaga Kerja. |
| ... | ... | ... |

## 2.5 Kebutuhan Non-Fungsional (KNF)

Uraikan dengan ringkas Kebutuhan Non-Fungsional dalam tabel sebagai berikut. Isilah kolom kebutuhan dengan kalimat yang jelas, spesifik, dan terukur (kelak dapat diuji untuk dipenuhi). Kolom ID KNF adalah nomor Kebutuhan Non-Fungsional yang harus ditelusuri pada saat pengujian. Hubungkan ID Kebutuhan Non-Fungsional dengan ID Pemetaan Kebutuhan Umum dari sistem.

| ID KNF | ID Kebutuhan | Parameter | Deskripsi Kebutuhan |
| :--- | :--- | :--- | :--- |
| KNF01 | R04 | Security | Sistem harus mengenkripsi kata sandi menggunakan algoritma *hashing* dan mengamankan token autentikasi agar tidak tersimpan sebagai teks biasa. |
| KNF02 | R07 | Security | Sistem harus mengenkripsi berkas dokumen identitas pengguna (*data at rest*) yang tersimpan pada media penyimpanan. |
| KNF03 | R08 | Response time | Ketika Tenaga Kerja mencoba mengakses fitur platform, sistem harus mampu memverifikasi status akses atau verifikasi akun dalam waktu kurang dari 1 detik. |
| KNF04 | R11 | Reliability | Ketika terjadi kegagalan jaringan atau *timeout* pada respon Payment Gateway, sistem harus menerapkan mekanisme *idempotency* untuk mencegah pencatatan transaksi ganda. |
| KNF05 | R11 | Security | Selama proses transmisi data transaksi pembayaran dengan API Payment Gateway, sistem harus mengamankan lalu lintas data menggunakan protokol HTTPS/TLS. |
| KNF06 | R34, R35 | Reliability | Mekanisme instruksi pencairan dana ke Payment Gateway harus menerapkan prinsip *idempotency* dan transaksi ACID untuk menjamin tidak terjadi pencairan ganda (*double payout*) jika terjadi kegagalan jaringan atau *timeout*. |
| KNF07 | R34, R35 | Security | Pengiriman instruksi pencairan ke API Payment Gateway harus menggunakan protokol terenkripsi (HTTPS/TLS 1.3) serta enkripsi pada data nomor rekening/e-wallet pengguna. |
| KNF08 | R38 | Response time | Sistem harus mampu menyimpan ulasan baru dan memperbarui rating pada profil publik dalam waktu singkat. |
| KNF09 | R41 | Security | Hak akses modul sengketa/keluhan harus menerapkan *Role-Based Access Control* (RBAC) yang ketat sehingga hanya akun dengan peran Customer Service/Admin terverifikasi yang dapat melihat bukti sengketa dan mengeksekusi keputusan dana. |
| KNF10 | R41 | Reliability | Riwayat log aktivitas penanganan sengketa dan mutasi pencairan dana bersifat *tamper-proof* (tidak dapat diubah atau dihapus) untuk keperluan jejak audit (*audit trail*). |
| KNF11 | R15, R16 | Response Time | Sistem mampu memuat dan menampilkan hasil pencarian serta filtering lowongan pekerjaan dalam waktu kurang dari 5 detik dengan koneksi internet standar. |
| KNF12 | R12, R17 | Ergonomy | Antarmuka formulir pembuatan lowongan dan pengajuan penawaran mengadopsi pendekatan design Mobile-First, sehingga elemen input dan tombol dapat ditekan dengan nyaman menggunakan jari. |
| KNF13 | R18, R21 | Security | Sistem harus memvalidasi hak akses pengguna secara ketat. Pengguna dipastikan tidak dapat memanipulasi atau menyetujui lowongan milik orang lain, meskipun mereka mencoba mengubah URL atau angka ID secara manual di browser. |
| KNF14 | R22 | Reliability | Sistem harus mencegah terjadinya bentrokan data atau pemesanan ganda. Jika sistem sedang sibuk dan menerima dua persetujuan di detik yang sama, sistem dijamin hanya akan memproses salah satu saja, sehingga tidak ada satu lowongan yang tidak sengaja diberikan kepada dua Tenaga Kerja sekaligus. |
| KNF15 | R24, R25, R26 | Reliability | Sistem harus memastikan proses pembayaran tidak terjadi dua kali untuk transaksi yang sama, meskipun terjadi gangguan seperti gangguan jaringan atau koneksi saat proses berlangsung. |
| KNF16 | R23, R25 | Security | Seluruh data pembayaran yang dikirim ke Payment Gateway harus dilindungi dengan koneksi aman, sehingga tidak dapat dilihat atau diubah oleh pihak lain saat diproses |
| KNF17 | R27, R29 | Response Time | Sistem harus dapat memproses unggahan hasil pekerjaan (baik foto atau sebagainya) dan memperbarui status pekerjaan dalam waktu singkat setelah dikirim oleh Tenaga Kerja. |
| KNF18 | R28 | Security | Sistem harus memastikan hanya Tenaga Kerja yang ditugaskan pada pekerjaan tersebut yang bisa mengirimkan hasil pekerjaan. |
| KNF19 | R31, R32 | Reliability | Sistem harus memastikan proses pencairan dana hanya berjalan satu kali setelah Penyedia Kerja mengonfirmasi pekerjaan selesai, agar dana tidak tercairkan berulang kali akibat klik ganda, gangguan sistem, dan lain sebagainya. |
| ... | ... | ... | ... |


Silakan pilih yang relevan. Tidak perlu semua parameter menjadi kebutuhan non-fungsional. Berikut merupakan penjelasan dari setiap parameter. **Parameter dari Kebutuhan Non-Fungsional tidak terbatas hanya di bawah ini** karena hanya merupakan panduan sehingga dapat ditambah KNF yang lain, misalnya *constraint* dari sistem.

| Parameter | Penjelasan |
| :--- | :--- |
| *Availability* | Ketersediaan aplikasi, misalnya harus terus-menerus beroperasi 7 hari per minggu, 24 jam per hari tanpa gagal. |
| *Reliability* | Keandalan, misalnya tidak pernah boleh gagal (atau kegagalan yang ditolerir adalah …%) sehingga harus dipikirkan *fault tolerant architecture*. Biasanya hanya perlu untuk *critical application* yang jika gagal akan berakibat fatal. |
| *Ergonomy* | Kenyamanan pakai bagi pengguna. |
| *Portability* | Kemudahan untuk dibawa dan dioperasikan ke mesin/sistem operasi/*platform* yang lain. |
| *Memory* | Jika perhitungan kapasitas memori internal kritis (misalnya untuk P/L yang harus dijadikan *chips* dan ukurannya harus kecil). |
| *Response time* | Batasan waktu yang harus dipenuhi. Sangat penting untuk aplikasi *real time*. Contoh: "Aplikasi harus mampu menampilkan hasil dalam 4 detik", atau "ATM harus menarik kembali kartu yang tidak diambil dalam waktu 3 menit". |
| *Safety* | Yang menyangkut keselamatan manusia, misalnya untuk P/L yang dipakai pada sistem kontrol di pabrik. |
| *Security* | Aspek keamanan yang harus dipenuhi. |

<br>

# Referensi
- Diagram UML: https://www.drawio.com/, https://staruml.io/
