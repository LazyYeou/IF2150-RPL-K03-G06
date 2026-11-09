# Profil dan halaman informasi — issue #27

`GET /api/profil` dan `PATCH /api/profil` mengikuti kontrak API §3.1.
Pelaku diambil dari sesi; input hanya nama (1–80), area layanan (≤150), bio (≤1000).
PATCH parsial mempertahankan field yang tidak dikirim. Area/bio kosong menjadi null.
Email, peran, status verifikasi, dan rating tidak dapat diubah melalui endpoint ini.
Respons memakai camelCase dan tidak memuat hash password atau data dokumen identitas.

`/profil` menggunakan layout sesuai peran. Setelah penyimpanan berhasil, form
menampilkan data hasil server dan `router.refresh()` memperbarui nama di header,
sidebar serta dashboard. Verifikasi ditampilkan untuk TK; rating tanpa ulasan
ditampilkan sebagai “Belum ada ulasan”. Rata-rata rating mengikuti nilai tersimpan
`akumulasi_rating` sesuai DPPL2 M8 Q-001/Q-002, bukan dihitung ulang dari form profil.

Ulasan dari transaksi berstatus `COMPLETED` ditampilkan pada halaman profil pemilik
ulasan dan pada profil publik `/profil/:id`. Profil publik hanya mengembalikan nama,
peran, area layanan, bio, status verifikasi tenaga kerja, rating, dan maksimal 20
ulasan terbaru; email dan informasi akun privat tidak disertakan.

Halaman publik `/privasi` dan `/syarat` berisi informasi lingkungan proyek.
Route lama `/ketentuan` tetap tersedia dan menampilkan isi yang sama dengan `/syarat`.
Tautan formulir pendaftaran/footer menggunakan `/syarat`.
`app/not-found.tsx` menyediakan navigasi pemulihan untuk halaman tidak ditemukan.
Tes browser memeriksa status HTTP 404 dari alamat yang tidak terdaftar.

Verifikasi: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
Tes browser: `npm run test:e2e -- profil.spec.ts` memakai database uji berisi seed;
tes mengubah nama akun uji TK sehingga jangan diarahkan ke database bersama.
