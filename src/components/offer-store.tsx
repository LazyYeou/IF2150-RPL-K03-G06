"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type OfferStatus = "PENDING" | "WITHDRAWN";

export type JobOffer = {
  id: string;
  jobId: string;
  wage: number;
  availability: string;
  message: string;
  status: OfferStatus;
  submittedAt: string;
};

type OfferStoreValue = {
  offers: JobOffer[];
  submitOffer: (input: Omit<JobOffer, "id" | "status" | "submittedAt">) =>
    | { ok: true; offer: JobOffer }
    | { ok: false; reason: "duplicate" };
  withdrawOffer: (offerId: string) => void;
};

const OfferStoreContext = createContext<OfferStoreValue | null>(null);
const STORAGE_KEY = "kerja-in:offers";
const CHANGE_EVENT = "kerja-in:offers-change";

function isJobOffer(value: unknown): value is JobOffer {
  if (!value || typeof value !== "object") return false;
  const offer = value as Record<string, unknown>;
  return (
    typeof offer.id === "string" &&
    typeof offer.jobId === "string" &&
    typeof offer.wage === "number" &&
    Number.isInteger(offer.wage) &&
    typeof offer.availability === "string" &&
    typeof offer.message === "string" &&
    (offer.status === "PENDING" || offer.status === "WITHDRAWN") &&
    typeof offer.submittedAt === "string"
  );
}

function parseOffers(value: string | null): JobOffer[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every(isJobOffer)) return parsed;
    console.error("Saved offers in browser storage have an invalid format.");
  } catch (error) {
    console.error("Could not read saved offers from browser storage.", error);
  }
  return [];
}

function readSnapshot(): string {
  try {
    return JSON.stringify(parseOffers(window.localStorage.getItem(STORAGE_KEY)));
  } catch (error) {
    console.error("Could not access saved offers in browser storage.", error);
    return "[]";
  }
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

function writeOffers(offers: JobOffer[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function OfferStoreProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, () => "[]");
  const offers = JSON.parse(snapshot) as JobOffer[];

  const submitOffer = useCallback<OfferStoreValue["submitOffer"]>((input) => {
    const currentOffers = parseOffers(window.localStorage.getItem(STORAGE_KEY));
    const duplicate = currentOffers.find(
      (offer) => offer.jobId === input.jobId && offer.status === "PENDING",
    );
    if (duplicate) return { ok: false, reason: "duplicate" };

    const offer: JobOffer = {
      ...input,
      id: crypto.randomUUID(),
      status: "PENDING",
      submittedAt: new Date().toISOString(),
    };
    writeOffers([...currentOffers, offer]);
    return { ok: true, offer };
  }, []);

  const withdrawOffer = useCallback((offerId: string) => {
    const currentOffers = parseOffers(window.localStorage.getItem(STORAGE_KEY));
    const offer = currentOffers.find((item) => item.id === offerId);
    if (!offer || offer.status !== "PENDING") {
      throw new Error("Penawaran aktif tidak ditemukan.");
    }

    writeOffers(
      currentOffers.map((item) =>
        item.id === offerId ? { ...item, status: "WITHDRAWN" } : item,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({ offers, submitOffer, withdrawOffer }),
    [offers, submitOffer, withdrawOffer],
  );

  return <OfferStoreContext.Provider value={value}>{children}</OfferStoreContext.Provider>;
}

export function useOfferStore(): OfferStoreValue {
  const context = useContext(OfferStoreContext);
  if (!context) throw new Error("useOfferStore must be used within OfferStoreProvider.");
  return context;
}
