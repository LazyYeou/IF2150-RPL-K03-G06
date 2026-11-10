# Kerja-In

Marketplace jasa harian sektor informal (IF2150 K03 G06 – Shifu).

Next.js 15 · TypeScript · Tailwind · shadcn/ui · Vitest · Playwright. Node.js 20/22 LTS.

```bash
cd src
npm ci
cp .env.example .env.local
npm run dev        # http://localhost:3000
npm run lint && npm run typecheck && npm test
```

README lengkap (akun uji, modul, basis data) menyusul di issue README.

## Upgrade perbaikan review #95?#98

Dari folder src, hentikan server lalu jalankan `npm run db:migrate` dan `npm run db:protect-accounts` sekali untuk DB lama. CLI membaca .env.local. Gunakan FILE_ENCRYPTION_KEY yang sama dengan kunci enkripsi identitas sebelumnya; jangan menggantinya ketika upgrade. Tidak perlu reset DB.

Ringkasan perubahan, integrasi refund CS, kebijakan rekening, dan cara verifikasi ada di [docs/review-fixes.md](docs/review-fixes.md). Pengujian keyboard dialog: `npm run build` lalu `npm run test:e2e:transaksi` (DB sementara).
