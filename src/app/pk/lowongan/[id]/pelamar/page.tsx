import { ApplicantsPage } from "@/features/jobs/applicants-page";

export default async function ApplicantsRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ApplicantsPage jobId={id} />;
}
