"use client";

import { CalendarClock, Camera, RefreshCw, TriangleAlert } from "lucide-react";
import { STAGES, STAGE_INDEX, getProgress } from "@/data/orders";
import { formatDayLabel, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { useNow } from "@/components/ui/NowProvider";

/**
 * One visual language, four moods. Every tone declares the same tokens so the
 * hero can switch scenario without the markup changing shape.
 */
const TONES = {
  brand: {
    card: "bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700",
    text: "text-white",
    muted: "text-brand-50",
    pill: "bg-white/15 text-white ring-1 ring-white/25",
    railDone: "bg-white",
    railTodo: "bg-white/25",
    railHatch: "",
    dotDone: "bg-white text-brand-700 ring-white/15",
    dotCurrent: "bg-white text-brand-700 ring-white/40",
    dotTodo: "bg-white/20 text-white/85 ring-white/10",
    labelDone: "text-white",
    labelTodo: "text-brand-100",
  },
  amber: {
    card: "bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400",
    text: "text-ink-900",
    muted: "text-ink-700",
    pill: "bg-ink-900/10 text-ink-900 ring-1 ring-ink-900/10",
    railDone: "bg-ink-900",
    railTodo: "bg-ink-900/15",
    railHatch: "hatch-amber opacity-70",
    dotDone: "bg-ink-900 text-amber-200 ring-ink-900/10",
    dotCurrent: "bg-ink-900 text-amber-200 ring-ink-900/30",
    dotTodo: "bg-ink-900/10 text-ink-700 ring-transparent",
    labelDone: "text-ink-900",
    labelTodo: "text-ink-700",
  },
  slate: {
    card: "bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950",
    text: "text-white",
    muted: "text-ink-300",
    pill: "bg-white/10 text-white ring-1 ring-white/15",
    railDone: "bg-white",
    railTodo: "bg-white/20",
    railHatch: "",
    dotDone: "bg-white text-ink-900 ring-white/10",
    dotCurrent: "bg-white text-ink-900 ring-white/40",
    dotTodo: "bg-white/10 text-white/85 ring-white/5",
    labelDone: "text-white",
    labelTodo: "text-ink-300",
  },
};

const CONFIDENCE_COPY = {
  high: "Live ETA",
  medium: "Revised ETA",
  low: "Estimated",
};

export function StatusHero({ order, sync, onRefresh }) {
  const now = useNow();
  const toneKey = order.flags.delivered ? "slate" : order.flags.delayed ? "amber" : "brand";
  const tone = TONES[toneKey];
  const currentIndex = STAGE_INDEX[order.stage] ?? 0;
  const progress = getProgress(order);
  const stage = STAGES[currentIndex];
  const isSyncing = sync.status === "loading";

  return (
    <section
      aria-label="Current status"
      className={cn(
        "relative overflow-hidden rounded-3xl p-5 shadow-lg shadow-ink-900/10 sm:p-6 xl:p-7",
        tone.card,
        tone.text,
      )}
    >
      {/* Soft light bloom keeps the gradient from looking flat. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-white/15 blur-2xl sm:-right-14 sm:size-64"
      />

      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold",
            tone.pill,
          )}
        >
          <span className="relative flex size-2">
            <span className="animate-halo absolute inset-0 rounded-full bg-current" />
            <span className="relative size-2 rounded-full bg-current" />
          </span>
          {stage.label}
        </span>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isSyncing}
          aria-label="Refresh tracking"
          className={cn(
            "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[11.5px] font-medium transition-opacity",
            tone.pill,
            isSyncing && "opacity-70",
          )}
        >
          <RefreshCw className={cn("size-3.5", isSyncing && "animate-spin")} aria-hidden="true" />
          {isSyncing ? "Updating" : `Updated ${formatRelativeTime(sync.at, now)}`}
        </button>
      </div>

      <h2 className="relative mt-4 text-[clamp(1.65rem,1.3rem+1.6vw,2.35rem)] leading-[1.08] font-extrabold tracking-[-0.035em] text-balance">
        {order.eta.headline}
      </h2>

      <div className="relative mt-3 flex items-start gap-2.5">
        <CalendarClock className={cn("mt-0.5 size-[18px] shrink-0", tone.muted)} aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[17px] leading-tight font-bold tracking-[-0.02em] tabular-nums sm:text-[19px]">
            {order.eta.window}
          </p>
          <p className={cn("mt-1 text-[12.5px] font-medium", tone.muted)}>
            {formatDayLabel(order.eta.dateISO)}
            <span className="px-1.5 opacity-50">·</span>
            {CONFIDENCE_COPY[order.eta.confidence] ?? "Estimated"}
            {order.eta.revised && order.eta.previousWindow && (
              <>
                <span className="px-1.5 opacity-50">·</span>
                <span className="line-through decoration-1 opacity-70">{order.eta.previousWindow}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {order.flags.proofOfDelivery && (
        <div
          className={cn(
            "relative mt-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] font-semibold",
            "bg-white/10 text-white ring-1 ring-white/15",
          )}
        >
          <Camera className="size-4" aria-hidden="true" />
          Proof of delivery attached
        </div>
      )}

      <div className="relative mt-5">
        <div className="flex items-baseline justify-between text-[11.5px] font-semibold">
          <span className={tone.muted}>
            Step {currentIndex + 1} of {STAGES.length}
          </span>
          <span className={cn("tabular-nums", tone.muted)}>{Math.round(progress * 100)}%</span>
        </div>

        <div className="mt-2 flex gap-1.5 sm:gap-2" aria-hidden="true">
          {STAGES.map((item, index) => (
            <span
              key={item.key}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors sm:h-2",
                index <= currentIndex ? tone.railDone : tone.railTodo,
                index > currentIndex && tone.railHatch,
              )}
            />
          ))}
        </div>

        <ol className="mt-4 flex gap-1.5 sm:mt-5 sm:gap-2">
          {STAGES.map((item, index) => {
            const isDone = index < currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <li key={item.key} className="flex min-w-0 flex-1 flex-col items-center gap-1.5 sm:gap-2">
                <span
                  className={cn(
                    "grid size-7 place-items-center rounded-full ring-4 transition-colors sm:size-8",
                    isDone && tone.dotDone,
                    isCurrent && tone.dotCurrent,
                    !isDone && !isCurrent && tone.dotTodo,
                    isCurrent && "shadow-sm",
                  )}
                >
                  <Icon name={item.icon} className="size-3.5 sm:size-4" />
                </span>
                <span
                  className={cn(
                    "text-center text-[9.5px] leading-[1.1] font-bold tracking-[0.02em] uppercase sm:text-[10px]",
                    isDone || isCurrent ? tone.labelDone : tone.labelTodo,
                  )}
                >
                  {item.short}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {order.flags.delayed && (
        <p className={cn("relative mt-4 flex items-start gap-2 text-[12px] leading-snug font-medium", tone.muted)}>
          <TriangleAlert className="mt-px size-4 shrink-0" aria-hidden="true" />
          Delivery window has been rescheduled by the courier.
        </p>
      )}
    </section>
  );
}
