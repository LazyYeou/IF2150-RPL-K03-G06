import { ManagedJobDetail } from "@/features/jobs/managed-job-detail";

export default async function ManagedJobDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ManagedJobDetail jobId={id} />;
}
