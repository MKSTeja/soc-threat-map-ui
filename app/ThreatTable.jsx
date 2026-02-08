"use client";

import { useEffect, useState } from "react";

export default function ThreatTable() {
  const [events, setEvents] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  async function fetchEvents() {
    try {
      const res = await fetch("/api/events", { cache: "no-store" });
      const data = await res.json();

      setEvents(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  }

  useEffect(() => {
    fetchEvents(); // initial load

    const interval = setInterval(fetchEvents, 15000); // auto refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <p style={{ fontSize: 12, opacity: 0.7 }}>
        Last updated: {lastUpdated || "loading..."}
      </p>

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
              <td>{e.source_ip || e.ipAddress}</td>
              <td>{e.country || e.countryCode}</td>
              <td>{e.confidence || e.abuseConfidenceScore}</td>
              <td>{e.last_seen || e.lastReportedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
