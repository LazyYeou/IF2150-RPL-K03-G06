"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type SavedJobsContextValue = {
  savedIds: string[];
  toggleSaved: (jobId: string) => void;
};

const SavedJobsContext = createContext<SavedJobsContextValue | null>(null);
const STORAGE_KEY = "kerja-in:saved-jobs";
const CHANGE_EVENT = "kerja-in:saved-jobs-change";

function readSnapshot(): string {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return "[]";

    const parsed: unknown = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.every((id) => typeof id === "string")) {
      return JSON.stringify([...new Set(parsed)]);
    }
    console.error("Saved jobs in browser storage have an invalid format.");
  } catch (error) {
    console.error("Could not read saved jobs from browser storage.", error);
  }
  return "[]";
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

export function SavedJobsProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, () => "[]");
  const savedIds = JSON.parse(snapshot) as string[];

  const toggleSaved = useCallback((jobId: string) => {
    const next = savedIds.includes(jobId)
      ? savedIds.filter((id) => id !== jobId)
      : [...savedIds, jobId];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, [savedIds]);

  const value = useMemo(() => ({ savedIds, toggleSaved }), [savedIds, toggleSaved]);

  return <SavedJobsContext.Provider value={value}>{children}</SavedJobsContext.Provider>;
}

export function useSavedJobs(): SavedJobsContextValue {
  const context = useContext(SavedJobsContext);
  if (!context) {
    throw new Error("useSavedJobs must be used within SavedJobsProvider.");
  }
  return context;
}
