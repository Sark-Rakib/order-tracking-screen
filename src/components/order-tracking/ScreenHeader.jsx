"use client";

import { ChevronLeft, Copy, Headphones, Package } from "lucide-react";
import { formatDate, formatTime, pluralize } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

export function ScreenHeader({ order, itemCount, onBack, onHelp, onCopyId }) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-200/60 bg-white/85 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur-xl sm:px-6 sm:pt-4 sm:pb-4 lg:px-8 xl:px-10">
      {/* `flex-wrap` + `basis-full` on the id chip: its own row on a phone,
          inline in the bar from `sm` up where there is horizontal room. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-3 sm:gap-x-3 lg:gap-x-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to orders"
          className="-ml-1 grid size-10 shrink-0 place-items-center rounded-full text-ink-700 transition-colors hover:bg-ink-100 active:bg-ink-200 focus-visible:outline-2 focus-visible:outline-brand-600 lg:size-11"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] leading-tight font-bold tracking-[-0.03em] text-ink-900 sm:text-[19px] lg:text-[20px]">
            Track order
          </h1>
          <p className="truncate text-[12px] leading-tight text-ink-600 sm:text-[12.5px]">
            {formatDate(order.placedAt)} · {formatTime(order.placedAt)} ·{" "}
            {pluralize(itemCount, "item")}
          </p>
        </div>

        <button
          type="button"
          onClick={onHelp}
          aria-label="Get help with this order"
          className="grid size-10 shrink-0 place-items-center rounded-full text-ink-700 transition-colors hover:bg-ink-100 active:bg-ink-200 focus-visible:outline-2 focus-visible:outline-brand-600 lg:size-11"
        >
          <Headphones className="size-5" aria-hidden="true" />
        </button>

        {/* `order-last` + `basis-full` keep this on its own row on a phone;
            from `sm` up it drops back into the bar next to the title. */}
        <button
          type="button"
          onClick={onCopyId}
          className="order-last flex w-full basis-full items-center gap-2 rounded-2xl bg-ink-100/80 px-3 py-2 text-left transition-colors hover:bg-ink-100 active:bg-ink-200 focus-visible:outline-2 focus-visible:outline-brand-600 sm:order-none sm:w-auto sm:basis-auto sm:py-1.5 lg:px-3.5"
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white text-ink-500 shadow-xs sm:size-8">
            <Icon name="box" className="size-3.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10.5px] leading-none font-semibold tracking-[0.08em] text-ink-600 uppercase">
              Order id
            </span>
            <span className="mt-1 block truncate font-mono text-[13px] leading-none font-medium text-ink-800">
              {order.id}
            </span>
          </span>
          <span className="hidden shrink-0 items-center gap-1 rounded-lg bg-white px-2 py-1.5 text-[11px] font-semibold text-ink-600 shadow-xs min-[380px]:flex">
            <Copy className="size-3.5" aria-hidden="true" />
            Copy
          </span>
        </button>
      </div>
    </header>
  );
}

export function OrderStatusChip({ order }) {
  const isOpen = !order.flags.delivered;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-semibold text-ink-700">
      <Package className="size-3" aria-hidden="true" />
      {isOpen ? "Open order" : "Completed"}
    </span>
  );
}
