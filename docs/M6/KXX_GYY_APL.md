<h1>
IF2150 REKAYASA PERANGKAT LUNAK
<br>
TUGAS 6
<br>
ARSITEKTUR PERANGKAT LUNAK (APL)
</h1>
<br>

## Kerja-In

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

<br>
<br>

# BAB 1: Style/Pattern Arsitektur Acuan

<p align="center">
<img alt="Contoh Arsitektur MVC" src="./assets/diagram/contoh-arsitektur-mvc.webp" width="70%">
</p>
<p align="center">
<i>Gambar 1.  Arsitektur MVC</i>
</p>

Tabel 1.1. Lingkungan Operasi Perangkat Lunak

| Komponen | Spesifikasi |
| --- | --- |
| Server | Node.js dengan framework Hono, dijalankan pada layanan Railway. |
| Client | Web browser modern yang mendukung JavaScript, seperti Google Chrome, Mozilla Firefox, Microsoft Edge, dan Safari versi terbaru. |
| DBMS | PostgreSQL yang disediakan melalui layanan Supabase. |
| Authentication | Supabase Auth sebagai layanan autentikasi dan pengelolaan sesi pengguna. |
| File Storage | Supabase Storage |
| OS | Cross-platform melalui web browser pada Windows, Linux, macOS, Android, dan iOS. |

Pemilihan arsitektur Model-View-Controller (MVC) sebagai acuan untuk perangkat lunak Kerja-In didasarkan pada kesesuaiannya yang kuat dengan karakteristik pengguna, alur proses bisnis, serta lingkungan teknologi sistem. Sebagai aplikasi marketplace jasa, Kerja-In melayani tiga jenis pengguna dengan kebutuhan antarmuka yang berbeda yakni Tenaga Kerja, Penyedia Kerja, dan Customer Service (CS). Pola MVC memungkinkan sistem untuk menyajikan antarmuka (View) dan logika pemrosesan (Controller) yang spesifik untuk masing-masing peran, tetapi tetap terintegrasi secara terpusat pada pengelolaan entitas data (Model) yang sama. Hal ini efektif mencegah duplikasi data dan memastikan konsistensi informasi lintas pengguna.

Selain itu, alur proses bisnis pada aplikasi ini sangat interaktif dan sepenuhnya digerakkan oleh aksi pengguna, seperti pengajuan pekerjaan, konfirmasi penyelesaian, penanganan sengketa, hingga proses pembayaran. Arsitektur MVC dirancang secara natural untuk menangani siklus permintaan dan repons yang dinamis ini, View menangkap interaksi pengguna, Controller bertindak sebagai penengah untuk memvalidasi dan memproses logika bisnis, dan Model memperbarui status pada basis data secara aman.

Dari segi pengembangan, MVC menerapkan pemisahan tanggung jawab yang tegas antara tampilan antarmuka, logika bisnis, dan aturan data. Pemisahan ini sangat menguntungkan tim pengembang karena memungkinkan pengerjaan frontend dan backend dilakukan secara paralel dan modular tanpa saling mengganggu. Terakhir, MVC merupakan fondasi bawaan dari mayoritas framework web modern yang menjadi lingkungan operasi perangkat lunak ini. Dengan menerapkan MVC, pengembangan sistem tidak hanya mematuhi standard industri, tetapi juga menjamin skalabilitas dan kemudahan pemeliharaan perangkat lunak di masa depan.

---

# BAB 2: Identifikasi Komponen / Modul / Subsistem

Komponen Kerja-In dikelompokkan berdasarkan pola MVC menjadi Model, View, dan Controller, dilengkapi komponen autentikasi, integrasi pembayaran, serta penyimpanan data dan berkas. Setiap komponen menyimpan kelas-kelas terkait pada dokumen SKPL dan mendukung alur use case yang telah ditetapkan.

Tabel 2.1. Identifikasi Komponen/Modul/Subsistem

