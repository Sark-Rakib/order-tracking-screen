/**
 * Tiny class-name joiner. The project has no `clsx`/`tailwind-merge`, and all
 * call sites pass plain, non-conflicting strings, so a filter+join is enough.
 */
export function cn(...inputs) {
  return inputs.flat(Infinity).filter(Boolean).join(" ");
}
