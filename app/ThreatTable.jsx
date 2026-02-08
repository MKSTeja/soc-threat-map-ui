"use client";

import { useEffect, useState } from "react";

function normalizeEvent(e) {
  return {
    ip: e.source_ip || e.ipAddress || "unknown",
    country: e.country || e.countryCode || "unknown",
    confidence: e.confidence ?? e.abuseConfidenceScore ?? "N/A",
    lastSeen: e.last_seen || e.lastReportedAt || null,
  };
}

export default function ThreatTable() {
  const [events, setEvents] = useState([]);

  async function fetchEvents() {
    const res = await fetch("/api/events", { cache: "no-store" });
    const data = await res.json();
    setEvents(data.map(normalizeEvent));
  }

  useEffect(() => {
    fetchEvents(); // initial load

    const interval = setInterval(fetchEvents, 5000); // 🔁 LIVE refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <table border="1" cellPadding="8">
      <thead>
        <tr>
          <th>IP</th>
          <th>Country</th>
          <th>Confidence</th>
          <th>Last Seen</th>
        </tr>
      </thead>
      <tbody>
        {events.map((e, i) => (
          <tr key={i}>
            <td>{e.ip}</td>
            <td>{e.country}</td>
            <td>{e.confidence}</td>
            <td>
              {e.lastSeen
                ? new Date(e.lastSeen).toLocaleString()
                : "unknown"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
