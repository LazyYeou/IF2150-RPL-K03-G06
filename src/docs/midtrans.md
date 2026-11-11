# Integrasi Midtrans sandbox

Perbaikan integrasi PR #113 / issue #53: tidak ada lagi sukses refund/pencairan berdasarkan log lokal saja. Default aplikasi tetap `PAYMENT_PROVIDER=mock`.

## Konfigurasi dan upgrade

Hentikan server dan jalankan `npm run db:migrate` dari `src` sekali untuk menerapkan `0005_operasi_midtrans.sql`. Tidak perlu reset/seed DB pengguna. Isi `.env.local` (jangan commit kunci):

```env
PAYMENT_PROVIDER=midtrans
MIDTRANS_SERVER_KEY=<Server Key Snap/Core sandbox>
MIDTRANS_IRIS_API_KEY=<API key Iris Creator sandbox, berbeda dari Server Key>
MIDTRANS_IS_PRODUCTION=false
```

Atur Payment Notification URL di dashboard Midtrans dan notification URL Iris ke endpoint HTTPS publik `/api/webhooks/payment`. Localhost membutuhkan tunnel yang dapat dijangkau gateway. API key produksi tidak dipakai untuk pengujian otomatis.

## Pembayaran dan webhook

Notifikasi Core menggunakan `signature_key` SHA-512 dari body. Header HMAC simulator hanya berlaku ketika provider `mock`; fallback HMAC tidak diterima oleh Midtrans. Setelah signature valid, aplikasi mengambil GET status menggunakan Server Key. Status dan `fraud_status` berasal dari GET tersebut, bukan dari field callback yang tidak tercakup signature. Nominal IDR harus bilangan bulat positif dan sama dengan invoice.

`settlement`/`capture` yang disetujui menjadi `BERHASIL`; fraud `challenge` tetap `DIPROSES`, fraud `deny` menjadi `GAGAL`. `pending`/`authorize` menjadi `DIPROSES`, `deny`/`cancel`/`failure` menjadi `GAGAL`, `expire` menjadi `KEDALUWARSA`. Event refund tidak melewati alur pembayaran biasa; finalisasinya tetap melalui keputusan sengketa. Callback duplikat tidak menggandakan notifikasi/debit/kredit.

## Refund

Refund memakai Core API dengan `refund_key=refund:<idTiket>` dan nominal total invoice. GET status digunakan untuk rekonsiliasi sebelum POST, termasuk setelah timeout/restart. Respons sukses harus cocok order, key, nominal, status_code `200`, dan status transaksi `refund`/`partial_refund`. HTTP 200 saja tidak cukup. Respons penolakan, pending, error, timeout, dan bentuk respons yang tidak dikenal tidak boleh menutup sengketa atau mengubah invoice menjadi `DIKEMBALIKAN`; operasi tetap belum dikonfirmasi. CS dapat mengulangi keputusan yang sama untuk rekonsiliasi.

## Pencairan bank melalui Iris

Form menambahkan pilihan bank; format baru `BANK:<kode bank>:<10-16 digit>`, misalnya `BANK:bca:1234567890`. Rekening tetap terenkripsi di DB dan disamarkan di log. Format lama `BANK:<nomor>` dan e-wallet tetap berlaku untuk mock, tetapi ditolak sebelum reservasi saldo pada Midtrans karena tujuan tidak cukup spesifik / channel belum didukung. Form Midtrans hanya menampilkan pilihan rekening bank. Dukungan e-wallet Iris belum diimplementasikan.

Adapter memvalidasi rekening melalui `/account_validation`, menggunakan nama pemilik hasil validasi, kemudian POST `/payouts` di luar transaksi DB. `DITERIMA` berarti Iris mengembalikan `reference_no`, bukan dana sudah diterima pekerja. **Approver tetap menyetujui payout melalui dashboard Iris.** Status queued/approved/processed tetap menunggu; debit saldo hanya setelah GET payout detail mengonfirmasi completed (atau success), nominal, bank, dan rekening yang sama. Callback Iris hanya memicu GET terautentikasi; field status callback tidak dipercaya.

Tabel `operasi_midtrans` menyimpan sidik instruksi, klaim, hasil, dan referensi provider; tidak menyimpan rekening mentah. Retry dengan isi berbeda ditolak. Replay yang sudah diterima tidak membuat payout baru.

Respons payout yang datang setelah lease berpindah tetap menyimpan `reference_no` dan log sebagai bukti instruksi yang sama, tanpa menimpa klaim/status worker baru. Worker yang kehilangan klaim mengembalikan `GATEWAY_UNCERTAIN`; retry berikutnya menggunakan GET detail atas referensi tersimpan, bukan POST payout kedua. Error fetch/abort/timeout juga dipetakan ke 502 `GATEWAY_UNCERTAIN` tanpa detail upstream. Tidak ada migrasi tambahan untuk perbaikan ini.

GET detail Iris menggunakan field `bank` (sesuai model respons SDK resmi); `beneficiary_bank` tetap diterima sebagai alias kompatibilitas. Jika keduanya ada tetapi berbeda, respons ditolak. `amount` tetap divalidasi sebagai string IDR bulat positif. Status `BERHASIL` pada operasi `DISBURSEMENT` berarti **instruksi diterima**, sedangkan hasil transfer tetap berada pada `pencairan_dana`; queued/approved/processed tidak mendebit saldo.

Jika respons POST payout hilang sebelum `reference_no` tersimpan, jangan membuat pengajuan pengganti atau POST ulang secara buta. Operasi tetap `BELUM_PASTI`, reservasi dipertahankan. Operator mencari payout di dashboard Iris menggunakan notes `kerjain:<idPencairan>`, lalu menjalankan:

```sh
npm run midtrans:reconcile -- <idPencairan> <reference_no>
```

CLI melakukan GET detail dan memverifikasi notes, nominal, bank, rekening, serta klaim operasi sebelum mengaitkan referensi; tidak mengirim payout. Setelah itu gunakan **Coba lagi** pada pengajuan yang sama dan tunggu callback hasil akhir. Jangan menghapus marker operasi untuk memaksa retry. Bila gateway tidak menunjukkan payout yang pasti, lanjutkan pemeriksaan operator; aplikasi tidak menebak bahwa transfer gagal.

Log MIDTRANS dari versi lama bukan bukti transfer/refund: versi tersebut dapat mencatat sukses tanpa jaringan. Status/tagihan lama yang terlanjur final harus diaudit terhadap dashboard provider; migrasi tidak mengubah riwayat keuangan tersebut secara otomatis.

## Pengujian

`npm test`, `npm run lint`, `npm run typecheck`, `npm run build`. Setelah build: `npm run test:e2e:transaksi` (opsional `PLAYWRIGHT_CHANNEL=msedge` di Windows). Semua tes integrasi menggunakan SQLite sementara dan HTTP stub, tanpa kunci gateway nyata atau transfer uang. Uji sandbox langsung membutuhkan akun Snap/Core serta Iris yang telah diaktifkan; kelulusan tes stub bukan bukti konfigurasi akun/tunnel sudah benar.

Referensi: [notifikasi Midtrans](https://docs.midtrans.com/docs/https-notification-webhooks), [refund](https://docs.midtrans.com/reference/refund-transactions-card), [GET status](https://docs.midtrans.com/reference/get-transaction-status), [SDK Iris resmi](https://github.com/Midtrans/midtrans-nodejs-client/blob/master/lib/iris.js), [peran/approval/status Iris](https://github.com/Midtrans/technical-documentation-site/blob/master/en/disbursement/dashboard-usage.md).
