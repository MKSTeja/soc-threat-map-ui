// app/page.js (SERVER COMPONENT)

import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

// Client-only components
const ThreatMap = nextDynamic(
  () => import("./components/ThreatMap"),
  { ssr: false }
);

const ThreatTable = nextDynamic(
  () => import("./components/ThreatTable"),
  { ssr: false }
);

export default async function Home() {
  let payload;

  try {
    // ✅ Correct internal API call (App Router safe)
    const res = await fetch("/api/events"), {
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

  // Support both response shapes
  const events = Array.isArray(payload)
    ? payload
    : payload.events ?? [];

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
