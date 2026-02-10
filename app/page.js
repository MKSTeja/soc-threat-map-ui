// app/page.js (SERVER COMPONENT)

import ThreatDashboard from "./components/ThreatDashboard";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function Home() {
  let payload;

  try {
    const headersList = headers();
    const host = headersList.get("host");

    if (!host) {
      throw new Error("Host header missing");
    }

    const protocol =
      process.env.NODE_ENV === "development" ? "http" : "https";

    const apiUrl = `${protocol}://${host}/api/events`;

    const res = await fetch(apiUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Threat feed API failed (${res.status})`);
    }

    payload = await res.json();
  } catch (err) {
    return (
      <main style={{ padding: 24, fontFamily: "monospace" }}>
        <h1>⚠️ Threat Feed Error</h1>
        <pre>{String(err.message)}</pre>
      </main>
    );
  }

  /**
   * API contract — DO NOT reshape
   */
  const {
    events = [],
    geoSummary = [],
    lastUpdated = null,
    source = "unknown",
  } = payload ?? {};

  return (
    <ThreatDashboard
      events={events}
      geoSummary={geoSummary}
      lastUpdated={lastUpdated}
      source={source}
    />
  );
}
