const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function toDate(value) {
  return value instanceof Date ? value : new Date(value);
}

export function formatCurrency(amount, { currency = "USD", locale = "en-US" } = {}) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(toDate(value));
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(toDate(value));
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(toDate(value));
}

/**
 * "Today" / "Tomorrow" / "Yesterday" / "Fri, 26 Sep" — friendlier than a raw date.
 *
 * Both sides are floored to local midnight before subtracting. Comparing raw
 * timestamps instead would make the fraction of an elapsed day leak into the
 * answer, so a 9 PM order would be labelled "Tomorrow" when it is plainly from
 * today. `Math.round` on the midnight-to-midnight gap absorbs the ±1 hour that
 * a DST boundary introduces.
 *
 * `now` is a parameter rather than a bare `Date.now()` so callers can pass the
 * shared `useNow()` clock — reading the wall clock during render is exactly what
 * causes hydration mismatches on relative labels.
 */
export function formatDayLabel(value, now = Date.now()) {
  const date = toDate(value);
  const reference = toDate(now);
  const startOfDay = (input) =>
    new Date(input.getFullYear(), input.getMonth(), input.getDate()).getTime();
  const diffDays = Math.round((startOfDay(date) - startOfDay(reference)) / DAY);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) {
    return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
  }
  return formatDate(date);
}

export function formatRelativeTime(value, now = Date.now()) {
  const elapsed = now - toDate(value).getTime();
  if (elapsed < MINUTE) return "just now";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h ago`;
  return `${Math.floor(elapsed / DAY)}d ago`;
}

/** "in 3h 12m" — used for "tracking available in …" countdowns. */
export function formatTimeUntil(value, now = Date.now()) {
  const remaining = toDate(value).getTime() - now;
  if (remaining <= 0) return "any moment now";
  const hours = Math.floor(remaining / HOUR);
  const minutes = Math.floor((remaining % HOUR) / MINUTE);
  if (hours === 0) return `${minutes}m`;
  return hours < 10 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
