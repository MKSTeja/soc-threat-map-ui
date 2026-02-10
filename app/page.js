// app/page.js (SERVER COMPONENT)

import ThreatDashboard from "./components/ThreatDashboard";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function Home() {
  let payload;

  try {
    const headersList = headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const apiUrl = `${protocol}://${host}/api/events`;

    const res = await fetch(apiUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Threat feed API failed");
    }

    payload = await res.json();
  } catch (err) {
    return (
      <main style={{ padding: 24, fontFamily: "monospace" }}>
        <h1>⚠️ Threat Feed Error</h1>
        <pre>{err.message}</pre>
      </main>
    );
  }

  /**
   * DO NOT reshape data here.
   * Treat API response as a contract.
   */
  const {
    events = [],
    geoSummary = [],
    lastUpdated = null,
    source = "unknown",
  } = payload ?? {};

  return (
    <ThreatDashboard
      events={events}           // raw events → table
      geoSummary={geoSummary}   // aggregated → map
      lastUpdated={lastUpdated}
      source={source}
    />
  );
}
