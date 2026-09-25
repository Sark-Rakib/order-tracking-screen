"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Headphones, MessageCircle, Navigation, PackageX } from "lucide-react";
import { getScenario, getStateKey, resolveScenarioId } from "@/data/orders";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/cn";
import {
  getServerStoredScenarioId,
  getStoredScenarioId,
  subscribeToStoredScenarioId,
  writeStateParam,
  writeStoredScenarioId,
} from "@/lib/scenarioState";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { NowProvider } from "@/components/ui/NowProvider";
import { ScreenHeader } from "@/components/order-tracking/ScreenHeader";
import { StatusHero } from "@/components/order-tracking/StatusHero";
import { DelayedNotice } from "@/components/order-tracking/DelayedNotice";
import { NotReceivedPanel } from "@/components/order-tracking/NotReceivedPanel";
import { TrackingTimeline } from "@/components/order-tracking/TrackingTimeline";
import { PendingStatusCard, TrackingPendingPanel, TrackingPlaceholderCard } from "@/components/order-tracking/TrackingPending";
import { CourierCard } from "@/components/order-tracking/CourierCard";
import { DeliveryCard } from "@/components/order-tracking/DeliveryCard";
import { OrderSummary } from "@/components/order-tracking/OrderSummary";
import { PaymentSummary } from "@/components/order-tracking/PaymentSummary";
import { SupportActions } from "@/components/order-tracking/SupportActions";
import { ScenarioSwitcher } from "@/components/order-tracking/ScenarioSwitcher";
import { SyncError } from "@/components/order-tracking/SyncError";
import { TrackCourierSheet } from "@/components/order-tracking/sheets/TrackCourierSheet";
import { SupportSheet } from "@/components/order-tracking/sheets/SupportSheet";
import { NotReceivedSheet } from "@/components/order-tracking/sheets/NotReceivedSheet";
import { RequestUpdateSheet } from "@/components/order-tracking/sheets/RequestUpdateSheet";
import { ProofSheet } from "@/components/order-tracking/sheets/ProofSheet";

/**
 * Screen orchestrator.
 *
 * Owns exactly three things:
 *  1. which mock scenario is on screen (the demo switcher),
 *  2. which sheet is open,
 *  3. the background-sync state machine (loading → success | error).
 *
 * Everything below is a pure function of `order`, so swapping this file for a
 * real data source changes nothing in the presentational layer.
 */

const SHEETS = {
  courier: TrackCourierSheet,
  support: SupportSheet,
  notReceived: NotReceivedSheet,
  requestUpdate: RequestUpdateSheet,
  proof: ProofSheet,
};

