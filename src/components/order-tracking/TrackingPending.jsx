"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  Circle,
  Clock,
  Copy,
  Headphones,
  Hourglass,
  PackageCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { STAGES } from "@/data/orders";
import { formatCurrency, formatDayLabel, formatTime, formatTimeUntil, pluralize } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Card, SectionHeading } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Switch } from "@/components/ui/Switch";
import { useNow } from "@/components/ui/NowProvider";

/**
 * Situation 3 — the order exists, but the courier has not published tracking.
 *
 * The governing rule: a placeholder is not a loader. An order with no tracking
 * yet is a *known* state, so this file never renders an unbounded spinner or a
 * bare shimmer with no explanation — every skeleton block below sits inside a
 * frame that names what is missing, says how long it will be missing, and
 * carries the order facts plus a way to reach a human. `order.pending` may be
 * absent on a malformed payload, so the components fall back to `PLACEHOLDER`
 * rather than returning `null` and blanking the column.
 */

const PLACEHOLDER = {
  headline: "Your order has been placed!",
  body: "Tracking details will be updated within 24 hours. We’ll let you know as soon as your parcel is on the move.",
  availableByISO: null,
  checkpoints: [],
};

const itemCountOf = (order) => order.items.reduce((sum, item) => sum + item.qty, 0);

export function PendingStatusCard({ order, onContactSupport, onCopyId }) {
  const now = useNow();
  const pending = order.pending ?? PLACEHOLDER;

  return (
    <section
      aria-label="Order status"
      className="animate-rise relative overflow-hidden rounded-3xl border border-brand-200/60 bg-white p-5 shadow-xs sm:p-6"
    >
      {/* Brand wash instead of a gradient hero: this is a calm, in-progress
          state, not a live shipment. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand-50 to-transparent"
      />

      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-3 py-1.5 text-[12px] font-semibold text-white">
          <PackageCheck className="size-3.5" aria-hidden="true" />
          Order placed
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1.5 text-[11.5px] font-semibold text-amber-700 ring-1 ring-amber-200">
          <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
          Tracking not live yet
        </span>
      </div>

      <h2 className="relative mt-4 text-[clamp(1.45rem,1.15rem+1.2vw,2rem)] leading-[1.12] font-extrabold tracking-[-0.035em] text-ink-900 text-balance">
        {pending.headline}
      </h2>
      <p className="relative mt-2 text-[13px] leading-relaxed text-ink-500">{pending.body}</p>

      {/* The delivery window is genuinely unknown, so the bars stay — but they
          are framed as a placeholder with a caption, which is what stops the
          shimmer from reading as "still loading". */}
      <div className="relative mt-4 rounded-2xl bg-ink-50 p-4 ring-1 ring-ink-100">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10.5px] font-bold tracking-[0.06em] text-ink-500 uppercase">Estimated delivery</p>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[10.5px] font-semibold text-ink-500 ring-1 ring-ink-200">
            <Hourglass className="size-3" aria-hidden="true" />
            Not set yet
          </span>
        </div>

        <div className="mt-3 rounded-xl border border-dashed border-ink-200 bg-white/70 p-3.5">
          <div className="space-y-2.5" aria-hidden="true">
            <Skeleton className="h-4 w-3/4" rounded="rounded-lg" />
            <Skeleton className="h-3 w-1/2" rounded="rounded-lg" />
          </div>
          <p className="mt-3 text-[12px] leading-snug font-medium text-ink-500">
            The courier sets this once your parcel is scanned. Until then there is no window to show.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-ink-200/70 pt-3">
          <Sparkles className="size-3.5 shrink-0 text-brand-600" aria-hidden="true" />
          <p className="text-[12px] leading-snug font-medium text-ink-600">
            {pending.availableByISO ? (
              <>
                Live tracking is expected{" "}
                <span className="font-bold text-ink-900">in {formatTimeUntil(pending.availableByISO, now)}</span>
              </>
            ) : (
              <>
                Live tracking is expected <span className="font-bold text-ink-900">within 24 hours</span>
              </>
            )}
          </p>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ink-200" aria-hidden="true">
          <span className="block h-full w-1/3 rounded-full bg-gradient-to-r from-brand-500 to-brand-400" />
        </div>
      </div>

      <OrderFacts order={order} now={now} onCopyId={onCopyId} />
    </section>
  );
}

/**
 * Order ID, placed date, items and total, in the status column.
 *
 * Normally this information lives in the header and the order summary, both of
 * which sit in the other column. When tracking is unavailable the user is
 * waiting on a single question — "did my order go through?" — so the answer has
 * to be on the card they are already looking at.
 */
