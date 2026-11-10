"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ControlledDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Penawaran } from "@/lib/validation/penawaran";
import { kesalahanAPI } from "./api";

export default function DialogTarikPenawaran({
  id,
  judul,
  onChanged,
}: {
  id: string;
  judul: string;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const [login, setLogin] = useState(false);
  const inFlight = useRef(false),
    triggerRef = useRef<HTMLButtonElement>(null);
  const batalRef = useRef<HTMLButtonElement>(null);
  async function tarik() {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        `/api/penawaran/${encodeURIComponent(id)}/tarik`,
        { method: "POST" },
      );
      const data: unknown = await response.json();
      if (!response.ok) {
        const err = kesalahanAPI(
          data,
          "Penawaran belum dapat ditarik. Coba lagi.",
        );
        setError(err.message);
        setLogin(response.status === 401);
        return;
      }
      const result = Penawaran.parse(data);
      if (result.id !== id || result.status !== "DITARIK")
        throw new Error("Respons penarikan tidak sesuai");
      setOpen(false);
      onChanged();
    } catch {
      setError(
        "Koneksi terputus. Muat ulang daftar untuk memeriksa status penawaran.",
      );
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }
  return (
    <>
      <Button
        ref={triggerRef}
        variant="outline"
        onClick={() => {
          setError("");
          setLogin(false);
          setOpen(true);
        }}
      >
        Tarik penawaran
      </Button>
      <ControlledDialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value && error) onChanged();
        }}
        title="Tarik penawaran?"
        description={judul}
        initialFocus={batalRef}
        finalFocus={() =>
          triggerRef.current ?? document.getElementById("lamaran-title")
        }
      >
        <p className="text-sm leading-6 text-muted-foreground">
          Penawaran hanya dapat ditarik selama masih menunggu tanggapan. Setelah
          ditarik, kamu boleh mengajukan ulang jika lowongan masih terbuka.
        </p>
        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
            {login && (
              <Link
                className="mt-2 block underline"
                href="/masuk?next=%2Ftk%2Flamaran"
              >
                Masuk kembali
              </Link>
            )}
          </div>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button
            ref={batalRef}
            variant="outline"
            onClick={() => {
              setOpen(false);
              if (error) onChanged();
            }}
          >
            Batal
          </Button>
          <Button onClick={tarik} disabled={pending}>
            {pending ? "Menarik..." : "Ya, tarik penawaran"}
          </Button>
        </div>
      </ControlledDialog>
    </>
  );
}
