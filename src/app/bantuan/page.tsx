import { HelpCenterPage } from "@/features/tickets/ticket-pages";
import { penggunaHalaman } from "@/controllers/LayoutController";
import WorkspaceShell from "@/views/layout/WorkspaceShell";
export default async function Bantuan({
  searchParams,
}: {
  searchParams: Promise<{
    transaksiId?: string | string[];
    idTransaksi?: string | string[];
  }>;
}) {
  const [user, query] = await Promise.all([
    penggunaHalaman(),
    searchParams,
  ]);
  const queryTransactionId = query.transaksiId ?? query.idTransaksi;
  const transactionId = Array.isArray(queryTransactionId)
    ? (queryTransactionId[0] ?? "")
    : (queryTransactionId ?? "");

  return (
    <WorkspaceShell peran={user.peran} nama={user.nama}>
      <HelpCenterPage transactionId={transactionId} />
    </WorkspaceShell>
  );
}