| Nama Komponen/Modul/Subsistem | Jenis | Penjelasan |
| :--- | :--- | :--- |
| AkunModel | Model | Mewadahi kelas Pengguna, TenagaKerja, PenyediaKerja, dan CustomerService untuk mengelola data akun, peran, profil, portofolio, saldo, dan status verifikasi. Data pengajuan identitas yang tercantum sebagai VerifikasiIdentitas pada diagram kelas keseluruhan juga dikelompokkan dalam komponen ini (UC01 dan UC02). |
| LowonganModel | Model | Mewadahi kelas LowonganPekerjaan untuk mengelola deskripsi, kategori, lokasi, kuota, upah, dan status lowongan, termasuk aturan ketersediaan lowongan dan sisa kuota (UC03, UC04, dan UC06). |
| PenawaranModel | Model | Mewadahi kelas PengajuanPenawaran untuk mengelola data pelamar, pesan penawaran, waktu pengajuan, dan status persetujuan penawaran pada suatu lowongan (UC05 dan UC06). |
| PekerjaanModel | Model | Mewadahi kelas TransaksiPekerjaan dan BuktiPenyerahan untuk mengelola kesepakatan pekerjaan, tenaga kerja terpilih, status pengerjaan, bukti hasil, dan permintaan revisi (UC06, UC07, UC08, dan UC09). |
| PembayaranModel | Model | Mewadahi kelas TagihanPembayaran dan PencairanDana untuk mengelola tagihan upah beserta commission fee, batas pembayaran, permintaan penarikan saldo, tujuan transfer, dan status transaksi dana (UC07 dan UC10). |
| PenilaianModel | Model | Mewadahi kelas UlasanRating untuk mengelola rating dan ulasan setelah pekerjaan selesai, aturan satu ulasan per pihak untuk setiap pekerjaan, serta perhitungan reputasi pengguna (UC11). |
| KeluhanModel | Model | Mewadahi kelas TiketSengketa dan RiwayatSengketa untuk mengelola keluhan, bukti pendukung, status tiket, keputusan Customer Service, dan riwayat penanganan secara kronologis (UC12). |
| NotifikasiModel | Model | Mewadahi kelas Notifikasi untuk mengelola pesan, penerima, waktu pengiriman, dan status baca pemberitahuan mengenai verifikasi, penawaran, pekerjaan, pembayaran, pencairan, dan keluhan. |
| AkunController | Controller | Mewadahi kelas PenggunaController, TenagaKerjaController, PenyediaKerjaController, dan CustomerServiceController. Memproses registrasi, validasi usia, login, pembaruan profil, pengajuan identitas, persetujuan atau penolakan verifikasi, serta pemeriksaan hak akses sesuai peran; menggunakan AkunModel dan layanan Autentikasi (UC01 dan UC02). |
| LowonganController | Controller | Mewadahi kelas LowonganPekerjaanController. Memproses pembuatan lowongan, validasi isian, pencarian dan pemfilteran lowongan Open, serta pembaruan ketersediaan kuota melalui LowonganModel (UC03, UC04, dan UC06). |
| PenawaranController | Controller | Mewadahi kelas PengajuanPenawaranController. Memproses pengajuan penawaran dan pemilihan pelamar, memeriksa status verifikasi serta kuota, dan menjalankan operasi model terkait untuk mencatat penawaran serta transaksi pekerjaan bagi kandidat yang diterima (UC05 dan UC06). |
| PekerjaanController | Controller | Mewadahi kelas TransaksiPekerjaanController dan BuktiPenyerahanController. Memproses perubahan status pengerjaan, unggahan bukti, pemeriksaan hasil, permintaan revisi, dan konfirmasi penyelesaian; memvalidasi kepemilikan pekerjaan, format, serta ukuran lampiran (UC07, UC08, dan UC09). |
| PembayaranController | Controller | Mewadahi kelas TagihanPembayaranController dan PencairanDanaController. Menghitung tagihan upah beserta biaya platform, memproses pembayaran serta penarikan saldo, memvalidasi rekening dan nominal, lalu menggunakan PaymentGatewayAdapter untuk mengirim instruksi dan mencatat hasil transaksi pada PembayaranModel (UC07 dan UC10; tindak lanjut dana UC09 dan UC12). |
| PenilaianController | Controller | Mewadahi kelas UlasanRatingController. Memeriksa status pekerjaan Completed, memvalidasi rating 1-5, mencegah ulasan ganda, dan memperbarui rata-rata rating pengguna melalui model terkait (UC11). |
| KeluhanController | Controller | Mewadahi kelas TiketSengketaController dan RiwayatSengketaController. Memproses laporan dan bukti tambahan, memeriksa kewenangan Customer Service, mencatat keputusan serta riwayat, dan menerapkan tindak lanjut refund atau pencairan sesuai bukti dan status pekerjaan (UC12). |
| NotifikasiController | Controller | Mewadahi kelas NotifikasiController. Memproses pembuatan pemberitahuan kepada penerima yang sesuai, menampilkan daftar pesan dari NotifikasiModel, dan memperbarui status baca ketika pengguna membuka notifikasi. |
| AkunView | View | Mewadahi kelas PenggunaUI, TenagaKerjaUI, PenyediaKerjaUI, dan CustomerServiceUI. Menampilkan formulir registrasi/login, profil, saldo, pengajuan dokumen identitas, antrean verifikasi, serta dashboard sesuai peran. Meneruskan tindakan pengelolaan akun dan verifikasi ke AkunController (UC01 dan UC02). |
| LowonganView | View | Mewadahi kelas LowonganPekerjaanUI. Menampilkan formulir lowongan, daftar pencarian, filter, detail pekerjaan, dan ketersediaan kuota; meneruskan tindakan terkait ke LowonganController (UC03 dan UC04). |
| PenawaranView | View | Mewadahi kelas PengajuanPenawaranUI. Menampilkan formulir pengajuan penawaran, daftar pelamar beserta profil dan reputasi, serta konfirmasi pemilihan kandidat; meneruskan tindakan terkait ke PenawaranController (UC05 dan UC06). |
| PekerjaanView | View | Mewadahi kelas TransaksiPekerjaanUI dan BuktiPenyerahanUI. Menampilkan rincian transaksi, status pekerjaan, formulir unggah bukti, hasil yang diserahkan, serta pilihan persetujuan atau revisi; meneruskan tindakan terkait ke PekerjaanController (UC08 dan UC09). |
| PembayaranView | View | Mewadahi kelas TagihanPembayaranUI, PencairanDanaUI, dan PaymentGatewayUI. Menampilkan invoice, rincian upah dan biaya platform, pilihan metode, instruksi pembayaran, formulir penarikan saldo, serta status transfer; meneruskan tindakan terkait ke PembayaranController (UC07 dan UC10). |
| PenilaianView | View | Mewadahi kelas UlasanRatingUI. Menampilkan formulir rating dan ulasan serta hasil penilaian pada profil; meneruskan pengiriman penilaian ke PenilaianController (UC11). |
| KeluhanView | View | Mewadahi kelas TiketSengketaUI dan RiwayatSengketaUI. Menampilkan formulir laporan, rincian dan bukti tiket, permintaan bukti tambahan, keputusan, serta riwayat penanganan; meneruskan tindakan pengguna atau Customer Service ke KeluhanController (UC12). |
| NotifikasiView | View | Mewadahi kelas NotifikasiUI. Menampilkan daftar atau pop-up pemberitahuan dan status baca, serta meneruskan tindakan membuka pesan ke NotifikasiController. |
| PaymentGatewayAdapter | Integrasi Eksternal | Mewadahi kelas PaymentGateway dan PaymentGatewayController sebagai penghubung layanan pembayaran dummy atau layanan setara. Mengirim instruksi pembayaran, pencairan, dan refund; memverifikasi callback serta meneruskan status transaksi kepada pemroses transaksi terkait. Layanan Payment Gateway di luar aplikasi merupakan sistem eksternal. |
| Autentikasi | Pendukung | Menghubungkan aplikasi dengan Supabase Auth sesuai lingkungan operasi SKPL untuk memverifikasi kredensial dan mengelola sesi/token pengguna. AkunController menggunakannya pada registrasi/login, sementara permintaan yang dilindungi memerlukan pemeriksaan sesi dan hak akses. |
| Database | Penyimpanan Data | Menggunakan PostgreSQL pada Supabase sesuai SKPL untuk menyimpan data akun, lowongan, penawaran, pekerjaan, tagihan, pencairan, ulasan, keluhan, dan notifikasi. Mendukung pencatatan riwayat serta perubahan data transaksi yang konsisten. |
| PenyimpananBerkas | Penyimpanan Data | Menggunakan Supabase Storage sesuai SKPL untuk menyimpan dokumen identitas, lampiran hasil pekerjaan, dan bukti keluhan. Referensi berkas dicatat pada model terkait dan akses berkas dibatasi sesuai hak pengguna. |

