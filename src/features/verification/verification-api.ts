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

export type CSVerificationQueueItem = {
  idTenagaKerja: string;
  nama: string;
  email: string;
  waktuPengajuan: string;
};

type CSVerificationQueueResponse = {
  items: CSVerificationQueueItem[];
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

function isCSVerificationQueueResponse(
  value: unknown,
): value is CSVerificationQueueResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(
      (item) =>
        isRecord(item) &&
        typeof item.idTenagaKerja === "string" &&
        typeof item.nama === "string" &&
        typeof item.email === "string" &&
        typeof item.waktuPengajuan === "string",
    )
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

async function fetchCSVerification(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`/api/cs/verifikasi${path}`, {
    cache: "no-store",
    credentials: "same-origin",
    ...init,
  });
}

export async function getCSVerificationQueue(
  signal?: AbortSignal,
): Promise<CSVerificationQueueResponse> {
  const response = await fetchCSVerification("", { signal });
  if (!response.ok) return throwApiError(response);

  const result: unknown = await response.json();
  if (!isCSVerificationQueueResponse(result)) {
    throw new Error("Respons antrean verifikasi dari server tidak valid.");
  }
  return result;
}

export async function getCSVerificationDocument(
  idTenagaKerja: string,
  signal?: AbortSignal,
): Promise<Blob> {
  const response = await fetchCSVerification(
    `/${encodeURIComponent(idTenagaKerja)}/dokumen`,
    { signal },
  );
  if (!response.ok) return throwApiError(response);

  const document = await response.blob();
  if (
    document.size === 0 ||
    (!document.type.startsWith("image/") &&
      document.type !== "application/pdf")
  ) {
    throw new Error("Dokumen tidak dapat ditampilkan sebagai gambar atau PDF.");
  }
  return document;
}

export async function approveCSVerification(
  idTenagaKerja: string,
): Promise<"TERVERIFIKASI"> {
  const response = await fetchCSVerification(
    `/${encodeURIComponent(idTenagaKerja)}/setujui`,
    { method: "POST" },
  );
  if (!response.ok) return throwApiError(response);

  const result: unknown = await response.json();
  if (!isRecord(result) || result.status !== "TERVERIFIKASI") {
    throw new Error("Respons persetujuan verifikasi dari server tidak valid.");
  }
  return result.status;
}

export async function rejectCSVerification(
  idTenagaKerja: string,
  reason: string,
): Promise<"DITOLAK"> {
  const response = await fetchCSVerification(
    `/${encodeURIComponent(idTenagaKerja)}/tolak`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alasan: reason }),
    },
  );
  if (!response.ok) return throwApiError(response);

  const result: unknown = await response.json();
  if (!isRecord(result) || result.status !== "DITOLAK") {
    throw new Error("Respons penolakan verifikasi dari server tidak valid.");
  }
  return result.status;
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
