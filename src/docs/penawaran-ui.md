# Integrasi UI penawaran #101

Alur visual dialog pengajuan, tinjauan, dan konfirmasi tarik dari branch feat/ui-dialog-penawaran (6b1f741) dipindahkan ke aplikasi tim di src. Konfigurasi aplikasi kedua, data contoh, localStorage penawaran, layout pengganti, dan route /jobs tidak dipakai. Header sesi, navigasi peran, notifikasi, dashboard dan route /lowongan tetap milik aplikasi yang sama.

- Detail /lowongan/:id membaca data sebenarnya dan penawaran aktif milik TK melalui controller. UI memeriksa sesi/peran/verifikasi/status lowongan; API tetap menjadi pengaman akhir.
- Dialog memakai ControlledDialog dari komponen bersama: fokus, Escape, Tab/Shift+Tab, dan pengembalian fokus. Upah, ketersediaan dan pesan divalidasi dengan AjukanPenawaranInput yang sama dengan backend. Langkah tinjau tidak mengirim request.
- Kirim POST /api/penawaran hanya setelah konfirmasi; tombol dikunci selama request dan ref mencegah klik berulang. Respons 400 ditampilkan per field, 401 menawarkan masuk kembali, 403 NOT_VERIFIED mengarahkan ke profil/status yang tersedia, dan 409 menampilkan alasan penawaran ganda/kuota penuh.
- /tk/lamaran mengambil GET /api/penawaran/saya tanpa cache browser aplikasi; tidak menyimpan penawaran di localStorage. Status dan halaman ada pada URL, dapat di-refresh. Semua status backend ditampilkan. Halaman di luar jangkauan kembali ke halaman terakhir.
- Tarik membutuhkan konfirmasi dan POST /api/penawaran/:id/tarik. Hanya MENUNGGU memiliki tombol. API tetap memeriksa pemilik/status dan menolak permintaan lama setelah diterima. Setelah ditarik, data dimuat ulang dan pengajuan ulang dibolehkan oleh backend bila lowongan masih terbuka.
- Router refresh dan halaman dashboard yang membaca controller membuat jumlah Penawaran menunggu mengikuti perubahan pengajuan/penarikan. Notifikasi PK tetap dikirim backend yang sudah ada.
- Halaman upload verifikasi lengkap tetap cakupan #14; UI #101 tidak membuat tautan ke halaman yang belum tersedia. Backend verifikasi #20 tetap dipakai sebagai gate.

Pengujian: npm test, npm run typecheck, npm run lint, npm run build. Browser dengan SQLite sementara: npm run test:e2e:penawaran (set PLAYWRIGHT_CHANNEL=msedge jika memakai Edge). Runner memakai konfigurasi integrasi yang sudah tersedia, tanpa menyentuh data/kerjain.db pengguna. Suite mencakup pengajuan nyata sampai terlihat PK/notifikasi, tarik dan ajukan ulang, perubahan dashboard, error 409 nyata, gate peran, isolasi akun, paginasi/filter, dan keyboard pada 360/768/1280px.

Issue #95-#98 dan perubahan kebijakan rekening bukan bagian branch ini.
