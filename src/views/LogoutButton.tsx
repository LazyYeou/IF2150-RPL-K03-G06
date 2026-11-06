"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState("");
  async function keluar() {
    setSibuk(true);
    setPesan("");
    try {
      const r = await fetch("/api/auth/logout", { method: "POST" });
      if (!r.ok && r.status !== 401) throw new Error();
      router.replace("/masuk");
      router.refresh();
    } catch {
      setPesan("Gagal keluar. Silakan coba lagi.");
    } finally {
      setSibuk(false);
    }
  }
  return (
    <div>
      <button
        type="button"
        onClick={keluar}
        disabled={sibuk}
        className="rounded-lg border px-4 py-2 disabled:opacity-50"
      >
        {sibuk ? "Memproses…" : "Keluar"}
      </button>
      {pesan && <p role="alert">{pesan}</p>}
    </div>
  );
}
