import { penggunaHalaman } from "@/controllers/LayoutController";
import { TicketDetailPage } from "@/features/tickets/ticket-pages";
import WorkspaceShell from "@/views/layout/WorkspaceShell";

export default async function TicketDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, user] = await Promise.all([params, penggunaHalaman()]);
  return (
    <WorkspaceShell peran={user.peran} nama={user.nama}>
      <TicketDetailPage mode="reporter" ticketId={id} />
    </WorkspaceShell>
  );
}
