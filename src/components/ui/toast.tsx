"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, X } from "lucide-react";
const Context = createContext<(message: string) => void>(() => {});
export const useToast = () => useContext(Context);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const show = useCallback((text: string) => {
    clearTimeout(timer.current);
    setMessage(text);
    timer.current = setTimeout(() => setMessage(""), 6000);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <Context.Provider value={show}>
      {children}
      <div
        className="fixed right-4 bottom-4 left-4 z-[70] sm:left-auto sm:w-96"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {message && (
          <div className="flex items-center gap-3 rounded-xl border bg-background p-3 shadow-lg">
            <CheckCircle2
              className="size-5 shrink-0 text-teal-700"
              aria-hidden="true"
            />
            <span className="flex-1 text-sm">{message}</span>
            <button
              className="flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-muted"
              aria-label="Tutup pemberitahuan"
              onClick={() => setMessage("")}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </Context.Provider>
  );
}
