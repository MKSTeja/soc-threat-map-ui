"use client";

export default function ThreatTable({ events, aggregationMode }) {
  if (!events.length) return <p>No data</p>;

  return (
    <table border="1" cellPadding="8" width="100%">
      <thead>
        <tr>
          {aggregationMode === "ip" && <th>IP</th>}
          <th>Country</th>
          <th>Severity</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        {events.map((e, i) => (
          <tr key={i}>
            {aggregationMode === "ip" && <td>{e.ip}</td>}
            <td>{e.country}</td>
            <td>{e.severity}</td>
            <td>{e.count ?? 1}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
