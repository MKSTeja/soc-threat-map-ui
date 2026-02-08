import fs from "fs";
import path from "path";

export default function Home() {
  const filePath = path.join(process.cwd(), "data", "sample_events.json");
  const fileContents = fs.readFileSync(filePath, "utf8");
  const events = JSON.parse(fileContents);

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
