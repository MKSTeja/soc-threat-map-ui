let cache = {
  data: null,
  lastFetch: 0,
};

const CACHE_TTL = 60 * 1000; // 1 min

export async function GET() {
  const now = Date.now();

  if (cache.data && now - cache.lastFetch < CACHE_TTL) {
    return Response.json(cache.data);
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
    return new Response("Threat feed error", { status: 500 });
  }

  const json = await res.json();

  // Normalize for frontend
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

  return Response.json(normalized);
}
