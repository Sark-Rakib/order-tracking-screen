"use client";

import { useState } from "react";
import { Bell, Check, ChevronDown, Circle, Hourglass, Sparkles } from "lucide-react";
import { formatTimeUntil } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Card, SectionHeading } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Switch } from "@/components/ui/Switch";
import { useNow } from "@/components/ui/NowProvider";

/**
 * Situation 3 — the order exists, but the courier has not published tracking.
 * Rule of thumb: never render an empty state where the customer is owed an
 * explanation. Shimmer marks what we genuinely don't know yet; the copy below
 * keeps them calm and in control.
 */
export function PendingStatusCard({ order }) {
  const now = useNow();
  const pending = order.pending;
  if (!pending) return null;

  return (
    <section
      aria-label="Status"
      className="animate-rise relative overflow-hidden rounded-3xl border border-ink-200/70 bg-white p-5 shadow-xs sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-ink-100 px-3 py-1.5 text-[12px] font-semibold text-ink-700">
          <Hourglass className="size-3.5" aria-hidden="true" />
          Processing
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1.5 text-[11.5px] font-semibold text-amber-700 ring-1 ring-amber-200">
          <span className="size-1.5 rounded-full bg-amber-500" />
          Tracking not live
        </span>
      </div>

      <h2 className="mt-4 text-[clamp(1.5rem,1.2rem+1.2vw,2.05rem)] leading-[1.1] font-extrabold tracking-[-0.035em] text-ink-900 text-balance">
        {order.eta.headline}
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-500">{pending.body}</p>

      {/* Skeleton block: the delivery window is genuinely unknown right now. */}
      <div className="mt-4 rounded-2xl bg-ink-50 p-4 ring-1 ring-ink-100">
        <p className="text-[10.5px] font-bold tracking-[0.06em] text-ink-500 uppercase">Estimated delivery</p>
        <div className="mt-2.5 space-y-2.5" aria-hidden="true">
          <Skeleton className="h-4 w-3/4" rounded="rounded-lg" />
          <Skeleton className="h-3 w-1/2" rounded="rounded-lg" />
        </div>
        <p className="sr-only">Estimated delivery window is not available yet.</p>

        <div className="mt-4 flex items-center gap-2 border-t border-ink-200/70 pt-3">
          <Sparkles className="size-3.5 shrink-0 text-brand-600" aria-hidden="true" />
          <p className="text-[12px] leading-snug font-medium text-ink-600">
            Live tracking is expected in{" "}
            <span className="font-bold text-ink-900">{formatTimeUntil(pending.availableByISO, now)}</span>
          </p>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ink-200" aria-hidden="true">
          <span className="block h-full w-1/3 rounded-full bg-gradient-to-r from-brand-500 to-brand-400" />
        </div>
      </div>
    </section>
  );
}

export function TrackingPendingPanel({ order, onNotifyChange }) {
  const [notify, setNotify] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const pending = order.pending;

  const handleToggle = (next) => {
    setNotify(next);
    onNotifyChange?.(next);
  };

  return (
    <Card className="@container">
      <SectionHeading
        title="What happens next"
        hint="We'll keep this page updated as your parcel moves."
      />

      <ol className="space-y-0">
        {pending.checkpoints.map((checkpoint, index) => {
          const isLast = index === pending.checkpoints.length - 1;
          const isDone = checkpoint.state === "done";
          const isCurrent = checkpoint.state === "current";
          return (
            <li key={checkpoint.label} className="relative flex items-center gap-3 pb-4 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-7 left-[11px] h-[calc(100%-1.75rem)] w-0.5 -translate-x-1/2 rounded-full",
                    isDone ? "bg-brand-300" : "bg-ink-200",
                  )}
                />
              )}
              <span
                className={cn(
                  "relative grid size-6 shrink-0 place-items-center rounded-full",
                  isDone && "bg-brand-600 text-white",
                  isCurrent && "bg-white text-brand-600 ring-2 ring-brand-400",
                  !isDone && !isCurrent && "bg-ink-100 text-ink-300 ring-1 ring-ink-200",
                )}
              >
                {isDone ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : isCurrent ? (
                  <span className="size-2 rounded-full bg-brand-500" />
                ) : (
                  <Circle className="size-2.5" aria-hidden="true" />
                )}
              </span>
              <span
                className={cn(
                  "text-[13.5px] leading-tight font-semibold",
                  isDone || isCurrent ? "text-ink-900" : "text-ink-500",
                )}
              >
                {checkpoint.label}
                {isCurrent && (
                  <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10.5px] font-bold text-brand-700">
                    In progress
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 space-y-2">
        <Switch
          checked={notify}
          onChange={handleToggle}
          icon={Bell}
          label="Notify me when it ships"
          description={
            notify ? "Push + email alerts are on" : "Get a push notification the moment tracking goes live"
          }
        />

        <button
          type="button"
          onClick={() => setShowWhy((value) => !value)}
          aria-expanded={showWhy}
          className="flex w-full items-center justify-between gap-2 rounded-2xl bg-ink-50 px-3 py-2.5 text-left text-[12.5px] font-semibold text-ink-700 ring-1 ring-ink-100 transition-colors hover:bg-ink-100"
        >
          Why is there no tracking number yet?
          <ChevronDown
            className={cn("size-4 shrink-0 text-ink-500 transition-transform", showWhy && "rotate-180")}
            aria-hidden="true"
          />
        </button>
        {showWhy && (
          <p className="animate-fade rounded-2xl bg-ink-50 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-600 ring-1 ring-ink-100">
            A tracking number is created by the courier at the first hub scan, not at checkout. Orders placed within the
            last 24 hours are still in picking or packing — around 1 in 5 parcels needs a second attempt before a scan is
            recorded.
          </p>
        )}
      </div>
    </Card>
  );
}
