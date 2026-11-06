import { redirect } from "next/navigation";
import { bacaSesi, type Peran } from "@/lib/auth/session";
import LogoutButton from "./LogoutButton";

export default async function RoleHome({ peran }: { peran: Peran }) {
  const pengguna = await bacaSesi();
  if (!pengguna) redirect("/masuk");
  if (pengguna.peran !== peran) redirect(`/${pengguna.peran.toLowerCase()}`);
  const label = {
    TK: "Tenaga Kerja",
    PK: "Penyedia Kerja",
    CS: "Customer Service",
  };
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="flex items-center justify-between gap-4">
        <span className="font-bold">Kerja-In</span>
        <LogoutButton />
      </header>
      <p className="mt-12 text-sm text-muted-foreground">{label[peran]}</p>
      <h1 className="mt-2 text-3xl font-semibold">Halo, {pengguna.nama}</h1>
      <p className="mt-3 text-muted-foreground">
        Kamu berhasil masuk ke akun {label[peran]}.
      </p>
    </main>
  );
}
