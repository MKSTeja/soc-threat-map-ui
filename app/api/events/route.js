import fs from "fs";
import path from "path";

let cache = {
  data: null,
  lastFetch: 0,
};

const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET() {
  const now = Date.now();

  // Serve cache if fresh
  if (cache.data && now - cache.lastFetch < CACHE_TTL) {
    return Response.json(cache.data);
  }

  const filePath = path.join(
    process.cwd(),
    "app",
    "data",
    "sample_events.json"
  );

  const fileContents = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(fileContents);

  cache = {
    data,
    lastFetch: now,
  };

  return Response.json(data);
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
