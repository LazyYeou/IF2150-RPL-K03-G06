# Autentikasi — issue #8

Jalankan aplikasi dari `src/` dengan `npm run dev`, lalu buka `/daftar` atau `/masuk`.
Registrasi hanya untuk TK dan PK. Akun CS disediakan melalui seed. Setelah login,
pengguna diarahkan ke `/tk`, `/pk`, atau `/cs`; halaman awal tersebut menyediakan tombol Keluar.
Halaman ini adalah tujuan awal autentikasi, belum mencakup dashboard domain lainnya.

Akun seed: `tk1@kerjain.test`, `tk2@kerjain.test`, `tk3@kerjain.test`,
`pk1@kerjain.test`, `cs1@kerjain.test`; kata sandi `Password123!`.
Hanya gunakan data fiktif untuk pengujian. `db:reset` menghapus database lokal.

Login, registrasi, dan lupa sandi masing-masing punya batas 5 percobaan per 15 menit per
IP+email; pada login hanya percobaan yang gagal dihitung. Email dinormalisasi ke huruf kecil. Limiter disimpan di memori
proses, sehingga restart mereset jatah dan beberapa instance tidak berbagi jatah.
Secara default semua koneksi memakai identitas IP `local` karena Request Next.js
tidak menyediakan alamat socket. Untuk deployment di belakang proxy tepercaya yang
menimpa `X-Forwarded-For`, set `TRUST_PROXY=true` agar alamat dari proxy digunakan.
Jangan aktifkan bila klien bisa mengatur header tersebut langsung.

Validasi usia menggunakan tanggal kalender Asia/Jakarta. Error validasi field
mengikuti kontrak `src/docs/contracts/api.md`. `/privasi` (I-24) dan `/ketentuan` (I-25)
berisi informasi penggunaan lingkungan proyek dan dibuka pada tab baru dari form.

Verifikasi otomatis: `npm test -- tests/integration/auth-flow.test.ts`.
Tes mencakup registrasi kedua peran, rollback profil, duplikat email, batas usia,
privasi, login ketiga peran, cookie/token, logout, dan rate limit.
