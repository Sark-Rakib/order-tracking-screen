import { cn } from "@/lib/cn";

/** Shimmering placeholder block. Pair with the `.skeleton` class. */
export function Skeleton({ className, rounded = "rounded-md" }) {
  return (
    <div
      aria-hidden="true"
      className={cn("skeleton", rounded, className)}
    />
  );
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn("h-3", index === lines - 1 ? "w-2/3" : index === 0 ? "w-1/2" : "w-full")}
        />
      ))}
    </div>
  );
}

/** Label used for every skeleton region, so screen readers aren't silent. */
export function SkeletonRegion({ label, children }) {
  return (
    <section
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className="rounded-3xl border border-ink-200/70 bg-white p-5 shadow-xs"
    >
      <span className="sr-only">{label}</span>
      {children}
    </section>
  );
}
