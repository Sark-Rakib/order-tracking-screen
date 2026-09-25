/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MOCK DATA — the single source of truth for the tracking screen.
 *
 * Every scenario below is the *same order* viewed through a different
 * fulfilment outcome, which is exactly how a real API would model it: one
 * `Order` shape, several `status` values.
 *
 * `createOrderScenarios(nowMs)` returns the four demo orders, all timestamped
 * relative to `nowMs`. The page component (a server component) calls it with
 * `Date.now()` and passes the result down as a serialisable prop, so the server
 * HTML and the hydrated client render agree byte for byte.
 *
 * Order
 * ─────
 * {
 *   id: string,                    // human order id, e.g. "OT-8471-2290"
 *   placedAt: ISOString,
 *   channel: string,               // where the order came from
 *   items: Array<{                 // product summary
 *     id, name, variant, qty, price, icon, swatch
 *   }>,
 *   address: { label, recipient, line1, line2, city, postcode, phone },
 *   payment: { method, provider, status, promoCode, subtotal, shipping, discount, tax, total, currency },
 *   stage: 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered',
 *   eta: { headline, dateISO, window, confidence, revised, previousWindow },
 *   timeline: TimelineStep[],
 *   flags: { delayed, delivered, notReceived, trackingPending, proofOfDelivery },
 *   courier: { partner, trackingNumber, agent, lastScan, liveLocation } | null,
 *   notice: {...} | null,          // amber banner content
 *   proof: {...} | null,          // proof of delivery for "not received"
 *   pending: {...} | null,        // "tracking not available yet" content
 *   lastSyncedAt: ISOString,
 *   support: { phone, email, hours, responseTime }
 * }
 *
 * TimelineStep
 * ────────────
 * {
 *   key, title, description,
 *   state: 'complete' | 'current' | 'delayed' | 'upcoming' | 'pending',
 *   at?: ISOString, location?: string, note?: string
 * }
 *
 * Swap `createOrderScenarios()` for `fetch('/api/orders/:id')` and every
 * component in this app keeps working unchanged.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * The five fulfilment stages. The first three map to "Processing" in the
 * product spec, the last two to "Shipped → Out for delivery → Delivered".
 */
export const STAGES = [
  { key: "confirmed", label: "Confirmed", short: "Confirmed", icon: "receipt" },
  { key: "packed", label: "Packed", short: "Packed", icon: "box" },
  { key: "shipped", label: "Shipped", short: "Shipped", icon: "truck" },
  { key: "out_for_delivery", label: "Out for delivery", short: "Out", icon: "bike" },
  { key: "delivered", label: "Delivered", short: "Done", icon: "house" },
];

export const STAGE_INDEX = STAGES.reduce((acc, stage, index) => {
  acc[stage.key] = index;
  return acc;
}, {});

export const DEFAULT_SCENARIO_ID = "normal";

/* ── Static catalogue data ─────────────────────────────────────────────────── */

const items = [
  {
    id: "itm_9014",
    name: "Aurora Pro Noise-Cancelling Headphones",
    variant: "Midnight black · SKU AUR-NC-02",
    qty: 1,
    price: 249,
    icon: "headphones",
    swatch: "from-slate-700 via-slate-800 to-slate-950",
  },
  {
    id: "itm_2287",
    name: "Merino Everyday Crew Socks",
    variant: "Charcoal · M/L · 3-pack",
    qty: 2,
    price: 32,
    icon: "shirt",
    swatch: "from-brand-600 via-brand-700 to-brand-900",
  },
  {
    id: "itm_5503",
    name: "Braided USB-C Cable, 2m",
    variant: "Graphite · 100W charging",
    qty: 1,
    price: 19,
    icon: "plug",
    swatch: "from-amber-400 via-orange-500 to-rose-500",
  },
];

const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
const shipping = 0; // free above the store threshold
const discount = 15; // WELCOME15
const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
const total = Math.round((subtotal - discount + tax + shipping) * 100) / 100;

const support = {
  phone: "+1 (800) 555-0142",
  email: "orders@lumen.market",
  hours: "24/7 for open orders, 8 AM – 10 PM for claims",
  responseTime: "under 2 hours",
};

