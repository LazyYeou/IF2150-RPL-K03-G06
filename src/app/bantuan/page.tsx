import { HelpCenterPage } from "@/features/tickets/ticket-pages";

export default async function HelpRoute({
  searchParams,
}: {
  searchParams: Promise<{
    transaksiId?: string | string[];
    idTransaksi?: string | string[];
  }>;
}) {
  const query = await searchParams;
  const transactionId = query.transaksiId ?? query.idTransaksi;
  return (
    <HelpCenterPage
      transactionId={Array.isArray(transactionId) ? transactionId[0] ?? "" : transactionId ?? ""}
    />
  );
}
