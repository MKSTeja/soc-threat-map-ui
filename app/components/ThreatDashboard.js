"use client";

import { useState, useMemo } from "react";
import ThreatMap from "./ThreatMap";
import ThreatTable from "./ThreatTable";

const SEVERITIES = ["all", "critical", "high", "medium"];

export default function ThreatDashboard({ events, lastUpdated }) {
  const [severityFilter, setSeverityFilter] = useState("all");

  // 1️⃣ Raw events (never aggregated)
  const rawEvents = Array.isArray(events) ? events : [];

  // 2️⃣ Filtered events (used for map + stats)
  const filteredEvents = useMemo(() => {
    if (severityFilter === "all") return rawEvents;
    return rawEvents.filter(
      (e) => e.severity === severityFilter
    );
  }, [rawEvents, severityFilter]);

  return (
    <main style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>🌐 Global Threat Map</h1>
      <p>Live abuse intelligence feed (MVP)</p>

      {lastUpdated && (
        <p style={{ opacity: 0.7 }}>
          Last refreshed: {new Date(lastUpdated).toUTCString()}
        </p>
      )}

      {/* Severity filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {SEVERITIES.map((s) => (
          <button
            key={s}
            onClick={() => setSeverityFilter(s)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #334155",
              background:
                severityFilter === s ? "#0f172a" : "transparent",
              color: "#e5e7eb",
              cursor: "pointer",
            }}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      <p style={{ opacity: 0.7 }}>
        Showing {filteredEvents.length} of {rawEvents.length} threats
      </p>

      {/* Map gets FILTERED events */}
      <ThreatMap events={filteredEvents} />

      {/* Table gets RAW events */}
      <ThreatTable events={rawEvents} />
    </main>
  );
}