---

# BAB 3: Model Arsitektur Perangkat Lunak

*Architectural View* adalah bagaimana cara kita melihat/mendeskripsikan arsitektur sebuah sistem dari sudut pandang tertentu. Dalam perancangan arsitektur aplikasi, dibutuhkan *Architectural View* yang dapat mempermudah pemahaman dari proses aplikasi yang akan dikembangkan. Tujuan dari *Architectural View* adalah menjadi bahan komunikasi, pemisahan masalah, mempermudah analisis, dan pemandu saat eksekusi pengembangan sistem tersebut.

Buatlah model arsitektur dari aplikasi yang akan dirancang dalam bentuk *view*. Model arsitektur ini berfungsi untuk memperlihatkan bagaimana setiap komponen, modul, dan subsistem saling berinteraksi serta berkolaborasi dalam menjalankan fungsi utama sistem secara keseluruhan. Anda dapat membuat satu atau lebih *view* tergantung kebutuhan dalam bentuk gambar. Pilihlah notasi yang sesuai. Contoh *view* yang dapat digunakan antara lain ***Logical View***, ***Process View***, ***Development View***, serta ***Physical View***.

Ketentuan pengisian BAB 3:
1. Setiap view menggambarkan **keseluruhan sistem**, bukan satu use case atau satu fitur saja.
2. Buat **minimal satu view**. Setiap view dituliskan dalam subbab tersendiri (3.1, 3.2, dan seterusnya). Tidak perlu membuat keempat view, pilih yang paling membantu menjelaskan P/L Anda, lalu jelaskan alasan pemilihannya.
3. Setiap view harus **konsisten dengan BAB 2**. Seluruh komponen pada Tabel 2.1 harus muncul dengan nama yang sama, dan tidak boleh ada komponen pada view yang tidak terdaftar di Tabel 2.1.
4. Setiap view harus **mencerminkan style/pattern pada BAB 1**. Misalnya, jika memilih MVC, pembagian *Model*, *View*, dan *Controller* harus terlihat jelas pada diagram.
5. Jika membuat lebih dari satu view, setiap view harus menggambarkan sistem yang sama dari sudut pandang berbeda. View tambahan melengkapi view pertama, bukan mengulanginya.
6. Beri label pada setiap garis atau panah yang menghubungkan komponen agar hubungan antarkomponen dapat dipahami tanpa penjelasan tambahan.
7. Jika membuat *Physical View*, gambarkan lingkungan operasi pada Tabel 1.1.

