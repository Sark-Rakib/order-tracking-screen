import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

const VARIANTS = {
  primary:
    "bg-brand-700 text-white shadow-sm shadow-brand-700/20 hover:bg-brand-800 active:bg-brand-900",
  secondary:
    "bg-white text-ink-900 ring-1 ring-ink-200 hover:bg-ink-50 active:bg-ink-100",
  warning:
    "bg-amber-500 text-ink-900 shadow-sm shadow-amber-500/25 hover:bg-amber-400 active:bg-amber-600",
  danger:
    "bg-rose-600 text-white shadow-sm shadow-rose-600/20 hover:bg-rose-700 active:bg-rose-800",
  ghost: "text-brand-700 hover:bg-brand-50 active:bg-brand-100",
};

const SIZES = {
  sm: "min-h-9 px-3.5 text-[13px] gap-1.5 rounded-xl",
  md: "min-h-11 px-4 text-[15px] gap-2 rounded-2xl",
  lg: "min-h-13 px-5 text-base gap-2 rounded-2xl",
};

export function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  icon: LeadingIcon,
  trailingIcon: TrailingIcon,
  className,
  children,
  disabled,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <Component
      className={cn(
        "inline-flex select-none items-center justify-center font-semibold tracking-[-0.01em]",
        "transition-[background-color,box-shadow,transform] duration-150 active:scale-[0.985]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
        "disabled:pointer-events-none disabled:opacity-55",
        VARIANTS[variant],
        SIZES[size],
        block && "w-full",
        className,
      )}
      disabled={Component === "button" ? isDisabled : undefined}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      {...props}
    >
      {loading ? (
        <LoaderCircle className="size-[1.1em] animate-spin" aria-hidden="true" />
      ) : (
        LeadingIcon && <LeadingIcon className="size-[1.15em] shrink-0" aria-hidden="true" />
      )}
      {children}
      {!loading && TrailingIcon && <TrailingIcon className="size-[1.1em] shrink-0" aria-hidden="true" />}
    </Component>
  );
}
