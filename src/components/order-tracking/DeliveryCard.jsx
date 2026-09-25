"use client";

import { CalendarClock, MapPin, Navigation, Phone, Truck } from "lucide-react";
import { formatDateTime, formatDayLabel } from "@/lib/format";
import { Card, SectionHeading } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useNow } from "@/components/ui/NowProvider";

const CONFIDENCE_COPY = {
  high: "Live ETA from the courier",
  medium: "Revised by the courier",
  low: "Best estimate so far",
};

/**
 * Left column, first card: where the parcel is going and when.
 *
 * The hero owns the glanceable status; this card owns the *details* — the exact
 * address, the promised window with its confidence, and the courier handling the
 * leg. It has to answer the same question in all four states, so each scenario
 * changes the copy rather than the layout.
 */
export function DeliveryCard({ order, onTrackCourier, onContactSupport }) {
  const now = useNow();
  const { eta, address, courier, flags, pending } = order;

  const windowLabel = flags.delivered ? "Delivered" : flags.delayed ? "Revised window" : "Promised window";
  const etaBody = (
    <>
      <p className="text-[10.5px] font-bold tracking-[0.06em] text-ink-500 uppercase">{windowLabel}</p>
      <p className="mt-1.5 text-[clamp(1rem,0.9rem+0.4vw,1.15rem)] leading-tight font-bold text-ink-900 tabular-nums">
        {eta.window}
      </p>
      <p className="mt-1 text-[12px] leading-snug font-medium text-ink-600">
        {formatDayLabel(eta.dateISO, now)}
        <span className="px-1.5 text-ink-500">·</span>
        {CONFIDENCE_COPY[eta.confidence] ?? CONFIDENCE_COPY.low}
      </p>
      {eta.revised && eta.previousWindow && (
        <p className="mt-1.5 text-[11.5px] text-ink-500">
          Was <span className="line-through decoration-1">{eta.previousWindow}</span>
        </p>
      )}
    </>
  );

  return (
    <Card>
      <SectionHeading
        icon={MapPin}
        title="Delivery"
        hint={`${address.label} · ${address.recipient}`}
      />

      <div>
        <div className="rounded-2xl bg-ink-50 p-3.5 ring-1 ring-ink-100">
          {flags.trackingPending ? (
            <>
              <p className="text-[10.5px] font-bold tracking-[0.06em] text-ink-500 uppercase">
                Estimated delivery
              </p>
              <div className="mt-2 space-y-2" aria-hidden="true">
                <Skeleton className="h-4 w-3/4" rounded="rounded-lg" />
                <Skeleton className="h-3 w-1/2" rounded="rounded-lg" />
              </div>
              <p className="sr-only">Estimated delivery window is not available yet.</p>
              <p className="mt-2.5 text-[11.5px] leading-snug text-ink-600">
                Live tracking is expected{" "}
                <span className="font-bold text-ink-900">
                  {pending ? formatDayLabel(pending.availableByISO, now) : "shortly"}
                </span>
                .
              </p>
            </>
          ) : (
            etaBody
          )}
        </div>

        <address className="mt-3 rounded-2xl bg-ink-50 p-3.5 text-[12.5px] leading-relaxed text-ink-700 not-italic ring-1 ring-ink-100">
          <span className="block font-bold text-ink-900">{address.recipient}</span>
          <span className="block">{address.line1}</span>
          <span className="block">{address.line2}</span>
          <span className="block">
            {address.city} {address.postcode}
          </span>
          <span className="mt-1.5 flex items-center gap-1.5 text-ink-500">
            <Phone className="size-3.5 shrink-0" aria-hidden="true" />
            {address.phone}
          </span>
        </address>

        {courier && (
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl bg-ink-50 px-3.5 py-3 text-[12px] text-ink-600 ring-1 ring-ink-100">
            <Truck className="size-4 shrink-0 text-ink-500" aria-hidden="true" />
            <span className="font-bold text-ink-900">{courier.partner}</span>
            <span aria-hidden="true" className="text-ink-500">
              ·
            </span>
            <span>{courier.agent.vehicle}</span>
            {flags.delivered && order.proof && (
              <>
                <span aria-hidden="true" className="text-ink-500">
                  ·
                </span>
                <span>Dropped {formatDateTime(order.proof.capturedAt)}</span>
              </>
            )}
            {!flags.delivered && !flags.trackingPending && (
              <>
                <span aria-hidden="true" className="text-ink-500">
                  ·
                </span>
                <span className="flex items-center gap-1">
                  <CalendarClock className="size-3.5" aria-hidden="true" />
                  ETA {formatDayLabel(eta.dateISO, now)}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {courier ? (
        <Button block size="md" className="mt-4" icon={Navigation} onClick={onTrackCourier}>
          Track on map
        </Button>
      ) : (
        <Button block size="md" className="mt-4" icon={MapPin} variant="secondary" onClick={onContactSupport}>
          Ask about this delivery
        </Button>
      )}
    </Card>
  );
}
