"use client";

import { Headphones, Mail, MessageCircle, Phone, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/**
 * The action centre. Which CTA is primary is decided by the scenario, so the
 * screen always pushes the single most useful next step.
 */
export function SupportActions({ order, primary, onContactSupport, onReportIssue, onCall, onChat, onEmail }) {
  const { support } = order;

  return (
    <Card className="@container">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
          <Headphones className="size-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] leading-tight font-bold tracking-[-0.02em] text-ink-900 sm:text-[15.5px]">
            Need a hand?
          </h2>
          <p className="mt-0.5 text-[12px] leading-snug text-ink-500">
            Agents reply in {support.responseTime} · {support.hours}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {primary && (
          <Button block size="lg" variant={primary.variant} icon={primary.icon} onClick={primary.onClick}>
            {primary.label}
          </Button>
        )}
        <div className={primary ? "grid grid-cols-1 gap-2 @md:grid-cols-2" : "space-y-2"}>
          <Button size="sm" variant="secondary" icon={MessageCircle} onClick={onContactSupport}>
            Contact support
          </Button>
          <Button size="sm" variant="secondary" icon={TriangleAlert} onClick={onReportIssue}>
            Report a problem
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-ink-100 pt-4 @sm:gap-3">
        <QuickAction icon={Phone} label="Call" hint={support.phone} onClick={onCall} />
        <QuickAction icon={MessageCircle} label="Chat" hint="Live agent" onClick={onChat} />
        <QuickAction icon={Mail} label="Email" hint="24h reply" onClick={onEmail} />
      </div>
    </Card>
  );
}

function QuickAction({ icon: ActionIcon, label, hint, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl bg-ink-50 px-1 py-2 ring-1 ring-ink-100 transition-colors hover:bg-ink-100 active:bg-ink-200 focus-visible:outline-2 focus-visible:outline-brand-600"
    >
      <ActionIcon className="size-4 text-ink-700" aria-hidden="true" />
      <span className="text-[12px] leading-none font-bold text-ink-900">{label}</span>
      <span className="max-w-full truncate text-[10px] leading-none text-ink-500">{hint}</span>
    </button>
  );
}
