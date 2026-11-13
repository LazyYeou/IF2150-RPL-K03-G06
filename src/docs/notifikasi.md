# Notifikasi — issue #28

`kirimNotifikasi(idPengguna, pesan, tautan?)` tetap memiliki signature
`Promise<void>` sesuai kontrak modul. Fungsi dipakai internal sesudah transaksi
bisnis berhasil; tidak ada endpoint publik untuk mengirim notifikasi.
Penyimpanan SQL dipindahkan ke model `Notifikasi`, memakai tabel/index yang sudah ada.

`GET /api/notifikasi` memerlukan sesi, menampilkan paling banyak 20 terbaru
(waktu kirim menurun, lalu urutan penyimpanan untuk waktu sama).
`?belumDibaca=true` menyaring item, sedangkan `jumlahBelumDibaca` selalu mencakup
seluruh notifikasi belum dibaca milik pengguna. Respons tidak di-cache.

`POST /api/notifikasi/:id/baca` hanya mengubah milik pengguna dari sesi.
ID tidak dikenal atau milik orang lain menghasilkan 404 tanpa perubahan.
Pengulangan penandaan oleh pemilik tetap menghasilkan 204.

Saat PK menyetujui hasil, TK menerima notifikasi upah masuk. Saat PK meminta
revisi, TK menerima notifikasi permintaan revisi dengan tautan ke transaksi.
Keduanya hanya dikirim setelah perubahan transaksi berhasil di-commit.

Lonceng muncul di header desktop/mobile setelah login. Polling dimulai saat
komponen terpasang, berjalan setiap 30 detik, dan berhenti saat komponen dilepas.
Membuka popover/menekan retry juga memuat ulang data. Request tidak ditumpuk
dan dibatalkan saat komponen dilepas. Komponen diberi key ID pengguna agar
data akun lama tidak terbawa ketika akun berganti.

Klik notifikasi menandai baca setelah server berhasil, lalu membuka tautan
internal bila tersedia. URL eksternal, protokol skrip, dan path berbahaya diabaikan.
Gagal menandai tidak mengubah status lokal. Popover dapat digunakan dengan
keyboard, ditutup Escape, dan mengembalikan fokus ke lonceng.

Verifikasi: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
Tes browser `notifikasi.spec.ts` memakai database terpisah dengan seed; tes
menyetujui TK3 melalui API CS untuk membuktikan integrasi notifikasi lintas modul.
