export type ApplicantStatus =
  | "MENUNGGU"
  | "DITERIMA"
  | "DITOLAK"
  | "DITARIK"
  | "DITOLAK_OTOMATIS";

export type Applicant = {
  idPenawaran: string;
  tenagaKerja: {
    id: string;
    nama: string;
    akumulasiRating: number;
    jumlahUlasan: number;
  };
  hargaPenawaran: number;
  ketersediaan: string;
  pesan: string | null;
  status: ApplicantStatus;
  createdAt: string;
};

export type ApplicantsResponse = {
  lowongan: {
    id: string;
    judul: string;
    kategori: string;
    lokasi: string;
    tanggalPekerjaan: string;
    upah: number;
    satuanUpah: "PER_TUGAS" | "PER_HARI";
    kuota: number;
    jumlahDiterima: number;
    status: "OPEN" | "CLOSED_FULL" | "DIBATALKAN";
    createdAt: string;
  };
  sisaKuota: number;
  items: Applicant[];
};

export type ApplicantSelectionResponse = {
  idTransaksi: string;
  statusLowongan: "OPEN" | "CLOSED_FULL";
  sisaKuota: number;
};

export class ApplicantsApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApplicantsApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApplicantStatus(value: unknown): value is ApplicantStatus {
  return (
    value === "MENUNGGU" ||
    value === "DITERIMA" ||
    value === "DITOLAK" ||
    value === "DITARIK" ||
    value === "DITOLAK_OTOMATIS"
  );
}

function isApplicant(value: unknown): value is Applicant {
  if (!isRecord(value) || !isRecord(value.tenagaKerja)) return false;
  const worker = value.tenagaKerja;
  return (
    typeof value.idPenawaran === "string" &&
    typeof worker.id === "string" &&
    typeof worker.nama === "string" &&
    typeof worker.akumulasiRating === "number" &&
    typeof worker.jumlahUlasan === "number" &&
    typeof value.hargaPenawaran === "number" &&
    typeof value.ketersediaan === "string" &&
    (typeof value.pesan === "string" || value.pesan === null) &&
    isApplicantStatus(value.status) &&
    typeof value.createdAt === "string"
  );
}

function isApplicantsResponse(value: unknown): value is ApplicantsResponse {
  if (
    !isRecord(value) ||
    !isRecord(value.lowongan) ||
    !Array.isArray(value.items)
  ) {
    return false;
  }
  const job = value.lowongan;
  return (
    typeof job.id === "string" &&
    typeof job.judul === "string" &&
    typeof job.kategori === "string" &&
    typeof job.lokasi === "string" &&
    typeof job.tanggalPekerjaan === "string" &&
    typeof job.upah === "number" &&
    (job.satuanUpah === "PER_TUGAS" || job.satuanUpah === "PER_HARI") &&
    typeof job.kuota === "number" &&
    typeof job.jumlahDiterima === "number" &&
    (job.status === "OPEN" ||
      job.status === "CLOSED_FULL" ||
      job.status === "DIBATALKAN") &&
    typeof job.createdAt === "string" &&
    typeof value.sisaKuota === "number" &&
    value.items.every(isApplicant)
  );
}

async function throwApiError(response: Response): Promise<never> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApplicantsApiError(
      `Permintaan gagal (HTTP ${response.status}).`,
      response.status,
    );
  }

  const error =
    isRecord(payload) && isRecord(payload.error) ? payload.error : undefined;
  throw new ApplicantsApiError(
    typeof error?.message === "string"
      ? error.message
      : `Permintaan gagal (HTTP ${response.status}).`,
    response.status,
    typeof error?.code === "string" ? error.code : undefined,
  );
}

export async function getApplicants(
  jobId: string,
  signal?: AbortSignal,
): Promise<ApplicantsResponse> {
  const response = await fetch(
    `/api/lowongan/${encodeURIComponent(jobId)}/pelamar`,
    {
      cache: "no-store",
      credentials: "same-origin",
      signal,
    },
  );
  if (!response.ok) return throwApiError(response);

  const result: unknown = await response.json();
  if (!isApplicantsResponse(result)) {
    throw new Error("Respons daftar pelamar dari server tidak valid.");
  }
  return result;
}

export async function selectApplicant(
  offerId: string,
): Promise<ApplicantSelectionResponse> {
  const response = await fetch(
    `/api/penawaran/${encodeURIComponent(offerId)}/terima`,
    {
      method: "POST",
      credentials: "same-origin",
    },
  );
  if (!response.ok) return throwApiError(response);

  const result: unknown = await response.json();
  if (
    !isRecord(result) ||
    typeof result.idTransaksi !== "string" ||
    (result.statusLowongan !== "OPEN" &&
      result.statusLowongan !== "CLOSED_FULL") ||
    typeof result.sisaKuota !== "number"
  ) {
    throw new Error("Respons pemilihan pelamar dari server tidak valid.");
  }
  return {
    idTransaksi: result.idTransaksi,
    statusLowongan: result.statusLowongan,
    sisaKuota: result.sisaKuota,
  };
}
