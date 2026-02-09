// app/page.js (SERVER COMPONENT)

import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const ThreatMap = nextDynamic(
  () => import("./components/ThreatMap"),
  { ssr: false }
);

const ThreatTable = nextDynamic(
  () => import("./components/ThreatTable"),
  { ssr: false }
);

export default async function Home() {
  let payload = { events: [], lastUpdated: null };

  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/events`, {
      cache: "no-store",
    });

    // ⚠️ DO NOT throw here
    payload = await res.json();
  } catch {
    // fallback already handled by API
  }

  const events = payload.events ?? [];
  const lastUpdated = payload.lastUpdated ?? null;

  return (
    <main style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>🌐 Global Threat Map</h1>
      <p>Live abuse intelligence feed (MVP)</p>

      {lastUpdated && (
        <p style={{ opacity: 0.7 }}>
          Last refreshed: {new Date(lastUpdated).toUTCString()}
        </p>
      )}

      <ThreatMap events={events} />
      <ThreatTable events={events} />
    </main>
  );
}
