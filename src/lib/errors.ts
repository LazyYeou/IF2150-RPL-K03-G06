import { ZodError } from "zod";

/** Error bisnis yang dipetakan ke respons HTTP. Kode: docs/contracts/api.md §1.1. */
export class AppError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/** Bentuk respons error seragam `{ error: { code, message, fields? } }`; dipakai semua route handler. */
export function toResponse(err: unknown): Response {
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const i of err.issues) fields[i.path.join(".") || "_"] ??= i.message;
    err = new AppError("VALIDATION_ERROR", 400, "Isian tidak valid", fields);
  }
  if (err instanceof AppError) {
    return Response.json(
      { error: { code: err.code, message: err.message, fields: err.fields } },
      { status: err.status },
    );
  }
  console.error(err); // jangan bocorkan detail internal ke klien
  return Response.json(
    { error: { code: "INTERNAL", message: "Terjadi kesalahan pada server" } },
    { status: 500 },
  );
}
