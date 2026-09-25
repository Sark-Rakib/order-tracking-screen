"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

const ToastContext = createContext(null);

const TONES = {
  success: {
    icon: CircleCheck,
    ring: "ring-brand-500/30",
    iconClass: "text-brand-300",
    bar: "bg-brand-400",
  },
  error: {
    icon: CircleAlert,
    ring: "ring-rose-500/30",
    iconClass: "text-rose-300",
    bar: "bg-rose-400",
  },
  warning: {
    icon: CircleAlert,
    ring: "ring-amber-500/30",
    iconClass: "text-amber-300",
    bar: "bg-amber-400",
  },
  info: {
    icon: Info,
    ring: "ring-white/10",
    iconClass: "text-ink-300",
    bar: "bg-ink-400",
  },
};

const DURATION = 4200;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    ({ title, description, tone = "info" }) => {
      const id = nextId.current++;
      setToasts((current) => [
        ...current.slice(-2),
        { id, title, description, tone },
      ]);
      timersRef.current.set(
        id,
        setTimeout(() => dismiss(id), DURATION),
      );
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      // Mobile: above the pinned scenario bar. sm+: top-centred under the sticky
      // header, so a toast can never cover the toolbar or the last CTA on a
      // long page.
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+8.25rem)] z-[60] flex flex-col items-center gap-2 px-4",
        "sm:inset-x-0 sm:top-[calc(env(safe-area-inset-top)+5.25rem)] sm:bottom-auto sm:px-6 lg:sm:px-8 xl:sm:px-10",
      )}
    >
      {toasts.map((toast) => {
        const tone = TONES[toast.tone] ?? TONES.info;
        const ToneIcon = tone.icon;
        return (
          <div
            key={toast.id}
            className={cn(
              "animate-rise pointer-events-auto relative flex w-full max-w-[398px] items-start gap-3 overflow-hidden sm:w-[380px]",
              "rounded-2xl bg-ink-900 py-3 pr-3 pl-3.5 text-white shadow-lg shadow-ink-900/25 ring-1",
              tone.ring,
            )}
          >
            <ToneIcon
              className={cn("mt-px size-5 shrink-0", tone.iconClass)}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] leading-snug font-semibold tracking-[-0.01em]">
                {toast.title}
              </p>
              {toast.description && (
                <p className="mt-0.5 text-[12.5px] leading-snug text-ink-300">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="-m-1 grid size-9 shrink-0 place-items-center rounded-full text-ink-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
            <span
              aria-hidden="true"
              className={cn(
                "animate-countdown absolute inset-x-0 bottom-0 h-[3px] origin-left",
                tone.bar,
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
