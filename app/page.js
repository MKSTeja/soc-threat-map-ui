async function getEvents() {
  const res = await fetch("http://localhost:3000/api/events", {
    cache: "no-store",
  });

  return res.json();
}

export default async function Home() {
  const events = await getEvents();

  return (
    <main style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>🌐 Global Threat Map</h1>
      <p>Live abuse intelligence feed (MVP)</p>

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
              <td>{e.lastSeen}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