function Tracker({ scenarios, initialScenarioId, initialStateParam }) {
  const { toast } = useToast();
  const pathname = usePathname();
  const [sheet, setSheet] = useState(null); // { name, props } while open
  // Keeps the last sheet mounted for the length of its exit transition.
  const [closingSheet, setClosingSheet] = useState(null);
  const [sync, setSync] = useState({ status: "idle", at: null, attempts: 0 });

  /* ── scenario persistence ────────────────────────────────────────────────────
   * The URL is the source of truth on a fresh load: the server already read
   * `?state=` and rendered the right scenario, so a refresh, a new tab and a
   * copied link all land correctly on the first paint.
   *
   * localStorage covers a bare `/`. It is read through `useSyncExternalStore`
   * rather than copied into state from an effect, because its server snapshot is
   * `null` — the first client render therefore matches the server HTML exactly,
   * and React applies the restore on the next pass without a cascading render.
   *
   * `pinnedId` is the local override. While it is `null` the persisted value (or
   * the URL) is in charge; the moment the user picks a scenario by hand, the
   * picker wins for the rest of this page's life.
   * ─────────────────────────────────────────────────────────────────────────── */

  const storedId = useSyncExternalStore(
    subscribeToStoredScenarioId,
    getStoredScenarioId,
    getServerStoredScenarioId,
  );
  const [pinnedId, setPinnedId] = useState(null);

  // Note the ternary, not `!initialStateParam && …`: a failed `&&` guard yields
  // `false`, which is not nullish and would win the `??` chain below, silently
  // pinning every deep link to the first scenario.
  const restoredId = initialStateParam ? null : resolveScenarioId(scenarios, storedId);
  const scenarioId = pinnedId ?? restoredId ?? initialScenarioId;

  const scenario = getScenario(scenarios, scenarioId);
  const order = scenario.order;
  const syncState = { ...sync, at: sync.at ?? order.lastSyncedAt };
  const { flags } = order;

  // Writing to the two external stores is a genuine synchronisation, so this is
  // what the effect is for. It also canonicalises the URL on a bare first visit,
  // which makes the next refresh URL-driven rather than storage-driven.
  useEffect(() => {
    // Effects run *after* hydration, so the real stored value is readable here
    // even though the first render had to use the null server snapshot. That gap
    // is the dangerous one: writing `scenarioId` blindly on a bare visit would
    // persist the default over the very value we are one tick away from
    // restoring, and the restore would then be a no-op. So while a restore is
    // still in flight, hold off — the effect re-runs the moment it lands and
    // writes then. A scenario the user picked by hand can never be a pending
    // restore, which is why `pinnedId` short-circuits the check.
    const restoreTarget = initialStateParam ? null : resolveScenarioId(scenarios, getStoredScenarioId());
    if (pinnedId === null && restoreTarget !== null && restoreTarget !== scenarioId) return;

    writeStoredScenarioId(scenarioId);
    writeStateParam(pathname, getStateKey(scenarios, scenarioId));
  }, [scenarioId, scenarios, pathname, initialStateParam, pinnedId]);

  /* ── actions ──────────────────────────────────────────────────────────── */

  const openSheet = (name, props = {}) => {
    const next = { name, props };
    setSheet(next);
    setClosingSheet(next);
  };
  const closeSheet = () => setSheet(null);

  const copyToClipboard = async (value, message) => {
    const copied = await copyText(value);
    if (copied) {
      toast({ tone: "success", title: message, description: value });
    } else {
      toast({ tone: "warning", title: "Copy blocked by the browser", description: value });
    }
  };

  const handleRefresh = () => {
    if (sync.status === "loading") return;
    const attempt = sync.attempts + 1;
    setSync((current) => ({ ...current, status: "loading", attempts: attempt }));

    setTimeout(() => {
      // The delayed scenario fails its first refresh so the error state is
      // always reachable for review.
      const shouldFail = scenarioId === "delayed" && attempt === 1;

      if (shouldFail) {
        setSync((current) => ({ ...current, status: "error" }));
        return;
      }
      setSync((current) => ({ ...current, status: "idle", at: new Date().toISOString() }));
      toast({
        tone: "success",
        title: "Tracking is up to date",
        description: `Synced with ${order.courier?.partner ?? "the warehouse"}.`,
      });
    }, 1200);
  };

  const handleScenarioChange = (nextId) => {
    if (nextId === scenarioId) return;
    const next = getScenario(scenarios, nextId);
    setPinnedId(nextId);
    setSheet(null);
    setClosingSheet(null);
    setSync({ status: "idle", at: null, attempts: 0 });
    toast({ tone: "info", title: next.title, description: next.description });
  };

  const contactSupport = (issue = "late") => openSheet("support", { defaultIssue: issue });

  const openNotReceived = () => openSheet("notReceived");

  const notify = (title, description, tone = "info") => toast({ title, description, tone });

  const handleCall = () =>
    order.courier
      ? notify("Calling your courier", `${order.courier.agent.name} · ${order.courier.agent.phone}`)
      : notify("Calling support", order.support.phone);

  const handleChat = () =>
    order.courier
      ? notify("Chat opened", `${order.courier.agent.name} replies in about 4 minutes`)
      : notify("Connecting you", "Joining the support queue… about 2 minutes");

  const handleEmail = () => notify("Email ready", order.support.email);

  /* ── per-scenario primary action ──────────────────────────────────────── */

  const primaryAction = flags.notReceived
    ? { label: "I didn’t receive this order", icon: PackageX, variant: "danger", onClick: openNotReceived }
    : flags.delayed
      ? { label: "Request an update", icon: MessageCircle, variant: "warning", onClick: () => openSheet("requestUpdate") }
      : flags.trackingPending
        ? { label: "Ask about this order", icon: Headphones, variant: "primary", onClick: () => openSheet("support") }
        : { label: "Track courier live", icon: Navigation, variant: "primary", onClick: () => openSheet("courier") };

  // The closing sheet stays mounted briefly so it can animate back down.
  const activeSheet = sheet ?? closingSheet;
  const ActiveSheet = activeSheet ? SHEETS[activeSheet.name] : null;

  /* ── column contents ───────────────────────────────────────────────────────
   * Two independent stacks so each one can be a real column on wide screens and
   * a plain stack on a phone. The tracking stack comes first in the DOM because
   * on mobile the timeline is the most important thing above the fold; the
   * `md:order-*` classes swap the visual sides without touching that order.
   * ───────────────────────────────────────────────────────────────────────── */

  const statusStack = (
    <div className="order-1 flex min-w-0 flex-col gap-4 sm:gap-5 md:order-2">
      {flags.trackingPending ? (
        <PendingStatusCard
          order={order}
          onContactSupport={() => openSheet("support")}
          onCopyId={() => copyToClipboard(order.id, "Order id copied")}
        />
      ) : (
        <StatusHero order={order} sync={syncState} onRefresh={handleRefresh} />
      )}

      {sync.status === "error" && <SyncError sync={syncState} order={order} onRetry={handleRefresh} />}

      {flags.delayed && (
        <DelayedNotice
          order={order}
          onTrackCourier={() => openSheet("courier")}
          onRequestUpdate={() => openSheet("requestUpdate")}
          onContactSupport={() => openSheet("support")}
        />
      )}

      {flags.notReceived && (
        <NotReceivedPanel
          order={order}
          onReport={openNotReceived}
          onChatCourier={() => notify("Chat opened", `${order.courier.agent.name} can confirm the hand-off`, "info")}
        />
      )}

      {/* Timeline + courier sit side by side on tablet, stacked again on desktop
          so the tracker keeps a full-height column of its own. The sm range
          (640-767px) is width-starved for a 1:1 split: the timeline needs the
          extra room for its rail, step titles and timestamps, while the courier
          card only holds a short action stack. */}
      <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] sm:gap-5 md:grid-cols-1 xl:gap-6">
        {flags.trackingPending ? (
          <>
            <div className="min-w-0">
              <TrackingPendingPanel
                order={order}
                onNotifyChange={(enabled) =>
                  notify(
                    enabled ? "Alerts switched on" : "Alerts switched off",
                    enabled
                      ? "We will notify you the moment tracking goes live"
                      : "You can re-enable alerts from the notification settings",
                    enabled ? "success" : "info",
                  )
                }
              />
            </div>
            {/* No courier has been assigned yet, so the second column is a named
                placeholder rather than a bare shimmer: a blank card here read as
                a page stuck loading. */}
            <div className="min-w-0">
              <TrackingPlaceholderCard
                order={order}
                onContactSupport={() => openSheet("support")}
                onChecked={() =>
                  notify(
                    "Still preparing",
                    "No new scans yet — we’ll email you the moment your parcel is on the move",
                    "info",
                  )
                }
              />
            </div>
          </>
        ) : (
          <div className="min-w-0">
            <TrackingTimeline order={order} onViewProof={() => openSheet("proof")} />
          </div>
        )}

        {order.courier && (
          <div className="min-w-0">
            <CourierCard
              order={order}
              onTrack={() => openSheet("courier")}
              onCall={handleCall}
              onChat={handleChat}
              onCopyTracking={() =>
                copyToClipboard(order.courier.trackingNumber, "Tracking number copied")
              }
            />
          </div>
        )}
      </div>
    </div>
  );

  const detailStack = (
    <div className="order-2 flex min-w-0 flex-col gap-4 sm:gap-5 md:order-1">
      <DeliveryCard
        order={order}
        onTrackCourier={() => openSheet("courier")}
        onContactSupport={() => openSheet("support")}
      />

      <OrderSummary
        order={order}
        onViewInvoice={() => notify("Invoice ready", `Sending ${order.id}.pdf to your email`, "success")}
      />

      <PaymentSummary order={order} />

      <SupportActions
        order={order}
        primary={primaryAction}
        onContactSupport={() => openSheet("support")}
        onReportIssue={() => contactSupport(flags.notReceived ? "missing" : "late")}
        onCall={handleCall}
        onChat={handleChat}
        onEmail={handleEmail}
      />
    </div>
  );

  return (
    <div className="app-canvas min-h-svh">
      {/* Page container: phone-width on mobile, dashboard-width from md up. */}
      <div
        className={cn(
          "mx-auto flex min-h-svh w-full max-w-[520px] flex-col",
          "sm:max-w-[700px] sm:px-6 sm:pb-6 sm:pt-2",
          "lg:max-w-[1180px] lg:px-8 lg:pb-8 lg:pt-4",
          "xl:max-w-[1340px] xl:px-10",
        )}
      >
        <ScreenHeader
          order={order}
          itemCount={order.items.reduce((sum, item) => sum + item.qty, 0)}
          onBack={() => notify("Back to My Orders", "Demo build — there is no order list here yet")}
          onHelp={() => openSheet("support")}
          onCopyId={() => copyToClipboard(order.id, "Order id copied")}
        />

        {/* key remounts on scenario change: scroll resets, entrance animation replays */}
        <main key={scenario.id} className="flex-1 px-4 pt-4 pb-4 sm:px-0 sm:pt-5 sm:pb-2 lg:pt-6">
          <div
            className={cn(
              "animate-rise grid grid-cols-1 items-start gap-4 sm:gap-5",
              "md:grid-cols-2 md:gap-6",
              "xl:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] xl:gap-8",
            )}
          >
            {statusStack}
            {detailStack}
          </div>

          <ScenarioSwitcher scenarios={scenarios} activeId={scenario.id} onChange={handleScenarioChange} />
        </main>
      </div>

      {ActiveSheet && (
        <ActiveSheet
          key={activeSheet.name}
          open={Boolean(sheet)}
          onClose={closeSheet}
          order={order}
          onReport={openNotReceived}
          {...activeSheet.props}
        />
      )}
    </div>
  );
}

export function OrderTrackingScreen({ scenarios, initialScenarioId, initialStateParam, initialNow }) {
  return (
    <NowProvider initialNow={initialNow}>
      <ToastProvider>
        <Tracker
          scenarios={scenarios}
          initialScenarioId={initialScenarioId}
          initialStateParam={initialStateParam}
        />
      </ToastProvider>
    </NowProvider>
  );
}
