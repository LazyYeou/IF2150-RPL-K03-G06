"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

type SearchBarProps = {
  initialKeyword?: string;
  initialLocation?: string;
  onSearch?: (keyword: string, location: string) => void;
  compact?: boolean;
};

export function SearchBar({
  initialKeyword = "",
  initialLocation = "",
  onSearch,
  compact = false,
}: SearchBarProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState(initialLocation);

  function runSearch() {
    if (onSearch) {
      onSearch(keyword.trim(), location.trim());
      return;
    }

    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(`/jobs${params.size ? `?${params.toString()}` : ""}`);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runSearch();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      runSearch();
    }
  }

  return (
    <form
      className={compact ? "search-bar search-bar-compact" : "search-bar"}
      onSubmit={submitSearch}
    >
      <label className="search-field">
        <span aria-hidden="true" className="field-icon">⌕</span>
        <span className="field-copy">
          <span className="field-label">Mau kerja apa?</span>
          <input
            aria-label="Pekerjaan atau keahlian"
            name="q"
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pekerjaan atau keahlian"
            type="search"
            value={keyword}
          />
        </span>
      </label>
      <label className="search-field">
        <span aria-hidden="true" className="field-icon">⌖</span>
        <span className="field-copy">
          <span className="field-label">Di mana?</span>
          <input
            aria-label="Kota atau daerah"
            name="location"
            onChange={(event) => setLocation(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bandung dan sekitarnya"
            type="search"
            value={location}
          />
        </span>
      </label>
      <button className="button button-primary search-submit" type="submit">
        <span aria-hidden="true">⌕</span>
        Cari Pekerjaan
      </button>
    </form>
  );
}
