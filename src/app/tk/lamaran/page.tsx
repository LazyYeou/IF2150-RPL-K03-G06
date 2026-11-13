import { redirect } from "next/navigation";
import { penggunaHalaman } from "@/controllers/LayoutController";
import { PenawaranSayaQuery } from "@/lib/validation/penawaran";
import DaftarLamaran from "@/views/penawaran/DaftarLamaran";

export default async function Lamaran({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[];
    status?: string | string[];
  }>;
}) {
  const user = await penggunaHalaman("TK");
  const query = await searchParams;
  const parsed = PenawaranSayaQuery.safeParse({
    page: query.page,
    status: query.status || undefined,
  });
  if (!parsed.success) redirect("/tk/lamaran");
  return (
    <DaftarLamaran
      key={user.id}
      idPengguna={user.id}
      page={parsed.data.page}
      status={parsed.data.status}
    />
  );
}
