let cache = {
  data: null,
  lastFetch: 0,
};

const CACHE_TTL = 60 * 1000; // 1 minute
const ABUSE_URL =
  "https://api.abuseipdb.com/api/v2/blacklist?confidenceMinimum=90&limit=100";

export async function GET() {
  const now = Date.now();

  // 1️⃣ Serve cached data if still valid
  if (cache.data && now - cache.lastFetch < CACHE_TTL) {
    return Response.json(cache.data, {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    });
  }

  // 2️⃣ Fail fast if API key is missing
  if (!process.env.ABUSEIPDB_API_KEY) {
    return new Response("Missing AbuseIPDB API key", { status: 500 });
  }

  try {
    const res = await fetch(ABUSE_URL, {
      headers: {
        Key: process.env.ABUSEIPDB_API_KEY,
        Accept: "application/json",
      },
      next: { revalidate: 60 }, // Next.js edge hint
    });

    // 3️⃣ Graceful fallback if AbuseIPDB is down
    if (!res.ok) {
      if (cache.data) {
        return Response.json(cache.data);
      }
      return new Response("Threat feed unavailable", { status: 503 });
    }

    const json = await res.json();

    // 4️⃣ Normalize for frontend stability
    const normalized = json.data.map((e) => ({
      ip: e.ipAddress ?? "unknown",
      country: e.countryCode ?? "NA",
      confidence: e.abuseConfidenceScore ?? 0,
      lastSeen: e.lastReportedAt ?? "unknown",
      severity:
        e.abuseConfidenceScore >= 90
          ? "critical"
          : e.abuseConfidenceScore >= 70
          ? "high"
          : "medium",
    }));

    // 5️⃣ Update cache
    cache = {
      data: normalized,
      lastFetch: now,
    };

    return Response.json(normalized, {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (err) {
    // 6️⃣ Absolute last-resort safety net
    if (cache.data) {
      return Response.json(cache.data);
    }
    return new Response("Internal threat feed error", { status: 500 });
  }
}
