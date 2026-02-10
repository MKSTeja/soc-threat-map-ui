"use client";

import { useState, useMemo } from "react";
import ThreatMap from "./ThreatMap";
import ThreatTable from "./ThreatTable";

const SEVERITIES = ["all", "critical", "high", "medium"];

export default function ThreatDashboard({
  events,
  geoSummary,
  lastUpdated,
  source,
}) {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("");
  const [ipFilter, setIpFilter] = useState("");

  // 1️⃣ Raw events (never mutated)
  const rawEvents = Array.isArray(events) ? events : [];

  // 2️⃣ Filtered events (map + stats)
  const filteredEvents = useMemo(() => {
    return rawEvents.filter((e) => {
      if (
        severityFilter !== "all" &&
        e.severity !== severityFilter
      ) {
        return false;
      }

      if (
        countryFilter &&
        e.country?.toLowerCase() !== countryFilter.toLowerCase()
      ) {
        return false;
      }

      if (ipFilter && !e.ip?.includes(ipFilter)) {
        return false;
      }

      return true;
    });
  }, [rawEvents, severityFilter, countryFilter, ipFilter]);

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
          alignItems: "flex-end",
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, margin: 0 }}>
            🌐 Global Threat Intelligence Dashboard
          </h1>
          <p style={{ margin: "4px 0", opacity: 0.7 }}>
            Live abuse intelligence feed (SOC MVP)
          </p>
        </div>

        <div style={{ textAlign: "right", fontSize: 12, opacity: 0.6 }}>
          <div>
            Source: <strong>{source}</strong>
          </div>
          <div>
            Status: <span style={{ color: "#22c55e" }}>LIVE</span>
          </div>
          {lastUpdated && (
            <div>
              Updated: {new Date(lastUpdated).toUTCString()}
            </div>
          )}
        </div>
      </header>

      {/* ================= FILTER BAR ================= */}
      <section style={{ marginBottom: 16 }}>
        {/* Severity */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
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
                fontSize: 12,
              }}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* IP + Country */}
        <div style={{ display: "flex", gap: 12 }}>
          <input
            placeholder="Filter by IP"
            value={ipFilter}
            onChange={(e) => setIpFilter(e.target.value)}
            style={{
              padding: 6,
              background: "#020617",
              border: "1px solid #334155",
              color: "#e5e7eb",
            }}
          />

          <input
            placeholder="Filter by Country (US, IN, DE)"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            style={{
              padding: 6,
              background: "#020617",
              border: "1px solid #334155",
              color: "#e5e7eb",
            }}
          />
        </div>

        <p style={{ opacity: 0.7, marginTop: 8 }}>
          Showing {filteredEvents.length} of {rawEvents.length} threats
        </p>
      </section>

      {/* ================= MAP ================= */}
      <section style={{ marginBottom: 24 }}>
        <ThreatMap events={filteredEvents} />
      </section>

      {/* ================= TABLE ================= */}
      <section>
        <ThreatTable events={rawEvents} />
      </section>
    </main>
  );
}
