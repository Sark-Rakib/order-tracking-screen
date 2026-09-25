"use client";

import { useState } from "react";
import { Clock, MapPin, MessageCircle, Navigation, Phone, Share2 } from "lucide-react";
import { formatRelativeTime, formatTimeUntil } from "@/lib/format";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { useNow } from "@/components/ui/NowProvider";

/**
 * Courier map. Swap `<CourierMapPlaceholder />` for a Mapbox / Google Maps
 * embed later — the surrounding copy and actions stay untouched.
 */
function CourierMapPlaceholder({ order }) {
  const isHeld = order.courier?.liveLocation?.stopsAway === null;

  return (
    <div className="relative h-56 overflow-hidden rounded-3xl bg-[#e7ecf1] ring-1 ring-ink-200">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #ffffff 0 12px, transparent 12px), linear-gradient(#ffffff 0 9px, transparent 9px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div aria-hidden="true" className="absolute top-5 left-6 h-14 w-28 rounded-2xl bg-[#d7e3da]" />
      <div aria-hidden="true" className="absolute right-10 bottom-6 h-12 w-20 rounded-2xl bg-[#dde4ec]" />
      <div aria-hidden="true" className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 bg-[#f3d9c9]" />

      <svg viewBox="0 0 320 224" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path
          d="M44 186 C 96 178, 118 132, 176 116 S 250 74, 268 38"
          fill="none"
          stroke="#0f766e"
          strokeOpacity="0.35"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M44 186 C 96 178, 118 132, 176 116 S 250 74, 268 38"
          fill="none"
          stroke="#0f172a"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="8 10"
          className="animate-dash"
        />
        <circle cx="44" cy="186" r="8" fill="#0d9488" />
        <circle cx="44" cy="186" r="3.5" fill="#ffffff" />
        <circle cx="268" cy="38" r="9" fill="#0f172a" />
        <path d="M268 32 c 3.2 3.6 5 6 5 8 a 5 5 0 0 1 -10 0 c 0 -2 1.8 -4.4 5 -8 z" fill="#ffffff" />
      </svg>

      <span
        aria-hidden="true"
        className="absolute size-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/50"
        style={{ left: "13.75%", bottom: "17%", animation: "var(--animate-halo)" }}
      />
      <span
        className="absolute -translate-x-1/2 rounded-lg bg-ink-900/90 px-2 py-1 text-[10px] font-bold text-white"
        style={{ left: "13.75%", bottom: "calc(17% + 1.4rem)" }}
      >
        {isHeld ? "At hub" : order.courier?.agent.name}
      </span>
      <span
        className="absolute -translate-x-1/2 rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-ink-800 shadow-sm"
        style={{ left: "83.75%", top: "8%" }}
      >
        Home
      </span>

      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10.5px] font-bold text-ink-700 shadow-sm">
        <Navigation className="size-3" aria-hidden="true" />
        {isHeld ? "Route pending" : "Live · 38m ago"}
      </span>
    </div>
  );
}

export function TrackCourierSheet({ open, onClose, order }) {
  const { toast } = useToast();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const now = useNow();
  const { courier } = order;
  const isHeld = courier?.liveLocation?.stopsAway === null;

  const notify = (title, description, tone = "info") => toast({ title, description, tone });

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isHeld ? "Parcel journey" : "Track your courier"}
      subtitle={`${courier.partner} · ${courier.trackingNumber}`}
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="md"
            variant="secondary"
            icon={Phone}
            onClick={() => notify("Calling your agent", `Dialling ${courier.agent.name} at ${courier.agent.phone}`, "info")}
          >
            Call agent
          </Button>
          <Button
            size="md"
            variant="primary"
            icon={Navigation}
            onClick={() => notify("Opening maps", `Live position shared from ${courier.liveLocation.label}`, "success")}
          >
            Open in maps
          </Button>
        </div>
      }
    >
      <div className="space-y-4 pb-2">
        <CourierMapPlaceholder order={order} />

        <dl className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-ink-50 p-3 ring-1 ring-ink-100">
            <dt className="text-[10.5px] font-bold tracking-[0.06em] text-ink-500 uppercase">Arriving</dt>
            <dd className="mt-1 text-[13.5px] font-bold text-ink-900">{order.eta.window}</dd>
            <dd className="mt-0.5 text-[11.5px] text-ink-500">
              <Clock className="mr-1 inline size-3" aria-hidden="true" />
              {order.flags.delivered ? "Delivered" : `in ${formatTimeUntil(order.eta.dateISO, now)}`}
            </dd>
          </div>
          <div className="rounded-2xl bg-ink-50 p-3 ring-1 ring-ink-100">
            <dt className="text-[10.5px] font-bold tracking-[0.06em] text-ink-500 uppercase">Last scan</dt>
            <dd className="mt-1 truncate text-[13.5px] font-bold text-ink-900">
              {formatRelativeTime(courier.lastScan, now)}
            </dd>
            <dd className="mt-0.5 truncate text-[11.5px] text-ink-500">{courier.liveLocation.label}</dd>
          </div>
        </dl>

        <div className="flex items-center gap-3 rounded-2xl bg-ink-50 p-3 ring-1 ring-ink-100">
          <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-brand-700 text-[13px] font-bold text-white shadow-xs">
            {courier.partner[0]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-bold text-ink-900">{courier.agent.name}</p>
            <p className="truncate text-[11.5px] text-ink-500">{courier.agent.vehicle}</p>
          </div>
          <button
            type="button"
            onClick={() => notify("Sharing tracking", `Live link copied for ${courier.trackingNumber}`, "success")}
            aria-label="Share tracking link"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-ink-600 ring-1 ring-ink-200 transition-colors hover:bg-ink-100"
          >
            <Share2 className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => notify("Chat opened", `${courier.agent.name} replies in about 4 minutes`, "info")}
            aria-label="Chat with agent"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-ink-600 ring-1 ring-ink-200 transition-colors hover:bg-ink-100"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
          </button>
        </div>

        <Switch
          checked={autoRefresh}
          onChange={(next) => {
            setAutoRefresh(next);
            if (next) notify("Auto-refresh on", "We will pull a new courier scan every 30 seconds", "success");
          }}
          icon={MapPin}
          label="Auto-refresh this map"
          description="Pulls a new courier scan every 30 seconds while the app is open"
        />
      </div>
    </Sheet>
  );
}
