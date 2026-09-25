/**
 * Reads the wall clock outside of the React render path.
 *
 * React's purity rules forbid `Date.now()` inside a component body because a
 * re-render must produce identical output. A server component needs a real
 * timestamp per request, so it is read here and passed down as a prop instead.
 */
export function readServerClock() {
  return Date.now();
}
