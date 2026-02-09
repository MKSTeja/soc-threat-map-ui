// app/page.js (SERVER COMPONENT)

import nextDynamic from "next/dynamic";
import ThreatTable from "./components/ThreatTable";
import FeedHealth from "./components/FeedHealth";

export const dynamic = "force-dynamic";

const ThreatMap = nextDynamic(
  () => import("./components/ThreatMap"),
  { ssr: false }
);

export default async function Home() {
  const res = await fetch("http://localhost:3000/api/events", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load threat feed");
  }

  const data = await res.json();

  return (
    <main style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>🌐 Global Threat Map</h1>
      <p>Live abuse intelligence feed (MVP)</p>

      <FeedHealth
        lastUpdated={data.lastUpdated}
        status={data.status}
      />

      <ThreatMap events={data.events} />
      <ThreatTable events={data.events} />
    </main>
  );
}


