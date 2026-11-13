import { Star } from "lucide-react";
import type { UlasanProfil } from "@/lib/validation/profil";

export default function DaftarUlasanProfil({
  ulasan,
}: {
  ulasan: UlasanProfil[];
}) {
  return (
    <section aria-labelledby="ulasan-profil-title" className="mt-8">
      <h2 id="ulasan-profil-title" className="text-xl font-semibold">
        Ulasan pekerjaan
      </h2>
      {ulasan.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
          Belum ada ulasan dari transaksi yang selesai.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {ulasan.map((item) => (
            <li key={item.id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{item.namaPenilai}</p>
                <p
                  className="flex items-center gap-1 text-sm font-medium"
                  aria-label={`${item.nilai} dari 5 bintang`}
                >
                  <Star
                    aria-hidden="true"
                    className="size-4 text-amber-500"
                    fill="currentColor"
                  />
                  {item.nilai}/5
                </p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.judulPekerjaan}
              </p>
              {item.deskripsi && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                  {item.deskripsi}
                </p>
              )}
              <time
                dateTime={item.createdAt}
                className="mt-3 block text-xs text-muted-foreground"
              >
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "long",
                  timeZone: "Asia/Jakarta",
                }).format(new Date(item.createdAt))}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
