export const ticketStatuses = [
  "DIAJUKAN",
  "DITINJAU",
  "MENUNGGU_BALASAN",
  "DIPROSES",
  "DITUTUP",
  "DITOLAK",
  "DIBATALKAN",
] as const;

export type TicketStatus = (typeof ticketStatuses)[number];
export type TicketDecision = "REFUND" | "PENCAIRAN";

export type TicketEvidence = {
  id: string;
  urlBerkas: string;
  createdAt: string;
};

export type TicketHistoryEntry = {
  aktor: string | null;
  log: string;
  timestamp: string;
};

export type Ticket = {
  id: string;
  nomorTiket: string;
  idTransaksi: string | null;
  kategoriMasalah: string;
  deskripsi: string;
  status: TicketStatus;
  keputusan: TicketDecision | null;
  createdAt: string;
  pelapor: { id: string; nama: string };
  bukti: TicketEvidence[];
  riwayat: TicketHistoryEntry[];
};

export type TicketListResponse = {
  items: Omit<Ticket, "riwayat">[];
  total: number;
  page: number;
  pageSize: number;
};

export class TicketApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "TicketApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTicketStatus(value: unknown): value is TicketStatus {
  return (
    typeof value === "string" &&
    ticketStatuses.includes(value as TicketStatus)
  );
}

function isTicketDecision(value: unknown): value is TicketDecision {
  return value === "REFUND" || value === "PENCAIRAN";
}

function isEvidence(value: unknown): value is TicketEvidence {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.urlBerkas === "string" &&
    value.urlBerkas.startsWith("/api/berkas/sengketa/") &&
    typeof value.createdAt === "string"
  );
}

function isTicketHistoryEntry(value: unknown): value is TicketHistoryEntry {
  return (
    isRecord(value) &&
    (typeof value.aktor === "string" || value.aktor === null) &&
    typeof value.log === "string" &&
    typeof value.timestamp === "string"
  );
}

function isTicketSummary(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.nomorTiket === "string" &&
    /^KIN-/.test(value.nomorTiket) &&
    (typeof value.idTransaksi === "string" || value.idTransaksi === null) &&
    typeof value.kategoriMasalah === "string" &&
    typeof value.deskripsi === "string" &&
    isTicketStatus(value.status) &&
    (isTicketDecision(value.keputusan) || value.keputusan === null) &&
    typeof value.createdAt === "string" &&
    isRecord(value.pelapor) &&
    typeof value.pelapor.id === "string" &&
    typeof value.pelapor.nama === "string" &&
    Array.isArray(value.bukti) &&
    value.bukti.every(isEvidence)
  );
}

function isTicket(value: unknown): value is Ticket {
  return (
    isTicketSummary(value) &&
    isRecord(value) &&
    Array.isArray(value.riwayat) &&
    value.riwayat.every(isTicketHistoryEntry)
  );
}

function isTicketListResponse(value: unknown): value is TicketListResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isTicketSummary) &&
    typeof value.total === "number" &&
    typeof value.page === "number" &&
    typeof value.pageSize === "number"
  );
}

async function throwApiError(response: Response): Promise<never> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new TicketApiError(
      `Permintaan gagal (HTTP ${response.status}).`,
      response.status,
    );
  }

  const error =
    isRecord(payload) && isRecord(payload.error) ? payload.error : undefined;
  throw new TicketApiError(
    typeof error?.message === "string"
      ? error.message
      : `Permintaan gagal (HTTP ${response.status}).`,
    response.status,
    typeof error?.code === "string" ? error.code : undefined,
  );
}

async function requestTicket(
  url: string,
  init?: RequestInit,
): Promise<Ticket> {
  const response = await fetch(url, {
    cache: "no-store",
    credentials: "same-origin",
    ...init,
  });
  if (!response.ok) return throwApiError(response);

  const result: unknown = await response.json();
  if (!isTicket(result)) {
    throw new Error("Respons tiket dari server tidak valid.");
  }
  return result;
}

export async function createTicket(formData: FormData): Promise<Ticket> {
  return requestTicket("/api/tiket", {
    method: "POST",
    body: formData,
  });
}

export async function getTicket(
  id: string,
  signal?: AbortSignal,
): Promise<Ticket> {
  return requestTicket(`/api/tiket/${encodeURIComponent(id)}`, { signal });
}

export async function getCsTicket(
  id: string,
  signal?: AbortSignal,
): Promise<Ticket> {
  return requestTicket(`/api/cs/tiket/${encodeURIComponent(id)}`, { signal });
}

export async function getCsTickets(
  status: TicketStatus | "",
  page: number,
  signal?: AbortSignal,
): Promise<TicketListResponse> {
  const query = new URLSearchParams({ page: String(page) });
  if (status) query.set("status", status);
  const response = await fetch(`/api/cs/tiket?${query}`, {
    cache: "no-store",
    credentials: "same-origin",
    signal,
  });
  if (!response.ok) return throwApiError(response);

  const result: unknown = await response.json();
  if (!isTicketListResponse(result)) {
    throw new Error("Respons daftar tiket dari server tidak valid.");
  }
  return result;
}

export async function uploadTicketEvidence(
  id: string,
  file: File,
): Promise<Ticket> {
  const formData = new FormData();
  formData.set("berkas", file);
  return requestTicket(`/api/tiket/${encodeURIComponent(id)}/bukti`, {
    method: "POST",
    body: formData,
  });
}

export async function cancelTicket(id: string): Promise<Ticket> {
  return requestTicket(`/api/tiket/${encodeURIComponent(id)}/batal`, {
    method: "POST",
  });
}

export async function decideTicket(
  id: string,
  keputusan: TicketDecision,
  catatan: string,
): Promise<Ticket> {
  return requestTicket(`/api/cs/tiket/${encodeURIComponent(id)}/putuskan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keputusan, catatan }),
  });
}

export async function requestTicketEvidence(
  id: string,
  pesan: string,
): Promise<Ticket> {
  return requestTicket(`/api/cs/tiket/${encodeURIComponent(id)}/minta-bukti`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pesan }),
  });
}

export async function rejectTicket(
  id: string,
  alasan: string,
): Promise<Ticket> {
  return requestTicket(`/api/cs/tiket/${encodeURIComponent(id)}/tolak`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alasan }),
  });
}
