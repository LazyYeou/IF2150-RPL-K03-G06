"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function LogoutButton() {
  const router = useRouter();
  const toast = useToast();
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState("");
  async function keluar() {
    setSibuk(true);
    setPesan("");
    try {
      const r = await fetch("/api/auth/logout", { method: "POST" });
      if (!r.ok && r.status !== 401) throw new Error();
      toast("Kamu sudah keluar dari akun.");
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
      <Button
        type="button"
        onClick={keluar}
        disabled={sibuk}
        variant="ghost"
        className="w-full justify-start gap-3 px-3"
      >
        <LogOut className="size-4" aria-hidden="true" />
        {sibuk ? "Memproses…" : "Keluar"}
      </Button>
      {pesan && <p role="alert">{pesan}</p>}
    </div>
  );
}
