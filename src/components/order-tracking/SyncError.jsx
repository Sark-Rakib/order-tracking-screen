"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime } from "@/lib/format";
import { useNow } from "@/components/ui/NowProvider";

/** Inline error state for a failed background refresh — never blocks the page. */
export function SyncError({ sync, order, onRetry }) {
  const now = useNow();

  return (
    <section
      role="alert"
      className="animate-rise flex flex-wrap items-start gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-4 sm:flex-nowrap sm:p-5"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-600">
        <TriangleAlert className="size-[18px]" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] leading-tight font-bold text-rose-950">We couldn&apos;t refresh tracking</p>
        <p className="mt-1 text-[12.5px] leading-snug text-rose-900/80">
          {order.courier?.partner ?? "The courier"} didn&apos;t respond. Showing the last confirmed update from{" "}
          {formatRelativeTime(sync.at, now)}.
        </p>
        <Button size="sm" variant="secondary" icon={RefreshCw} className="mt-2.5" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </section>
  );
}
