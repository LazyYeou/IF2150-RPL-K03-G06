import { AppError } from "@/lib/errors";

/** Body JSON dari request; JSON rusak = 400 (bukan 500). Validasi isinya tetap lewat skema Zod. */
export async function bacaJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "Body harus berupa JSON yang valid",
    );
  }
}

/** Body multipart/form-data; content-type salah = 400. */
export async function bacaForm(req: Request): Promise<FormData> {
  try {
    return await req.formData();
  } catch {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "Body harus berupa multipart/form-data",
    );
  }
}

/** Query string -> objek, untuk divalidasi skema Zod `.strict()`. */
export const bacaQuery = (req: Request) =>
  Object.fromEntries(new URL(req.url).searchParams);

/** Timestamp DB `YYYY-MM-DD HH:MM:SS` (UTC) -> ISO 8601 untuk API. */
export const keIso = (ts: string) => ts.replace(" ", "T") + "Z";
