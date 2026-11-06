"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthResponse } from "@/lib/validation/auth";

export default function AuthForm({ daftar = false }: { daftar?: boolean }) {
  const router = useRouter();
  const [tampilSandi, setTampilSandi] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});

  async function kirim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sibuk) return;
    setSibuk(true);
    setPesan("");
    setFields({});
    const data = new FormData(event.currentTarget);
    const body = {
      email: data.get("email"),
      password: data.get("password"),
      ...(daftar
        ? {
            nama: data.get("nama"),
            peran: data.get("peran"),
            tanggalLahir: data.get("tanggalLahir"),
            persetujuanPrivasi: data.get("persetujuanPrivasi") === "on",
          }
        : {}),
    };
    try {
      const response = await fetch(
        `/api/auth/${daftar ? "register" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const json = await response.json();
      if (!response.ok) {
        setPesan(json.error?.message ?? "Permintaan gagal. Silakan coba lagi.");
        setFields(json.error?.fields ?? {});
        return;
      }
      router.replace(AuthResponse.parse(json).redirectTo);
      router.refresh();
    } catch {
      setPesan(
        "Tidak dapat menyelesaikan permintaan. Periksa koneksi dan coba lagi.",
      );
    } finally {
      setSibuk(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-lg border bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-ring aria-invalid:border-destructive";
  function field(nama: string, label: string, type = "text", extra = {}) {
    return (
      <div>
        <label htmlFor={nama} className="text-sm font-medium">
          {label}
        </label>
        <input
          id={nama}
          name={nama}
          type={type}
          className={inputClass}
          required
          aria-invalid={Boolean(fields[nama])}
          aria-describedby={fields[nama] ? `${nama}-error` : undefined}
          {...extra}
        />
        {fields[nama] && (
          <p id={`${nama}-error`} className="mt-1 text-sm text-destructive">
            {fields[nama]}
          </p>
        )}
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-5 py-12">
      <section
        className="w-full max-w-md rounded-2xl border bg-card p-7 shadow-sm sm:p-9"
        aria-labelledby="auth-title"
      >
        <Link href="/" className="text-lg font-bold tracking-tight">
          Kerja-In<span className="text-emerald-600">.</span>
        </Link>
        <h1
          id="auth-title"
          className="mt-7 text-3xl font-semibold tracking-tight"
        >
          {daftar ? "Mulai bersama Kerja-In" : "Selamat datang kembali"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {daftar
            ? "Buat akun untuk mencari atau menyediakan pekerjaan."
            : "Masuk untuk melanjutkan aktivitasmu."}
        </p>
        <form onSubmit={kirim} className="mt-7 space-y-5">
          {pesan && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {pesan}
            </p>
          )}
          <fieldset disabled={sibuk} className="space-y-5 disabled:opacity-60">
            <legend className="sr-only">
              {daftar ? "Data pendaftaran" : "Data masuk"}
            </legend>
            {daftar &&
              field("nama", "Nama lengkap", "text", {
                maxLength: 80,
                autoComplete: "name",
              })}
            {field("email", "Email", "email", {
              maxLength: 254,
              autoComplete: "email",
            })}
            <div>
              {field(
                "password",
                "Kata sandi",
                tampilSandi ? "text" : "password",
                {
                  minLength: daftar ? 8 : 1,
                  maxLength: 72,
                  autoComplete: daftar ? "new-password" : "current-password",
                },
              )}
              <button
                type="button"
                onClick={() => setTampilSandi(!tampilSandi)}
                aria-pressed={tampilSandi}
                aria-controls="password"
                className="mt-2 text-sm underline underline-offset-4"
              >
                {tampilSandi
                  ? "Sembunyikan kata sandi"
                  : "Tampilkan kata sandi"}
              </button>
            </div>
            {daftar && (
              <>
                {field("tanggalLahir", "Tanggal lahir", "date", {
                  autoComplete: "bday",
                })}
                <p className="-mt-3 text-xs text-muted-foreground">
                  Usia minimal 17 tahun.
                </p>
                <div>
                  <label htmlFor="peran" className="text-sm font-medium">
                    Saya ingin
                  </label>
                  <select
                    id="peran"
                    name="peran"
                    className={inputClass}
                    defaultValue="TK"
                  >
                    <option value="TK">Mencari pekerjaan (Tenaga Kerja)</option>
                    <option value="PK">
                      Menyediakan pekerjaan (Penyedia Kerja)
                    </option>
                  </select>
                  {fields.peran && (
                    <p className="text-sm text-destructive">{fields.peran}</p>
                  )}
                </div>
                <div>
                  <label className="flex items-start gap-3 text-sm leading-6">
                    <input
                      type="checkbox"
                      name="persetujuanPrivasi"
                      className="mt-1 size-4"
                      aria-invalid={Boolean(fields.persetujuanPrivasi)}
                      aria-describedby="privasi-error"
                    />
                    <span>
                      Saya menyetujui{" "}
                      <Link
                        href="/ketentuan"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Ketentuan Penggunaan
                      </Link>{" "}
                      dan{" "}
                      <Link
                        href="/privasi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Kebijakan Privasi
                      </Link>{" "}
                      (terbuka di tab baru).
                    </span>
                  </label>
                  {fields.persetujuanPrivasi && (
                    <p
                      id="privasi-error"
                      className="mt-1 text-sm text-destructive"
                    >
                      {fields.persetujuanPrivasi}
                    </p>
                  )}
                </div>
              </>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground"
            >
              {sibuk ? "Memproses…" : daftar ? "Buat akun" : "Masuk"}
            </button>
          </fieldset>
        </form>
        {!daftar && (
          <Link
            href="/lupa-sandi"
            className="mt-4 inline-flex min-h-11 items-center text-sm underline underline-offset-4"
          >
            Lupa kata sandi?
          </Link>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {daftar ? "Sudah punya akun? " : "Belum punya akun? "}
          <Link
            href={daftar ? "/masuk" : "/daftar"}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {daftar ? "Masuk" : "Daftar"}
          </Link>
        </p>
      </section>
    </main>
  );
}