function OrderFacts({ order, now, onCopyId }) {
  const { currency } = order.payment;
  const itemCount = itemCountOf(order);

  return (
    <div className="relative mt-4 rounded-2xl border border-ink-200/70 bg-white p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10.5px] font-bold tracking-[0.06em] text-ink-500 uppercase">Your order</p>
        {onCopyId && (
          <button
            type="button"
            onClick={onCopyId}
            className="-mr-1.5 inline-flex min-h-8 items-center gap-1.5 rounded-lg px-1.5 text-[11.5px] font-semibold text-ink-600 transition-colors hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <Copy className="size-3.5" aria-hidden="true" />
            Copy id
          </button>
        )}
      </div>

      <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2.5 @sm:grid-cols-4">
        <div className="min-w-0">
          <dt className="text-[10.5px] font-semibold text-ink-500">Order id</dt>
          <dd className="mt-0.5 truncate font-mono text-[12.5px] font-medium text-ink-900">{order.id}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10.5px] font-semibold text-ink-500">Placed</dt>
          <dd className="mt-0.5 truncate text-[12.5px] font-medium text-ink-900">
            {formatDayLabel(order.placedAt, now)}, {formatTime(order.placedAt)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10.5px] font-semibold text-ink-500">Items</dt>
          <dd className="mt-0.5 truncate text-[12.5px] font-medium text-ink-900">{pluralize(itemCount, "item")}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10.5px] font-semibold text-ink-500">Total paid</dt>
          <dd className="mt-0.5 truncate text-[12.5px] font-medium text-ink-900">
            {formatCurrency(order.payment.total, { currency })}
          </dd>
        </div>
      </dl>

      <ul className="mt-3 space-y-1.5 border-t border-ink-100 pt-3">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-2.5">
            <span
              className={cn("size-6 shrink-0 rounded-lg bg-gradient-to-br", item.swatch)}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink-700">{item.name}</span>
            <span className="shrink-0 text-[12.5px] font-semibold text-ink-900 tabular-nums">
              {formatCurrency(item.price * item.qty, { currency })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The tracking slot for a parcel the courier has not scanned yet.
 *
 * This replaces a bare full-card shimmer skeleton. The shape is the same — the
 * real timeline's five stages, greyed out — because the point is to show the
 * user exactly what is coming. The differences are all about intent: it has a
 * name, a caption, and a "check again" that always resolves instead of leaving
 * the reader staring at an animation that never ends.
 *
 * Note the deliberate absence of `aria-busy`: nothing is being fetched, the data
 * simply does not exist yet, and announcing a busy region here is what makes
 * assistive tech imply a wait that never completes.
 */
export function TrackingPlaceholderCard({ order, onContactSupport, onChecked }) {
  const [checkState, setCheckState] = useState("idle"); // idle → checking → resolved
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCheck = () => {
    if (checkState === "checking") return;
    setCheckState("checking");
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCheckState("resolved");
      onChecked?.();
    }, 1400);
  };

  const courierName = order.courier?.partner ?? "the courier";

  return (
    <Card className="@container">
      <SectionHeading
        icon={Clock}
        title="Tracking history"
        hint={`Scans appear here as soon as ${courierName} checks your parcel in.`}
      />

      {/* `aria-hidden` on the frame: the caption below carries the same
          information in words, so the bars are decoration, not content. */}
      <div aria-hidden="true" className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/70 p-4">
        <ol className="space-y-4 @lg:space-y-5">
          {STAGES.map((stage, index) => (
            <li key={stage.key} className="relative flex items-start gap-3">
              {index < STAGES.length - 1 && (
                <span className="absolute top-9 left-[19px] h-[calc(100%+1rem)] w-0.5 -translate-x-1/2 rounded-full bg-ink-100 @lg:top-10" />
              )}
              <Skeleton className="size-10 shrink-0 @lg:size-11" rounded="rounded-full" />
              <div className="min-w-0 flex-1 space-y-2 pt-1.5">
                <Skeleton className="h-3.5 w-32" rounded="rounded-lg" />
                <Skeleton className="h-3 w-4/5" rounded="rounded-lg" />
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div
        role="status"
        className="mt-4 flex items-start gap-2.5 rounded-2xl bg-brand-50 p-3.5 ring-1 ring-brand-100"
      >
        <Hourglass className="mt-px size-4 shrink-0 text-brand-700" aria-hidden="true" />
        <p className="text-[12.5px] leading-snug text-ink-700">
          {checkState === "resolved"
            ? "Still nothing new — your parcel is being picked. This page updates itself, so there is no need to reload."
            : "Nothing to show yet. This panel fills itself in the moment the first scan lands."}
        </p>
      </div>

      {/* Two ways out of the wait: try again, or talk to someone. Both are
          always enabled — an unshippable order is exactly when a customer most
          needs a way to reach a human. */}
      <div className="mt-4 flex flex-col gap-2 @md:flex-row">
        <Button
          variant="secondary"
          icon={RefreshCw}
          loading={checkState === "checking"}
          onClick={handleCheck}
          className="@md:flex-1"
        >
          {checkState === "resolved" ? "Check again" : "Check for tracking"}
        </Button>
        <Button variant="ghost" icon={Headphones} onClick={onContactSupport} className="@md:flex-1">
          Contact support
        </Button>
      </div>

      <p className="mt-3 text-center text-[11.5px] leading-snug text-ink-500">
        Tracking usually goes live within 24 hours of ordering.
      </p>
    </Card>
  );
}

export function TrackingPendingPanel({ order, onNotifyChange }) {
  const [notify, setNotify] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const checkpoints = (order.pending ?? PLACEHOLDER).checkpoints;

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

      {checkpoints.length > 0 ? (
        <ol className="space-y-0">
          {checkpoints.map((checkpoint, index) => {
            const isLast = index === checkpoints.length - 1;
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
      ) : (
        /* No checkpoint payload: say what we do know rather than rendering an
           empty list, which would look like a rendering failure. */
        <p className="rounded-2xl bg-ink-50 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-600 ring-1 ring-ink-100">
          Your order is confirmed and paid for. The warehouse is preparing your items, and each step is added here as
          it happens.
        </p>
      )}

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
