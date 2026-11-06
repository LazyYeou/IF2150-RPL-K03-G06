# AGENTS.md — Kerja-In

Panduan untuk semua anggota tim **dan** asisten LLM (Claude, Codex, Copilot, Cursor, Gemini, dll.) yang menulis kode di repo ini. Baca sebelum mengubah apa pun.

## Dokumen acuan (urutan prioritas)

1. [`Kerja-In_Rancangan_Pengembangan.md`](Kerja-In_Rancangan_Pengembangan.md) — rancangan r3, **sumber kebenaran teknis** (skema DB §11, API §12, route §13, alur §14, keamanan §15, traceability §16).
2. Kontrak di [`src/docs/contracts/`](src/docs/contracts/) — **wajib diikuti saat menulis kode**:
   - [`db.md`](src/docs/contracts/db.md): tabel, kolom, constraint, enum, invarian, aturan migrasi.
   - [`api.md`](src/docs/contracts/api.md): konvensi, kode error, objek DTO, request/respons tiap endpoint.
   - [`modules.md`](src/docs/contracts/modules.md): fungsi bersama antarmodul, state machine, webhook, penyimpanan berkas, env, guard route.
3. [`src/docs/PRD.md`](src/docs/PRD.md) — apa yang dibangun, prioritas MoSCoW, kriteria penerimaan KF/KNF.
4. [`Kerja-In_Issues.md`](Kerja-In_Issues.md) + GitHub Issues #3–#53 — tugas, assignee, dependensi.
5. [`CONTRIBUTING.md`](CONTRIBUTING.md) — alur Git, PR, review, rilis.

Bila instruksi pengguna bertentangan dengan rancangan, tanyakan dulu. Jangan "memperbaiki" rancangan diam-diam; deviasi wajib dicatat (lihat §Deviasi).

## Proyek singkat

Marketplace jasa harian: **TK** (Tenaga Kerja) cari & kerjakan lowongan, **PK** (Penyedia Kerja) pasang lowongan & bayar, **CS** verifikasi identitas & putus sengketa. Next.js 15 full-stack, SQLite, mock payment gateway. Semua kode aplikasi di `src/`.

## Perintah (jalankan dari `src/`)

