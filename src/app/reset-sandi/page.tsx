import ResetSandiForm from "@/views/ResetSandiForm";
export const metadata = { referrer: "no-referrer" as const };
export default async function ResetSandi({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  return (
    <ResetSandiForm
      token={typeof params.token === "string" ? params.token : ""}
    />
  );
}
