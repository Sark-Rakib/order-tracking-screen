"use client";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * Demo-only control.
 *
 * Two shapes, one control: a thumb-reachable bar pinned to the bottom of a
 * phone, and an in-flow toolbar that sits under the dashboard grid from `sm` up
 * (where a fixed bar would just cover content). Buttons keep a 44px+ target at
 * every size.
 */
export function ScenarioSwitcher({ scenarios, activeId, onChange }) {
  return (
    <div
      className={cn(
        "mt-5 z-40 border-ink-200/70 bg-white/92 backdrop-blur-xl",
        // mobile: pinned to the bottom edge, full-bleed
        "sticky bottom-0 border-t px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        // sm and up: a normal block at the end of the page
        "sm:static sm:mt-6 sm:rounded-3xl sm:border sm:p-3 sm:shadow-xs",
        // md and up: label and pills share one row
        "md:flex md:items-center md:justify-between md:gap-4",
        "lg:mt-8 lg:p-3.5",
      )}
    >
      <p className="mb-2 text-center text-[9.5px] font-bold tracking-[0.16em] text-ink-600 uppercase sm:mb-0 sm:shrink-0 sm:text-left sm:text-[10.5px] sm:tracking-[0.14em] lg:text-[11px]">
        Demo state switcher
      </p>

      <div
        role="group"
        aria-label="Switch demo order state"
        className="grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap md:flex md:flex-1 md:justify-end md:gap-2 lg:max-w-xl"
      >
        {scenarios.map((scenario) => {
          const isActive = scenario.id === activeId;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onChange(scenario.id)}
              aria-pressed={isActive}
              title={scenario.description}
              className={cn(
                "flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-2xl px-1 transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
                "sm:min-h-11 sm:px-2 md:min-w-[7.5rem] md:flex-row md:gap-2 md:px-3.5",
                isActive
                  ? "bg-brand-700 text-white shadow-sm shadow-brand-700/30"
                  : "bg-ink-100 text-ink-700 hover:bg-ink-200 active:bg-ink-300",
              )}
            >
              <Icon name={scenario.tabIcon} className="size-[18px] shrink-0" />
              <span className="max-w-full truncate text-[10px] leading-none font-bold sm:text-[12px]">
                {scenario.tabLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
