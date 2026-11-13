"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KATEGORI } from "@/lib/validation/common";

export function SearchFilters({
  keyword,
  category,
  minimumWage,
  sort,
}: {
  keyword: string;
  category: string | undefined;
  minimumWage: string;
  sort: "terbaru" | "upah_tertinggi";
}) {
  const [selectedCategory, setSelectedCategory] = useState(category ?? "");

  useEffect(() => {
    setSelectedCategory(category ?? "");
  }, [category]);

  return (
    <form
      action="/lowongan"
      className="space-y-5 rounded-xl border bg-white p-5"
      method="get"
    >
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="job-keyword">
          Kata kunci
        </label>
        <input
          className="min-h-11 w-full rounded-md border px-3 text-sm"
          defaultValue={keyword}
          id="job-keyword"
          name="q"
          placeholder="Judul atau deskripsi pekerjaan"
          type="search"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Kategori pekerjaan</legend>
        <p className="mt-1 text-xs text-muted-foreground">Pilih satu kategori.</p>
        <div className="mt-3 space-y-3">
          {KATEGORI.map((item) => (
            <label className="flex items-center gap-3 text-sm" key={item}>
              <input
                checked={selectedCategory === item}
                className="size-4 accent-primary"
                name="kategori"
                onChange={(event) =>
                  setSelectedCategory(event.target.checked ? item : "")
                }
                type="checkbox"
                value={item}
              />
              {item}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="minimum-wage">
          Upah minimum
        </label>
        <div className="flex min-h-11 items-center rounded-md border">
          <span className="border-r px-3 text-sm text-muted-foreground">Rp</span>
          <input
            className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
            defaultValue={minimumWage}
            id="minimum-wage"
            min="0"
            name="upahMin"
            placeholder="0"
            step="1000"
            type="number"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="job-sort">
          Urutkan
        </label>
        <select
          className="min-h-11 w-full rounded-md border bg-white px-3 text-sm"
          defaultValue={sort}
          id="job-sort"
          name="urut"
        >
          <option value="terbaru">Terbaru</option>
          <option value="upah_tertinggi">Upah tertinggi</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <button
          className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
          type="submit"
        >
          Terapkan filter
        </button>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-lg border px-4 text-sm font-medium"
          href="/lowongan"
        >
          Reset filter
        </Link>
      </div>
    </form>
  );
}
