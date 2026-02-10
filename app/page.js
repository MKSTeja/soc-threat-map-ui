// app/page.js (SERVER COMPONENT)

import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

// Client dashboard
const ThreatDashboard = nextDynamic(
  () => import("./components/ThreatDashboard"),
  { ssr: false }
);

export default async function Home() {
  let payload;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/events`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Threat feed API failed");

    payload = await res.json();
  } catch (err) {
    return (
      <main style={{ padding: 24, fontFamily: "monospace" }}>
        <h1>⚠️ Threat Feed Error</h1>
        <pre>{err.message}</pre>
      </main>
    );
  }

  const rawEvents = Array.isArray(payload)
    ? payload
    : payload.events ?? [];

  // Normalize once (server-side)
  const events = rawEvents.map((e) => ({
    ...e,
    severity: e.severity?.toLowerCase() || "medium",
  }));

  return (
    <ThreatDashboard
      events={events}
      lastUpdated={payload.lastUpdated ?? null}
    />
  );
}

