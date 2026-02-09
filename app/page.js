// app/page.js (SERVER COMPONENT)

import ThreatTable from "./components/ThreatTable";
import ThreatMap from "./components/ThreatMap";
import FeedHealth from "./components/FeedHealth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/events`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to load threat feed");
  }

  const { events, lastUpdated, status } = await res.json();

  return (
    <main style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>🌐 Global Threat Map</h1>
      <p>Live abuse intelligence feed (MVP)</p>

      <FeedHealth lastUpdated={lastUpdated} status={status} />

      <ThreatMap events={events} />
      <ThreatTable events={events} />
    </main>
  );
}
