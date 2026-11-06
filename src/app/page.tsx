import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-semibold">Kerja-In</h1>
      <div className="flex gap-4">
        <Link
          href="/masuk"
          className="rounded-lg bg-primary px-5 py-3 text-primary-foreground"
        >
          Masuk
        </Link>
        <Link href="/daftar" className="rounded-lg border px-5 py-3">
          Daftar
        </Link>
      </div>
    </main>
  );
}
