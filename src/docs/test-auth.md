# Pengujian autentikasi — issue #40

## Cakupan

- `tests/unit/usia.test.ts`: unit hitung usia penuh lewat fungsi produksi
  `validasiBatasUsia` (DPPL2 M8 Algo validasiBatasUsia). Batas sehari sebelum,
  tepat, sesudah 17 tahun; pergantian hari WIB; 29 Februari; tahun 1900/2000;
  tanggal mustahil, format salah, dan masa depan.
- Aturan yang sudah dipakai produksi tetap: kelahiran 29 Februari mencapai
  usia baru pada 1 Maret di tahun nonkabisat. Tidak ada perubahan aturan bisnis.
- `auth-flow.test.ts`: registrasi TK/PK, persetujuan privasi, usia melalui API,
  email duplikat, login sukses/gagal, logout mencabut sesi, cookie/token, sesi
  kedaluwarsa ditolak endpoint autentikasi. Tanggal untuk batas usia dibekukan
  dengan fake timer **Date saja**, sehingga hashing/native IO tetap nyata.
- `auth.test.ts`: hashing/verifikasi, sesi baru/kedaluwarsa/diperpanjang,
  guard 401/403, middleware dan CSRF.
- `reset-sandi.test.ts`: reset mencabut seluruh sesi pengguna di beberapa
  perangkat, token lama ditolak, password lama gagal dan password baru berhasil;
  sesi pengguna lain tetap berlaku. Termasuk kedaluwarsa, pemakaian ulang,
  konkurensi reset, dan rollback jika pencabutan sesi gagal.

## Helper bersama

Model yang memakai koneksi eksplisit dapat menggunakan `dbSementara()`:
migrasi dan seed otomatis, DB berbeda per pemanggilan. `{ seed: false }`
menyiapkan skema kosong. Panggil `tutup()` pada `afterAll`.

Untuk controller yang mengimpor singleton `lib/db`, panggil helper **sebelum**
impor modul aplikasi secara dinamis:

```ts
let tutupDb: (() => void) | undefined;
beforeAll(async () => {
  const sementara = await dbAplikasiSementara();
  tutupDb = sementara.tutup;
  controller = await import("@/controllers/PenggunaController");
});
afterAll(() => tutupDb?.());
```

Helper mengikat singleton ke SQLite sementara, lalu memulihkan `DATABASE_PATH`
dan singleton awal saat ditutup. Helper menolak mengganti koneksi singleton
yang sudah terbuka. Cleanup idempoten dan kegagalan setup membersihkan DB.
`test-db.test.ts` memeriksa isolasi, migrasi/seed, pemulihan environment,
pembersihan berkas, dan penolakan menimpa koneksi aktif.

Suite auth/session/reset memakai helper ini. Helper `dbSementara()` lama tetap
kompatibel dengan suite milik anggota lain. Jalankan suite dengan isolasi file
default Vitest; jangan menonaktifkan isolasi karena modul singleton di-cache.

Verifikasi: `npm run lint`, `npm run typecheck`, `npm test`.
Tes memakai SQLite di direktori sementara OS, tanpa menyentuh DB pengembangan.
