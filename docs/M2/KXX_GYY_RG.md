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
| *KF01* | *R33* | Perangkat lunak dapat menampilkan notifikasi dan status penerimaan pembayaran/upah pada halaman dashboard Tenaga Kerja setelah pekerjaan diverifikasi selesai. |
| *KF02* | *R34* | Perangkat lunak dapat memvalidasi nomor rekening bank atau nomor e-wallet Tenaga Kerja serta mengirimkan instruksi payout/disbursement secara otomatis ke API Payment Gateway. |
| *KF03* | *R35* | Perangkat lunak dapat mencatat riwayat transaksi pencairan dana secara lengkap (ID transaksi, nominal upah, ID penerima, waktu pencairan, dan status transfer). |
| *KF04* | *R36* | Perangkat lunak dapat menyediakan formulir penilaian (skala 1–5 dan kolom ulasan teks) bagi Tenaga Kerja dan Penyedia Kerja setelah transaksi pembayaran selesai. |
| *KF05* | *R37* | Perangkat lunak dapat membatasi pengiriman ulasan sehingga setiap pengguna hanya dapat memberikan maksimal satu kali ulasan untuk satu nomor transaksi pekerjaan yang sama. |
| *KF06* | *R38* | Perangkat lunak dapat menghitung ulang rata-rata rating secara otomatis dan memperbarui portofolio digital pada profil pengguna secara langsung setelah ulasan baru disimpan. |
| *KF07* | *R39* | Perangkat lunak dapat menyediakan antarmuka bagi pengguna untuk mengajukan tiket sengketa/keluhan serta dashboard khusus bagi Customer Service untuk melihat antrean keluhan terkait akun, pekerjaan, dan transaksi. |
| *KF08* | *R40* | Perangkat lunak dapat menyediakan aksi penindakan keputusan sengketa bagi Customer Service untuk mengeksekusi pengembalian dana (*refund*) ke Penyedia Kerja atau pelepasan dana upah ke Tenaga Kerja. |
| *KF09* | *R41* | Perangkat lunak dapat mencatat data kronologis kasus sengketa, unggahan bukti pendukung (foto/dokumen), status penanganan (*Open*, *Under Review*, *Resolved*), dan riwayat log aktivitas yang dilakukan oleh Customer Service. |
| ... | ... | ... |

## 2.5 Kebutuhan Non-Fungsional (KNF)

Uraikan dengan ringkas Kebutuhan Non-Fungsional dalam tabel sebagai berikut. Isilah kolom kebutuhan dengan kalimat yang jelas, spesifik, dan terukur (kelak dapat diuji untuk dipenuhi). Kolom ID KNF adalah nomor Kebutuhan Non-Fungsional yang harus ditelusuri pada saat pengujian. Hubungkan ID Kebutuhan Non-Fungsional dengan ID Pemetaan Kebutuhan Umum dari sistem.

| ID KNF | ID Kebutuhan | Parameter | Deskripsi Kebutuhan |
| :--- | :--- | :--- | :--- |
| *KNF01* | *R34, R35* | *Reliability* | Mekanisme instruksi pencairan dana ke Payment Gateway harus menerapkan prinsip *idempotency* dan transaksi ACID untuk menjamin tidak terjadi pencairan ganda (*double payout*) jika terjadi kegagalan jaringan atau *timeout*. |
| *KNF02* | *R34, R35* | *Security* | Pengiriman instruksi pencairan ke API Payment Gateway harus menggunakan protokol terenkripsi (HTTPS/TLS 1.3) serta enkripsi pada data nomor rekening/e-wallet pengguna. |
| *KNF03* | *R38* | *Response time* | Sistem harus mampu menyimpan ulasan baru dan memperbarui rating pada profil publik dalam waktu singkat. |
| *KNF04* | *R41* | *Security* | Hak akses modul sengketa/keluhan harus menerapkan *Role-Based Access Control* (RBAC) yang ketat sehingga hanya akun dengan peran Customer Service/Admin terverifikasi yang dapat melihat bukti sengketa dan mengeksekusi keputusan dana. |
| *KNF05* | *R41* | *Reliability* | Riwayat log aktivitas penanganan sengketa dan mutasi pencairan dana bersifat *tamper-proof* (tidak dapat diubah atau dihapus) untuk keperluan jejak audit (*audit trail*). |
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
