import { OrderTrackingScreen } from "@/components/order-tracking/OrderTrackingScreen";
import { DEFAULT_SCENARIO_ID, createOrderScenarios } from "@/data/orders";
import { readServerClock } from "@/lib/clock";

// A real app would fetch the order here; the mock is timestamped per request so
// "arriving today" stays true, and the same clock is handed to the client to
// keep the server and hydrated markup identical.
export const dynamic = "force-dynamic";

export default function Home() {
  const now = readServerClock();
  const scenarios = createOrderScenarios(now);

  return <OrderTrackingScreen scenarios={scenarios} initialScenarioId={DEFAULT_SCENARIO_ID} initialNow={now} />;
}
