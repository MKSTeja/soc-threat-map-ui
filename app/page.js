import ThreatMap from "./components/ThreatMap";

export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>🌐 Global Threat Map</h1>
      <p>Live abuse intelligence feed (MVP)</p>

      <ThreatMap />
    </main>
  );
}
