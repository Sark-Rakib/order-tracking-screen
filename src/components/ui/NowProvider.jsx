"use client";

import { createContext, useContext, useEffect, useState } from "react";

/**
 * A single "now" for the whole screen, taken from the server render and then
 * kept ticking on the client.
 *
 * Without this, every relative label ("updated 38m ago", "in 9h 12m") is
 * computed against Date.now() on both sides and the two renders can disagree by
 * a minute → hydration mismatch. Threading the server's clock through context
 * removes that class of bug entirely.
 */
const NowContext = createContext(0);

const TICK_MS = 60_000;

export function NowProvider({ initialNow, children }) {
  const [now, setNow] = useState(initialNow);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  return <NowContext.Provider value={now}>{children}</NowContext.Provider>;
}

export function useNow() {
  return useContext(NowContext);
}
