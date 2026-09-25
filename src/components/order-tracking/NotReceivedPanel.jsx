"use client";

import { Camera, ChevronRight, MessageCircle, PackageX, ShieldCheck } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/Button";

/**
 * Situation 2 — courier says delivered, customer says otherwise.
 * The CTA is the loudest element on the screen, as it should be.
 */
export function NotReceivedPanel({ order, onReport, onChatCourier }) {
  const proof = order.proof;
  if (!proof) return null;

  return (
    <section
      aria-label="Delivery problem"
      className="animate-rise @container overflow-hidden rounded-3xl border border-rose-200 bg-white p-5 shadow-xs sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
          <PackageX className="size-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15.5px] leading-tight font-bold tracking-[-0.02em] text-ink-900">
            We marked this as delivered
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">
            The courier logged a successful drop {formatDateTime(proof.capturedAt).toLowerCase()}. If the parcel isn&apos;t
            with you, we&apos;ll make it right.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-ink-50 p-3.5 ring-1 ring-ink-100">
        <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.06em] text-ink-500 uppercase">
          <Camera className="size-3.5" aria-hidden="true" />
          What the courier recorded
        </p>
        <p className="mt-1.5 text-[13.5px] leading-snug font-semibold text-ink-800">{proof.note}</p>
        <p className="mt-1 text-[11.5px] text-ink-500">
          {proof.method} · GPS accuracy {proof.gpsAccuracy}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 @md:grid-cols-2">
        <Button block size="lg" variant="danger" icon={PackageX} trailingIcon={ChevronRight} onClick={onReport}>
          I didn&apos;t receive this order
        </Button>
        <Button block size="sm" variant="secondary" icon={MessageCircle} onClick={onChatCourier}>
          Ask the courier first
        </Button>
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-[11.5px] leading-snug text-ink-500">
        <ShieldCheck className="mt-px size-3.5 shrink-0 text-brand-600" aria-hidden="true" />
        Report within 7 days of delivery for a full refund or free re-delivery — no return shipping needed.
      </p>
    </section>
  );
}
