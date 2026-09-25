import { OrderTrackingScreen } from "@/components/order-tracking/OrderTrackingScreen";
import { DEFAULT_SCENARIO_ID, createOrderScenarios, resolveScenarioId } from "@/data/orders";
import { readServerClock } from "@/lib/clock";

// A real app would fetch the order here; the mock is timestamped per request so
// "arriving today" stays true, and the same clock is handed to the client to
// keep the server and hydrated markup identical.
export const dynamic = "force-dynamic";

/**
 * `?state=` is resolved on the server rather than in an effect, so a refresh, a
 * new tab and a shared link all render the requested scenario on the very first
 * paint — no flash of the wrong view and no hydration mismatch. An unrecognised
 * value falls back to the default instead of erroring, because this is a demo
 * deep link and a bad one should still show a working screen.
 */
export default async function Home({ searchParams }) {
  const params = await searchParams;
  const now = readServerClock();
  const scenarios = createOrderScenarios(now);

  const requestedState = typeof params?.state === "string" ? params.state : null;
  const initialScenarioId = resolveScenarioId(scenarios, requestedState) ?? DEFAULT_SCENARIO_ID;

  return (
    <OrderTrackingScreen
      scenarios={scenarios}
      initialScenarioId={initialScenarioId}
      initialStateParam={requestedState}
      initialNow={now}
    />
  );
}