## 3.1 XXX View

Tuliskan secara singkat mengenai model arsitektur perangkat lunak yang Anda pilih dan sertakan alasan mengapa model arsitektur tersebut cocok untuk aplikasi Anda.

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="./assets/diagram/contoh-logical-view.webp" width="100%">
</p>
<p align="center">
<i>Gambar 2. Contoh Logical View pada P/L E-Commerce</i>
</p>

Gambar 2 adalah contoh *Logical View* dalam bentuk *block diagram*. Seluruh komponen pada Tabel 2.1 digambarkan dan dikelompokkan sesuai pola MVC (*View*, *Controller*, *Model*), ditambah komponen pendukung dan basis data. Sistem di luar P/L, seperti *Payment Gateway (dummy)*, digambarkan dengan garis putus-putus dan tidak perlu dimasukkan ke Tabel 2.1. Setiap garis diberi label: "Memanggil" untuk *View* yang memanggil *Controller*, "akses" untuk *Controller* yang mengakses *Model*, serta agregasi dan komposisi untuk hubungan antar-*Model*.

<sub><b><i>Catatan</i></b>: <i>Ganti XXX dengan nama view yang dibuat, misalnya Logical View. Gambar 2 hanya contoh untuk P/L e-commerce, ganti dengan view milik kelompok Anda yang memuat seluruh komponen pada Tabel 2.1. Jenis view dan notasinya boleh berbeda dari contoh. Jika membuat view tambahan, lanjutkan pola 3.x ini (3.2, 3.3, dan seterusnya).</i></sub>

---

# Referensi

- Sommerville, I. (2016). *Software Engineering* (10th ed.). Pearson. Chapter 6: *Architectural Design*: [https://software-engineering-book.com/slides/](https://software-engineering-book.com/slides/)
- Diagram arsitektur: [https://www.drawio.com/](https://www.drawio.com/), [https://staruml.io/](https://staruml.io/)
