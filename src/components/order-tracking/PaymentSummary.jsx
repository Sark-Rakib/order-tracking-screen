"use client";

import { useState } from "react";
import { ChevronDown, CreditCard, ShieldCheck, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";

const ROWS = [
  { key: "subtotal", label: "Subtotal" },
  { key: "shipping", label: "Shipping" },
  { key: "discount", label: "Discount", tone: "credit" },
  { key: "tax", label: "Tax" },
];

export function PaymentSummary({ order }) {
  const [open, setOpen] = useState(false);
  const { payment } = order;
  const money = (value) => formatCurrency(value, { currency: payment.currency });

  return (
    <Card className="px-0 py-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-5 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-600 sm:p-6"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-ink-100 text-ink-600">
          <CreditCard className="size-[18px]" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] leading-tight font-bold tracking-[-0.02em] text-ink-900 sm:text-[15px]">
            Payment summary
          </span>
          <span className="mt-0.5 block truncate text-[12px] text-ink-500">
            {payment.method} · {payment.status}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-[12px] text-ink-500">Total paid</span>
          <span className="block text-[15px] font-bold text-ink-900 tabular-nums">{money(payment.total)}</span>
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-ink-500 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="animate-fade border-t border-ink-100 px-5 pt-4 pb-5 sm:px-6 sm:pt-5 sm:pb-6">
          <dl className="space-y-2.5 text-[13px]">
            {ROWS.map((row) => {
              const value = payment[row.key];
              const isFree = row.key === "shipping" && value === 0;
              const isCredit = row.tone === "credit" && value !== 0;
              return (
                <div key={row.key} className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-1.5 text-ink-500">
                    {isCredit && <Tag className="size-3.5 text-brand-600" aria-hidden="true" />}
                    {isCredit ? `${row.label} · ${payment.promoCode}` : row.label}
                  </dt>
                  <dd
                    className={cn(
                      "font-semibold tabular-nums",
                      isFree && "text-brand-600",
                      isCredit && "text-brand-600",
                      !isFree && !isCredit && "text-ink-800",
                    )}
                  >
                    {isFree ? "Free" : isCredit ? `−${money(Math.abs(value))}` : money(value)}
                  </dd>
                </div>
              );
            })}
          </dl>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-ink-200 pt-3">
            <span className="text-[14px] font-bold text-ink-900">Total</span>
            <span className="text-[16px] font-extrabold text-ink-900 tabular-nums">{money(payment.total)}</span>
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-500">
            <ShieldCheck className="size-3.5 shrink-0 text-brand-600" aria-hidden="true" />
            Charged by {payment.provider}. Refunds go back to {payment.method} in 3–5 working days.
          </p>
        </div>
      )}
    </Card>
  );
}
