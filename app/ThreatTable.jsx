"use client";

import { useEffect, useState } from "react";

export default function ThreatTable({ events }) {
  const [data, setData] = useState(events);

  // Auto refresh every 15s
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/events");
      if (res.ok) {
        const fresh = await res.json();
        setData(fresh);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (!Array.isArray(data)) {
    return <p>Loading threat data…</p>;
  }

  return (
    <table border="1" cellPadding="8" width="100%">
      <thead>
        <tr>
          <th>IP</th>
          <th>Country</th>
          <th>Confidence</th>
          <th>Severity</th>
          <th>Last Seen</th>
        </tr>
      </thead>
      <tbody>
        {data.map((e, i) => (
          <tr key={i}>
            <td>{e.ip}</td>
            <td>{e.country}</td>
            <td>{e.confidence}</td>
            <td>{e.severity}</td>
            <td>{new Date(e.lastSeen).toUTCString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
