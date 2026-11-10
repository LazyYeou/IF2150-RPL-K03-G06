export type VerificationStatus =
  | "BELUM_TERVERIFIKASI"
  | "MENUNGGU_VERIFIKASI"
  | "TERVERIFIKASI"
  | "DITOLAK";

export type VerificationStatusResponse = {
  status: VerificationStatus;
  waktuPengajuan: string | null;
  alasanPenolakan: string | null;
};

type VerificationSubmissionResponse = Pick<
  VerificationStatusResponse,
  "status" | "waktuPengajuan"
>;

type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string>;
  };
};

const verificationStatuses: VerificationStatus[] = [
  "BELUM_TERVERIFIKASI",
  "MENUNGGU_VERIFIKASI",
  "TERVERIFIKASI",
  "DITOLAK",
];

export class VerificationApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code?: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "VerificationApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isVerificationStatus(value: unknown): value is VerificationStatus {
  return (
    typeof value === "string" &&
    verificationStatuses.includes(value as VerificationStatus)
  );
}

function isVerificationStatusResponse(
  value: unknown,
): value is VerificationStatusResponse {
  return (
    isRecord(value) &&
    isVerificationStatus(value.status) &&
    (typeof value.waktuPengajuan === "string" ||
      value.waktuPengajuan === null) &&
    (typeof value.alasanPenolakan === "string" ||
      value.alasanPenolakan === null)
  );
}

function isSubmissionResponse(
  value: unknown,
): value is VerificationSubmissionResponse {
  return (
    isRecord(value) &&
    isVerificationStatus(value.status) &&
    (typeof value.waktuPengajuan === "string" ||
      value.waktuPengajuan === null)
  );
}

async function throwApiError(response: Response): Promise<never> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new VerificationApiError(
      `Permintaan gagal (HTTP ${response.status}).`,
      response.status,
    );
  }

  const error = isRecord(payload) && isRecord(payload.error)
    ? payload.error as ApiErrorPayload["error"]
    : undefined;
  const fields = error?.fields &&
    Object.values(error.fields).every((message) => typeof message === "string")
    ? error.fields
    : undefined;

  throw new VerificationApiError(
    error?.message ?? `Permintaan gagal (HTTP ${response.status}).`,
    response.status,
    error?.code,
    fields,
  );
}

export async function getVerificationStatus(
  signal?: AbortSignal,
): Promise<VerificationStatusResponse> {
  const response = await fetch("/api/verifikasi/status", {
    cache: "no-store",
    credentials: "same-origin",
    signal,
  });
  if (!response.ok) return throwApiError(response);

  const result: unknown = await response.json();
  if (!isVerificationStatusResponse(result)) {
    throw new Error("Respons status verifikasi dari server tidak valid.");
  }
  return result;
}

export async function submitVerification(
  file: File,
): Promise<VerificationSubmissionResponse> {
  const formData = new FormData();
  formData.append("berkas", file);
  formData.append("persetujuan", "true");

  const response = await fetch("/api/verifikasi", {
    method: "POST",
    credentials: "same-origin",
    body: formData,
  });
  if (!response.ok) return throwApiError(response);

  const result: unknown = await response.json();
  if (!isSubmissionResponse(result)) {
    throw new Error("Respons pengajuan verifikasi dari server tidak valid.");
  }
  return result;
}
