# Panduan Kontribusi — Kerja-In

Alur kerja tim G06 untuk Tugas 9. Lingkup produk di [`src/docs/PRD.md`](src/docs/PRD.md), rancangan teknis di [`Kerja-In_Rancangan_Pengembangan.md`](Kerja-In_Rancangan_Pengembangan.md).

## 1. Setup lokal

Prasyarat: **Node.js 20 LTS atau 22 LTS**, npm ≥ 10, Git. Tidak perlu Docker atau akun layanan apa pun.

```bash
git clone https://github.com/LazyYeou/IF2150-RPL-K03-G06.git
cd IF2150-RPL-K03-G06/src
npm ci
cp .env.example .env.local
npm run db:reset   # setelah issue #4 selesai
npm run dev        # http://localhost:3000
```

Isi `.env.local`:
- `FILE_ENCRYPTION_KEY`: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `PAYMENT_WEBHOOK_SECRET`: string acak panjang apa saja.

Centang nama Anda di issue #6 setelah langkah di atas berhasil.

**Native module gagal terpasang** (`better-sqlite3`, `@node-rs/argon2`): pastikan memakai Node LTS (bukan versi "Current"), hapus `node_modules` lalu `npm ci` ulang. Di Windows pasang Visual Studio Build Tools workload **"Desktop development with C++"** atau pakai WSL. Tulis solusi yang berhasil di komentar issue #6.

## 2. Mengambil pekerjaan

1. Ambil issue yang di-assign ke Anda di milestone `M9 – Implementasi`. Cek kolom **Bergantung**; bila issue hulu belum selesai, pakai data seed atau fixture (`views/__fixtures__/`).
2. Pindahkan kartu di GitHub Projects: *Backlog → To Do → In Progress → Review → Done*.
3. Blocker lebih dari 2 jam → lapor di grup dan beri label `blocker`.

## 3. Branch & commit

- Buat branch dari `dev` terbaru: `feat/<modul>-<fitur>`, `fix/…`, `docs/…`, `chore/…`, `test/…`. Contoh: `feat/penawaran-pilih-pelamar`.
- Format commit (ditegakkan commitlint lewat hook husky):

  ```
  <tipe>(<scope>): <deskripsi singkat, huruf kecil>
  ```

  Tipe: `feat` `fix` `test` `docs` `chore` `perf` `refactor` `style` `ci` `build` `revert`. Scope wajib, berupa modul: `auth`, `verifikasi`, `lowongan`, `penawaran`, `transaksi`, `pembayaran`, `dompet`, `ulasan`, `sengketa`, `notifikasi`, `profil`, `storage`, `db`, `ui`, `api`, `ci`, `setup`, `release`.
- Commit kecil dan sering. Jangan meng-commit `.env*` (kecuali `.env.example`), `data/`, `storage/`, `node_modules/`.
- Tidak ada atribusi AI di commit/PR; catat penggunaan AI di `docs/K03_G06_AI-Usage.md`.

## 4. Pull request

1. Sebelum push: `npm run lint && npm run typecheck && npm test` lulus.
2. Buka PR ke `dev` dengan templat PR (PR `dev` → `main` hanya saat rilis, lihat §7): `Closes #n`, UC/KF terkait, bukti (screenshot + hasil test), checklist keamanan, traceability.
3. PR kecil (< ±400 baris). Fitur besar dipecah.
4. CI (`ci`) wajib hijau; `main` butuh 1 approval.

### Reviewer

| Penulis PR | Reviewer utama | Cadangan |
|---|---|---|
| Davin | Sebastio | Ridwan |
| Aditya (FE) | Davin | Sebastio |
| Ridwan (BE) | Karmel | Davin |
| Karmel | Ridwan | Sebastio |
| Sebastio | Karmel | Davin |

- PR berlabel `uang` (tagihan, saldo, pencairan, refund) **wajib** di-review Karmel + 1 orang lain.
- PR frontend yang memanggil endpoint baru: mention Ridwan untuk cek kontrak request/response.
- Reviewer memeriksa: kriteria penerimaan teruji, guard & validasi Zod di server, ID pelaku dari sesi, query ber-parameter, tidak ada `await` di dalam `tx()`, tidak ada rahasia di diff.

## 5. Definition of Done

- [ ] Kriteria penerimaan KF di issue lolos dan ada test-nya
- [ ] Otorisasi & validasi server ada
- [ ] Lint, typecheck, CI hijau
- [ ] Di-review 1 anggota lain; PR menautkan issue + screenshot
- [ ] Baris traceability (rancangan §16 / B.5) dan B.1 (§21) diperbarui bila ada deviasi

## 6. Perubahan bersama

Kontrak tim ada di [`src/docs/contracts/`](src/docs/contracts/): [`db.md`](src/docs/contracts/db.md), [`api.md`](src/docs/contracts/api.md), [`modules.md`](src/docs/contracts/modules.md). Perubahan kontrak memperbarui dokumennya **di PR yang sama**.

- **Skema DB**: migrasi baru = file baru bernomor di `db/migrations/`. Jangan mengedit migrasi yang sudah di-merge. Perbarui `db.md` dan seed.
- **API & kontrak antarmodul** (`api.md`, `modules.md`, skema `lib/validation/*`): perubahan harus diumumkan di grup, fixture diperbarui, dan pemilik modul pemakai ikut me-review.
- **Layout & komponen bersama** dimiliki Davin; minta review Davin bila mengubahnya.
- Keputusan teknis yang diperdebatkan diputus project lead (Ridwan).

## 7. Rilis & deploy

Penilaian memakai **tag release `v9.x` terakhir sebelum deadline** (Rabu 11 Nov 2026 21.50 WIB). Pemilik rilis: Davin (pemilik `main`) bersama Ridwan.

| Tag | Kapan | Syarat |
|---|---|---|
| `v9.0` | Selasa 10 Nov malam | Semua issue Must tertutup atau tercatat sebagai known issue; E2E happy path lulus; CI hijau di `main` |
| `v9.1` | Rabu 11 Nov ≤ 20.00 WIB | Merge terakhir ≤ 19.00; README `src/` dan laporan `docs/M9/` ada di `main`; CI hijau |
| `v9.2+` | Bila perlu | Hanya hotfix yang disepakati |

Langkah rilis: buka PR `dev` → `main`, tunggu CI hijau + 1 approval, merge, lalu:

```bash
git checkout main && git pull
cd src && npm ci && npm run lint && npm run typecheck && npm test && npm run build && cd ..
gh release create v9.0 --target main --title "v9.0" --notes "Rilis M9 (jaring pengaman)"
```

Setelah rilis, satu anggota lain membuka halaman Releases, mengunduh arsipnya, dan menjalankan langkah §1 dari kondisi bersih.

**Deploy (opsional, KNF10).** Target utama adalah dijalankan lokal oleh asisten. Bila ingin online: gunakan VPS atau layanan dengan **disk persisten** (SQLite tidak cocok untuk serverless seperti Vercel), jalankan `npm ci && npm run build && npm start` di belakang HTTPS, set variabel `.env` di server (`Secure` cookie aktif di produksi), dan backup `data/kerjain.db` harian (`db.backup(...)`, rancangan §11.4). Tetap `PAYMENT_PROVIDER=mock` kecuali adapter Midtrans (#53) selesai.

## 8. Jadwal & aturan main

- Daily sync 15 menit (pagi) + perbarui papan Projects.
- **Feature freeze Must: Senin 9 Nov.** Fitur Could hanya setelah gate D4.
- Tidak ada merge ke `main` setelah Rabu 11 Nov 19.00 kecuali hotfix yang disepakati.
