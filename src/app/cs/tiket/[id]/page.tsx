import { TicketDetailPage } from "@/features/tickets/ticket-pages";

export default async function CsTicketDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketDetailPage mode="cs" ticketId={id} />;
}
