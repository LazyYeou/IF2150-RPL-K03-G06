"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Popover } from "@base-ui/react/popover";
import { Bell, Check, RefreshCw } from "lucide-react";
import {
  DaftarNotifikasiResponse,
  tautanNotifikasi,
  type DaftarNotifikasi,
  type Notifikasi,
} from "@/lib/validation/notifikasi";
import { formatTanggal } from "@/lib/format";

const kosong: DaftarNotifikasi = { items: [], jumlahBelumDibaca: 0 };
export default function NotificationBell() {
  const [data, setData] = useState<DaftarNotifikasi>(kosong);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const router = useRouter();
  useEffect(() => {
    let active = true;
    let pending = false;
    const abort = new AbortController();
    async function muat() {
      if (!active || pending) return;
      pending = true;
      try {
        const response = await fetch("/api/notifikasi", {
          cache: "no-store",
          signal: abort.signal,
        });
        if (!active) return;
        if (response.status === 401) {
          setData(kosong);
          setError("Sesi berakhir. Silakan masuk kembali.");
          return;
        }
        if (!response.ok) throw new Error();
        const hasil = DaftarNotifikasiResponse.parse(await response.json());
        if (active) {
          setData(hasil);
          setError("");
        }
      } catch {
        if (active)
          setError("Notifikasi belum dapat diperbarui. Silakan coba lagi.");
      } finally {
        pending = false;
        if (active) setLoading(false);
      }
    }
    void muat();
    const interval = setInterval(() => {
      void muat();
    }, 30_000);
    return () => {
      active = false;
      clearInterval(interval);
      abort.abort();
    };
  }, [refresh]);

  async function baca(item: Notifikasi) {
    if (busy) return;
    setBusy(item.id);
    setError("");
    try {
      const response = await fetch(`/api/notifikasi/${item.id}/baca`, {
        method: "POST",
      });
      if (response.status === 401) {
        setData(kosong);
        throw new Error();
      }
      if (!response.ok) throw new Error();
      setData((lama) => ({
        items: lama.items.map((n) =>
          n.id === item.id ? { ...n, dibaca: true } : n,
        ),
        jumlahBelumDibaca: Math.max(
          0,
          lama.jumlahBelumDibaca -
            (lama.items.find((n) => n.id === item.id)?.dibaca === false
              ? 1
              : 0),
        ),
      }));
      setRefresh((v) => v + 1);
      const target = tautanNotifikasi(item.tautan);
      if (target) {
        setOpen(false);
        router.push(target);
      }
    } catch {
      setError("Notifikasi belum ditandai dibaca. Silakan coba lagi.");
    } finally {
      setBusy(null);
    }
  }
  return (
    <Popover.Root
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value) setRefresh((v) => v + 1);
      }}
    >
      <Popover.Trigger
        className="relative flex size-11 shrink-0 items-center justify-center rounded-lg border hover:bg-muted"
        aria-label={`Notifikasi, ${data.jumlahBelumDibaca} belum dibaca`}
      >
        <Bell className="size-5" aria-hidden="true" />
        {data.jumlahBelumDibaca > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] font-bold text-navy"
          >
            {data.jumlahBelumDibaca > 99 ? "99+" : data.jumlahBelumDibaca}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={10} align="end" className="z-50">
          <Popover.Popup
            role="dialog"
            aria-label="Daftar notifikasi"
            className="max-h-[70dvh] w-[min(380px,calc(100vw_-_2rem))] overflow-y-auto rounded-xl border bg-background shadow-xl outline-none"
          >
            <div className="flex items-center justify-between gap-3 border-b p-4">
              <div>
                <h2 className="font-semibold">Notifikasi</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.jumlahBelumDibaca} belum dibaca · 20 terbaru
                </p>
              </div>
              <Popover.Close
                aria-label="Tutup notifikasi"
                className="flex size-11 items-center justify-center rounded-lg text-sm hover:bg-muted"
              >
                Tutup
              </Popover.Close>
            </div>
            {error && (
              <div className="border-b p-4">
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
                <button
                  type="button"
                  className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm underline"
                  onClick={() => setRefresh((v) => v + 1)}
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                  Coba lagi
                </button>
              </div>
            )}
            {loading ? (
              <p role="status" className="p-6 text-sm text-muted-foreground">
                Memuat notifikasi…
              </p>
            ) : data.items.length === 0 ? (
              <div className="p-7 text-center">
                <Bell
                  className="mx-auto mb-3 size-6 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium">Belum ada notifikasi</p>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  Kabar pekerjaan dan aktivitas akunmu akan muncul di sini.
                </p>
              </div>
            ) : (
              <ul className="divide-y">
                {data.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        void baca(item);
                      }}
                      disabled={busy !== null}
                      aria-label={`${item.dibaca ? "Sudah dibaca" : "Belum dibaca"}: ${item.pesan}`}
                      className={`flex min-h-16 w-full items-start gap-3 p-4 text-left hover:bg-muted disabled:opacity-60 ${item.dibaca ? "" : "bg-blue-50/60"}`}
                    >
                      <span className="mt-1 shrink-0">
                        {item.dibaca ? (
                          <Check
                            className="size-4 text-teal-700"
                            aria-hidden="true"
                          />
                        ) : (
                          <span
                            className="block size-2 rounded-full bg-orange-600"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block break-words text-sm leading-6 ${item.dibaca ? "" : "font-medium"}`}
                        >
                          {item.pesan}
                        </span>
                        <time
                          dateTime={item.waktuKirim}
                          className="mt-2 block text-xs text-muted-foreground"
                        >
                          {formatTanggal(item.waktuKirim)}
                        </time>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {busy === item.id
                            ? "Memproses…"
                            : item.dibaca
                              ? "Sudah dibaca"
                              : tautanNotifikasi(item.tautan)
                                ? "Buka dan tandai dibaca"
                                : "Tandai dibaca"}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