const address = {
  label: "Home",
  recipient: "Ayesha Rahman",
  line1: "Flat 4B, Rose Garden Residency",
  line2: "House 22, Road 7, Dhanmondi",
  city: "Dhaka 1209",
  postcode: "1209",
  phone: "+880 1712 345 678",
};

const courierAgent = {
  name: "Rifat H.",
  phone: "+880 1811 223 344",
  rating: 4.9,
};

/* ── Scenario factory ──────────────────────────────────────────────────────── */

export function createOrderScenarios(nowMs = Date.now()) {
  /** ISO timestamp relative to `nowMs`, so the mock always looks live. */
  const at = (offset) => new Date(nowMs + offset).toISOString();

  /** Calendar-day offsets keep "Today / Tomorrow" labels honest. */
  const dayFromNow = (days, hour = 14, minute = 0) => {
    const date = new Date(nowMs + days * DAY);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
  };

  const baseOrder = {
    id: "OT-8471-2290",
    placedAt: at(-2 * DAY - 5 * HOUR),
    channel: "iOS app · v4.2.1",
    items,
    address,
    payment: {
      method: "Visa •••• 4242",
      provider: "Stripe",
      status: "Paid",
      promoCode: "WELCOME15",
      subtotal,
      shipping,
      discount,
      tax,
      total,
      currency: "USD",
    },
    support,
  };

  /* 1 ── Normal flow: out for delivery, arriving today --------------------- */

  const normalOrder = {
    ...baseOrder,
    stage: "out_for_delivery",
    eta: {
      headline: "Arriving today",
      dateISO: dayFromNow(0, 18, 0),
      window: "6:00 PM – 8:00 PM",
      confidence: "high",
      revised: false,
    },
    courier: {
      partner: "Apex Express",
      trackingNumber: "APX-4410-88231",
      agent: { ...courierAgent, vehicle: "Motorcycle · BRT-8891" },
      lastScan: at(-38 * MINUTE),
      liveLocation: { label: "2.4 km away · Near Green Road", stopsAway: 12 },
    },
    flags: { delayed: false, delivered: false, notReceived: false, trackingPending: false },
    notice: null,
    proof: null,
    pending: null,
    lastSyncedAt: at(-38 * MINUTE),
    timeline: [
      {
        key: "confirmed",
        title: "Order confirmed",
        description: "Payment captured and the warehouse started preparing your items.",
        state: "complete",
        at: at(-2 * DAY - 5 * HOUR),
        location: "Lumen app",
        note: "Paid with Visa •••• 4242",
      },
      {
        key: "packed",
        title: "Packed & labelled",
        description: "All three items picked, quality-checked and sealed in a tamper bag.",
        state: "complete",
        at: at(-1 * DAY - 6 * HOUR),
        location: "Dhaka fulfilment centre · Bay 4",
      },
      {
        key: "shipped",
        title: "Shipped",
        description: "Departed the regional hub and scanned into the courier network.",
        state: "complete",
        at: at(-9 * HOUR),
        location: "Gazipur sorting hub",
        note: "Container APX-7721 · 1 of 1",
      },
      {
        key: "out_for_delivery",
        title: "Out for delivery",
        description: "Your courier is on the route and about 12 stops away.",
        state: "current",
        at: at(-2 * HOUR),
        location: "Dhanmondi 27",
        note: "Live location sharing is on",
      },
      {
        key: "delivered",
        title: "Delivered",
        description: "Expected by 6:00 PM – 8:00 PM today.",
        state: "upcoming",
      },
    ],
  };

  /* 2 ── Edge case: delayed order ------------------------------------------- */

  const delayedOrder = {
    ...normalOrder,
    stage: "shipped",
    eta: {
      headline: "Delayed by 1 day",
      dateISO: dayFromNow(1, 14, 0),
      window: "2:00 PM – 4:00 PM",
      confidence: "medium",
      revised: true,
      previousWindow: "Today, 6:00 PM – 8:00 PM",
    },
    courier: {
      partner: "Apex Express",
      trackingNumber: "APX-4410-88231",
      agent: { ...courierAgent, vehicle: "Van · BRT-8891" },
      lastScan: at(-11 * HOUR),
      liveLocation: { label: "Held at Gazipur hub", stopsAway: null },
    },
    flags: { delayed: true, delivered: false, notReceived: false, trackingPending: false },
    notice: {
      severity: "warning",
      title: "Your delivery is running late",
      body: "A backlog at the Gazipur hub pushed this order back by one day. The parcel is intact and still moving — the courier confirmed the revised slot.",
      reason: "Hub congestion · weather hold",
      revisedBy: "Rescheduled automatically 6 hours ago",
    },
    proof: null,
    pending: null,
    lastSyncedAt: at(-11 * HOUR),
    timeline: [
      {
        key: "confirmed",
        title: "Order confirmed",
        description: "Payment captured and the warehouse started preparing your items.",
        state: "complete",
        at: at(-2 * DAY - 5 * HOUR),
        location: "Lumen app",
      },
      {
        key: "packed",
        title: "Packed & labelled",
        description: "Sealed in a tamper bag and handed to the courier.",
        state: "complete",
        at: at(-1 * DAY - 6 * HOUR),
        location: "Dhaka fulfilment centre · Bay 4",
      },
      {
        key: "shipped",
        title: "In transit — held at hub",
        description: "Arrived at the sorting hub but could not be loaded onto the delivery van.",
        state: "current",
        at: at(-11 * HOUR),
        location: "Gazipur sorting hub · Dock 2",
        note: "Exception code HUB_BACKLOG — cleared by the hub team",
      },
      {
        key: "out_for_delivery",
        title: "Out for delivery",
        description: "Now expected to start tomorrow morning.",
        state: "delayed",
      },
      {
        key: "delivered",
        title: "Delivered",
        description: "New estimate: tomorrow, 2:00 PM – 4:00 PM.",
        state: "delayed",
      },
    ],
  };

  /* 3 ── Edge case: delivered but not received ------------------------------ */

  const notReceivedOrder = {
    ...normalOrder,
    stage: "delivered",
    eta: {
      headline: "Marked as delivered",
      dateISO: at(-3 * DAY - 2 * HOUR),
      window: "2:14 PM, 3 days ago",
      confidence: "high",
      revised: false,
    },
    courier: {
      partner: "Apex Express",
      trackingNumber: "APX-4410-88231",
      agent: { ...courierAgent, vehicle: "Motorcycle · BRT-8891" },
      lastScan: at(-3 * DAY - 2 * HOUR),
      liveLocation: null,
    },
    flags: {
      delayed: false,
      delivered: true,
      notReceived: true,
      trackingPending: false,
      proofOfDelivery: true,
    },
    notice: null,
    proof: {
      method: "Photo + geofence",
      capturedAt: at(-3 * DAY - 2 * HOUR),
      note: "Left with a neighbour at Flat 4C, Rose Garden Residency",
      gpsAccuracy: "±12 m",
      imageAvailable: true,
    },
    pending: null,
    lastSyncedAt: at(-3 * DAY - 2 * HOUR),
    timeline: [
      {
        key: "confirmed",
        title: "Order confirmed",
        description: "Payment captured and the warehouse started preparing your items.",
        state: "complete",
        at: at(-2 * DAY - 5 * HOUR),
      },
      {
        key: "packed",
        title: "Packed & labelled",
        description: "Sealed and handed to the courier.",
        state: "complete",
        at: at(-1 * DAY - 6 * HOUR),
      },
      {
        key: "shipped",
        title: "Shipped",
        description: "Departed the regional hub in good condition.",
        state: "complete",
        at: at(-9 * HOUR - 1 * DAY),
        location: "Gazipur sorting hub",
      },
      {
        key: "out_for_delivery",
        title: "Out for delivery",
        description: "Courier started the route in the early afternoon.",
        state: "complete",
        at: at(-3 * DAY - 5 * HOUR),
        location: "Dhanmondi 27",
      },
      {
        key: "delivered",
        title: "Delivered",
        description: "Courier marked the parcel delivered and shared proof.",
        state: "complete",
        at: at(-3 * DAY - 2 * HOUR),
        location: "Flat 4C, Rose Garden Residency",
        note: "Proof: doorstep photo · ±12 m accuracy",
      },
    ],
  };

  /* 4 ── Edge case: tracking not available yet ------------------------------ */

  const trackingPendingOrder = {
    ...baseOrder,
    stage: "packed",
    eta: {
      headline: "Preparing your item",
      dateISO: dayFromNow(2, 12, 0),
      window: "Fri, 26 Sep · 12:00 PM – 4:00 PM",
      confidence: "low",
      revised: false,
    },
    courier: null,
    flags: {
      delayed: false,
      delivered: false,
      notReceived: false,
      trackingPending: true,
      proofOfDelivery: false,
    },
    notice: null,
    proof: null,
    pending: {
      headline: "Your order has been placed!",
      body: "Tracking details will be updated within 24 hours — usually much sooner. We’ll email you the moment the courier scans your parcel, and nothing is needed from you in the meantime.",
      availableByISO: at(9 * HOUR),
      checkpoints: [
        { label: "Order confirmed", state: "done" },
        { label: "Picking & packing", state: "current" },
        { label: "Courier pickup & scan", state: "upcoming" },
        { label: "Live tracking", state: "upcoming" },
      ],
    },
    lastSyncedAt: at(-4 * HOUR),
    timeline: [
      {
        key: "confirmed",
        title: "Order confirmed",
        description: "Payment captured. We are getting your items ready.",
        state: "complete",
        at: at(-5 * HOUR),
        location: "Lumen app",
      },
      {
        key: "packed",
        title: "Picking & packing",
        description: "An associate is picking your items from the warehouse now.",
        state: "current",
        at: at(-45 * MINUTE),
        location: "Dhaka fulfilment centre",
      },
      {
        key: "shipped",
        title: "Handed to courier",
        description: "Waiting for the courier scan that creates your tracking number.",
        state: "pending",
      },
      {
        key: "out_for_delivery",
        title: "Out for delivery",
        description: "Available once tracking goes live.",
        state: "pending",
      },
      {
        key: "delivered",
        title: "Delivered",
        description: "Available once tracking goes live.",
        state: "pending",
      },
    ],
  };

  /* `stateKey` is the URL-facing slug for each scenario, so a shared link
   * reads `?state=no-tracking` instead of leaking the internal id. `?state=`
   * also accepts the raw `id`, which keeps old links working. */
  return [
    {
      id: "normal",
      stateKey: "normal-flow",
      tabLabel: "Normal",
      tabIcon: "circle-check",
      title: "On the way",
      description: "Out for delivery, arriving today",
      order: normalOrder,
    },
    {
      id: "delayed",
      stateKey: "delayed-order",
      tabLabel: "Delayed",
      tabIcon: "triangle-alert",
      title: "Delayed order",
      description: "ETA passed, rescheduled by the hub",
      order: delayedOrder,
    },
    {
      id: "not-received",
      stateKey: "delivered-not-received",
      tabLabel: "Not got it",
      tabIcon: "package-x",
      title: "Delivered, not received",
      description: "Courier says delivered, you don't have it",
      order: notReceivedOrder,
    },
    {
      id: "tracking-pending",
      stateKey: "no-tracking",
      tabLabel: "No tracking",
      tabIcon: "clock",
      title: "Tracking unavailable",
      description: "Order exists, tracking not generated yet",
      order: trackingPendingOrder,
    },
  ];
}

export function getScenario(scenarios, id) {
  return scenarios.find((scenario) => scenario.id === id) ?? scenarios[0];
}

/**
 * Resolve a `?state=` value to a scenario id, accepting either the URL slug or
 * the raw id. Returns `null` for anything unrecognised so the caller can fall
 * back deliberately — a bad deep link should not 404 or crash the screen.
 */
export function resolveScenarioId(scenarios, value) {
  if (typeof value !== "string") return null;
  const needle = value.trim().toLowerCase();
  if (!needle) return null;
  const match = scenarios.find(
    (scenario) => scenario.stateKey === needle || scenario.id.toLowerCase() === needle,
  );
  return match?.id ?? null;
}

/** The canonical `?state=` value for a scenario id. */
export function getStateKey(scenarios, id) {
  return scenarios.find((scenario) => scenario.id === id)?.stateKey ?? null;
}

/** Progress 0–1 for the hero rail, derived from the current stage. */
export function getProgress(order) {
  const index = STAGE_INDEX[order.stage] ?? 0;
  return (index + 1) / STAGES.length;
}
