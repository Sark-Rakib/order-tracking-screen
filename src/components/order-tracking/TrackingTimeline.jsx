"use client";

import { useState } from "react";
import { Camera, ChevronDown, Circle, Clock, MapPin } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Card, SectionHeading } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { STAGES } from "@/data/orders";

const STATE_STYLES = {
  complete: {
    dot: "bg-brand-600 text-white ring-brand-100",
    rail: "bg-brand-300",
    title: "text-ink-900",
    meta: "text-brand-700",
  },
  current: {
    dot: "bg-white text-brand-700 ring-4 ring-brand-100",
    rail: "bg-ink-100",
    title: "text-ink-900",
    meta: "text-brand-700",
  },
  delayed: {
    dot: "bg-amber-100 text-amber-700 ring-amber-200",
    rail: "bg-ink-100",
    title: "text-amber-800",
    meta: "text-amber-700",
  },
  upcoming: {
    dot: "bg-white text-ink-300 ring-1 ring-ink-200",
    rail: "bg-ink-100",
    title: "text-ink-500",
    meta: "text-ink-500",
  },
  pending: {
    dot: "bg-ink-100 text-ink-500 ring-1 ring-ink-200",
    rail: "bg-ink-100",
    title: "text-ink-500",
    meta: "text-ink-500",
  },
};

function StepIcon({ state, step }) {
  if (state === "complete") {
    return <Icon name={STAGES.find((stage) => stage.key === step.key)?.icon ?? "box"} className="size-4" />;
  }
  if (state === "current") return <Icon name={STAGES.find((stage) => stage.key === step.key)?.icon ?? "box"} className="size-4" />;
  if (state === "delayed") return <Clock className="size-4" />;
  return <Circle className="size-3.5" />;
}

export function TrackingTimeline({ order, onViewProof }) {
  const steps = order.timeline;
  const [expanded, setExpanded] = useState(
    () => new Set(steps.filter((step) => step.state === "current" || step.key === "delivered").map((step) => step.key)),
  );

  // Empty state: an order with no scans yet should still say something useful.
  if (steps.length === 0) {
    return (
      <Card className="@container">
        <SectionHeading title="Tracking history" />
        <div className="flex flex-col items-center py-6 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-ink-100 text-ink-500">
            <MapPin className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-3 text-[14px] font-bold text-ink-900">No scans recorded yet</p>
          <p className="mt-1 max-w-[17rem] text-[12.5px] leading-snug text-ink-500">
            The courier has not scanned this parcel. We&apos;ll add the first update here as soon as it arrives.
          </p>
        </div>
      </Card>
    );
  }

  const toggle = (key) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    // `@container` scopes the responsive rules below to the *card*, not the
    // viewport, so the tracker stays legible in a 300px tablet column and in a
    // 640px desktop column without a second set of breakpoint classes.
    <Card className="@container">
      <SectionHeading title="Tracking history" hint="Tap any step for the full scan detail." />
      <ol className="relative">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isOpen = expanded.has(step.key);
          const style = STATE_STYLES[step.state] ?? STATE_STYLES.upcoming;
          const hasDetail = Boolean(step.location || step.note || step.at);

          return (
            <li key={step.key} className="relative">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-10 left-[19px] h-[calc(100%-2.5rem)] w-0.5 -translate-x-1/2 rounded-full @lg:top-11 @lg:left-[21px] @lg:h-[calc(100%-2.75rem)]",
                    style.rail,
                  )}
                />
              )}

              <button
                type="button"
                onClick={() => hasDetail && toggle(step.key)}
                aria-expanded={hasDetail ? isOpen : undefined}
                disabled={!hasDetail}
                className={cn(
                  "group relative flex w-full items-start gap-3 rounded-2xl px-1 py-1.5 text-left transition-colors @md:gap-4 @md:px-1.5 @md:py-2",
                  hasDetail ? "hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-brand-600" : "cursor-default",
                )}
              >
                <span className="relative grid size-10 shrink-0 place-items-center @lg:size-11">
                  {step.state === "current" && (
                    <span className="animate-halo absolute inset-1 rounded-full bg-brand-400/60" />
                  )}
                  <span
                    className={cn(
                      "relative grid size-10 place-items-center rounded-full transition-colors @lg:size-11",
                      style.dot,
                    )}
                  >
                    <StepIcon state={step.state} step={step} />
                  </span>
                </span>

                <span className="min-w-0 flex-1 pb-1">
                  <span className="flex flex-col gap-0.5 @xl:flex-row @xl:items-baseline @xl:justify-between @xl:gap-3">
                    <span
                      className={cn(
                        "text-[14.5px] leading-tight font-bold tracking-[-0.02em] @xl:truncate",
                        style.title,
                      )}
                    >
                      {step.title}
                    </span>
                    {step.at && (
                      <span className="shrink-0 text-[11px] font-medium whitespace-nowrap text-ink-500 tabular-nums">
                        {formatDateTime(step.at)}
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-snug text-ink-500">
                    {step.description}
                  </span>
                </span>

                {hasDetail && (
                  <ChevronDown
                    className={cn(
                      "mt-3 size-4 shrink-0 text-ink-300 transition-transform duration-200",
                      isOpen && "rotate-180 text-ink-500",
                    )}
                    aria-hidden="true"
                  />
                )}
              </button>

              {isOpen && hasDetail && (
                <div className="animate-fade mb-3 ml-[27px] rounded-2xl border border-ink-100 bg-ink-50/70 p-3 @lg:ml-[29px]">
                  <dl className="space-y-2 text-[12.5px]">
                    {step.location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-px size-3.5 shrink-0 text-ink-500" aria-hidden="true" />
                        <div>
                          <dt className="font-semibold text-ink-700">{step.location}</dt>
                          <dd className="text-ink-500">Last scan location</dd>
                        </div>
                      </div>
                    )}
                    {step.note && (
                      <div className="flex items-start gap-2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ink-300" aria-hidden="true" />
                        <p className="text-ink-600">{step.note}</p>
                      </div>
                    )}
                  </dl>

                  {step.key === "delivered" && order.proof && onViewProof && (
                    <button
                      type="button"
                      onClick={onViewProof}
                      className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-xl bg-white px-3 text-[12.5px] font-semibold text-ink-800 ring-1 ring-ink-200 transition-colors hover:bg-ink-100"
                    >
                      <Camera className="size-4 text-ink-500" aria-hidden="true" />
                      View delivery photo
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
