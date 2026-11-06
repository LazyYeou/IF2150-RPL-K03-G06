import Link from "next/link";

export default function Home() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="site-container py-16 outline-none sm:py-24"
    >
      <p className="mb-5 text-sm text-muted-foreground">
        Peluang baik, dekat dari rumah.
      </p>
      <h1 className="max-w-3xl text-4xl leading-tight font-semibold tracking-tight sm:text-6xl">
        Keahlianmu berarti.
        <br />
        Temukan kerja yang cocok.
      </h1>
      <p className="mt-6 mb-8 max-w-lg text-base leading-8 text-muted-foreground">
        Dari bantu pindahan sampai perbaikan rumah. Temukan pekerjaan harian di
        sekitarmu, dengan lingkup jelas dan upah yang disepakati.
      </p>
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
      <section id="cara-kerja" className="mt-20 border-t pt-10">
        <h2 className="text-2xl font-semibold">
          Langkah sederhana. Kesepakatan yang jelas.
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            "Temukan pekerjaan yang sesuai keahlianmu.",
            "Sepakati lingkup, jadwal, dan upah sebelum mulai.",
            "Kerja tuntas, periksa hasil, dan pantau pembayaran.",
          ].map((step, i) => (
            <p key={step} className="rounded-xl border p-6 text-sm leading-7">
              <span className="mb-4 block font-semibold text-orange-700">
                0{i + 1}
              </span>
              {step}
            </p>
          ))}
        </div>
      </section>
    </main>
  );
}
