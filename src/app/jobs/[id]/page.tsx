import { notFound } from "next/navigation";
import { JobDetail } from "@/features/jobs/job-detail";
import { getJobById, jobs } from "@/lib/jobs";

export function generateStaticParams() {
  return jobs.map((job) => ({ id: job.id }));
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = getJobById(id);
  if (!job) notFound();

  return <JobDetail job={job} />;
}
