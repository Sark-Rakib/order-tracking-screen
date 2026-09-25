# Order Tracking Screen — Lumen

A production-grade, mobile-first **order tracking screen** for an e-commerce app, built with Next.js (App Router) and Tailwind CSS v4. Renders one order through four fulfilment states — including three deliberately awkward edge cases — from mock data, with no backend.

![status](https://img.shields.io/badge/Next.js-16-000000) ![status](https://img.shields.io/badge/React-19-087ea4) ![status](https://img.shields.io/badge/Tailwind-4-38bdf8) ![status](https://img.shields.io/badge/license-MIT-blue)

---

## Table of Contents

- [Quick Start](#quick-start)
- [The Four Scenarios](#the-four-scenarios)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
  - [Single data source, one page route](#single-data-source-one-page-route)
  - [Hydration-safe clock](#hydration-safe-clock)
  - [State ownership](#state-ownership)
  - [Sheets](#sheets)
- [Component Reference](#component-reference)
- [Design System](#design-system)
- [Responsive Strategy](#responsive-strategy)
- [Accessibility](#accessibility)
- [Data Shape](#data-shape)
- [Swapping Mock Data for a Real API](#swapping-mock-data-for-a-real-api)
- [Scripts](#scripts)
- [Tech Stack](#tech-stack)
- [Deliberate Non-Dependencies](#deliberate-non-dependencies)
- [Project Origin](#project-origin)
- [Known Rough Edges](#known-rough-edges)
- [License](#license)

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Use the **state switcher** to explore: on mobile it is a sticky bar pinned to the bottom of the viewport (thumb-reachable); from `sm` up it becomes an inline toolbar at the top of the page.

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (`eslint-config-next`, `core-web-vitals`) |

No environment variables are required — `.env*` is gitignored but nothing is read from the environment. The data layer is a static module.

---

## The Four Scenarios

All four scenarios describe the **same order** (`OT-8471-2290`, 3 items, Visa ···· 4242 via Stripe, promo `WELCOME15`, free shipping, Dhaka 1209) from a courier named *Apex Express* (`APX-4410-88231`, agent Rifat H., rated 4.9). This mirrors how a real API would model one resource shape with several `status` values, and it makes the UI differences easy to isolate.

| Scenario | Stage | Signature UI |
| --- | --- | --- |
| **Normal** | `out_for_delivery` | Brand-gradient hero, "Arriving today 6–8 PM", courier is 12 stops away, live-location chip |
| **Delayed** | `shipped` | **Amber** hero, `DelayedNotice` banner, revised window with the original struck through, "Held at Gazipur hub" instead of a stop count |
| **Not got it** | `delivered` | Slate hero, `NotReceivedPanel` with rose accents, proof-of-delivery block, no live location |
| **No tracking** | `packed` | "Your order has been placed!" card with a framed skeleton for the unknown ETA and the order receipt, a named tracking placeholder with a bounded *check again*, and a 4-step "what happens next" checklist with a notify-me switch |

Every timestamp in the mock data is generated **relative to the current request time**, so "arriving today" and "updated 38m ago" are always truthful no matter when you open the page.

Notable behaviours worth trying:

- In the **Delayed** scenario, pressing refresh in the hero deliberately fails on the first attempt, so the inline `SyncError` state is always reachable. The second attempt succeeds.
- Submitting the support, missing-parcel, or update-request flows returns a fake ticket number (`SUP-4821`, `CLM-2291`, `UPD-####`) after a 1–1.2s delay, and fires a toast.
- The primary CTA in the action centre is **scenario-driven**: it becomes "I didn't receive this order" (danger) in the not-received state, "Request an update" (warning) when delayed, and "Ask about this order" when tracking is pending.

### Deep links

Every scenario is addressable, and the address bar is kept in sync as you switch:

| Scenario | URL |
| --- | --- |
| Normal | `/?state=normal-flow` |
| Delayed | `/?state=delayed-order` |
| Not received | `/?state=delivered-not-received` |
| No tracking | `/?state=no-tracking` |

The raw internal ids (`?state=tracking-pending`) are still accepted, and an unrecognised value falls back to Normal rather than erroring.

### State persistence

Refreshing used to reset the screen to the default scenario. The active state now survives a refresh, a new tab, and a shared link, via two stores with a fixed precedence:

1. **`?state=` in the URL wins on a fresh load.** `page.js` is a server component, so it reads `searchParams` and renders the requested scenario on the *first paint* — no flash of the default view, no hydration mismatch.
2. **localStorage is the fallback for a bare `/`**, which is what you get after pressing refresh on a link that never carried the param.

Both are written whenever the scenario changes, so the URL is canonicalised on the way in and the next refresh is URL-driven. `replaceState` is used rather than `pushState`, so clicking through the four demo states does not leave four entries for the evaluator to back through.

Three details make this safe rather than merely working:

- The persisted id is read through **`useSyncExternalStore`** with a `getServerSnapshot` that returns `null`. That is what keeps the first client render byte-identical to the server HTML while still letting React apply the restore immediately afterwards — and it avoids the cascading render that reading storage into state from an effect would cause.
- The persistence effect **refuses to write while a restore is still in flight**. Effects run after hydration, when the real stored value is readable even though the render used the `null` snapshot; without that guard, a bare visit would persist the default over the very value it was about to restore, and the restore would silently become a no-op.
- Every storage call is wrapped. Private-mode Safari and hardened browser settings throw on `localStorage` access, and persistence is a convenience rather than a correctness requirement — the URL still carries the state if it fails.

---

## Project Structure

```
src/
├── app/
│   ├── layout.js          Root layout — Geist fonts, metadata, viewport
│   ├── page.js            The only route (/), a server component
│   └── globals.css        Tailwind theme + design tokens + keyframes
├── components/
│   ├── order-tracking/    Feature components for this screen
│   │   ├── OrderTrackingScreen.jsx   Orchestrator (state + layout)
│   │   ├── ScreenHeader.jsx          Sticky header + copyable order ID
│   │   ├── StatusHero.jsx            Status card: stage, ETA, progress rail
│   │   ├── TrackingTimeline.jsx      Expandable scan timeline
│   │   ├── CourierCard.jsx           Courier, agent, live location
│   │   ├── DeliveryCard.jsx          Address, promised vs revised window
│   │   ├── OrderSummary.jsx          Itemised products
│   │   ├── PaymentSummary.jsx        Collapsible cost breakdown
│   │   ├── SupportActions.jsx        Scenario CTA + contact quick actions
│   │   ├── DelayedNotice.jsx         Edge case: delayed
│   │   ├── NotReceivedPanel.jsx      Edge case: delivered but not received
│   │   ├── TrackingPending.jsx       Edge case: no tracking yet (3 exports)
│   │   ├── SyncError.jsx             Inline refresh-failure banner
│   │   ├── ScenarioSwitcher.jsx      Demo-only state switcher
│   │   └── sheets/                   5 bottom sheets (see below)
│   └── ui/                 Presentational primitives
│       ├── Button.jsx  Card.jsx  Icon.jsx  Skeleton.jsx  Switch.jsx
│       └── NowProvider.jsx  Sheet.jsx  Toast.jsx
├── data/
│   └── orders.js          Mock scenarios + the data contract
└── lib/
    ├── format.js          Intl date/number formatting
    ├── clipboard.js       copyText() with a fallback for older Safari
    ├── clock.js           readServerClock()
    ├── scenarioState.js   ?state= URL + localStorage persistence store
    └── cn.js              Dependency-free class joiner
```

---

## Architecture

### Single data source, one page route

There is exactly **one route**. `src/app/page.js` is a server component that reads a server clock, builds the scenarios, and hands everything to the client orchestrator:

```js
export const dynamic = "force-dynamic";

export default function Home() {
  const now = readServerClock();
  const scenarios = createOrderScenarios(now);
  return (
    <OrderTrackingScreen
      scenarios={scenarios}
      initialScenarioId={DEFAULT_SCENARIO_ID}
      initialNow={now}
    />
  );
}
```

`force-dynamic` is deliberate: the mock data is timestamped per request so that "arriving today" stays true.

There are **no API routes, no server actions, and no `fetch()` calls** anywhere in the project.

### Hydration-safe clock

Relative labels ("updated 38m ago", "arrives in 9h 12m") are the single most common source of hydration mismatches in a screen like this. The fix is a single shared timestamp that flows one way:

```
readServerClock()  →  page.js  →  initialNow prop  →  <NowProvider>  →  useNow()
```

Seven components consume `useNow()`. The server renders with the seed value; the client re-ticks the same context every 60s (`TICK_MS = 60_000`). Because the seed is serialised through props rather than read from `Date.now()` during render, server and client markup are identical on first paint. `lib/clock.js` exists purely to keep `Date.now()` out of the render path.

### State ownership

All client state lives in one `Tracker` component inside `OrderTrackingScreen.jsx` — nothing more than the sheet pair, the sync machine, and one override:

```js
const [sheet, setSheet] = useState(null);            // { name, props } while open
const [closingSheet, setClosingSheet] = useState(null); // kept mounted for exit transition
const [sync, setSync] = useState({ status: "idle", at: null, attempts: 0 });
const [pinnedId, setPinnedId] = useState(null);      // scenario picked by hand
```

The active scenario is *derived*, not stored:

```js
const storedId = useSyncExternalStore(subscribe, getStored, getServerStored);
const restoredId = initialStateParam ? null : resolveScenarioId(scenarios, storedId);
const scenarioId = pinnedId ?? restoredId ?? initialScenarioId;
```

A URL deep link wins, then the persisted value, then the server default — and `pinnedId` short-circuits all three once the user chooses for themselves. See [State persistence](#state-persistence) for why each term is shaped that way.

Feature components receive plain serialisable props and are otherwise dumb, which is what makes them trivially portable. The content wrapper is keyed by scenario (`<main key={scenario.id}>`) so switching states resets scroll and replays the entrance animation.

Simulated network calls are all `setTimeout`-based — there is no real I/O anywhere.

### Sheets

Five bottom sheets, registered by name in one place:

```js
const SHEETS = {
  courier:       TrackCourierSheet,
  support:       SupportSheet,
  notReceived:   NotReceivedSheet,
  requestUpdate: RequestUpdateSheet,
  proof:         ProofSheet,
};
```

`ui/Sheet.jsx` implements the shared behaviour: deferred enter/exit transitions via `requestAnimationFrame`, backdrop and `Escape` dismissal, a counter-based body scroll lock (`body[data-sheet-open]`), focus restoration on close, `svh` heights, and safe-area padding. It is bottom-anchored on mobile and becomes a centred dialog from `sm` up.

---

## Component Reference

### Feature — `components/order-tracking/`

| Component | Purpose |
| --- | --- |
| `OrderTrackingScreen` | Orchestrator. Owns state, composes the responsive two-column grid, registers all sheets. |
| `ScreenHeader` | Sticky blurred bar: back chevron, title + placed-at date, help button, copy-to-clipboard order-ID chip. |
| `StatusHero` | The gradient status card: pulsing stage pill, ETA headline, delivery window, confidence, struck-through previous window, segmented progress rail, refresh button. |
| `TrackingTimeline` | Expandable vertical scan timeline with `complete` / `current` / `delayed` / `upcoming` / `pending` states, halo pulse on the current step, and location disclosure. Renders its own empty state when no scans exist yet. |
| `CourierCard` | Courier partner, agent, rating, copyable tracking number, live-location chip, map/call/chat actions. |
| `DeliveryCard` | Address `<address>` block, promised vs revised window with confidence, courier leg, "Track on map". |
| `OrderSummary` | Itemised products with swatch tiles, quantities, order channel, "View invoice". |
| `PaymentSummary` | Collapsible: collapsed shows method + status + total; expanded shows subtotal, shipping, discount, tax, total. |
| `SupportActions` | Scenario-driven primary CTA, "Contact support" / "Report a problem", and a Call/Chat/Email quick-action row. |
| `DelayedNotice` | **Edge case 1** — amber banner with reason, new window, and next-step CTAs. |
| `NotReceivedPanel` | **Edge case 2** — "We marked this as delivered" with the courier's proof note and the loudest CTA in the app. |
| `TrackingPending` | **Edge case 3** — the "no tracking yet" fallback. Exports `PendingStatusCard` (reassurance copy, a framed skeleton for the unknown ETA, and the order receipt), `TrackingPlaceholderCard` (the named placeholder for the tracking slot, with a bounded "check again"), and `TrackingPendingPanel` (the "what happens next" checklist). |
| `SyncError` | Inline `role="alert"` banner for a failed background refresh, with a retry. Never blocks the page. |
| `ScenarioSwitcher` | Demo-only control. Sticky bottom bar on mobile, inline toolbar from `sm` up. |

### Sheets — `components/order-tracking/sheets/`

| Sheet | Flow |
| --- | --- |
| `TrackCourierSheet` | Hand-drawn SVG map with an animated dashed route, arrival and last-scan stats, agent row, auto-refresh switch, call / open-in-maps footer. |
| `SupportSheet` | Call / Chat / Email channels, six issue-type chips, optional 400-char note, submit → success with ticket `SUP-4821`. |
| `NotReceivedSheet` | Two-step claim: step 1 asks "did you check nearby?" (neighbour, safe place, locker, household) with an "I found it" escape hatch; step 2 picks a remedy (refund / re-deliver / investigate) and a preferred day → claim `CLM-2291` plus a resolution timeline. |
| `RequestUpdateSheet` | Delayed-order follow-up: six reason chips, optional 300-char note, submit → confirmation. |
| `ProofSheet` | Blurred doorstep-photo placeholder, evidence table (status, where, method, GPS accuracy, agent), retention-policy note, and a "This isn't my parcel" danger CTA. |

### Primitives — `components/ui/`

| Component | Purpose |
| --- | --- |
| `Button` | Polymorphic (`as`), five variants (`primary` / `secondary` / `warning` / `danger` / `ghost`), three sizes, `block`, `loading` with spinner, leading/trailing icons. |
| `Card` / `SectionHeading` | `rounded-3xl` surface plus a heading row with optional icon tile, hint text, and action slot. |
| `Icon` | Name → Lucide map so mock JSON can reference icons by string and stay serialisable. Falls back to `CircleCheck`. |
| `NowProvider` / `useNow` | The shared clock described above. |
| `Sheet` | The accessible bottom sheet described above. |
| `Skeleton` | Shimmer placeholders backed by the `.skeleton` class. |
| `Switch` | Full-row `role="switch"` toggle with icon tile, label, description, animated knob. |
| `ToastProvider` / `useToast` | Four tones, max three stacked, 4.2s auto-dismiss, `aria-live="polite"` viewport, animated countdown bar. |

---

## Design System

Styling is Tailwind CSS v4 in its CSS-first form — there is no `tailwind.config.js`. `postcss.config.mjs` loads `@tailwindcss/postcss` and `globals.css` starts with `@import "tailwindcss"`.

Tokens are declared in `globals.css`:

- **Brand scale** (teal/emerald, 50→900, `--color-brand-500: #10b98b`) — chosen to read as "in transit / on time".
- **Ink scale** (cool slate, 50→900, `--color-ink-900: #0f172a`) — text and structure.
- `--radius-4xl: 1.75rem` for the card language.
- `--font-sans` / `--font-mono` bridged from the `Geist` CSS variables via `@theme inline`.

Six keyframe animations are registered as theme tokens, so they are usable as ordinary `animate-*` utilities:

| Token | Effect | Used by |
| --- | --- | --- |
| `--animate-shimmer` | sweeping gradient | skeleton placeholders |
| `--animate-rise` | fade + `translateY(10px)` | card entrances, toasts |
| `--animate-fade` | opacity | disclosures, payment panel |
| `--animate-halo` | infinite expanding ring | status pill, current timeline step, map marker |
| `--animate-dash` | `stroke-dashoffset` loop | courier map route |
| `--animate-countdown` | `scaleX(1) → 0` | toast dismiss bar |

Only five hand-written classes exist, in `@layer components`:

- `.app-canvas` — flat background on mobile, two radial-gradient washes from tablet up so white cards read as surfaces.
- `.skeleton` — the shimmer.
- `.hatch-amber` / `.hatch-rose` — diagonal stripe fills for stuck / rescheduled timeline stages.
- `.no-scrollbar` — hides scrollbars in sheet bodies.

---

## Responsive Strategy

Layout is driven by a handful of container widths, deliberately using the awkward `sm` range rather than skipping it:

| Viewport | Layout |
| --- | --- |
| `< 640px` | Single column, sticky bottom scenario switcher, bottom sheets |
| `640–767px` (`sm`) | Timeline and courier card **side by side** (`grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]`) — the 640–767 range is width-starved for a 1:1 split, so the two widest elements pair up and the rest stacks |
| `768–1023px` (`md`) | Two-column dashboard: `md:grid-cols-1` on the inner row, outer container `sm:max-w-[700px]` |
| `> 1024px` (`lg`) | `max-w-[1180px]`, asymmetric `1fr / 1.08fr` split, tracking column on the right |
| `> 1280px` (`xl`) | `max-w-[1340px]`, looser gaps |

DOM order deliberately does **not** match visual order. The two columns are declared as `order-1 … md:order-2` and `order-2 … md:order-1`, so on mobile the timeline renders first in the DOM (keeping it above the fold and letting screen readers hit the most important content early) while on desktop it visually moves to the right-hand column.

Ten components use **container queries** (`@container` / `@sm:` / `@md:` / `@lg:` / `@xl:`), so a card adapts to the width of its own column rather than the viewport — which is what lets the same component work in a 520px mobile stack and a 640px desktop column.

Also used: `clamp()` fluid type for the hero headline, `min-h-svh` / `max-h-[90svh]`, `env(safe-area-inset-*)` on the header, switcher, and sheet footer, `text-balance`, `tabular-nums`, and `backdrop-blur`.

---

## Accessibility

- A complete `prefers-reduced-motion: reduce` block disables all six animations and every transition.
- Roles and ARIA where semantics need help: `role="alert"` on the sync error, `role="switch"` on toggles, `role="dialog"` on sheets, `role="status"` on pending states, plus `aria-live="polite"` on the toast viewport, and `aria-busy` / `aria-expanded` / `aria-pressed` throughout.
- Touch targets are at least 44px; the mobile scenario switcher uses 54px rows because it sits in the thumb zone.
- `sr-only` labels on icon-only controls, and `focus-visible` ring styles on every interactive element.
- Colour is never the only signal — delayed and not-received states also change copy, icon, and layout.

---

## Data Shape

The data contract is documented as a JSDoc block at the top of `src/data/orders.js` and is worth reading before wiring up a real endpoint:

```js
/**
 * Order
 * {
 *   id, placedAt, channel,
 *   items:  [{ id, name, variant, qty, price, icon, swatch }],
 *   address:{ label, recipient, line1, line2, city, postcode, phone },
 *   payment:{ method, provider, status, promoCode,
 *             subtotal, shipping, discount, tax, total, currency },
 *   stage:  'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered',
 *   eta:    { headline, dateISO, window, confidence, revised, previousWindow },
 *   timeline: TimelineStep[],
 *   flags:  { delayed, delivered, notReceived, trackingPending, proofOfDelivery },
 *   courier: { partner, trackingNumber, agent, lastScan, liveLocation } | null,
 *   notice, proof, pending,            // edge-case payloads, nullable
 *   lastSyncedAt, support: { phone, email, hours, responseTime }
 * }
 *
 * TimelineStep
 * { key, title, description,
 *   state: 'complete'|'current'|'delayed'|'upcoming'|'pending',
 *   at?, location?, note? }
 */
```

Helper exports alongside it: `createOrderScenarios(nowMs)`, `getScenario(scenarios, id)`, `getProgress(order)`, and — for the deep links — `resolveScenarioId(scenarios, value)` (accepts either a `stateKey` slug or a raw id, returns `null` for anything unknown) and `getStateKey(scenarios, id)`. Each scenario carries a `stateKey` (`normal-flow`, `delayed-order`, `delivered-not-received`, `no-tracking`) used to build the URL.

`src/lib/format.js` holds the ten `Intl`-based formatters used across the UI, including `formatDayLabel` (which anchors to local midnight rather than a rolling 24 hours, so "Yesterday" and "Today" are correct) and `formatTimeUntil`.

---

## Swapping Mock Data for a Real API

The mock data is isolated to a single factory function, and every component downstream is already driven by props. To go live:

1. Add a route handler at `src/app/api/orders/[id]/route.js` that returns an `Order` matching the shape above.
2. Replace `createOrderScenarios(now)` in `src/app/page.js` with `await fetch(...)`.
3. Map the real `status` value to a `flags` object and select the matching scenario UI.
4. Replace the `setTimeout` calls in the sheet submit handlers and `handleRefresh` with real requests.

Nothing in `components/` needs to change. `orders.js` says the same thing at line 44.

---

## Tech Stack

| | |
| --- | --- |
| **Framework** | Next.js 16.3.6 (App Router) |
| **UI** | React 19.2.8 |
| **Styling** | Tailwind CSS 4.3.3 (CSS-first config) |
| **Icons** | lucide-react 1.48.0 — ~55 icons, used in 23 of 33 source files |
| **Compiler** | `babel-plugin-react-compiler` 1.0.0, enabled via `reactCompiler: true` in `next.config.mjs` |
| **Linting** | ESLint 9 flat config + `eslint-config-next` (`core-web-vitals`) |
| **Language** | JavaScript (JSX). No TypeScript — `jsconfig.json` maps `@/*` → `./src/*` |

`next.config.mjs` enables only the React Compiler. The three Next.js APIs actually in use are `next/font/google` (Geist + Geist Mono), the `dynamic = "force-dynamic"` route segment config, and the `metadata` / `viewport` exports.

---

## Deliberate Non-Dependencies

The screen is dependency-light on purpose. Each of these was built in-house instead of pulled in:

| Instead of | This project uses |
| --- | --- |
| `clsx` / `tailwind-merge` | `lib/cn.js` — a four-line class joiner |
| `framer-motion` / `motion` | six hand-rolled CSS keyframes |
| `react-hot-toast` | `ui/Toast.jsx` — provider, timers, stacking, `aria-live` |
| `@headlessui` / `react-aria` / `radix` | `ui/Sheet.jsx` — manual focus trap, `Escape`, scroll lock, transitions |
| `date-fns` / `dayjs` | `lib/format.js` — the platform `Intl` |
| `@tanstack/react-query` | local `useState` + `setTimeout` |
| a maps SDK | a hand-drawn SVG placeholder with an animated route |

---

## Project Origin

Built from a two-part brief, preserved verbatim in [`AI_PROMPT_HISTORY.txt`](./AI_PROMPT_HISTORY.txt):

1. Build a production-grade, mobile-first (360–430px) order tracking screen with a visual progress timeline, prominent status and ETA, order and payment summaries, a support action centre, and an interactive state switcher — plus three mandatory edge cases: **delayed order**, **delivered but not received**, and **tracking not available yet**.
2. Make it fully responsive across mobile, tablet, and desktop with Tailwind breakpoints, evolving the desktop layout into a two-column dashboard while keeping all three edge cases working at every breakpoint.

---

## Known Rough Edges

- `public/` still contains the five unused `create-next-app` SVG templates.
- Three exports are defined but never referenced: `OrderStatusChip` (`ScreenHeader.jsx`), `SkeletonText` and `SkeletonRegion` (`Skeleton.jsx`).
- The refresh failure in the Delayed scenario is hard-coded to fail on the first attempt so the error state stays reviewable. It is a demo affordance, not a bug, but it would need to go before any real integration.
- Scenario state lives in `localStorage`, which is per-browser and per-origin. It is right for a single-order demo screen; a real app with several orders would key the store by order id or drop it in favour of the URL alone.

---

## License

MIT
