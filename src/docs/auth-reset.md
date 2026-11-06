# Lupa dan reset kata sandi — issue #9

Buka `/masuk` → **Lupa kata sandi?**, lalu masukkan email akun uji.
Respons selalu sama untuk email valid, baik terdaftar maupun tidak.
Untuk akun terdaftar, tautan `/reset-sandi?token=...` dicetak ke terminal
server Next.js sesuai kebutuhan proyek; belum ada pengiriman email eksternal.
Salin tautan dari terminal dan isi kata sandi baru (8–72 karakter).

Token acak 32 byte berlaku 30 menit dan hanya SHA-256-nya disimpan di
`reset_sandi`. Setelah reset, kata sandi diganti dengan hash Argon2id,
semua token reset pengguna ditandai dipakai, dan semua sesi pengguna dicabut
dalam satu transaksi `BEGIN IMMEDIATE`. Login ulang dengan sandi baru diperlukan.
Token diperiksa ulang setelah hashing di dalam transaksi untuk mencegah pemakaian ganda.

Lupa sandi menggunakan limiter memori yang sama dengan login/registrasi:
5 percobaan per 15 menit per IP+email. Restart proses mereset limiter.
Pengaturan proxy mengikuti `TRUST_PROXY` yang sudah tersedia pada `.env.example`.
Gunakan akun fiktif untuk pengujian, dan jangan membagikan log berisi tautan reset aktif.

Tes integrasi: `npm test -- tests/integration/reset-sandi.test.ts`.
Tes browser: `npm run test:e2e -- reset-sandi.spec.ts` (memerlukan browser Playwright).
