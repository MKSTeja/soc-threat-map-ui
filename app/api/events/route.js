// app/api/events/route.js

let cache = {
  data: null,
  lastFetch: 0,
};

const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET() {
  const now = Date.now();

  if (cache.data && now - cache.lastFetch < CACHE_TTL) {
    return Response.json({
      status: "cached",
      lastUpdated: cache.lastFetch,
      events: cache.data,
    });
  }

  const res = await fetch(
    "https://api.abuseipdb.com/api/v2/blacklist?confidenceMinimum=90",
    {
      headers: {
        Key: process.env.ABUSEIPDB_API_KEY,
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) {
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Threat feed fetch failed",
      }),
      { status: 500 }
    );
  }

  const json = await res.json();

  const normalized = json.data.map((e) => ({
    ip: e.ipAddress,
    country: e.countryCode,
    confidence: e.abuseConfidenceScore,
    lastSeen: e.lastReportedAt,
    severity: e.abuseConfidenceScore > 80 ? "high" : "medium",
  }));

  cache = {
    data: normalized,
    lastFetch: now,
  };

  return Response.json({
    status: "live",
    lastUpdated: now,
    events: normalized,
  });
}
