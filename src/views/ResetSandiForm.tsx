"use client";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  LupaSandiInput,
  LupaSandiResponse,
  ResetSandiInput,
} from "@/lib/validation/reset-sandi";

const FormInput = LupaSandiInput.extend({
  passwordBaru: ResetSandiInput.shape.passwordBaru.optional(),
});
type Input = z.infer<typeof FormInput>;

export default function ResetSandiForm({ token }: { token?: string }) {
  const reset = token !== undefined;
  const tokenValid =
    !reset || ResetSandiInput.shape.token.safeParse(token).success;
  const [selesai, setSelesai] = useState(false);
  const [pesan, setPesan] = useState("");
  const [tampil, setTampil] = useState(false);
  const schema = reset
    ? z.object({
        email: z.string(),
        passwordBaru: ResetSandiInput.shape.passwordBaru,
      })
    : FormInput;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isReady },
  } = useForm<Input>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });
  async function kirim(data: Input) {
    setPesan("");
    try {
      const r = await fetch(
        `/api/auth/${reset ? "reset-sandi" : "lupa-sandi"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            reset
              ? { token, passwordBaru: data.passwordBaru }
              : { email: data.email },
          ),
        },
      );
      if (!r.ok) {
        const json = await r.json();
        setPesan(json.error?.message ?? "Permintaan gagal. Silakan coba lagi.");
        return;
      }
      setPesan(
        reset
          ? "Kata sandi berhasil diperbarui. Silakan masuk kembali di semua perangkat."
          : LupaSandiResponse.parse(await r.json()).message,
      );
      setSelesai(true);
    } catch {
      setPesan("Permintaan gagal. Periksa koneksi dan coba lagi.");
    }
  }
  const error = reset ? errors.passwordBaru : errors.email;
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-[70dvh] items-center justify-center bg-muted/40 px-5 py-12"
    >
      <section
        className="w-full max-w-md rounded-2xl border bg-card p-7 shadow-sm sm:p-9"
        aria-labelledby="reset-title"
      >
        <Link href="/" className="text-lg font-bold">
          Kerja-In<span className="text-emerald-600">.</span>
        </Link>
        <h1 id="reset-title" className="mt-7 text-3xl font-semibold">
          {reset ? "Buat kata sandi baru" : "Lupa kata sandi?"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {reset
            ? "Gunakan kata sandi baru dengan 8–72 karakter."
            : "Masukkan email yang digunakan untuk akun Kerja-In."}
        </p>
        {!tokenValid && (
          <p role="alert" className="mt-5 text-sm text-destructive">
            Tautan reset tidak lengkap atau tidak valid. Silakan minta tautan
            baru.
          </p>
        )}
        {pesan && (
          <p
            role={selesai ? "status" : "alert"}
            className="mt-5 rounded-lg border p-3 text-sm"
          >
            {pesan}
          </p>
        )}
        {!selesai && tokenValid && (
          <form onSubmit={handleSubmit(kirim)} className="mt-6 space-y-5">
            <fieldset
              disabled={isSubmitting || !isReady}
              className="space-y-5 disabled:opacity-60"
            >
              <legend className="sr-only">
                {reset ? "Kata sandi baru" : "Email akun"}
              </legend>
              <div>
                <label htmlFor="reset-field" className="text-sm font-medium">
                  {reset ? "Kata sandi baru" : "Email"}
                </label>
                <input
                  id="reset-field"
                  {...register(reset ? "passwordBaru" : "email")}
                  type={reset ? (tampil ? "text" : "password") : "email"}
                  required
                  autoComplete={reset ? "new-password" : "email"}
                  minLength={reset ? 8 : undefined}
                  maxLength={reset ? 72 : 254}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "reset-error" : undefined}
                  className="mt-2 w-full rounded-lg border bg-background px-3 py-3 focus:ring-2 focus:ring-ring"
                />
                {error && (
                  <p id="reset-error" className="mt-1 text-sm text-destructive">
                    {error.message}
                  </p>
                )}
              </div>
              {reset && (
                <button
                  type="button"
                  className="min-h-11 text-sm underline"
                  aria-controls="reset-field"
                  aria-pressed={tampil}
                  onClick={() => setTampil(!tampil)}
                >
                  {tampil ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                </button>
              )}
              <button
                type="submit"
                className="min-h-11 w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground"
              >
                {isSubmitting
                  ? "Memproses…"
                  : reset
                    ? "Simpan kata sandi"
                    : "Kirim tautan reset"}
              </button>
            </fieldset>
          </form>
        )}
        <div className="mt-6 flex flex-wrap gap-4 text-sm underline">
          <Link href="/masuk" className="inline-flex min-h-11 items-center">
            Kembali ke masuk
          </Link>
          {reset && (
            <Link
              href="/lupa-sandi"
              className="inline-flex min-h-11 items-center"
            >
              Minta tautan baru
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
