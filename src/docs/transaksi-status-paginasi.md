# Status, timeline, dan daftar transaksi

Peta `transisiDiizinkan()` mengikuti `contracts/modules.md` §2. Status final tidak dapat dibuka kembali. Tagihan setelah gagal/kedaluwarsa harus dibuat baru, bukan mengubah tagihan lama kembali ke `DIPROSES`.

`DISENGKETAKAN` dapat kembali ke `IN_PROGRESS` atau `SUBMITTED`. Controller pemrosesan tiket harus memilih status yang tersimpan dalam `status_sebelum_sengketa`, sesuai kontrak, ketika tiket ditolak/dibatalkan. Perubahan ini memperbaiki peta transisi; tidak menambahkan endpoint pemrosesan tiket baru.

Timeline membedakan status aktif dan tahap yang pernah tercapai. Sumbernya adalah status sekarang, status sebelum sengketa, bukti/catatan revisi, serta tagihan berstatus `BERHASIL`/`DIKEMBALIKAN`. Data pembatalan lama tanpa bukti pembayaran tidak menandai pekerjaan pernah berjalan. Riwayat penyerahan tetap terlihat ketika pekerjaan direvisi atau disengketakan.

Daftar TK `/tk/pekerjaan` dan PK `/pk/transaksi` mendukung `page` dan `status`. Filter selalu kembali ke halaman 1 dan dibawa saat memilih halaman lain. API `GET /api/transaksi?peran=TK|PK&status=...&page=...` memfilter data beserta `total`, tetap membatasi pemilik, dan mengurutkan dengan `created_at DESC, id_transaksi DESC` agar halaman tidak bertumpuk ketika timestamp sama. Query tidak valid mendapat 400 pada API; halaman dengan query tidak valid menampilkan 404.

## Pengujian

- `npm test`: seluruh pasangan status enam jenis dibandingkan dengan kontrak, kasus timeline, filter, kepemilikan, dan paginasi >12 transaksi.
- `npm run build` lalu `npm run test:e2e:transaksi`: 19 skenario browser untuk akses detail, paginasi/filter TK/PK, dan timeline. Konfigurasi ini membuat DB/storage sementara terpisah dari `.env.local` dan menolak memakai server lain pada port 3117.
- Browser default Chromium. Untuk Edge pada PowerShell, set `$env:PLAYWRIGHT_CHANNEL = 'msedge'` sebelum menjalankan tes browser.
