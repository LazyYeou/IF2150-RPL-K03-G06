# Layout dan navigasi — issue #19

Referensi visual: I-01, I-11, I-12 serta screenshot I-13/I-14 yang diberikan pengguna.
Logo berasal dari `logo-icon.png` pengguna, disalin tanpa perubahan ke `public/`.
Font sementara menggunakan Geist Sans yang sudah ada di proyek.

## Struktur

- Layout root menyediakan header/footer publik, skip link, dan toast provider.
- Layout `/tk`, `/pk`, `/cs` memvalidasi sesi dan peran di server melalui controller.
- Sidebar desktop menjadi menu dialog pada mobile; fokus dikelola Base UI Dialog,
  Escape menutup dialog dan mengembalikan fokus. Target sentuh minimal 44 px.
- Tidak ada perpindahan peran akun; menu berasal dari sesi yang tervalidasi.
- Dashboard TK/PK menampilkan nama pengguna dan jumlah lamaran menunggu/lowongan
  dari controller yang tersedia. Area `data-slot="dashboard-summary"` disiapkan
  untuk ringkasan modul lain tanpa angka atau transaksi fiktif.
- Halaman tujuan menu yang belum menjadi fitur lengkap berupa kerangka.
  Daftar/detail pekerjaan publik memakai controller lowongan yang sudah tersedia;
  implementasi filter, penawaran, dompet, profil, dan transaksi lengkap tetap di issue masing-masing.

## Dasar kegiatan CS

- SKPL M5 §3.1: KF05–KF06 mengatur verifikasi identitas, KF24–KF26 mengatur tiket,
  penyelesaian sengketa, bukti pendukung, dan riwayat kronologis.
- DPPL2 M8: CustomerServiceUI (C19), CustomerServiceController (C34),
  TiketSengketaUI (C27), dan RiwayatSengketaUI (C28) memetakan UC02 dan UC12.
- PRD serta kontrak M9 merinci keputusan verifikasi dan penanganan tiket.

Karena itu menu CS adalah **Verifikasi identitas** dan **Tiket & sengketa**.
Antrean verifikasi membaca data nyata dari controller yang ada dan menyediakan
dialog ringkasan serta akses dokumen terotorisasi. Persetujuan/penolakan lengkap
tetap bagian UI verifikasi (#31). Pengguna seed menunggu verifikasi tidak memiliki
berkas identitas fisik, sehingga endpoint dokumennya mengembalikan 404.

Area tiket saat ini adalah kerangka berisi kegiatan tinjau laporan/bukti,
telusuri riwayat, dan tentukan penyelesaian (minta bukti, tolak, refund/pencairan).
Belum mengambil atau mengubah tiket karena backend UC12 belum tersedia di branch ini.
Tidak ada perubahan kontrak API/DB, keputusan keuangan, atau dokumen arsip milestone.

## Verifikasi

`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
Tes browser: `npm run test:e2e -- layout.spec.ts` dengan database uji berisi seed.
Jangan arahkan tes mutasi/logout ke server yang sedang dipakai pengguna lain.
