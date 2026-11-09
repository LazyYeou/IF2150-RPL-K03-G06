import { notFound } from "next/navigation";
import { ambilProfilPublik } from "@/controllers/TransaksiPekerjaanController";
import { AppError } from "@/lib/errors";
import ProfilPublik from "@/views/ProfilPublik";

export default async function ProfilPengguna({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const profil = await ambilProfilPublik((await params).id);
    return <ProfilPublik profil={profil} />;
  } catch (error) {
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  }
}
