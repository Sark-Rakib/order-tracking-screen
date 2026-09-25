import { cn } from "@/lib/cn";

export function Card({ className, children, ...props }) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-ink-200/70 bg-white p-5 shadow-xs sm:p-6",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function SectionHeading({ icon: HeadingIcon, title, hint, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.02em] text-ink-900 sm:text-[15.5px]">
          {HeadingIcon && (
            <span className="grid size-7 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-600">
              <HeadingIcon className="size-4" aria-hidden="true" />
            </span>
          )}
          {title}
        </h2>
        {hint && <p className="mt-1 pl-9 text-[12.5px] leading-snug text-ink-500">{hint}</p>}
      </div>
      {action}
    </div>
  );
}
