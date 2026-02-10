"use client";

import { useState, useMemo } from "react";
import ThreatMap from "./ThreatMap";
import ThreatTable from "./ThreatTable";

const SEVERITIES = ["all", "critical", "high", "medium"];
const AGGREGATIONS = ["all", "ip", "country"];

export default function ThreatDashboard({
  events,
  geoSummary,
  lastUpdated,
  source,
}) {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [aggregationMode, setAggregationMode] = useState("all");

  /**
   * 1️⃣ Normalize raw events ONCE
   * UI never guesses field names again
   */
  const normalizedEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];

    return events.map((e) => ({
      ip: e.ip ?? e.ipAddress ?? e.source_ip ?? null,
      country: e.country ?? e.countryCode ?? null,
      severity: e.severity ?? "medium",
      confidence: e.confidence ?? null,
      lastSeen: e.lastSeen ?? e.last_seen ?? null,
    }));
  }, [events]);

  /**
   * 2️⃣ Severity filter
   */
  const severityFiltered = useMemo(() => {
    if (severityFilter === "all") return normalizedEvents;
    return normalizedEvents.filter(
      (e) => e.severity === severityFilter
    );
  }, [normalizedEvents, severityFilter]);

  /**
   * 3️⃣ Aggregation
   */
  const aggregatedEvents = useMemo(() => {
    if (aggregationMode === "all") {
      return severityFiltered;
    }

    const map = new Map();

    for (const e of severityFiltered) {
      const key =
        aggregationMode === "ip" ? e.ip : e.country;

      if (!key) continue;

      if (!map.has(key)) {
        map.set(key, { ...e, count: 1 });
      } else {
        map.get(key).count += 1;
      }
    }

    return Array.from(map.values());
  }, [severityFiltered, aggregationMode]);

  return (
    <main
      style={{
        padding: 24,
        fontFamily: "monospace",
        color: "#e5e7eb",
        background: "#020617",
        minHeight: "100vh",
      }}
    >
      {/* ================= HEADER ================= */}
      <header
        style={{
          marginBottom: 20,
          paddingBottom: 12,
          borderBottom: "1px solid #1e293b",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, margin: 0 }}>
            🌐 Global Threat Intelligence Dashboard
          </h1>
          <p style={{ opacity: 0.7 }}>
            Live abuse intelligence feed (SOC MVP)
          </p>
        </div>

        <div style={{ fontSize: 12, opacity: 0.7 }}>
          <div>Source: {source}</div>
          <div>Status: <span style={{ color: "#22c55e" }}>LIVE</span></div>
          {lastUpdated && (
            <div>{new Date(lastUpdated).toUTCString()}</div>
          )}
        </div>
      </header>

      {/* ================= FILTERS ================= */}
      <section style={{ marginBottom: 16 }}>
        {/* Severity */}
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {SEVERITIES.map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              style={buttonStyle(severityFilter === s)}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Aggregation */}
        <div style={{ display: "flex", gap: 8 }}>
          {AGGREGATIONS.map((a) => (
            <button
              key={a}
              onClick={() => setAggregationMode(a)}
              style={buttonStyle(aggregationMode === a)}
            >
              AGG BY {a.toUpperCase()}
            </button>
          ))}
        </div>

        <p style={{ opacity: 0.7, marginTop: 8 }}>
          Showing {aggregatedEvents.length} items
        </p>
      </section>

      {/* ================= MAP ================= */}
      <ThreatMap
        events={aggregatedEvents}
        aggregationMode={aggregationMode}
      />

      {/* ================= TABLE ================= */}
      <ThreatTable
        events={aggregatedEvents}
        aggregationMode={aggregationMode}
      />
    </main>
  );
}

function buttonStyle(active) {
  return {
    padding: "6px 12px",
    borderRadius: 6,
    border: "1px solid #334155",
    background: active ? "#0f172a" : "transparent",
    color: "#e5e7eb",
    cursor: "pointer",
    fontSize: 12,
  };
}
