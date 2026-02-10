// app/page.js (SERVER COMPONENT)

import nextDynamic from "next/dynamic";
import { useState } from "react";

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

const SEVERITIES = [
  { label: "ALL", value: "all" },
  { label: "CRITICAL", value: "critical" },
  { label: "HIGH", value: "high" },
  { label: "MEDIUM", value: "medium" },
];

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

  // 🔑 Normalize ONCE
  const events = rawEvents.map((e) => ({
    ...e,
    severity: e.severity?.toLowerCase() || "medium",
  }));

  const lastUpdated = payload.lastUpdated ?? null;

  return <ThreatDashboard events={events} lastUpdated={lastUpdated} />;
}

/**
 * Client-side dashboard wrapper
 */
function ThreatDashboard({ events, lastUpdated }) {
  const [activeSeverity, setActiveSeverity] = useState("all");

  const filteredEvents =
    activeSeverity === "all"
      ? events
      : events.filter((e) => e.severity === activeSeverity);

  return (
    <main style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>🌐 Global Threat Map</h1>
      <p>Live abuse intelligence feed (MVP)</p>

      {lastUpdated && (
        <p style={{ opacity: 0.6 }}>
          Last refreshed: {new Date(lastUpdated).toUTCString()}
        </p>
      )}

      {/* 🔘 Severity Filters */}
      <div style={{ display: "flex", gap: 10, margin: "16px 0" }}>
        {SEVERITIES.map((s) => (
          <button
            key={s.value}
            onClick={() => setActiveSeverity(s.value)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid #334155",
              background:
                activeSeverity === s.value ? "#020617" : "#020617aa",
              color: "#e5e7eb",
              cursor: "pointer",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 🔎 Result count */}
      <p style={{ opacity: 0.6, marginBottom: 8 }}>
        Showing {filteredEvents.length} of {events.length} threats
      </p>

      <ThreatMap events={filteredEvents} />
      <ThreatTable events={filteredEvents} />
    </main>
  );
}
