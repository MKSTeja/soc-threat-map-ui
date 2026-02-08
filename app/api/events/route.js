import data from "@/app/data/sample_events.json";

let cache = {
  data: null,
  lastFetch: 0,
};

const CACHE_TTL = 60 * 1000;

export async function GET() {
  const now = Date.now();

  if (cache.data && now - cache.lastFetch < CACHE_TTL) {
    return Response.json(cache.data);
  }

  cache = {
    data,
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
