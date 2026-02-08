let cache = {
  data: null,
  lastFetch: 0,
};

const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET() {
  const now = Date.now();

  // Serve cached data if fresh
  if (cache.data && now - cache.lastFetch < CACHE_TTL) {
    return Response.json(cache.data);
  }

  // For now we still use sample_events.json
  const data = await import("../../data/sample_events.json", {
    assert: { type: "json" },
  });

  cache = {
    data: data.default,
    lastFetch: now,
  };

  return Response.json(cache.data);
}


/*
FUTURE:
Replace sample data with AbuseIPDB fetch

const res = await fetch("https://api.abuseipdb.com/api/v2/blacklist", {
  headers: {
    Key: process.env.ABUSEIPDB_API_KEY,
    Accept: "application/json",
  },
});

const data = await res.json();
*/
