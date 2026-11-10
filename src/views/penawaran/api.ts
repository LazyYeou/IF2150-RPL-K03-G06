import { z } from "zod";
const ErrorAPI = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: z.record(z.string()).optional(),
  }),
});
export function kesalahanAPI(data: unknown, fallback: string) {
  const parsed = ErrorAPI.safeParse(data);
  return parsed.success
    ? parsed.data.error
    : { code: "", message: fallback, fields: undefined };
}
export const kelasInput =
  "min-h-11 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary aria-invalid:border-red-600";
