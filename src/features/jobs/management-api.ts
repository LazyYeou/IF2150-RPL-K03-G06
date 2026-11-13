import { KATEGORI } from "@/lib/validation/common";

export const jobCategories = KATEGORI;

export type JobCategory = (typeof jobCategories)[number];
export type JobStatus = "OPEN" | "CLOSED_FULL" | "DIBATALKAN";
export type WageUnit = "PER_TUGAS" | "PER_HARI";

export type CreateJobInput = {
  judul: string;
  deskripsi: string;
  ruangLingkup: string;
  kriteriaHasil: string;
  kategori: JobCategory;
  lokasi: string;
  tanggalPekerjaan: string;
  estimasiDurasi: string;
  upah: number;
  satuanUpah: WageUnit;
  kuota: number;
  pernyataanRisiko: boolean;
};

export type ManagedJob = {
  id: string;
  judul: string;
  kategori: string;
  lokasi: string;
  tanggalPekerjaan: string;
  upah: number;
  satuanUpah: WageUnit;
  kuota: number;
  jumlahDiterima: number;
  jumlahPelamarMenunggu?: number;
  status: JobStatus;
  createdAt: string;
  deskripsi?: string;
  ruangLingkup?: string;
  kriteriaHasil?: string;
  estimasiDurasi?: string;
  pernyataanRisiko?: boolean;
};

export type ManagedJobsResponse = {
  items: ManagedJob[];
  total: number;
  page: number;
  pageSize: number;
};

export class JobManagementApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code?: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "JobManagementApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isJobStatus(value: unknown): value is JobStatus {
  return (
    value === "OPEN" || value === "CLOSED_FULL" || value === "DIBATALKAN"
  );
}

function isWageUnit(value: unknown): value is WageUnit {
  return value === "PER_TUGAS" || value === "PER_HARI";
}

function isManagedJob(value: unknown): value is ManagedJob {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.judul === "string" &&
    typeof value.kategori === "string" &&
    typeof value.lokasi === "string" &&
    typeof value.tanggalPekerjaan === "string" &&
    typeof value.upah === "number" &&
    isWageUnit(value.satuanUpah) &&
    typeof value.kuota === "number" &&
    typeof value.jumlahDiterima === "number" &&
    isJobStatus(value.status) &&
    typeof value.createdAt === "string" &&
    (value.jumlahPelamarMenunggu === undefined ||
      typeof value.jumlahPelamarMenunggu === "number")
  );
}

function isManagedJobsResponse(value: unknown): value is ManagedJobsResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isManagedJob) &&
    typeof value.total === "number" &&
    typeof value.page === "number" &&
    typeof value.pageSize === "number"
  );
}

function isManagedJobDetail(value: unknown): value is ManagedJob {
  return (
    isManagedJob(value) &&
    typeof value.deskripsi === "string" &&
    typeof value.ruangLingkup === "string" &&
    typeof value.kriteriaHasil === "string" &&
    typeof value.estimasiDurasi === "string" &&
    typeof value.pernyataanRisiko === "boolean"
  );
}

async function throwApiError(response: Response): Promise<never> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new JobManagementApiError(
      `Permintaan gagal (HTTP ${response.status}).`,
      response.status,
    );
  }

  const error =
    isRecord(payload) && isRecord(payload.error) ? payload.error : undefined;
  const fields =
    error?.fields &&
    isRecord(error.fields) &&
    Object.values(error.fields).every((message) => typeof message === "string")
      ? (error.fields as Record<string, string>)
      : undefined;
  throw new JobManagementApiError(
    typeof error?.message === "string"
      ? error.message
      : `Permintaan gagal (HTTP ${response.status}).`,
    response.status,
    typeof error?.code === "string" ? error.code : undefined,
    fields,
  );
}

export async function getManagedJobs(
  page = 1,
  signal?: AbortSignal,
): Promise<ManagedJobsResponse> {
  const response = await fetch(`/api/lowongan/saya?page=${page}`, {
    cache: "no-store",
    credentials: "same-origin",
    signal,
  });
  if (!response.ok) return throwApiError(response);

  const result: unknown = await response.json();
  if (!isManagedJobsResponse(result)) {
    throw new Error("Respons daftar lowongan dari server tidak valid.");
  }
  return result;
}

export async function createManagedJob(
  input: CreateJobInput,
): Promise<ManagedJob> {
  const response = await fetch("/api/lowongan", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) return throwApiError(response);

  const result: unknown = await response.json();
  if (!isManagedJobDetail(result)) {
    throw new Error("Respons lowongan baru dari server tidak valid.");
  }
  return result;
}

export async function getManagedJob(
  id: string,
  signal?: AbortSignal,
): Promise<ManagedJob> {
  const response = await fetch(`/api/lowongan/${encodeURIComponent(id)}`, {
    cache: "no-store",
    credentials: "same-origin",
    signal,
  });
  if (!response.ok) return throwApiError(response);

  const result: unknown = await response.json();
  if (!isManagedJobDetail(result)) {
    throw new Error("Respons detail lowongan dari server tidak valid.");
  }
  return result;
}
