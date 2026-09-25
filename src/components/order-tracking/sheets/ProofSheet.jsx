"use client";

import { Camera, MapPin, PackageX, ShieldCheck } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";

/** Proof of delivery: the evidence behind the "Delivered" badge. */
export function ProofSheet({ open, onClose, order, onReport }) {
  const proof = order.proof;
  if (!proof) return null;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Proof of delivery"
      subtitle={`Captured ${formatDateTime(proof.capturedAt)}`}
      footer={
        <div className="space-y-2">
          <Button block size="lg" variant="danger" icon={PackageX} onClick={onReport}>
            This isn&apos;t my parcel
          </Button>
          <Button block size="sm" variant="secondary" onClick={onClose}>
            Looks right
          </Button>
        </div>
      }
    >
      <div className="space-y-4 pb-2">
        {/* Swap for the real courier image URL: <Image src={proof.imageUrl} … /> */}
        <div className="relative grid h-52 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-ink-200 via-ink-300 to-ink-400">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0 12px, transparent 12px 24px)",
            }}
          />
          <div className="relative flex flex-col items-center gap-2 text-white">
            <Camera className="size-8" aria-hidden="true" />
            <span className="text-[13px] font-bold">Doorstep photo · blurred</span>
            <span className="text-[11px] text-white/80">Shared by {order.courier.partner}</span>
          </div>
        </div>

        <dl className="divide-y divide-ink-100 overflow-hidden rounded-2xl ring-1 ring-ink-100">
          {[
            { label: "Status", value: "Left with a neighbour" },
            { label: "Where", value: "Flat 4C, Rose Garden Residency" },
            { label: "Method", value: proof.method },
            { label: "GPS accuracy", value: proof.gpsAccuracy },
            { label: "Agent", value: order.courier.agent.name },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 bg-white px-3.5 py-2.5">
              <dt className="text-[12.5px] text-ink-500">{row.label}</dt>
              <dd className="text-right text-[12.5px] font-semibold text-ink-900">{row.value}</dd>
            </div>
          ))}
        </dl>

        <p className="flex items-start gap-2 rounded-2xl bg-ink-50 p-3 text-[12px] leading-snug text-ink-600 ring-1 ring-ink-100">
          <MapPin className="mt-px size-4 shrink-0 text-ink-500" aria-hidden="true" />
          {proof.note}
        </p>

        <p className="flex items-start gap-2 text-[11.5px] leading-snug text-ink-500">
          <ShieldCheck className="mt-px size-3.5 shrink-0 text-brand-600" aria-hidden="true" />
          Delivery photos are retained for 30 days. If the parcel was never handed over, open a claim and we&apos;ll
          request the original file from the courier.
        </p>
      </div>
    </Sheet>
  );
}
