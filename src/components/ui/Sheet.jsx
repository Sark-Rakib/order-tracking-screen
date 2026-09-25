"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/** Multiple sheets can stack (rare), so lock the body with a counter. */
let openSheets = 0;

function lockScroll(locked) {
  openSheets = Math.max(0, openSheets + (locked ? 1 : -1));
  document.body.dataset.sheetOpen = openSheets > 0 ? "true" : "false";
}

/**
 * Mobile-first bottom sheet.
 * Handles: enter/exit transitions, backdrop dismissal, Esc, scroll lock and
 * focus restore — the things that make a modal feel native.
 */
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className,
}) {
  const panelRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const pendingRef = useRef([]);
  const [rendered, setRendered] = useState(open);
  // Always start closed so a freshly mounted sheet still slides in.
  const [state, setState] = useState("closed");

  useEffect(() => {
    // State changes are deferred to a frame/timeout so the browser paints the
    // starting position first — that is what makes the transition visible.
    const raf = requestAnimationFrame(() => {
      if (open) {
        setRendered(true);
        pendingRef.current.push(
          requestAnimationFrame(() => {
            setState("open");
          }),
        );
      } else {
        setState("closed");
        pendingRef.current.push(
          setTimeout(() => {
            setRendered(false);
          }, 280),
        );
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      pendingRef.current.forEach((id) => {
        clearTimeout(id);
        cancelAnimationFrame(id);
      });
      pendingRef.current = [];
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    restoreFocusRef.current = document.activeElement;
    lockScroll(true);
    panelRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      lockScroll(false);
      document.removeEventListener("keydown", onKeyDown);
      if (restoreFocusRef.current instanceof HTMLElement) {
        restoreFocusRef.current.focus({ preventScroll: true });
      }
    };
  }, [open, onClose]);

  if (!rendered) return null;

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <div
        data-state={state}
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-ink-950/45 backdrop-blur-[2px] transition-opacity duration-300 sm:bg-ink-950/55 sm:backdrop-blur-sm",
          state === "open" ? "opacity-100" : "opacity-0",
        )}
      />
      {/* Positioning wrapper: bottom-anchored on a phone, centred from sm up. */}
      <div className="absolute inset-0 z-10 flex items-end justify-center sm:items-center sm:p-6">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          data-state={state}
          className={cn(
            "relative flex max-h-[90svh] w-full max-w-[520px] flex-col rounded-t-[1.75rem] bg-white outline-none",
            "shadow-[0_-12px_40px_-12px_rgba(15,23,42,0.35)]",
            "sm:max-h-[86svh] sm:rounded-3xl sm:shadow-[0_32px_80px_-24px_rgba(15,23,42,0.45)]",
            "transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            state === "open"
              ? "translate-y-0 opacity-100 sm:translate-y-0 sm:scale-100"
              : "translate-y-full opacity-100 sm:translate-y-0 sm:scale-95 sm:opacity-0",
            className,
          )}
        >
          <div className="relative flex items-start gap-3 px-5 pt-3 pb-4 sm:px-6 sm:pt-5 sm:pb-4">
            {/* drag handle is a bottom-sheet affordance only */}
            <div className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-ink-200 sm:hidden" />
            <div className="min-w-0 flex-1 pt-3 sm:pt-0">
              <h2 className="truncate text-[17px] font-bold tracking-[-0.02em] text-ink-900 sm:text-[18px]">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 text-[13px] leading-snug text-ink-500">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mt-1 -mr-1 grid size-9 shrink-0 place-items-center rounded-full text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-600"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-5 pb-2 sm:px-6">
            {children}
          </div>

          {footer && (
            <div className="border-t border-ink-100 bg-white/95 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur sm:px-6 sm:pb-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
