# Kontrak API — Kerja-In

| Atribut | Nilai |
|---|---|
| Versi | 1.0-draf (5 Nov 2026) |
| Pemilik | Ridwan (issue #7) · domain pembayaran/dompet: Karmel · auth/profil/notifikasi: Davin · transaksi/ulasan: Sebastio |
| Base URL | `http://localhost:3000/api` |
| Sumber kebenaran | Skema Zod di `src/lib/validation/*.ts` (`.strict()`), tipe respons `z.infer`. Dokumen ini dan fixture `src/views/__fixtures__/*.json` wajib sama dengan skema |

Perubahan kontrak setelah dipakai FE: umumkan di grup, perbarui skema + fixture + dokumen ini dalam satu PR, mention Aditya.

## 1. Konvensi umum

| Hal | Aturan |
|---|---|
| Format | JSON UTF-8; upload berkas `multipart/form-data` |
| Nama field | `camelCase` (DB `snake_case` dipetakan di Model) |
| ID | string UUID |
| Uang | `number` integer rupiah |
| Waktu | string ISO 8601 UTC, mis. `"2026-11-05T03:00:00Z"`; tanggal saja `"YYYY-MM-DD"` |
| Enum | kode huruf besar (lihat [db.md §4](db.md#4-enum)); label Indonesia dibuat di UI |
| Autentikasi | Cookie sesi `kerjain_sesi` (`HttpOnly; SameSite=Lax; Path=/`, `Secure` di produksi). Tidak ada header `Authorization` |
| Mutasi | Selalu `POST`/`PATCH`; server menolak bila header `Origin` ≠ `APP_URL` |
| Field tak dikenal | Ditolak (`.strict()`) → 400 |
| Pelaku | Diambil dari sesi; field seperti `idTenagaKerja`/`idPenyediaKerja` **tidak pernah** diterima dari body |
| Paginasi | Query `page` (mulai 1). Respons `{ items, total, page, pageSize }` |

### 1.1 Format error

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Isian tidak valid", "fields": { "judul": "Minimal 8 karakter" } } }
```

| HTTP | Kode | Arti |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Body/query tidak lolos Zod; `fields` berisi pesan per field |
| 400 | `BERKAS_TIDAK_VALID` | Format (magic bytes) atau ukuran berkas salah |
| 401 | `UNAUTHENTICATED` | Belum login / sesi kedaluwarsa |
| 401 | `KREDENSIAL_SALAH` | Login gagal (pesan generik "Email atau kata sandi tidak valid") |
| 401 | `SIGNATURE_TIDAK_VALID` | HMAC webhook salah |
| 403 | `FORBIDDEN` | Peran salah atau bukan pemilik/peserta |
| 403 | `NOT_VERIFIED` | TK belum terverifikasi (KF06) |
| 403 | `ORIGIN_TIDAK_VALID` | Cek CSRF gagal |
| 404 | `NOT_FOUND` | Data tidak ada (atau tidak boleh diketahui keberadaannya) |
| 409 | `EMAIL_TERDAFTAR` | Registrasi dengan email yang sudah ada |
| 409 | `PENAWARAN_GANDA` | Masih ada penawaran aktif ke lowongan yang sama |
| 409 | `KUOTA_PENUH` | Kuota lowongan sudah penuh / lowongan tidak `OPEN` |
| 409 | `STATUS_TIDAK_VALID` | Transisi status tidak diizinkan (mis. setujui transaksi yang bukan `SUBMITTED`) |
| 409 | `ULASAN_GANDA` | Ulasan kedua untuk transaksi yang sama |
| 409 | `TIKET_AKTIF` | Sudah ada tiket aktif / upah sudah dikredit |
| 422 | `SALDO_TIDAK_CUKUP` | Nominal pencairan > saldo tersedia |
| 422 | `ATURAN_BISNIS` | Aturan bisnis lain (mis. usia < 17, pernyataan risiko belum dicentang) — `message` menjelaskan |
| 429 | `TERLALU_BANYAK_PERCOBAAN` | Rate limit login/registrasi/lupa sandi (5 / 15 menit per IP+email) |

> Usia < 17 dan pernyataan risiko adalah aturan per field; kembalikan sebagai `VALIDATION_ERROR` dengan `fields` agar form bisa menandai field-nya (KF02, KNF09).

## 2. Objek bersama

```ts
type Peran = 'TK' | 'PK' | 'CS';

type PenggunaSesi = { id: string; nama: string; email: string; peran: Peran;
  statusVerifikasi?: StatusVerifikasi /* hanya TK */ };

type ProfilPublik = { id: string; nama: string; akumulasiRating: number; jumlahUlasan: number };

type LowonganRingkas = { id: string; judul: string; kategori: string; lokasi: string;
  tanggalPekerjaan: string; upah: number; satuanUpah: 'PER_TUGAS' | 'PER_HARI';
  kuota: number; jumlahDiterima: number; status: StatusLowongan; createdAt: string };

type LowonganDetail = LowonganRingkas & { deskripsi: string; ruangLingkup: string;
  kriteriaHasil: string; estimasiDurasi: string; pernyataanRisiko: boolean;
  penyedia: ProfilPublik;
  penawaranSaya?: { id: string; status: StatusPenawaran } /* hanya bila TK login */ };

type Penawaran = { id: string; lowongan: { id: string; judul: string };
  hargaPenawaran: number; ketersediaan: string; pesan: string | null;
  status: StatusPenawaran; createdAt: string };

type Pelamar = { idPenawaran: string; tenagaKerja: ProfilPublik; hargaPenawaran: number;
  ketersediaan: string; pesan: string | null; status: StatusPenawaran; createdAt: string };

type Tagihan = { id: string; idTransaksi: string; nominalUpah: number; commissionFee: number;
  totalBayar: number; metode: string | null; expiry: string; status: StatusTagihan };

type Transaksi = { id: string; status: StatusPekerjaan; nominalUpah: number;
  lowongan: { id: string; judul: string }; tenagaKerja: ProfilPublik; penyediaKerja: ProfilPublik;
  tagihan: Tagihan | null; bukti: { id: string; deskripsi: string; urlBerkas: string; waktu: string }[];
  revisi: { catatan: string; waktu: string }[]; tiketAktif: { id: string; nomorTiket: string } | null;
  ulasanSaya: { nilai: number } | null; createdAt: string };

type Tiket = { id: string; nomorTiket: string; idTransaksi: string | null; kategoriMasalah: string;
  deskripsi: string; status: StatusTiket; keputusan: 'REFUND' | 'PENCAIRAN' | null; createdAt: string;
  pelapor: { id: string; nama: string };
  bukti: { id: string; urlBerkas: string; createdAt: string }[];
  riwayat: { aktor: string | null; log: string; timestamp: string }[] /* urut kronologis */ };

type Notifikasi = { id: string; pesan: string; tautan: string | null; dibaca: boolean; waktuKirim: string };
```

`urlBerkas` selalu route terotorisasi (`/api/berkas/...`), tidak pernah path disk.

## 3. Endpoint

Kolom **Peran**: `publik` = tanpa login · `user` = login peran apa pun · `TK✔` = TK terverifikasi · `pemilik`/`peserta` dicek dari sesi.

### 3.1 Auth & profil (Davin) — UC01, I-08–I-10, I-22

| Method & path | Peran | Request | Respons 2xx | Error khusus |
|---|---|---|---|---|
| `POST /auth/register` | publik | `{ nama (1–80), email, password (8–72), peran: 'TK'\|'PK', tanggalLahir: 'YYYY-MM-DD', persetujuanPrivasi: true }` | 201 `{ pengguna: PenggunaSesi, redirectTo }` + cookie sesi | 400 (privasi, usia < 17), 409 `EMAIL_TERDAFTAR`, 429 |
| `POST /auth/login` | publik | `{ email, password }` | 200 `{ pengguna: PenggunaSesi, redirectTo: '/tk'\|'/pk'\|'/cs' }` + cookie baru | 401 `KREDENSIAL_SALAH`, 429 |
| `POST /auth/logout` | user | – | 204, cookie dihapus | – |
| `POST /auth/lupa-sandi` | publik | `{ email }` | 200 `{ message }` **selalu sama**; tautan dicetak ke konsol server | 429 |
| `POST /auth/reset-sandi` | publik | `{ token, passwordBaru (8–72) }` | 204; semua sesi pengguna dihapus | 400 token kedaluwarsa/dipakai |
| `GET /profil` | user | – | 200 `PenggunaSesi & { areaLayanan, bio, akumulasiRating, jumlahUlasan }` | – |
| `PATCH /profil` | user | `{ nama?, areaLayanan? (≤150), bio? (≤1000) }` | 200 objek yang sama | 400 |
| `GET /profil/:id` | publik | – | 200 `{ id, nama, peran, areaLayanan, bio, statusVerifikasi?, akumulasiRating, jumlahUlasan, ulasan[] }` | 404 |

### 3.2 Verifikasi identitas (Ridwan) — UC02, KF04–KF06, I-30, I-31

| Method & path | Peran | Request | Respons 2xx | Error khusus |
|---|---|---|---|---|
| `POST /verifikasi` | TK | multipart: `berkas` (JPG/PNG/PDF ≤ 5 MB), `persetujuan=true` | 201 `{ status: 'MENUNGGU_VERIFIKASI', waktuPengajuan }` | 400 `BERKAS_TIDAK_VALID`/tanpa persetujuan, 409 status bukan `BELUM_TERVERIFIKASI`/`DITOLAK` |
| `GET /verifikasi/status` | TK | – | 200 `{ status, waktuPengajuan, alasanPenolakan }` | – |
| `GET /cs/verifikasi` | CS | – | 200 `{ items: { idTenagaKerja, nama, email, waktuPengajuan }[] }` (urut terlama) | 403 |
| `GET /cs/verifikasi/:idTK/dokumen` | CS | – | 200 stream berkas terdekripsi, `Cache-Control: no-store` | 404 |
| `POST /cs/verifikasi/:idTK/setujui` | CS | – | 200 `{ status: 'TERVERIFIKASI' }` | 409 bukan `MENUNGGU_VERIFIKASI` |
| `POST /cs/verifikasi/:idTK/tolak` | CS | `{ alasan (5–500) }` | 200 `{ status: 'DITOLAK' }` | 400, 409 |

Endpoint yang memakai gate `requireVerifiedTK` (→ 403 `NOT_VERIFIED`): `POST /penawaran`, `POST /transaksi/:id/bukti`, `POST /pencairan`.

### 3.3 Lowongan (Ridwan) — UC03, UC04, KF07–KF09, I-01–I-03, I-15–I-19

| Method & path | Peran | Request | Respons 2xx | Error khusus |
|---|---|---|---|---|
| `GET /lowongan` | publik | query `q?`, `kategori?`, `upahMin?`, `urut?: 'terbaru'\|'upah_tertinggi'`, `page?` | 200 `{ items: LowonganRingkas[], total, page, pageSize: 12 }` — hanya `OPEN` | 400 |
| `GET /lowongan/:id` | publik | – | 200 `LowonganDetail` | 404 |
| `POST /lowongan` | PK | `{ judul (8–150), deskripsi (20–2000), ruangLingkup, kriteriaHasil, kategori, lokasi, tanggalPekerjaan, estimasiDurasi, upah (1.000–100.000.000), satuanUpah, kuota (1–50), pernyataanRisiko: boolean }` | 201 `LowonganDetail` (status `OPEN`, `jumlahDiterima` 0) | 400 (risiko wajib untuk kategori berisiko), 403 TK/CS |
| `GET /lowongan/saya` | PK | query `page?` | 200 paginasi `LowonganRingkas & { jumlahPelamarMenunggu }` | – |
| `GET /lowongan/:id/pelamar` | PK pemilik | – | 200 `{ lowongan: LowonganRingkas, sisaKuota, items: Pelamar[] }` | 403, 404 |

### 3.4 Penawaran (Ridwan) — UC05, UC06, KF10–KF13, I-04, I-05, I-13, I-27, I-32

| Method & path | Peran | Request | Respons 2xx | Error khusus |
|---|---|---|---|---|
| `POST /penawaran` | TK✔ | `{ idLowongan, hargaPenawaran (1.000–100.000.000), ketersediaan (1–120), pesan? (≤1000) }` | 201 `Penawaran` (status `MENUNGGU`) | 403 `NOT_VERIFIED`, 409 `PENAWARAN_GANDA`/`KUOTA_PENUH` |
| `GET /penawaran/saya` | TK | query `status?`, `page?` | 200 paginasi `Penawaran` | – |
| `POST /penawaran/:id/tarik` | TK pemilik | – | 200 `Penawaran` (status `DITARIK`) | 403, 409 bukan `MENUNGGU` |
| `POST /penawaran/:id/terima` | PK pemilik lowongan | – | 200 `{ idTransaksi, statusLowongan, sisaKuota }` | 403, 409 `KUOTA_PENUH`/`STATUS_TIDAK_VALID` |

### 3.5 Transaksi & bukti (Sebastio) — UC08, UC09, KF16–KF18, I-14, I-21, I-29

| Method & path | Peran | Request | Respons 2xx | Error khusus |
|---|---|---|---|---|
| `GET /transaksi` | user | query `peran?: 'TK'\|'PK'`, `status?: StatusPekerjaan`, `page?` | 200 paginasi transaksi ringkas (tanpa `bukti`, `revisi`) | – |
| `GET /transaksi/:id` | peserta / CS | – | 200 `Transaksi` (termasuk `bukti`, `revisi`, `tiketAktif`, `ulasanSaya`) | 403, 404 |
| `POST /transaksi/:id/bukti` | TK✔ yang ditugaskan | multipart: `deskripsi` (10–1000), `berkas` (JPG/PNG/PDF ≤ 10 MB) | 201 `TransaksiDetail` (objek transaksi lengkap: `id`, `status: 'SUBMITTED'`, `bukti`, `timeline`, dan field detail lainnya) | 400 `BERKAS_TIDAK_VALID`, 403, 409 bukan `IN_PROGRESS` |
| `POST /transaksi/:id/setujui` | PK pemilik | – | 200 `{ idTransaksi, status: 'COMPLETED' }`; upah dikreditkan idempoten | 409 bukan `SUBMITTED`/tagihan belum `BERHASIL`/ada tiket aktif |
| `POST /transaksi/:id/revisi` | PK pemilik | `{ catatan (10–1000) }` | 200 `{ idTransaksi, status: 'IN_PROGRESS' }` | 400, 409 |
| `POST /transaksi/:id/ulasan` | peserta TK/PK | `{ nilai: 1–5 (wajib), deskripsi? (≤1000) }` | 201 `{ id, idPenerima, nilai, deskripsi }`; ulasan dan hitung ulang rating tersimpan atomik | 400 rating tidak valid, 403 bukan peserta, 409 `ULASAN_GANDA`/bukan `COMPLETED` |
| `GET /berkas/bukti/:id` | peserta / CS | – | 200 stream, `Cache-Control: no-store` | 403, 404 |

### 3.6 Pembayaran & dompet (Karmel) — UC07, UC10, KF14, KF15, KF19, KF20, I-20, I-33, I-34

| Method & path | Peran | Request | Respons 2xx | Error khusus |
|---|---|---|---|---|
| `POST /transaksi/:id/tagihan` | PK pemilik | – | 201 `Tagihan` baru, atau 200 tagihan aktif yang sudah ada | 403, 409 transaksi bukan `MENUNGGU_PEMBAYARAN` |
| `GET /tagihan/:id` | PK pemilik | – | 200 `Tagihan` (kedaluwarsa dicek lazy) | 403, 404 |
| `POST /tagihan/:id/bayar` | PK pemilik | `{ metode: 'VA_BCA'\|'VA_BNI'\|'QRIS'\|'EWALLET' }` | 200 `{ redirectUrl }` (mock: `/mock-gateway/:idTagihan`) | 409 kedaluwarsa/bukan `MENUNGGU_PEMBAYARAN` |
| `POST /webhooks/payment` | gateway | lihat [modules.md §3](modules.md#3-webhook-payment-gateway) | 200 `{ ok: true }` (duplikat juga 200) | 401 `SIGNATURE_TIDAK_VALID`, 400 nominal/id tidak cocok |
| `POST /mock-gateway/trigger` | PK pemilik tagihan / TK pemilik pencairan; hanya provider `mock` | tepat satu dari `{ idTagihan, status? }` atau `{ idPencairan, status? }`; nominal diambil dari DB | 200 `{ success, status, redirectUrl }` | 401 tanpa sesi, 403 bukan pemilik/peran salah/provider non-mock, 400 input tidak valid, 404 referensi tidak ada |
| `GET /dompet` | TK | – | 200 `{ saldo, saldoTersedia, mutasi: { kunciOperasi, nominal, createdAt }[], pencairan: { id, nominal, rekeningMasked, status, waktuPengajuan, bisaCobaUlang }[] }` | – |
| `POST /pencairan` | TK terverifikasi | Header `Idempotency-Key: <UUID>` wajib; `{ nominal (>= 10.000), rekeningTujuan }` | 201 `{ id, nominal, rekeningMasked, status, bisaCobaUlang }`; 202 jika hasil gateway belum pasti | 400 input/key tidak valid, 403 key bukan milik sendiri, 409 key dengan isian berbeda, 422 `SALDO_TIDAK_CUKUP` |
| `POST /pencairan/:id/ulang` | TK terverifikasi pemilik | Tanpa body; gunakan ID pengajuan sebelumnya | 200 bentuk pencairan yang sama; 202 jika hasil masih belum pasti | 401, 403 bukan pemilik/belum terverifikasi, 404 |

Format `rekeningTujuan`: `BANK:<kode bank>:<10–16 digit>` (contoh `BANK:bca:1234567890`); format lama `BANK:<10–16 digit>` dan `EWALLET:08<8–11 digit>` tetap diterima untuk mock. Midtrans membutuhkan kode bank eksplisit dan belum mendukung e-wallet; konfigurasi/tujuan yang tidak didukung ditolak sebelum reservasi saldo. Ditampilkan sebagai `rekeningMasked` (`****1234`). Detail: [Midtrans](../midtrans.md).

### 3.7 Sengketa (Ridwan) — UC12, KF24–KF26, I-23, I-36, I-37

| Method & path | Peran | Request | Respons 2xx | Error khusus |
|---|---|---|---|---|
| `POST /tiket` | user (peserta bila ada `idTransaksi`) | multipart: `idTransaksi?`, `kategoriMasalah`, `deskripsi` (20–1000), `berkas?` (≤ 10 MB) | 201 `Tiket` (status `DIAJUKAN`, `nomorTiket`) | 403, 409 `TIKET_AKTIF` |
| `GET /tiket/:id` | pelapor / peserta | – | 200 `Tiket` | 403, 404 |
| `POST /tiket/:id/bukti` | pelapor / peserta | multipart: `berkas` (≤ 10 MB) | 201 `Tiket` | 400, 409 tiket final |
| `POST /tiket/:id/batal` | pelapor | – | 200 `Tiket` (`DIBATALKAN`, status pekerjaan dikembalikan) | 409 bukan `DIAJUKAN` |
| `GET /cs/tiket` | CS | query `status?`, `page?` | 200 paginasi `Tiket` (tanpa `riwayat`) | 403 |
| `GET /cs/tiket/:id` | CS | – | 200 `Tiket` | 404 |
| `POST /cs/tiket/:id/putuskan` | CS | `{ keputusan: 'REFUND'\|'PENCAIRAN', catatan (10–1000) }` | 200 `Tiket` (`DITUTUP`) | 409 tiket final/sudah diputus |
| `POST /cs/tiket/:id/minta-bukti` | CS | `{ pesan (10–1000) }` | 200 `Tiket` (`MENUNGGU_BALASAN`) | 409 |
| `POST /cs/tiket/:id/tolak` | CS | `{ alasan (10–1000) }` | 200 `Tiket` (`DITOLAK`) | 409 |
| `GET /berkas/sengketa/:id` | peserta / CS | – | 200 stream, `Cache-Control: no-store` | 403, 404 |

### 3.8 Notifikasi (Davin) — C14, C29

| Method & path | Peran | Request | Respons 2xx | Error khusus |
|---|---|---|---|---|
| `GET /notifikasi` | user | query `belumDibaca?: 'true'` | 200 `{ items: Notifikasi[] (maks 20 terbaru), jumlahBelumDibaca }` | – |
| `POST /notifikasi/:id/baca` | pemilik | – | 204 | 404 milik orang lain |

UI melakukan polling `GET /notifikasi` tiap 30 detik.

### 3.9 Could (setelah gate D4)

| Method & path | Peran | Keterangan |
|---|---|---|
| `GET /lowongan-tersimpan` · `POST /lowongan/:id/simpan` · `POST /lowongan/:id/hapus-simpan` | TK | #51 |
| `GET /tenaga-kerja` · `GET /tenaga-kerja/:id` · `POST /tenaga-kerja/:id/undang` | publik / PK | #52; tanpa data pribadi sensitif |

## 4. Pertanyaan terbuka

| # | Hal | Usulan |
|---|---|---|
| A1 | Format rekening: issue #34 menulis `BANK:no` / `EWALLET:08…`, komentar DDL menulis `BCA:1234567890` / `GOPAY:08…` | Pakai `<KODE>:<nomor>` dengan kode bank/e-wallet dari daftar tetap (`BCA`, `BNI`, `BRI`, `MANDIRI`, `GOPAY`, `OVO`, `DANA`); bank 10–16 digit, e-wallet `08` + 8–11 digit. Putuskan Karmel |
| A2 | Panjang password, daftar `metode` bayar, batas `alasan`/`pesan` CS tidak ditentukan rancangan | Nilai di dokumen ini adalah usulan; difinalkan di skema Zod #7 |

### Contoh respons transaksi (#97)

`GET /api/transaksi?peran=TK&status=SUBMITTED&page=1` mengembalikan `{ items: TransaksiRingkas[], total, page: 1, pageSize: 12 }`. Status hanya menerima enum `StatusPekerjaan`; nilai di luar enum menghasilkan 400. TK/PK hanya melihat transaksi miliknya; CS dapat membaca sesuai peran yang diminta. Tanpa status, hasil tidak difilter.

`POST /api/transaksi/:id/bukti` mengembalikan HTTP 201 **TransaksiDetail**, bukan ringkasan `{ idTransaksi, status }`. Contoh bagian respons: `{ id: "<idTransaksi>", status: "SUBMITTED", bukti: [{ id: "<idBukti>", deskripsi: "Pekerjaan selesai sesuai kriteria.", urlBerkas: "/api/berkas/bukti/<idBukti>", waktu: "2026-11-10T08:00:00.000Z" }], ... }`. Field lain mengikuti `TransaksiDetail` di `lib/validation/transaksi.ts`; tanda `...` di contoh ini bukan field JSON.

Respons setujui: HTTP 200 `{ idTransaksi: "<id>", status: "COMPLETED" }`.
Respons revisi: HTTP 200 `{ idTransaksi: "<id>", status: "IN_PROGRESS" }`.
Respons ulasan: HTTP 201 `{ id: "<idUlasan>", idPenerima: "<idPengguna>", nilai: 5, deskripsi: "Hasil sesuai kesepakatan." }`; deskripsi opsional pada request dan `null` jika tidak diberikan. Skema respons tindakan: `HasilSetujui`, `HasilRevisi`, `HasilUlasan`.

Keputusan implementasi #97 mempertahankan bentuk respons yang sudah dipakai klien dan tes; review PR menjadi tempat konfirmasi pemilik modul/pemakainya. Tidak mengubah payload endpoint.
