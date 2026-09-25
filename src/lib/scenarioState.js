/**
 * Where the active demo scenario lives between visits.
 *
 * Two stores, one precedence rule:
 *   1. `?state=` in the URL wins on a fresh load — the server has already read
 *      it, so the first paint is correct and a shared link works.
 *   2. localStorage is the fallback for a bare `/`, which is what an evaluator
 *      gets after pressing refresh on a link that never had the param.
 *
 * Both are written on every change, so refresh, a new tab, and a copied link all
 * land on the same view.
 *
 * The persisted id is exposed as a `useSyncExternalStore` store rather than
 * being copied into `useState` from an effect. Two reasons:
 *   - `getServerSnapshot` returns `null`, so the first client render matches the
 *     server HTML exactly and hydration stays clean; React then re-reads the
 *     real value and applies the restore without a cascading render.
 *   - localStorage is genuinely an external store, and a `storage` listener
 *     keeps two open tabs of this demo in agreement for free.
 *
 * Every function is defensive: persistence is a convenience, never a
 * correctness requirement, so a throwing or unavailable storage API must not
 * take the screen down with it.
 */

const STORAGE_KEY = "lumen.orderTracking.scenario";

const listeners = new Set();

/** In-memory mirror, so `getSnapshot` is cheap and referentially stable. */
let currentId = null;
let hasRead = false;

function emit() {
  for (const listener of listeners) listener();
}

function readOnce() {
  if (hasRead) return;
  hasRead = true;
  try {
    currentId = typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    // Safari private mode and hardened browser settings both throw on access.
    currentId = null;
  }
}

/** Client snapshot: the last scenario this browser looked at. */
export function getStoredScenarioId() {
  readOnce();
  return currentId;
}

/**
 * Server snapshot: always `null`.
 *
 * The server has no localStorage, and returning the same value it would have
 * returned during SSR is what guarantees the hydrated tree matches.
 */
export function getServerStoredScenarioId() {
  return null;
}

export function subscribeToStoredScenarioId(listener) {
  listeners.add(listener);

  if (typeof window !== "undefined" && listeners.size === 1) {
    window.addEventListener("storage", handleStorageEvent);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined" && listeners.size === 0) {
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
}

/** Fires in *other* tabs when localStorage changes, keeping tabs in sync. */
function handleStorageEvent(event) {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  try {
    currentId = event.newValue || null;
  } catch {
    currentId = null;
  }
  hasRead = true;
  emit();
}

export function writeStoredScenarioId(id) {
  if (typeof window === "undefined" || !id) return;
  if (currentId === id && hasRead) return;

  currentId = id;
  hasRead = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // The URL still carries the state, so persistence can fail silently.
  }
  emit();
}

export function clearStoredScenarioId() {
  if (typeof window === "undefined") return;
  currentId = null;
  hasRead = true;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* no-op */
  }
  emit();
}

/**
 * Canonicalise `?state=` in the address bar.
 *
 * `replaceState` rather than `pushState` on purpose: clicking through four demo
 * states should not leave four entries for the evaluator to back through, and
 * it avoids the server round-trip a router navigation would cost on a
 * `force-dynamic` page. Any other query params already present are preserved.
 */
export function writeStateParam(pathname, stateKey) {
  if (typeof window === "undefined" || !stateKey) return;

  try {
    const params = new URLSearchParams(window.location.search);
    params.set("state", stateKey);
    const url = `${pathname}?${params.toString()}`;
    if (`${window.location.pathname}${window.location.search}` === url) return;
    window.history.replaceState(window.history.state, "", url);
  } catch {
    // Sandboxed iframes can refuse history access; the view still works.
  }
}
