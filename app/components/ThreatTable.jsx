"use client";

export default function ThreatTable({ events }) {
  if (!Array.isArray(events) || events.length === 0) {
    return <p style={{ opacity: 0.6 }}>No matching threats</p>;
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
        {events.map((e, i) => (
          <tr key={i}>
            <td>{e.ip}</td>
            <td>{e.country}</td>
            <td>{e.confidence}</td>
            <td>{e.severity}</td>
            <td>
              {e.lastSeen
                ? new Date(e.lastSeen).toUTCString()
                : "unknown"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
