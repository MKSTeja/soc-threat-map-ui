"use client";

export default function ThreatTable({ events }) {
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
            <td
              style={{
                color: e.severity === "high" ? "#ff6b6b" : "#feca57",
                fontWeight: "bold",
              }}
            >
              {e.severity.toUpperCase()}
            </td>
            <td>{new Date(e.lastSeen).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
