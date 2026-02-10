// app/page.js (SERVER COMPONENT)

"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";

const ThreatMap = dynamic(() => import("./components/ThreatMap"), {
  ssr: false,
});
const ThreatTable = dynamic(() => import("./components/ThreatTable"), {
  ssr: false,
});

export default function HomeClient({ events, lastUpdated }) {
  const [severityFilter, setSeverityFilter] = useState("all");

  const filteredEvents = useMemo(() => {
    if (severityFilter === "all") return events;
    return events.filter((e) => e.severity === severityFilter);
  }, [events, severityFilter]);

  return (
    <main style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>🌐 Global Threat Map</h1>
      <p>Live abuse intelligence feed (MVP)</p>

      {lastUpdated && (
        <p style={{ opacity: 0.7 }}>
          Last refreshed: {new Date(lastUpdated).toUTCString()}
        </p>
      )}

      {/* 🔎 SOC Filter Bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {["all", "critical", "high", "medium"].map((level) => (
          <button
            key={level}
            onClick={() => setSeverityFilter(level)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #334155",
              background:
                severityFilter === level ? "#1e293b" : "#020617",
              color: "#e5e7eb",
              cursor: "pointer",
            }}
          >
            {level.toUpperCase()}
          </button>
        ))}
      </div>

      <ThreatMap events={filteredEvents} />
      <ThreatTable events={filteredEvents} />
    </main>
  );
}
