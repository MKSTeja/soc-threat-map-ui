// app/page.js (SERVER COMPONENT)

import ThreatTable from "./components/ThreatTable";

export const dynamic = "force-dynamic";

export default async function Home() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/events`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to load threat feed");
  }

  const events = await res.json();

  return (
    <main style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>🌐 Global Threat Map</h1>
      <p>Live abuse intelligence feed (MVP)</p>

      <ThreatTable events={events} />
    </main>
  );
}