| Perintah | Fungsi |
|---|---|
| `npm ci` | Pasang dependensi (juga memasang hook commitlint) |
| `npm run dev` | Server dev di http://localhost:3000 |
| `npm run lint` | ESLint (termasuk aturan lapisan MVC) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit + integrasi (`tests/unit`, `tests/integration`) |
| `npm run test:e2e` | Playwright (`tests/e2e`; butuh `npx playwright install` sekali) |
| `npm run format` | Prettier |
| `npm run db:reset` | Hapus DB → migrasi → seed (**tersedia setelah issue #4**) |

**Sebelum menyatakan selesai:** `npm run lint && npm run typecheck && npm test` harus lulus. CI menjalankan urutan yang sama.

## Arsitektur: MVC eksplisit

| Lapisan | Lokasi (`src/`) | Aturan |
|---|---|---|
| View | `app/**/page.tsx`, `views/**` | **Dilarang** impor `models/` atau `lib/db` (ditegakkan ESLint). Ambil data lewat `fetch('/api/…')` atau server component yang memanggil controller |
| Route adapter | `app/api/**/route.ts` | Tipis: parse request → panggil controller → map hasil/`AppError` ke HTTP. Tanpa logika bisnis |
| Controller | `controllers/*Controller.ts` | **Satu-satunya** tempat logika bisnis: guard → validasi Zod → `tx()` → efek samping setelah commit → DTO |
| Model | `models/*.ts` | Query SQL ber-parameter + mapping snake_case ↔ camelCase |
| Infrastruktur | `lib/{db,auth,storage,payment,validation,errors}` | `lib/db`, `lib/auth`, `lib/storage` wajib `import 'server-only'` |

- **Mutasi bisnis hanya lewat `/api/*`**, bukan Server Actions (pengecualian sepele: logout).
- `middleware.ts` hanya cek ada/tidaknya cookie sesi (Edge runtime tidak bisa memakai SQLite). Validasi sesi sesungguhnya di `requireUser()`.
- Nama fungsi controller = nama operasi DPPL (mis. `prosesPemilihanPelamar`) agar traceability C01–C45 terbaca.
- Komentar rujukan seperlunya di titik penting: `// KF12, Q-098`.

## Aturan database (SQLite via better-sqlite3)

1. Hanya prepared statement: `db.prepare('… WHERE id = ?').get(id)`. **Dilarang** menyambung string ke SQL.
2. Operasi multi-baris/tabel wajib di `tx()` (`BEGIN IMMEDIATE`).
3. **Tidak ada `await` di dalam `tx()`** (driver sinkron). Upload berkas dan panggilan gateway dilakukan di luar transaksi.
4. Tabel & kolom `snake_case`; enum disimpan sebagai `TEXT` + `CHECK` dengan kode dari rancangan §7.
5. Migrasi yang sudah di-merge **tidak boleh diubah**; perubahan skema = file baru bernomor (`db/migrations/000N_nama.sql`).
6. `riwayat_sengketa`, `mutasi_saldo`, `log_gateway` append-only. Jangan menulis `UPDATE`/`DELETE` untuk tabel itu.
7. Jangan pernah meng-commit `data/`, `storage/`, atau file `.db`.

## Aturan uang (label `uang`, wajib review Karmel + 1)

- Nominal selalu `INTEGER` rupiah. Tidak ada float, tidak ada `Decimal`.
- Kredit/debit saldo hanya lewat `mutasi_saldo` dengan kunci idempoten unik (`upah:<idTransaksi>`, `cair:<idPencairan>`). Refund memakai idempotency key gateway `refund:<idTiket>`. Daftar kunci: [modules.md §3](src/docs/contracts/modules.md#3-webhook-payment-gateway).
- Status transaksi pekerjaan/tagihan hanya berubah sesuai `transisiDiizinkan()` (rancangan §7), dan status pembayaran hanya dari **webhook terverifikasi HMAC**.
- Semua pemanggilan gateway lewat `PaymentGatewayAdapter` dengan idempotency key.

## Keamanan (wajib di setiap endpoint)

- Panggil guard di awal controller: `requireUser`, `requireRole`, `requireVerifiedTK`, `requireCS`, `requireOwner`. **ID pelaku selalu dari sesi**, tidak pernah dari body/query.
- Validasi input dengan skema Zod `.strict()` dari `lib/validation/*` (dipakai bersama FE & BE).
- Error bisnis: `throw new AppError('KUOTA_PENUH', 409, 'Kuota lowongan sudah penuh')`. Bentuk respons `{ error: { code, message, fields? } }`. Kode HTTP: 400 validasi, 401 belum login, 403 tidak berhak, 404, 409 konflik/duplikat, 422 aturan bisnis.
- Upload: cek MIME **dan** magic bytes, batas ukuran (KTP 5 MB, lainnya 10 MB), nama berkas UUID, folder privat. KTP dienkripsi AES-256-GCM.
- Tidak ada `dangerouslySetInnerHTML`. Pesan error login/lupa sandi selalu generik.
- Rahasia hanya di `.env.local`. Jangan menulis kunci, token, atau password sungguhan ke kode, test, fixture, log, atau commit. Akun uji (`*@kerjain.test`) memang fiktif.

## Konvensi kode

- TypeScript strict; **dilarang `any`**. Import alias `@/…`.
- UI: Tailwind + komponen shadcn/ui di `components/ui` (tambah lewat `npx shadcn@latest add <nama>`), ikon `lucide-react`, form `react-hook-form` + `@hookform/resolvers/zod`.
- Teks UI bahasa Indonesia; label status dari tabel rancangan §7.8. Format rupiah & tanggal Indonesia.
- Mobile-first, target sentuh ≥ 44 px, bisa dipakai dengan keyboard.
- Payload API `camelCase`; DB `snake_case`.
- Jangan menambah dependensi baru tanpa alasan di deskripsi PR. Yang **sengaja tidak dipakai**: ORM, Supabase/Docker, Redux, GraphQL, library auth pihak ketiga, microservice, message queue.

## Testing & Definition of Done

- Setiap kriteria penerimaan KF di issue punya test (unit di `tests/unit`, integrasi controller + SQLite sementara di `tests/integration`, alur pengguna di `tests/e2e`).
- Kasus wajib ada di rancangan §17.1 (KNF07 konkurensi kuota, IDOR, bayar ganda, HMAC salah, ulasan ganda, append-only).
- DoD: test KF lulus · otorisasi & validasi server ada · lint/typecheck/CI hijau · direview 1 anggota · PR `Closes #n` · traceability §16/B.5 dan B.1 diperbarui bila ada deviasi.

## Git & PR

- Commit: `<tipe>(<scope>): <deskripsi>` (ditolak hook bila salah). Tipe: `feat fix test docs chore perf refactor style ci build revert`. Scope = modul, mis. `auth`, `lowongan`, `pembayaran`, `ui`, `db`, `ci`.
- Branch: `feat/<modul>-<fitur>`, `fix/…`, `docs/…`, `chore/…`, `test/…`, dibuat dari `dev`. PR fitur **ke `dev`**; `dev` → `main` hanya untuk rilis. `main` terlindungi (PR + 1 approval + CI hijau).
- PR kecil (< ±400 baris), ikuti templat `.github/pull_request_template.md`.
- Detail: [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Khusus asisten LLM

1. **Kerjakan hanya issue yang diminta.** Hormati kepemilikan domain (rancangan §20); jangan mengubah modul anggota lain kecuali diminta.
2. **Kontrak di `src/docs/contracts/` tidak boleh diubah sepihak** (skema DB, bentuk request/respons, kode error, signature `kirimNotifikasi`, `kreditUpahDalamTx`, `PaymentGatewayAdapter`, guard auth, skema `lib/validation/*`). Bila kode yang diminta butuh perubahan kontrak, berhenti dan laporkan. Bila kontrak dan kode berbeda, kontrak yang benar sampai diputuskan lain.
3. **Jangan commit, push, membuat PR, atau mengubah setting GitHub** kecuali pengguna memintanya secara eksplisit.
4. **Tanpa atribusi AI di GitHub**: jangan menambahkan trailer `Co-Authored-By` AI, footer "Generated with …", atau menyebut asisten sebagai kontributor di commit, PR, issue, maupun komentar. Penggunaan AI yang signifikan dicatat manusia di [`docs/K03_G06_AI-Usage.md`](docs/K03_G06_AI-Usage.md).
5. **Jangan mengubah** `docs/M1/`–`docs/M8/` (arsip milestone) dan `README.md` di root (milik repo mata kuliah). Laporan baru di `docs/M9/`.
6. Jangan menjalankan perintah destruktif (`git reset --hard`, `push --force`, hapus `data/`/`storage/` milik orang) tanpa izin.
7. Jangan mengarang: bila rancangan tidak menjawab (nama kolom, batas field, alur), cari di rancangan §11–§14, lalu tanyakan. Jangan menebak versi library; pakai yang ada di `src/package.json`.
8. Verifikasi sebelum klaim: jalankan lint, typecheck, test; laporkan hasil apa adanya, termasuk yang gagal atau tidak dijalankan.
9. Perubahan kecil dan terfokus; jangan menambah abstraksi, opsi, atau fitur yang tidak diminta (MoSCoW: Could hanya setelah gate D4).

## Deviasi dari DPPL

Setiap keputusan implementasi yang menyimpang dari DPPL/rancangan ditambahkan sebagai baris baru di rancangan §21 (draf Tabel B.1) dan disebut di deskripsi PR.
