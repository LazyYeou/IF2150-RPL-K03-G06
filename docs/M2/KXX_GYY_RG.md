<h1>
IF2150 REKAYASA PERANGKAT LUNAK
<br>
TUGAS 2
<br>
REQUIREMENT GATHERING
</h1>
<br>

## *Nama Perangkat Lunak*

### Untuk: *[Nama Asisten]*

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

Perhatikan kembali semua aktivitas yang telah didefinisikan pada tabel deskripsi aktivitas atau *activity diagram*. Jabarkan kebutuhan sistem yang akan dibuat dengan mengacu pada aktivitas-aktivitas tersebut. Setiap aktivitas (ID Aktivitas) dapat memiliki satu atau lebih kebutuhan yang berbeda. Pastikan untuk mengidentifikasi dan mengisi semua jenis kebutuhan yang relevan untuk setiap aktivitas, yaitu:

- **User Requirement**, yaitu kebutuhan dari sudut pandang pengguna (apa yang dapat dilakukan pengguna).
- **Business Requirement**, yaitu aturan, kebijakan, atau standar bisnis yang harus dipenuhi oleh sistem.
- **System Requirement**, yaitu kebutuhan yang menjelaskan apa yang harus dilakukan sistem dan bagaimana sistem harus bekerja dari segi performa, keamanan, keandalan, dsb.

Lengkapi juga dengan penjelasannya dan apakah keperluan tersebut perlu didukung oleh perangkat lunak atau tidak. Jenis kebutuhan tidak terbatas hanya dari tiga jenis di atas, dapat ditambahkan yang lain juga bila diperlukan, misalnya kebutuhan regulasi (*Legal*).

| ID Kebutuhan | ID Aktivitas | Jenis Kebutuhan | Deskripsi Kebutuhan | P/L |
| :--- | :--- | :--- | :--- | :--- |
| *R01* | *A01* | *User* | *Pengguna dapat memilih metode pembayaran dan melakukan pembayaran secara digital.* | *Ya* |
| *R02* | *A01* | *Business* | *Transaksi digital sesuai dengan ketentuan UU ITE yang berlaku.* | *Tidak* |
| *R03* | *A01* | *System* | *Sistem harus mengintegrasikan API Payment Gateway dengan prinsip ACID (Atomicity, Consistency, Isolation, Durability), jika terjadi kegagalan jaringan saat saldo terpotong, sistem harus secara otomatis membatalkan transaksi atau meneruskan dana (reliable).* | *Ya* |
| *R04* | *A01* | *System* | *Kata sandi (password) atau PIN pengguna saat otorisasi pembayaran harus di-hash menggunakan algoritma SHA-256 dan tidak disimpan dalam bentuk plain-text.* | *Ya* |
| *R05* | *A02* | *Business* | *Toko harus memiliki rekening bank aktif dan valid untuk menerima pencairan dana dari sistem.* | *Tidak* |
| ... | ... | ... | ... | ... |

## 2.4 Kebutuhan Fungsional (KF)

Untuk setiap kebutuhan yang telah diidentifikasi sebagai "didukung oleh perangkat lunak", buatlah daftar kebutuhan fungsional P/L, lengkap dengan ID Kebutuhan Fungsional (KF) dan penjelasannya. Hubungkan ID Kebutuhan Fungsional dengan ID Pemetaan Kebutuhan dari sistem.

| ID KF | ID Kebutuhan | Penjelasan |
| :--- | :--- | :--- |
| *KF01* | *R01* | *Perangkat lunak dapat menampilkan pilihan antarmuka metode pembayaran (transfer bank, e-wallet, kartu kredit) setelah pengguna melakukan checkout.* |
| *KF02* | *R01* | *Perangkat lunak dapat mengirimkan permintaan otorisasi transaksi ke API Payment Gateway beserta nominal tagihan dan ID Pesanan.* |
| ... | ... | ... |

## 2.5 Kebutuhan Non-Fungsional (KNF)

Uraikan dengan ringkas Kebutuhan Non-Fungsional dalam tabel sebagai berikut. Isilah kolom kebutuhan dengan kalimat yang jelas, spesifik, dan terukur (kelak dapat diuji untuk dipenuhi). Kolom ID KNF adalah nomor Kebutuhan Non-Fungsional yang harus ditelusuri pada saat pengujian. Hubungkan ID Kebutuhan Non-Fungsional dengan ID Pemetaan Kebutuhan Umum dari sistem.

| ID KNF | ID Kebutuhan | Parameter | Deskripsi Kebutuhan |
| :--- | :--- | :--- | :--- |
| *KNF01* | *R03* | *Reliability* | *Proses transaksi pembayaran harus memenuhi prinsip ACID untuk mencegah terjadinya data tersangkut (lost update) apabila terjadi kegagalan jaringan di tengah proses.* |
| *KNF02* | *R04* | *Security* | *Sistem harus mengenkripsi PIN atau password pengguna menggunakan algoritma SHA-256 sebelum data dikirimkan ke server, serta tidak menyimpannya dalam bentuk plain-text di database.* |
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
