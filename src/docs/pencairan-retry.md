# Retry pencairan

Jalankan `npm run db:migrate` dari `src` sebelum menjalankan aplikasi pada DB yang sudah ada. Migrasi menambah tabel pengiriman dan mempertahankan data serta saldo; tidak perlu reset DB.

- Klien membuat UUID sekali untuk satu pengajuan dan mengirim header `Idempotency-Key` pada `POST /api/pencairan`. Simpan key yang sama ketika respons jaringan hilang. Nominal/rekening tidak boleh diganti pada key yang sama.
- `GAGAL` pada respons adalah penolakan definitif: saldo tersedia kembali. Pengajuan baru membutuhkan key baru.
- `bisaCobaUlang: true`/HTTP 202 berarti hasil belum pasti: saldo tetap ditahan. Gunakan `POST /api/pencairan/:id/ulang` (TK terverifikasi pemilik), bukan membuat pengajuan baru. UI menyediakan tombol di Riwayat Pencairan, termasuk setelah memuat ulang halaman.
- Setelah `DITERIMA`, tunggu callback gateway. Tidak ada debit sampai callback `BERHASIL`; callback berulang tetap hanya satu debit.
- Batas tunggu adapter 10 detik, lease pengiriman 30 detik. Setelah proses terhenti, pengajuan yang klaimnya kedaluwarsa dapat diulang memakai ID yang sama. Tidak ada pembebasan saldo otomatis akibat timeout.
- Adapter gateway harus menjamin idempotensi untuk `idPencairan`; perilaku mock diuji dengan simulasi respons hilang sesudah instruksi tercatat. Gateway produksi belum tersedia dalam proyek.

Validasi: `npm test -- tests/integration/pencairan-retry.test.ts` dan suite regresi pencairan/dompet/payment.
