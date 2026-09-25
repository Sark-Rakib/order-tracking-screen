"use client";

import { useState } from "react";
import {
  Building2,
  Check,
  ChevronLeft,
  Home,
  PackageCheck,
  RotateCcw,
  Search,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

const PLACES = [
  { id: "neighbour", label: "With a neighbour or building reception", icon: Building2 },
  { id: "safe_place", label: "Behind a door, planter or other safe place", icon: Home },
  { id: "locker", label: "In a pickup locker or collection point", icon: PackageCheck },
  { id: "household", label: "With someone else in the household", icon: Users },
];

const REMEDIES = [
  { id: "refund", label: "Refund me", detail: "Money back to the original payment method", icon: RotateCcw },
  { id: "redeliver", label: "Deliver again", detail: "Free re-delivery, we pick a slot with you", icon: Truck },
  { id: "investigate", label: "Investigate", detail: "Check the courier's GPS trail and photo", icon: Search },
];

const REMEDY_DAYS = ["Tomorrow", "Saturday", "Sunday"];

export function NotReceivedSheet({ open, onClose, order }) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [checked, setChecked] = useState([]);
  const [remedy, setRemedy] = useState("refund");
  const [day, setDay] = useState("Tomorrow");
  const [status, setStatus] = useState("idle");

  const reset = () => {
    setStep(1);
    setChecked([]);
    setRemedy("refund");
    setDay("Tomorrow");
    setStatus("idle");
  };

  const close = () => {
    onClose();
    setTimeout(reset, 300);
  };

  const togglePlace = (id) => {
    setChecked((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const markFound = () => {
    toast({
      tone: "success",
      title: "Glad you found it",
      description: "No claim needed — we have closed the report on this order.",
    });
    close();
  };

  const submit = () => {
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 1200);
  };

  const remedyLabel = REMEDIES.find((item) => item.id === remedy)?.label;

  return (
    <Sheet
      open={open}
      onClose={close}
      title={status === "sent" ? "Claim opened" : step === 1 ? "Did you check nearby?" : "How should we fix it?"}
      subtitle={
        status === "sent"
          ? `Claim CLM-2291 · order ${order.id}`
          : `Step ${step} of 2 · marked delivered ${formatDateTime(order.proof.capturedAt).toLowerCase()}`
      }
      footer={
        status === "sent" ? (
          <Button block size="lg" onClick={close}>
            Back to tracking
          </Button>
        ) : step === 1 ? (
          <div className="space-y-2">
            <Button
              block
              size="lg"
              variant="primary"
              icon={Check}
              disabled={checked.length === 0}
              onClick={markFound}
            >
              {checked.length === 0 ? "Select where you looked" : "I found it — close report"}
            </Button>
            <Button block size="sm" variant="secondary" onClick={() => setStep(2)}>
              None of these — report it missing
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button block size="lg" variant="danger" loading={status === "sending"} onClick={submit}>
              {status === "sending" ? "Filing claim" : `Request ${remedyLabel?.toLowerCase()}`}
            </Button>
            <Button block size="sm" variant="ghost" icon={ChevronLeft} onClick={() => setStep(1)}>
              Back
            </Button>
          </div>
        )
      }
    >
      {status === "sent" ? (
        <div className="animate-rise py-2">
          <div className="flex items-start gap-3 rounded-2xl bg-brand-50 p-3.5 ring-1 ring-brand-100">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
              <Check className="size-4" aria-hidden="true" />
            </span>
            <p className="text-[13px] leading-snug text-brand-900">
              <span className="font-bold">No return shipping needed.</span> Your claim is pre-approved, so you don&apos;t
              have to wait for the courier to verify anything first.
            </p>
          </div>

          <ol className="mt-4 space-y-3">
            {[
              { title: "Courier contacted", detail: "Within 24 hours · we ask about the delivery attempt" },
              {
                title: remedy === "refund" ? "Refund issued" : remedy === "redeliver" ? `Re-delivery on ${day}` : "GPS trail reviewed",
                detail:
                  remedy === "refund"
                    ? `${formatCurrency(order.payment.total, { currency: order.payment.currency })} back to ${order.payment.method} in 3–5 days`
                    : remedy === "redeliver"
                      ? "Free of charge, with a 2-hour delivery window"
                      : "We compare the courier's photo and GPS with your address",
              },
              { title: "Order closed", detail: "We email you as soon as it is resolved" },
            ].map((item, index) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] leading-tight font-bold text-ink-900">{item.title}</p>
                  <p className="mt-0.5 text-[12px] leading-snug text-ink-500">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-ink-50 p-3 text-[12px] leading-snug text-ink-600 ring-1 ring-ink-100">
            <ShieldCheck className="mt-px size-4 shrink-0 text-brand-600" aria-hidden="true" />
            We&apos;ve paused the delivered status on this order so it stops counting as a late delivery.
          </p>
        </div>
      ) : step === 1 ? (
        <div className="space-y-3 pb-2">
          <p className="text-[13px] leading-relaxed text-ink-600">
            7 out of 10 missing parcels are handed to someone nearby. Worth checking these before we file a claim:
          </p>
          <ul className="space-y-2">
            {PLACES.map((place) => {
              const isChecked = checked.includes(place.id);
              return (
                <li key={place.id}>
                  <button
                    type="button"
                    onClick={() => togglePlace(place.id)}
                    aria-pressed={isChecked}
                    className={cn(
                      "flex w-full min-h-12 items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left transition-colors",
                      "focus-visible:outline-2 focus-visible:outline-brand-600",
                      isChecked ? "bg-brand-50 ring-1 ring-brand-200" : "bg-ink-50 ring-1 ring-ink-100 hover:bg-ink-100",
                    )}
                  >
                    <place.icon className={cn("size-4 shrink-0", isChecked ? "text-brand-600" : "text-ink-500")} aria-hidden="true" />
                    <span className="min-w-0 flex-1 text-[13px] leading-snug font-semibold text-ink-800">
                      {place.label}
                    </span>
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors",
                        isChecked ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300 bg-white",
                      )}
                    >
                      {isChecked && <Check className="size-3" aria-hidden="true" />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="space-y-4 pb-2">
          <fieldset>
            <legend className="text-[11px] font-bold tracking-[0.06em] text-ink-500 uppercase">Choose a resolution</legend>
            <div className="mt-2.5 space-y-2">
              {REMEDIES.map((option) => {
                const isSelected = remedy === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setRemedy(option.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      "flex w-full min-h-14 items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors",
                      "focus-visible:outline-2 focus-visible:outline-brand-600",
                      isSelected ? "bg-rose-50 ring-2 ring-rose-300" : "bg-ink-50 ring-1 ring-ink-100 hover:bg-ink-100",
                    )}
                  >
                    <option.icon className={cn("size-5 shrink-0", isSelected ? "text-rose-600" : "text-ink-500")} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] leading-tight font-bold text-ink-900">{option.label}</span>
                      <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-500">{option.detail}</span>
                    </span>
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-full border-2",
                        isSelected ? "border-rose-500" : "border-ink-300",
                      )}
                    >
                      {isSelected && <span className="size-2.5 rounded-full bg-rose-500" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {remedy === "redeliver" && (
            <fieldset className="animate-fade">
              <legend className="text-[11px] font-bold tracking-[0.06em] text-ink-500 uppercase">Preferred day</legend>
              <div className="mt-2.5 flex gap-2">
                {REMEDY_DAYS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDay(option)}
                    aria-pressed={day === option}
                    className={cn(
                      "min-h-9 flex-1 rounded-xl text-[12.5px] font-semibold transition-colors",
                      day === option ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-600 hover:bg-ink-200",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <p className="rounded-2xl bg-ink-50 p-3 text-[12px] leading-snug text-ink-600 ring-1 ring-ink-100">
            We&apos;ll ask the courier for their GPS trail and doorbell photos within 24 hours. If the parcel is
            confirmed lost, you choose the resolution — not us.
          </p>
        </div>
      )}
    </Sheet>
  );
}
