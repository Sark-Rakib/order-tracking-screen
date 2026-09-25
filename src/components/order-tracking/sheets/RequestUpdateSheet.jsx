"use client";

import { useState } from "react";
import { BellRing, Check, Send } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

const REASONS = [
  { id: "hub", label: "Hub delay" },
  { id: "weather", label: "Weather" },
  { id: "address", label: "Address problem" },
  { id: "addressing", label: "Recipient unavailable" },
  { id: "capacity", label: "Rider capacity" },
  { id: "other", label: "Not listed" },
];

/** Situation 1 follow-up: ask the courier to push for a firmer ETA. */
export function RequestUpdateSheet({ open, onClose, order }) {
  const { toast } = useToast();
  const [reason, setReason] = useState("hub");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("idle");

  const close = () => {
    onClose();
    setTimeout(() => {
      setStatus("idle");
      setNote("");
    }, 300);
  };

  const submit = () => {
    setStatus("sending");
    setTimeout(() => {
      setStatus("sent");
      toast({
        tone: "success",
        title: "Update requested",
        description: `${order.courier.partner} usually replies within 2 hours.`,
      });
    }, 1000);
  };

  return (
    <Sheet
      open={open}
      onClose={close}
      title={status === "sent" ? "Request sent" : "Request an update"}
      subtitle={
        status === "sent"
          ? `Reference UPD-${order.id.slice(-4)}`
          : `Goes straight to ${order.courier?.partner ?? "the courier"} dispatch team`
      }
      footer={
        status === "sent" ? (
          <Button block size="lg" onClick={close}>
            Back to tracking
          </Button>
        ) : (
          <Button block size="lg" variant="warning" icon={Send} loading={status === "sending"} onClick={submit}>
            {status === "sending" ? "Sending request" : "Send update request"}
          </Button>
        )
      }
    >
      {status === "sent" ? (
        <div className="animate-rise flex flex-col items-center py-4 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-brand-50 text-brand-600 ring-8 ring-brand-50/60">
            <Check className="size-8" aria-hidden="true" />
          </span>
          <p className="mt-5 text-[15px] font-bold text-ink-900">We&apos;re chasing the courier</p>
          <p className="mt-1.5 max-w-[19rem] text-[13px] leading-relaxed text-ink-500">
            You&apos;ll get a push notification the moment they confirm a new delivery window. If nothing changes by
            tomorrow evening, we&apos;ll automatically escalate this to a supervisor.
          </p>
          <p className="mt-4 flex items-center gap-2 rounded-2xl bg-ink-50 px-3.5 py-2.5 text-[12px] font-semibold text-ink-700 ring-1 ring-ink-100">
            <BellRing className="size-4 text-brand-600" aria-hidden="true" />
            Alerts are on for this order
          </p>
        </div>
      ) : (
        <div className="space-y-5 pb-2">
          <fieldset>
            <legend className="text-[11px] font-bold tracking-[0.06em] text-ink-500 uppercase">
              Why do you need an update?
            </legend>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {REASONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setReason(option.id)}
                  aria-pressed={reason === option.id}
                  className={cn(
                    "min-h-9 rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-brand-600",
                    reason === option.id ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-600 hover:bg-ink-200",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="update-note" className="text-[11px] font-bold tracking-[0.06em] text-ink-500 uppercase">
              Anything we should know?
            </label>
            <textarea
              id="update-note"
              rows={3}
              maxLength={300}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. I have a meeting at 3 PM, please call before arriving"
              className="mt-2.5 w-full resize-none rounded-2xl bg-ink-50 p-3.5 text-[13.5px] leading-snug text-ink-900 ring-1 ring-ink-200 transition-shadow placeholder:text-ink-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>
      )}
    </Sheet>
  );
}
