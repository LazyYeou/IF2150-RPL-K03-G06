# Pemeriksaan README dan clone bersih — issue #47

## Lingkup

Panduan yang diperiksa: [README aplikasi](../README.md), berdasarkan delapan butir [M9 §A.5](../../docs/M9/KXX_GYY_Implementasi.md#a5-isi-minimal-srcreadmemd).

Pemeriksaan lokal dilakukan pada 13 November 2026 di Windows x64, Node.js 22.23.4 dan npm 10.9.9. Kode acuan: commit `150851b612d662a3510be4ebdeaa6e6c2f461170` pada branch `dev`.

Clone uji berada di `.rpl-readme-audit/issue47-150851b`, di luar direktori repository utama. Clone dibuat dari repository Git lokal dengan `git clone --no-hardlinks --branch dev`, lalu hanya draft README disalin untuk dicocokkan. Ini menguji checkout sumber yang terlacak tanpa dependensi, DB, storage, konfigurasi rahasia, atau hasil build dari instalasi lama; bukan pengujian akses clone GitHub oleh anggota lain.

`.env.local` uji dibuat dari `.env.example`, menggunakan dua rahasia acak baru dan provider mock. Database serta `.env.local` utama tidak dipakai. Tidak ada permintaan pembayaran ke Midtrans, commit, push, atau komentar GitHub yang dibuat dalam pemeriksaan ini.

## Hasil

| Pemeriksaan di clone uji                    | Hasil                                                                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci` tanpa menyalin `node_modules` lama | Lulus (exit 0); 677 paket dipasang                                                                                              |
| Hook `npm run prepare`                      | Lulus saat diperiksa ulang; instalasi awal sempat mencetak `fatal: not in a git directory` dari Husky, meskipun `npm ci` exit 0 |
| `.env.local` dari template + rahasia baru   | Dibuat khusus pengujian, tidak menggunakan key utama atau Midtrans                                                              |
| `npm run db:reset`                          | Lulus; 5 pengguna, 30 lowongan, 5 transaksi dan 1 tiket                                                                         |
| `npm run db:migrate` setelah reset          | Lulus; 7 migrasi tercatat dan keluaran `Skema sudah terbaru`                                                                    |
| Integritas SQLite                           | `integrity_check = ok`; `foreign_key_check` mengembalikan 0 pelanggaran                                                         |
| `npm run lint`                              | Lulus                                                                                                                           |
| `npm test`                                  | **484 test lulus dalam 44 file**                                                                                                |
| `npm run build`                             | Lulus, termasuk kompilasi dan pemeriksaan tipe                                                                                  |
| `npm run typecheck` setelah build           | Lulus                                                                                                                           |
| `npm run dev -- --port 3123`                | Server siap; beranda dan `/masuk` mengembalikan HTTP 200                                                                        |
| Login seed TK, PK dan CS melalui HTTP       | Ketiganya HTTP 200, cookie sesi dibuat, tujuan redirect sesuai peran                                                            |
| Halaman setelah login                       | Dashboard ketiga peran HTTP 200 dan memuat nama akun yang sesuai                                                                |

Port smoke test diganti ke 3123 dan `APP_URL=http://localhost:3123` diteruskan hanya ke proses server uji agar tidak menggunakan server/data lokal pada port 3000. Setelah pemeriksaan, proses server uji dihentikan. Smoke test memakai HTTP, bukan klik browser; suite Playwright tidak dijalankan ulang untuk perubahan dokumentasi ini.

Catatan lingkungan: eksekusi awal dalam sandbox gagal pada informasi pengguna OS (`uv_os_get_passwd`), akses esbuild, dan unduhan font Google. Setup/test/build berhasil setelah dijalankan dengan izin lingkungan yang diperlukan, tanpa mengubah kode aplikasi atau dependensinya.

`npm ci` melaporkan **20 kerentanan dependensi** (2 low, 13 moderate, 3 high, 2 critical) serta warning deprecated. Instalasi berhasil, tetapi hasil ini bukan klaim bahwa dependensi bebas kerentanan. Lockfile tidak diubah dan `npm audit fix --force` tidak dijalankan; penanganan audit perlu ditinjau terpisah.

## Pemetaan isi wajib

| Butir A.5                     | Bagian README                                |
| ----------------------------- | -------------------------------------------- |
| Deskripsi singkat             | Pembuka                                      |
| Teknologi beserta versi       | §1                                           |
| Prasyarat dan instalasi       | §1–2                                         |
| Konfigurasi, migrasi dan seed | §2–3                                         |
| Menjalankan aplikasi dan test | §2, §4                                       |
| Akun dan data uji             | §5                                           |
| Modul dan pembagian anggota   | §6                                           |
| Tabel dan atribut/skema DB    | §7; tautan ke kontrak DB dan seluruh migrasi |

Troubleshooting di §8 menyertakan temuan nyata dari issue #6 mengenai kompilasi `better-sqlite3`, toolchain C++, dan versi Node. Isi issue dan komentarnya dibaca melalui GitHub API tanpa mengubahnya.

## Kriteria yang masih memerlukan anggota lain

Butir terakhir issue #47 **belum boleh dicentang berdasarkan pemeriksaan ini**. Anggota selain Davin perlu clone dari GitHub ke direktori baru, mengikuti README yang telah tersedia di branch/PR, lalu menulis hasilnya sendiri pada komentar issue #47. Template komentar tersedia di README §9. Pemeriksaan otomatis pada mesin Davin tidak membuktikan keberhasilan di mesin anggota lain.
