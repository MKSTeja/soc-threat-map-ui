"use client";

import { useState } from "react";
import ThreatMap from "./ThreatMap";
import ThreatTable from "./ThreatTable";

const SEVERITIES = [
  { label: "ALL", value: "all" },        // UI-only state
  { label: "CRITICAL", value: "critical" },
  { label: "HIGH", value: "high" },
  { label: "MEDIUM", value: "medium" },
];

export default function ThreatDashboard({ events, lastUpdated }) {
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

      {/* Severity Filters */}
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

      <p style={{ opacity: 0.6 }}>
        Showing {filteredEvents.length} of {events.length} threats
      </p>

      <ThreatMap events={filteredEvents} />
      <ThreatTable events={filteredEvents} />
    </main>
  );
}
