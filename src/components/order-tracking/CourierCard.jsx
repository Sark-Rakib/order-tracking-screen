"use client";

import { Copy, MapPin, MessageCircle, Navigation, Phone, Star, Truck } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Card, SectionHeading } from "@/components/ui/Card";
import { useNow } from "@/components/ui/NowProvider";

export function CourierCard({ order, onTrack, onCall, onChat, onCopyTracking }) {
  const { courier } = order;
  const now = useNow();
  if (!courier) return null;

  const live = courier.liveLocation;
  const isHeld = live?.stopsAway === null;
  // A delivered order has no live position left — it falls back to its last scan.
  const tone = isHeld
    ? {
        chip: "bg-amber-50 ring-1 ring-amber-200",
        icon: "text-amber-600",
        title: "text-amber-900",
        meta: "text-amber-800",
      }
    : live
      ? {
          chip: "bg-brand-50 ring-1 ring-brand-100",
          icon: "text-brand-600",
          title: "text-brand-900",
          meta: "text-brand-800",
        }
      : {
          chip: "bg-ink-100 ring-1 ring-ink-200",
          icon: "text-ink-500",
          title: "text-ink-800",
          meta: "text-ink-600",
        };

  const locationTitle = live ? live.label : (order.proof?.note ?? "Delivered");
  const locationMeta = isHeld
    ? `Out for delivery starts tomorrow · scan updated ${formatRelativeTime(courier.lastScan, now)}`
    : live
      ? `${live.stopsAway} stops away · scan updated ${formatRelativeTime(courier.lastScan, now)}`
      : `Scan updated ${formatRelativeTime(courier.lastScan, now)} · proof of delivery shared`;

  return (
    // `@container` so the card adapts to the column it lands in, not the
    // viewport: in the 640-767px band it shares a row with the timeline and is
    // too narrow for a two-up action row.
    <Card className="@container">
      <SectionHeading
        icon={Truck}
        title="Courier & tracking"
        action={
          <button
            type="button"
            onClick={onCopyTracking}
            className="mt-0.5 inline-flex min-h-9 max-w-full shrink-0 items-center gap-1.5 rounded-lg bg-ink-100 px-2.5 text-[11.5px] font-semibold text-ink-600 transition-colors hover:bg-ink-200"
          >
            <Copy className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate font-mono">{courier.trackingNumber}</span>
          </button>
        }
      />

      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-2xl text-[15px] font-bold text-white sm:size-12",
            isHeld ? "bg-amber-700" : "bg-gradient-to-br from-brand-700 to-brand-900",
          )}
        >
          {courier.partner[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] leading-tight font-bold text-ink-900">{courier.partner}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-500">
            <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="font-semibold text-ink-700 tabular-nums">{courier.agent.rating}</span>
            · {courier.agent.name}
          </p>
        </div>
      </div>

      <div className={cn("mt-4 flex items-start gap-2.5 rounded-2xl p-3.5", tone.chip)}>
        <MapPin className={cn("mt-0.5 size-4 shrink-0", tone.icon)} aria-hidden="true" />
        <div className="min-w-0">
          <p className={cn("text-[13.5px] leading-tight font-bold", tone.title)}>{locationTitle}</p>
          <p className={cn("mt-1 text-[11.5px] font-medium", tone.meta)}>{locationMeta}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Button block size="md" icon={Navigation} onClick={onTrack}>
          {isHeld ? "See parcel journey" : "Track courier on map"}
        </Button>
        <div className="grid grid-cols-1 gap-2 @min-[17rem]:grid-cols-2">
          <Button size="sm" variant="secondary" icon={Phone} onClick={onCall}>
            Call agent
          </Button>
          <Button size="sm" variant="secondary" icon={MessageCircle} onClick={onChat}>
            Chat
          </Button>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] leading-snug text-ink-500">
        {courier.agent.vehicle} · Shared by {courier.partner}
      </p>
    </Card>
  );
}
