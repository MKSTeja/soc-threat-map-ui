// app/page.js (SERVER COMPONENT)

import ThreatTable from "./components/ThreatTable";
import ThreatMap from "./components/ThreatMap";

export const dynamic = "force-dynamic";

export default async function Home() {
  const fetchedAt = new Date(); // ⏱ capture refresh time

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/events`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to load threat feed");
  }

  const events = await res.json();

  return (
    <main style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>🌐 Global Threat Map</h1>
      <p>Live abuse intelligence feed (MVP)</p>

      {/* 🕒 Last refresh indicator */}
      <p style={{ fontSize: 12, opacity: 0.7 }}>
        Last updated: {fetchedAt.toUTCString()}
      </p>

      <ThreatMap events={events} />
      <br />
      <ThreatTable events={events} />
    </main>
  );
}
