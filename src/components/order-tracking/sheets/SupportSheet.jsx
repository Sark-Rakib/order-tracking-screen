"use client";

import { useState } from "react";
import { Check, Mail, MessageCircle, Phone, Send, ShieldCheck } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

export const ISSUE_TYPES = [
  { id: "late", label: "Late delivery" },
  { id: "missing", label: "Not received" },
  { id: "damaged", label: "Damaged item" },
  { id: "wrong", label: "Wrong item" },
  { id: "address", label: "Address issue" },
  { id: "other", label: "Something else" },
];

export function SupportSheet({ open, onClose, order, defaultIssue = "late" }) {
  const { toast } = useToast();
  const [issue, setIssue] = useState(defaultIssue);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("idle");

  const reset = () => {
    setStatus("idle");
    setNote("");
    setIssue(defaultIssue);
  };

  const submit = () => {
    setStatus("sending");
    setTimeout(() => {
      setStatus("sent");
      const ticket = "SUP-4821";
      toast({
        tone: "success",
        title: "Support request sent",
        description: `Ticket ${ticket} · we will reply in under 2 hours.`,
      });
    }, 1100);
  };

  const selected = ISSUE_TYPES.find((type) => type.id === issue);

  return (
    <Sheet
      open={open}
      onClose={() => {
        onClose();
        setTimeout(reset, 300);
      }}
      title={status === "sent" ? "We are on it" : "Contact support"}
      subtitle={
        status === "sent"
          ? `Ticket SUP-4821 · order ${order.id}`
          : `Agents online ${order.support.hours.split(",")[0].toLowerCase()}`
      }
      footer={
        status === "sent" ? (
          <Button block size="lg" onClick={onClose}>
            Back to tracking
          </Button>
        ) : (
          <Button block size="lg" loading={status === "sending"} icon={Send} onClick={submit}>
            {status === "sending" ? "Sending request" : `Send to support${selected ? ` · ${selected.label}` : ""}`}
          </Button>
        )
      }
    >
      {status === "sent" ? (
        <div className="animate-rise flex flex-col items-center py-4 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-brand-50 text-brand-600 ring-8 ring-brand-50/60">
            <Check className="size-8" aria-hidden="true" />
          </span>
          <p className="mt-5 text-[15px] font-bold text-ink-900">Request SUP-4821 is open</p>
          <p className="mt-1.5 max-w-[19rem] text-[13px] leading-relaxed text-ink-500">
            A support agent is reviewing order {order.id} now. You&apos;ll get a push notification and an email at
            {` ${order.support.email}`} — usually within {order.support.responseTime}.
          </p>
          <div className="mt-5 w-full rounded-2xl bg-ink-50 p-3.5 text-left ring-1 ring-ink-100">
            <p className="text-[11px] font-bold tracking-[0.06em] text-ink-500 uppercase">While you wait</p>
            <ul className="mt-2 space-y-1.5 text-[12.5px] leading-snug text-ink-600">
              <li>· Keep your phone nearby for a call from the courier.</li>
              <li>· Don&apos;t re-order the same items — we&apos;ll adjust your order instead.</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-5 pb-2">
          <div className="grid grid-cols-3 gap-2">
            <ChannelButton
              icon={Phone}
              label="Call"
              value={order.support.phone}
              onClick={() => toast({ tone: "info", title: "Calling support", description: order.support.phone })}
            />
            <ChannelButton
              icon={MessageCircle}
              label="Chat"
              value="~2 min wait"
              onClick={() => toast({ tone: "info", title: "Connecting you", description: "Joining the live queue… 2 min" })}
            />
            <ChannelButton
              icon={Mail}
              label="Email"
              value={order.support.email}
              onClick={() => toast({ tone: "info", title: "Email ready", description: order.support.email })}
            />
          </div>

          <fieldset>
            <legend className="text-[11px] font-bold tracking-[0.06em] text-ink-500 uppercase">What is wrong?</legend>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {ISSUE_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setIssue(type.id)}
                  aria-pressed={issue === type.id}
                  className={cn(
                    "min-h-9 rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-brand-600",
                    issue === type.id
                      ? "bg-ink-900 text-white"
                      : "bg-ink-100 text-ink-600 hover:bg-ink-200",
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="support-note" className="text-[11px] font-bold tracking-[0.06em] text-ink-500 uppercase">
              Add details <span className="font-medium normal-case">(optional)</span>
            </label>
            <textarea
              id="support-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              maxLength={400}
              placeholder="e.g. the neighbour in 4B says they never received a parcel for me"
              className="mt-2.5 w-full resize-none rounded-2xl bg-ink-50 p-3.5 text-[13.5px] leading-snug text-ink-900 ring-1 ring-ink-200 transition-shadow placeholder:text-ink-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <p className="mt-1.5 text-right text-[11px] text-ink-500 tabular-nums">{note.length}/400</p>
          </div>

          <p className="flex items-start gap-2 rounded-2xl bg-brand-50 p-3 text-[12px] leading-snug text-brand-900 ring-1 ring-brand-100">
            <ShieldCheck className="mt-px size-4 shrink-0 text-brand-600" aria-hidden="true" />
            Attaching order {order.id} automatically — no need to explain which order this is about.
          </p>
        </div>
      )}
    </Sheet>
  );
}

function ChannelButton({ icon: ChannelIcon, label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl bg-ink-50 px-1.5 py-2 ring-1 ring-ink-100 transition-colors hover:bg-ink-100 active:bg-ink-200 focus-visible:outline-2 focus-visible:outline-brand-600"
    >
      <ChannelIcon className="size-4 text-brand-700" aria-hidden="true" />
      <span className="text-[12.5px] leading-none font-bold text-ink-900">{label}</span>
      <span className="max-w-full truncate text-[10px] leading-none text-ink-500">{value}</span>
    </button>
  );
}
