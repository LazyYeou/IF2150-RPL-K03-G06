import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ambilTransaksiSaya } from "@/controllers/TransaksiPekerjaanController";
import { DaftarTransaksiQuery } from "@/lib/validation/transaksi";
import {
  LABEL_STATUS_PEKERJAAN,
  StatusPekerjaan,
} from "@/lib/validation/common";
import DaftarTransaksi from "./DaftarTransaksi";

export type QueryDaftarTransaksi = Record<
  string,
  string | string[] | undefined
>;

export default async function HalamanDaftarTransaksi({
  peran,
  title,
  description,
  query,
}: {
  peran: "TK" | "PK";
  title: string;
  description: string;
  query: QueryDaftarTransaksi;
}) {
  const parsed = DaftarTransaksiQuery.safeParse({
    peran,
    page: query.page,
    status: query.status || undefined,
  });
  if (!parsed.success) notFound();
  const { page, status } = parsed.data;
  const data = await ambilTransaksiSaya(parsed.data);
  const totalHalaman = Math.max(1, Math.ceil(data.total / data.pageSize));
  const path = peran === "TK" ? "/tk/pekerjaan" : "/pk/transaksi";
  function halaman(nomor: number) {
    const params = new URLSearchParams({ page: String(nomor) });
    if (status) params.set("status", status);
    return `${path}?${params}`;
  }
  if (page > totalHalaman) redirect(halaman(totalHalaman));
  const linkClass =
    "inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <form
        key={`${status ?? "semua"}:${page}`}
        action={path}
        method="get"
        className="flex flex-wrap items-end gap-3"
      >
        <input type="hidden" name="page" value="1" />
        <div>
          <label
            htmlFor="status-transaksi"
            className="mb-2 block text-sm font-medium"
          >
            Status transaksi
          </label>
          <select
            id="status-transaksi"
            name="status"
            defaultValue={status ?? ""}
            className="min-h-11 rounded-lg border bg-background px-3 text-sm"
          >
            <option value="">Semua status</option>
            {StatusPekerjaan.options.map((value) => (
              <option key={value} value={value}>
                {LABEL_STATUS_PEKERJAAN[value]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Terapkan filter
        </button>
        {status && (
          <Link href={path} className={linkClass}>
            Hapus filter
          </Link>
        )}
      </form>
      <p className="text-sm text-muted-foreground">
        {data.total} transaksi ditemukan
      </p>
      <DaftarTransaksi
        items={data.items}
        detailPath={peran === "TK" ? "tk" : "pk"}
      />
      <nav
        aria-label="Paginasi transaksi"
        className="flex flex-wrap items-center gap-3"
      >
        {page > 1 && (
          <Link href={halaman(page - 1)} className={linkClass}>
            Sebelumnya
          </Link>
        )}
        <span className="text-sm" aria-live="polite">
          Halaman {page} dari {totalHalaman}
        </span>
        {page < totalHalaman && (
          <Link href={halaman(page + 1)} className={linkClass}>
            Berikutnya
          </Link>
        )}
      </nav>
    </main>
  );
}
