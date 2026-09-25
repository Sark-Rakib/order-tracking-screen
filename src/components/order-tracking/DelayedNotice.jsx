"use client";

import { CalendarClock, ChevronRight, MapPin, MessageCircle, Truck } from "lucide-react";
import { formatDayLabel } from "@/lib/format";
import { Button } from "@/components/ui/Button";

/**
 * Situation 1 — delayed order.
 * Amber (not red) on purpose: the parcel is fine, the *date* moved.
 */
export function DelayedNotice({ order, onTrackCourier, onRequestUpdate, onContactSupport }) {
  const notice = order.notice;
  if (!notice) return null;

  return (
    <section
      aria-label="Delivery delay"
      className="animate-rise @container overflow-hidden rounded-3xl border border-amber-300/70 bg-amber-50 p-5 shadow-xs sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-amber-500 text-white shadow-sm shadow-amber-500/30">
          <CalendarClock className="size-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15.5px] leading-tight font-bold tracking-[-0.02em] text-amber-950">
            {notice.title}
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-amber-900">{notice.body}</p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-2 @sm:grid-cols-2">
        <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-amber-200/70">
          <dt className="text-[10.5px] font-bold tracking-[0.06em] text-amber-800 uppercase">
            New window
          </dt>
          <dd className="mt-1 text-[13.5px] leading-tight font-bold text-amber-950 tabular-nums">
            {order.eta.window}
          </dd>
          <dd className="text-[11.5px] font-medium text-amber-800">{formatDayLabel(order.eta.dateISO)}</dd>
        </div>
        <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-amber-200/70">
          <dt className="text-[10.5px] font-bold tracking-[0.06em] text-amber-800 uppercase">Reason</dt>
          <dd className="mt-1 text-[13.5px] leading-tight font-bold text-amber-950">{notice.reason}</dd>
          <dd className="text-[11.5px] leading-snug font-medium text-amber-800">{notice.revisedBy}</dd>
        </div>
      </dl>

      <div className="mt-4 grid grid-cols-1 gap-2 @md:grid-cols-2">
        <Button
          block
          size="md"
          variant="warning"
          icon={Truck}
          trailingIcon={ChevronRight}
          onClick={onTrackCourier}
        >
          Track courier
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="secondary" onClick={onRequestUpdate}>
            Request update
          </Button>
          <Button size="sm" variant="secondary" icon={MessageCircle} onClick={onContactSupport}>
            Contact support
          </Button>
        </div>
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-[11.5px] leading-snug text-amber-900">
        <MapPin className="mt-px size-3.5 shrink-0" aria-hidden="true" />
        No action needed from you — we&apos;ll keep monitoring the parcel and alert you at every new scan.
      </p>
    </section>
  );
}
