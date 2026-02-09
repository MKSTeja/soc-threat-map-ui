// app/api/events/route.js

// --------------------
// In-memory cache
// --------------------
let cache = {
  data: null,
  lastFetch: 0,
};

const CACHE_TTL = 60 * 1000; // 1 minute

// --------------------
// Rate limiting
// --------------------
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // per IP per window

const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return false;
  }

  if (now - record.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return false;
  }

  record.count += 1;
  return record.count > MAX_REQUESTS;
}

// --------------------
// AbuseIPDB config
// --------------------
const ABUSE_URL =
  "https://api.abuseipdb.com/api/v2/blacklist?confidenceMinimum=90&limit=100";

// --------------------
// API handler
// --------------------
export async function GET(req) {
  const now = Date.now();

  // Get client IP (Vercel-safe)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  // Rate limit protection
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many requests" }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Serve cache if valid
  if (cache.data && now - cache.lastFetch < CACHE_TTL) {
    return Response.json(cache.data, {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    });
  }

  // Ensure API key exists
  if (!process.env.ABUSEIPDB_API_KEY) {
    return new Response("Missing AbuseIPDB API key", { status: 500 });
  }

  try {
    const res = await fetch(ABUSE_URL, {
      headers: {
        Key: process.env.ABUSEIPDB_API_KEY,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });

    // If AbuseIPDB fails, return cached data if possible
    if (!res.ok) {
      if (cache.data) {
        return Response.json(cache.data);
      }
      return new Response("Threat feed unavailable", { status: 503 });
    }

    const json = await res.json();

    // Normalize for frontend
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

    // Update cache
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
    // Absolute fallback
    if (cache.data) {
      return Response.json(cache.data);
    }
    return new Response("Internal threat feed error", { status: 500 });
  }
}
