# Perbaikan hasil review #95?#98

## #95 Refund sengketa

`prosesRefundTagihan(idTransaksi, idTiket, catatan?)` tetap fungsi integrasi internal untuk #39, bukan endpoint publik baru. Sekarang mewajibkan sesi CS, tiket yang benar-benar terkait transaksi, pembayaran berhasil, pekerjaan DISENGKETAKAN, dan belum ada ledger `upah:<idTransaksi>`. Memanggil fungsi ini berarti CS memilih keputusan REFUND; catatan 10?1000 karakter disimpan pada operasi dan riwayat.

`operasi_refund` (migrasi 0004) mengikat satu tagihan, transaksi, tiket, dan CS. Sebelum menghubungi gateway, tiket ditinjau oleh CS lalu dikunci DIPROSES/REFUND mengikuti peta transisi; tiap langkah dicatat pada riwayat. Trigger DB mencegah pembatalan, penggantian keputusan, pemulihan status pekerjaan, dan kredit upah yang bersaing dengan refund. Kunci gateway tetap `refund:<idTiket>`.

Panggilan jaringan di luar transaksi DB, timeout 10 detik, lease 30 detik. Permintaan bersamaan saat lease aktif mengembalikan `{ok:false,status:'DIPROSES'}` tanpa instruksi tambahan; pemanggil #39 wajib memeriksa `ok/status`. Timeout/exception menghasilkan 502 dan BELUM_PASTI; respons GAGAL menghasilkan 502 dan GAGAL. Keduanya tetap mengunci tiket untuk retry keputusan yang sama. Jangan memulihkan pekerjaan atau memilih PENCAIRAN karena timeout bukan bukti dana belum dikembalikan.

Setelah gateway BERHASIL, satu transaksi DB memeriksa seluruh hasil update dan menyelesaikan tagihan DIKEMBALIKAN, pekerjaan DIBATALKAN, tiket DITUTUP, riwayat, dan notifikasi kedua peserta. Gagal finalisasi tetap dapat direkonsiliasi dengan retry kunci sama. Pengulangan hasil final tidak mengirim instruksi/notifikasi ulang. Endpoint keputusan lengkap dan UI CS tetap cakupan #39/#37.

## #96 Dialog pencairan

Dialog native modal (`showModal`) membuat konten belakang inert, ditambah penjagaan Tab/Shift+Tab pada batas kontrol agar fokus berputar di dalam dialog, mendukung Escape, dan mengembalikan fokus ke tombol Tarik Dana. Fokus awal di nomor rekening. Tombol dan input dialog memiliki target minimum 44px. Diuji Playwright pada 360/768/1280px melalui `npm run test:e2e:transaksi` setelah build.

## #97 Kontrak transaksi

Kontrak API menyertakan filter status GET transaksi dan bentuk respons upload bukti berupa TransaksiDetail. Respons setujui/revisi/ulasan dipertahankan sesuai implementasi dan divalidasi dalam tes integrasi memakai skema respons. Review PR ini menjadi tempat konfirmasi pemilik modul dan pemakai kontrak; tidak menyatakan persetujuan orang lain sudah diperoleh.

## #98 Kebijakan rekening KNF17

Mengikuti SKPL: enkripsi penyimpanan ditambah masking, bukan memilih masking saja. Rekening baru dienkripsi AES-256-GCM, IV acak 12 byte, tag 16 byte; AAD mengikat ciphertext pada ID payout/profil agar tidak bisa ditukar antarbaris. Format `enc:rekening:v1:<base64url>`. Subkey enkripsi dan sidik rekening diturunkan secara terpisah melalui HKDF-SHA256 dari FILE_ENCRYPTION_KEY. Tidak ada default key produksi. Key yang hilang/salah atau ciphertext diubah harus gagal.

Rekening lengkap hanya dibuka di server untuk memanggil adapter transfer. Respons/tampilan memakai rekeningMasked. Log gateway menyimpan rekeningMasked serta HMAC sidik rekening untuk pemeriksaan idempotensi; tidak menyimpan rekening lengkap atau kredensial. Sanitasi terpusat berlaku juga pada callback dan payload JSON string.

Data lama dibaca kompatibel selama transisi. Untuk memenuhi perlindungan penyimpanan seluruh data, jalankan migrasi maintenance di bawah; implementasi tidak menganggap data lama otomatis sudah terenkripsi. Sanitasi log lama merupakan pengecualian migrasi pada append-only: hanya payload sensitif diperbaiki, ID/waktu/urutan catatan dipertahankan. Drop/restore trigger update dilakukan dalam satu transaksi, rollback mengembalikan trigger jika gagal. Operasi aplikasi normal tetap append-only. CLI mengaktifkan secure_delete selama perubahan, lalu checkpoint WAL dan VACUUM.

Kebijakan teknis ini diajukan untuk review pemilik rancangan pada PR ini, tanpa mengklaim persetujuan sudah diberikan.

## Menjalankan pada DB yang sudah ada

1. Hentikan server aplikasi.
2. Pastikan FILE_ENCRYPTION_KEY di src/.env.local tetap kunci lama yang sudah dipakai untuk KTP; jangan menggantinya saat upgrade.
3. Dari src: `npm run db:migrate` lalu `npm run db:protect-accounts`.
4. Jalankan aplikasi kembali. Tidak perlu db:reset; saldo dan data lain dipertahankan.

Kedua CLI membaca .env.local dan menghormati env yang sudah disetel (termasuk DATABASE_PATH). Maintenance idempoten dan tidak mencetak nomor rekening/kunci. Kunci diperlukan untuk membuka kembali data terenkripsi; salinan DB/backups lama perlu perlindungan operasional yang sama. Pengujian menggunakan key dan DB fixture tersendiri.
