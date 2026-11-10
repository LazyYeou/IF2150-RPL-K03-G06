# Kontrak Antarmodul — Kerja-In

| Atribut | Nilai |
|---|---|
| Versi | 1.0 (5 Nov 2026) |
| Sumber | Rancangan §7 (state machine), §11.4 (DB), §14 (alur), §15 (keamanan), §20.4 (kontrak), §23.2 (env) |

Kontrak ini disepakati D0 agar lima anggota bisa bekerja paralel. Signature di §1 **tidak boleh diubah sepihak**: perubahan butuh persetujuan pemilik + semua pemakai, dan dokumen ini diperbarui di PR yang sama.

## 1. Fungsi bersama

| Modul (pemilik) | Signature | Pemakai | Aturan |
|---|---|---|---|
| `lib/db.ts` (Davin) | `db: Database` · `tx<T>(fn: () => T): T` | semua model/controller | `tx` = `BEGIN IMMEDIATE`; **tanpa `await` di dalam `fn`**; error → rollback otomatis |
| `lib/auth/guards.ts` (Davin) | `requireUser()` · `requireRole(peran)` · `requireVerifiedTK()` · `requireCS()` · `requireOwner(idPemilik, idPelaku)` | semua controller | Dipanggil di baris pertama controller; melempar `AppError` 401/403 |
| `lib/auth/session.ts` (Davin) | `buatSesi(idPengguna)` · `bacaSesi()` · `hapusSesi()` · `hapusSemuaSesi(idPengguna)` | auth, reset sandi | Token 32 byte di cookie; DB menyimpan SHA-256 |
| `lib/errors.ts` (Davin) | `class AppError(code: string, status: number, message: string, fields?: Record<string,string>)` · `toResponse(err)` | semua route handler | Kode error: [api.md §1.1](api.md#11-format-error) |
| `controllers/NotifikasiController.ts` (Davin) | `kirimNotifikasi(idPengguna: string, pesan: string, tautan?: string): Promise<void>` | semua domain | Dipanggil **setelah commit**; `idPengguna` = `pengguna.id_pengguna` (bukan id profil). Sebelum #28 selesai, pakai stub dengan signature yang sama |
| `controllers/TransaksiPekerjaanController.ts` (Sebastio) | `kreditUpahDalamTx(db: Database, idTransaksi: string): boolean` | persetujuan hasil (#35), putusan sengketa `PENCAIRAN` (#39) | Sinkron, **wajib dipanggil di dalam `tx()`**; controller mengekspor helper model dengan signature yang sama; `INSERT mutasi_saldo('upah:'||id) ON CONFLICT DO NOTHING`, tambah saldo hanya bila baris baru; `true` = baru dikredit |
| `models/statusMachine.ts` (Sebastio) | `transisiDiizinkan(jenis, dari, ke): boolean` · `labelStatus(jenis, kode): string` | semua controller yang mengubah status | Satu-satunya sumber transisi sah (§2) |
| `lib/payment/adapter.ts` (Karmel) | `PaymentGatewayAdapter` (di bawah) · `getPaymentAdapter()` (pilih dari `PAYMENT_PROVIDER`) | pembayaran, pencairan, sengketa | Panggilan jaringan **di luar** `tx()` |
| `lib/storage.ts` (Ridwan) | `simpanBerkas(kategori, file, { enkripsi? })` → `{ path, ukuran }` · `bacaBerkas(path)` · `hapusBerkas(path)` | verifikasi, bukti, sengketa | §4 |
| `lib/validation/*.ts` (Ridwan, domain lain oleh pemiliknya) | Satu skema Zod `.strict()` per endpoint + `type X = z.infer<typeof X>` | FE (form) & BE (controller) | Sumber kebenaran [api.md](api.md) |

```ts
interface PaymentGatewayAdapter {
  charge(p: { idTagihan: string; total: number; metode: string }): Promise<{ redirectUrl: string }>;
  disburse(p: { idPencairan: string; rekening: string; nominal: number }): Promise<{ status: 'DITERIMA' | 'GAGAL' }>;
  refund(p: { idempotencyKey: string; idTagihan: string; nominal: number }): Promise<{ status: 'BERHASIL' | 'GAGAL' }>;
  verifikasiWebhook(body: string, signature: string): boolean;
}
```

Pola controller (rancangan §23.6): `1) guard → 2) validasi Zod → 3) tx(baca → cek → tulis) → 4) efek samping setelah commit (notifikasi, gateway) → 5) return DTO`.

## 2. State machine

Setiap perubahan status lewat `transisiDiizinkan`. Transisi di luar tabel ini → 409 `STATUS_TIDAK_VALID`.

### 2.1 Verifikasi TK
| Dari | Ke | Pemicu |
|---|---|---|
| `BELUM_TERVERIFIKASI` | `MENUNGGU_VERIFIKASI` | TK unggah dokumen |
| `DITOLAK` | `MENUNGGU_VERIFIKASI` | TK unggah ulang |
| `MENUNGGU_VERIFIKASI` | `TERVERIFIKASI` | CS setujui |
| `MENUNGGU_VERIFIKASI` | `DITOLAK` | CS tolak (alasan wajib) |

### 2.2 Lowongan
`OPEN` → `CLOSED_FULL` (penerimaan terakhir) · `OPEN` → `DIBATALKAN` (PK, hanya bila belum ada pelamar diterima).

### 2.3 Penawaran
`MENUNGGU` → `DITERIMA` (PK pilih) · `DITOLAK` (PK) · `DITARIK` (TK) · `DITOLAK_OTOMATIS` (lowongan penuh).

### 2.4 Transaksi pekerjaan
| Dari | Ke | Pemicu |
|---|---|---|
| (baru) | `MENUNGGU_PEMBAYARAN` | PK terima pelamar |
| `MENUNGGU_PEMBAYARAN` | `IN_PROGRESS` | webhook pembayaran `BERHASIL` (terverifikasi HMAC) |
| `IN_PROGRESS` | `SUBMITTED` | TK serahkan bukti |
| `SUBMITTED` | `IN_PROGRESS` | PK minta revisi |
| `SUBMITTED` | `COMPLETED` | PK setujui → `kreditUpahDalamTx` |
| `IN_PROGRESS`, `SUBMITTED` | `DISENGKETAKAN` | tiket dibuat; status asal disimpan di `status_sebelum_sengketa` |
| `DISENGKETAKAN` | `COMPLETED` | CS putuskan `PENCAIRAN` |
| `DISENGKETAKAN` | `DIBATALKAN` | CS putuskan `REFUND` |
| `DISENGKETAKAN` | `status_sebelum_sengketa` | tiket ditolak / dibatalkan |

### 2.5 Tagihan
`MENUNGGU_PEMBAYARAN` → `DIPROSES` (bayar) → `BERHASIL` | `GAGAL` | `KEDALUWARSA` · `MENUNGGU_PEMBAYARAN` → `KEDALUWARSA` (lazy, `expiry < now`) · `BERHASIL` → `DIKEMBALIKAN` (refund). Setelah `GAGAL`/`KEDALUWARSA` PK boleh membuat tagihan baru.

### 2.6 Pencairan
`MENUNGGU_PROSES` → `DIPROSES` → `BERHASIL` | `GAGAL` · `MENUNGGU_PROSES` → `DITOLAK`. Implementasi #34 langsung menyisipkan `DIPROSES` lalu memanggil `disburse()`. Debit saldo hanya saat `BERHASIL`.

### 2.7 Tiket sengketa
`DIAJUKAN` → `DITINJAU` | `MENUNGGU_BALASAN` · `MENUNGGU_BALASAN` ↔ `DITINJAU` · `DITINJAU` → `DIPROSES` (keputusan dicatat) → `DITUTUP` · `DIAJUKAN`/`DITINJAU` → `DITOLAK` · `DIAJUKAN` → `DIBATALKAN` (pelapor). Final: `DITUTUP`, `DITOLAK`, `DIBATALKAN`.

> `DIAJUKAN` → `DITINJAU` tidak tertulis eksplisit di rancangan §7.7; ditambahkan agar CS bisa memproses tiket tanpa harus meminta bukti dulu. Konfirmasi Ridwan (#29, #39).

### 2.8 Label UI (status pekerjaan)
| Kode | Label |
|---|---|
| `MENUNGGU_PEMBAYARAN` | Menunggu pembayaran |
| `IN_PROGRESS` | Sedang dikerjakan |
| `SUBMITTED` | Menunggu pemeriksaan |
| `COMPLETED` | Selesai |
| `DISENGKETAKAN` | Dalam peninjauan CS |
| `DIBATALKAN` | Dibatalkan |

Label status lain dibuat di `labelStatus()` dengan bahasa Indonesia yang setara dan dipakai bersama semua halaman.

## 3. Webhook payment gateway

Dipakai mock gateway (dan adapter Midtrans bila ada). Pemilik: Karmel.

| Hal | Aturan |
|---|---|
| Endpoint | `POST /api/webhooks/payment` (tanpa cookie, tanpa cek `Origin`) |
| Signature | Header `x-signature` = hex HMAC-SHA256 dari **raw body** dengan `PAYMENT_WEBHOOK_SECRET`; dibandingkan dengan `timingSafeEqual` |
| Body | `{ "jenis": "PEMBAYARAN" \| "PENCAIRAN" \| "REFUND", "referensiId": "<idTagihan\|idPencairan\|idTiket>", "status": "BERHASIL" \| "GAGAL" \| "KEDALUWARSA", "nominal": 52500, "waktu": "<ISO 8601>" }` |
| Validasi | Signature → body objek JSON → `nominal` wajib angka bulat positif dalam rentang integer aman → `referensiId` ada → nominal sama dengan data di DB. Nilai hilang, null, string, pecahan, nol, negatif, atau tidak cocok ditolak; gagal → 401/400, data tidak berubah |
| Idempotensi | Status sama dengan yang tersimpan → no-op 200. Bertentangan dengan status final → hanya dicatat di `log_gateway`, 200 |
| Log | Setiap callback dicatat `log_gateway` jenis `CALLBACK` (payload lengkap) |
| Efek | `PEMBAYARAN BERHASIL`: tagihan `BERHASIL` + transaksi `IN_PROGRESS` dalam satu `tx()`, lalu notifikasi TK. `PENCAIRAN BERHASIL`: `mutasi_saldo('cair:'||id, −nominal)` + debit saldo + `BERHASIL`. `PENCAIRAN GAGAL`: `GAGAL` (reservasi lepas) |

Kunci idempoten:

| Operasi | Kunci |
|---|---|
| `charge()` | `id_tagihan` |
| `disburse()` | `id_pencairan` |
| `refund()` | `refund:<idTiket>` |
| Kredit upah (`mutasi_saldo`) | `upah:<idTransaksi>` |
| Debit pencairan (`mutasi_saldo`) | `cair:<idPencairan>` |

## 4. Penyimpanan berkas

| Kategori | Folder | Format | Maks | Enkripsi | Diunduh lewat | Boleh akses |
|---|---|---|---|---|---|---|
| `identitas` | `storage/identitas/` | JPG, PNG, PDF | 5 MB | AES-256-GCM (`FILE_ENCRYPTION_KEY`) | `GET /api/cs/verifikasi/:idTK/dokumen` | CS |
| `bukti` | `storage/bukti/` | JPG, PNG, PDF | 10 MB | – | `GET /api/berkas/bukti/:id` | peserta transaksi, CS |
| `sengketa` | `storage/sengketa/` | JPG, PNG, PDF | 10 MB | – | `GET /api/berkas/sengketa/:id` | peserta transaksi/pelapor, CS |

- Nama berkas = UUID + ekstensi asli yang sudah divalidasi; DB menyimpan path relatif.
- Validasi MIME **dan** magic bytes di server. Gambar dikompres di klien ke ≤ 2 MB sebelum upload (KNF22).
- Berkas ditulis **sebelum** `tx()`; bila transaksi DB gagal, berkas dihapus.
- Semua unduhan: `Cache-Control: no-store`. Folder `storage/` tidak pernah di bawah `public/`.

## 5. Variabel lingkungan

Semua dibaca hanya di server. Template: `src/.env.example`; nilai lokal di `src/.env.local` (tidak di-commit).

| Variabel | Contoh / default | Dipakai oleh |
|---|---|---|
| `DATABASE_PATH` | `./data/kerjain.db` | `lib/db` |
| `STORAGE_DIR` | `./storage` | `lib/storage` |
| `FILE_ENCRYPTION_KEY` | 64 karakter hex (32 byte) | enkripsi KTP |
| `APP_URL` | `http://localhost:3000` | cek `Origin`, tautan notifikasi/reset |
| `COMMISSION_RATE` | `0.05` | `commission_fee = round(rate × upah)` |
| `PAYMENT_EXPIRY_HOURS` | `24` | `expiry_timestamp` tagihan |
| `PAYMENT_PROVIDER` | `mock` | pemilihan adapter; halaman `/mock-gateway` hanya aktif bila `mock` |
| `PAYMENT_WEBHOOK_SECRET` | string acak panjang | HMAC webhook |
| `MIDTRANS_SERVER_KEY` | (opsional) | adapter Midtrans (#53) |

Menambah variabel = perbarui `.env.example`, tabel ini, dan README di PR yang sama.

## 6. Route halaman & guard

| Prefix | Peran | Guard |
|---|---|---|
| `/`, `/lowongan`, `/lowongan/[id]`, `/masuk`, `/daftar`, `/lupa-sandi`, `/reset-sandi`, `/privasi`, `/syarat` | publik | – |
| `/tk/*` | TK | `middleware.ts` (cookie ada) → `requireRole('TK')` di server |
| `/pk/*` | PK | idem, `requireRole('PK')` |
| `/cs/*` | CS | idem, `requireCS()` |
| `/profil`, `/bantuan`, `/tiket/[id]` | user | `requireUser()` |
| `/mock-gateway/[idTagihan]` | PK pemilik tagihan | hanya bila `PAYMENT_PROVIDER=mock` |

Belum login → redirect `/masuk?next=<path>`. Middleware hanya untuk UX; otorisasi tetap di controller. Peta layar lengkap: rancangan §13.
