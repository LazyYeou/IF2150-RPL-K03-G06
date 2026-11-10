import { TicketDetailPage } from "@/features/tickets/ticket-pages";

export default async function TicketDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketDetailPage mode="reporter" ticketId={id} />;
}
