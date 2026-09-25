"use client";

import { cn } from "@/lib/cn";

export function Switch({ checked, onChange, label, description, id, icon: LeadingIcon }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-brand-600",
        checked ? "bg-brand-50 ring-1 ring-brand-200" : "bg-ink-50 ring-1 ring-ink-100 hover:bg-ink-100",
      )}
    >
      {LeadingIcon && (
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-xl transition-colors",
            checked ? "bg-brand-700 text-white" : "bg-white text-ink-500",
          )}
        >
          <LeadingIcon className="size-4" aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] leading-tight font-bold text-ink-900">{label}</span>
        {description && (
          <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-500">{description}</span>
        )}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-brand-700" : "bg-ink-400",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-[1.4rem]" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}
