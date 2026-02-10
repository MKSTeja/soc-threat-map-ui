"use client";

export default function ThreatTable({ events }) {
  if (!Array.isArray(events) || events.length === 0) {
    return (
      <p style={{ fontFamily: "monospace", opacity: 0.7 }}>
        Loading threat data…
      </p>
    );
  }

  return (
    <table
      border="1"
      cellPadding="8"
      width="100%"
      style={{
        marginTop: 24,
        borderCollapse: "collapse",
        fontFamily: "monospace",
      }}
    >
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
