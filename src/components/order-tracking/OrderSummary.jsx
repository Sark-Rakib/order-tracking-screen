"use client";

import { Package, Receipt, Store } from "lucide-react";
import { formatCurrency, formatDateTime, pluralize } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Card, SectionHeading } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

function ItemRow({ item, currency }) {
  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-2.5 sm:gap-4 sm:py-3">
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-inner ring-1 ring-ink-900/5 sm:size-12",
          item.swatch,
        )}
      >
        <Icon name={item.icon} className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13.5px] leading-tight font-semibold text-ink-900 sm:text-[14px]">
          {item.name}
        </span>
        <span className="mt-1 block text-[11.5px] leading-snug text-ink-500">{item.variant}</span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-[13.5px] font-bold text-ink-900 tabular-nums sm:text-[14px]">
          {formatCurrency(item.price, { currency })}
        </span>
        {item.qty > 1 && (
          <span className="mt-0.5 block text-[11.5px] text-ink-500 tabular-nums">Qty {item.qty}</span>
        )}
      </span>
    </li>
  );
}

export function OrderSummary({ order, onViewInvoice }) {
  const currency = order.payment.currency;
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <Card>
      <SectionHeading
        icon={Package}
        title="Order summary"
        hint={`${pluralize(itemCount, "item")} · Ordered ${formatDateTime(order.placedAt)}`}
      />

      <ul className="divide-y divide-ink-100">
        {order.items.map((item) => (
          <ItemRow key={item.id} item={item} currency={currency} />
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-ink-100 pt-3">
        <p className="flex min-w-0 items-center gap-1.5 text-[11.5px] text-ink-500">
          <Store className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">Ordered via {order.channel}</span>
        </p>
        <Button size="sm" variant="secondary" icon={Receipt} onClick={onViewInvoice} className="shrink-0">
          View invoice
        </Button>
      </div>
    </Card>
  );
}
