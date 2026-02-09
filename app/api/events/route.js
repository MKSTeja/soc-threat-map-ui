// app/api/events/route.js

let cache = {
  data: null,
  lastFetch: 0,
};

const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET() {
  const now = Date.now();

  // ✅ Serve cache if still valid
  if (cache.data && now - cache.lastFetch < CACHE_TTL) {
    return Response.json({
      events: cache.data,
      lastUpdated: cache.lastFetch,
      source: "cache",
    });
  }

  try {
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
      throw new Error("AbuseIPDB rate limit or error");
    }

    const json = await res.json();

    const normalized = json.data.map((e) => ({
      ip: e.ipAddress,
      country: e.countryCode,
      confidence: e.abuseConfidenceScore,
      lastSeen: e.lastReportedAt,
      severity:
        e.abuseConfidenceScore > 90
          ? "critical"
          : e.abuseConfidenceScore > 70
          ? "high"
          : "medium",
    }));

    cache = {
      data: normalized,
      lastFetch: now,
    };

    return Response.json({
      events: normalized,
      lastUpdated: now,
      source: "abuseipdb",
    });
  } catch (err) {
    // ✅ Fallback to stale cache instead of failing UI
    if (cache.data) {
      return Response.json({
        events: cache.data,
        lastUpdated: cache.lastFetch,
        source: "stale-cache",
      });
    }

    return Response.json(
      { status: "error", message: "Threat feed fetch failed" },
      { status: 503 }
    );
  }
}
