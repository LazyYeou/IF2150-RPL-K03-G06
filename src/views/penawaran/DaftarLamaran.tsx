"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { z } from "zod";
import { PenawaranSayaResponse } from "@/lib/validation/penawaran";
import { StatusPenawaran } from "@/lib/validation/common";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import DialogTarikPenawaran from "./DialogTarikPenawaran";
import { kesalahanAPI } from "./api";

type Data = z.infer<typeof PenawaranSayaResponse>;
export default function DaftarLamaran({
  idPengguna,
  page,
  status,
}: {
  idPengguna: string;
  page: number;
  status?: z.infer<typeof StatusPenawaran>;
}) {
  const router = useRouter();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [login, setLogin] = useState(false);
  const [versi, setVersi] = useState(0);
  const [pesan, setPesan] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  const query = params.toString();
  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError("");
    setLogin(false);
    async function muat() {
      try {
        const res = await fetch(`/api/penawaran/saya?${query}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const body: unknown = await res.json();
        if (controller.signal.aborted) return;
        if (!res.ok) {
          setError(kesalahanAPI(body, "Lamaran belum dapat dimuat.").message);
          setLogin(res.status === 401);
          return;
        }
        const result = PenawaranSayaResponse.parse(body);
        const akhir = Math.max(1, Math.ceil(result.total / result.pageSize));
        if (result.page > akhir) {
          const p = new URLSearchParams(query);
          p.set("page", String(akhir));
          router.replace(`/tk/lamaran?${p}`);
          return;
        }
        setData(result);
      } catch {
        if (!controller.signal.aborted)
          setError(
            "Tidak dapat memuat lamaran. Periksa koneksi lalu coba lagi.",
          );
      }
    }
    void muat();
    return () => controller.abort();
  }, [query, idPengguna, versi, router]);
  function halaman(n: number) {
    const p = new URLSearchParams(query);
    p.set("page", String(n));
    return `/tk/lamaran?${p}`;
  }
  function diperbarui() {
    setPesan(
      "Status lamaran diperbarui. Penawaran yang ditarik tidak lagi aktif.",
    );
    setVersi((v) => v + 1);
    router.refresh();
    requestAnimationFrame(() => headingRef.current?.focus());
  }
  return (
    <div className="space-y-6">
      <div>
        <h1
          ref={headingRef}
          id="lamaran-title"
          tabIndex={-1}
          className="text-3xl font-semibold outline-none"
        >
          Lamaran saya
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Pantau penawaran dan perkembangan lamaranmu di satu tempat.
        </p>
      </div>
      <form
        action="/tk/lamaran"
        method="get"
        className="flex flex-wrap items-end gap-3"
      >
        <input type="hidden" name="page" value="1" />
        <div>
          <label
            htmlFor="status-lamaran"
            className="mb-2 block text-sm font-medium"
          >
            Status lamaran
          </label>
          <select
            key={status ?? "semua"}
            id="status-lamaran"
            name="status"
            defaultValue={status ?? ""}
            className="min-h-11 rounded-lg border bg-background px-3 text-sm"
          >
            <option value="">Semua status</option>
            {StatusPenawaran.options.map((value) => (
              <option key={value} value={value}>
                {
                  {
                    MENUNGGU: "Menunggu tanggapan",
                    DITERIMA: "Diterima",
                    DITARIK: "Ditarik",
                    DITOLAK: "Ditolak",
                    DITOLAK_OTOMATIS: "Ditolak otomatis",
                  }[value]
                }
              </option>
            ))}
          </select>
        </div>
        <Button type="submit">Terapkan filter</Button>
        {status && (
          <Link
            className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm"
            href="/tk/lamaran"
          >
            Hapus filter
          </Link>
        )}
      </form>
      {pesan && (
        <p
          role="status"
          className="rounded-lg bg-teal-50 p-3 text-sm text-teal-900"
        >
          {pesan}
        </p>
      )}
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 p-4 text-sm text-red-800"
        >
          <p>{error}</p>
          {login ? (
            <Link
              className="mt-3 inline-flex min-h-11 items-center underline"
              href="/masuk?next=%2Ftk%2Flamaran"
            >
              Masuk kembali
            </Link>
          ) : (
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => setVersi((v) => v + 1)}
            >
              Coba lagi
            </Button>
          )}
        </div>
      ) : !data ? (
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-muted-foreground"
        >
          Memuat lamaran...
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {data.total} lamaran ditemukan
          </p>
          <section
            aria-label="Daftar lamaran"
            className="divide-y rounded-xl border"
          >
            {data.items.length ? (
              data.items.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <StatusBadge status={item.status} />
                    <h2 className="mt-3 font-semibold">
                      <Link
                        href={`/lowongan/${item.lowongan.id}`}
                        className="inline-flex min-h-11 items-center hover:underline"
                      >
                        {item.lowongan.judul}
                      </Link>
                    </h2>
                    <p className="mt-1 text-sm">
                      {formatRupiah(item.hargaPenawaran)} &middot;{" "}
                      {item.ketersediaan}
                    </p>
                    {item.pesan && (
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                        {item.pesan}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Diajukan {formatTanggal(item.createdAt)}
                    </p>
                  </div>
                  {item.status === "MENUNGGU" && (
                    <div className="shrink-0">
                      <DialogTarikPenawaran
                        id={item.id}
                        judul={item.lowongan.judul}
                        onChanged={diperbarui}
                      />
                    </div>
                  )}
                </article>
              ))
            ) : (
              <div className="p-8 text-center">
                <h2 className="font-semibold">
                  {status
                    ? "Tidak ada lamaran dengan status ini"
                    : "Belum ada penawaran"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Penawaran yang kamu ajukan akan ditampilkan di sini.
                </p>
                <Link
                  href="/lowongan"
                  className="mt-4 inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-medium"
                >
                  Cari pekerjaan
                </Link>
              </div>
            )}
          </section>
          <nav
            aria-label="Paginasi lamaran"
            className="flex flex-wrap items-center gap-3"
          >
            {page > 1 && (
              <Link
                className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm"
                href={halaman(page - 1)}
              >
                Sebelumnya
              </Link>
            )}
            <span className="text-sm">
              Halaman {page} dari{" "}
              {Math.max(1, Math.ceil(data.total / data.pageSize))}
            </span>
            {page * data.pageSize < data.total && (
              <Link
                className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm"
                href={halaman(page + 1)}
              >
                Berikutnya
              </Link>
            )}
          </nav>
        </>
      )}
    </div>
  );
}
