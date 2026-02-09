// app/page.js (SERVER COMPONENT)

import nextDynamic from "next/dynamic";
import FeedHealth from "./components/FeedHealth"; // ✅ ADD

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
    // Build absolute URL correctly (server-safe)
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/events`, {
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

  // ✅ SAFE normalization (unchanged)
  const events = Array.isArray(payload)
    ? payload
    : payload.events ?? [];

  const lastUpdated = payload.lastUpdated ?? null;
  const source = payload.source ?? "unknown"; // ✅ ADD (safe default)

  return (
    <main style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>🌐 Global Threat Map</h1>
      <p>Live abuse intelligence feed (MVP)</p>

      {/* ✅ ADD: Feed health banner */}
      <FeedHealth
        lastUpdated={lastUpdated}
        source={source}
      />

      <ThreatMap events={events} />
      <ThreatTable events={events} />
    </main>
  );
}
