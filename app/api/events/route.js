// app/api/events/route.js

import fs from "fs";
import path from "path";

let cache = {
  data: null,
  lastFetch: 0,
};

const CACHE_TTL = 60 * 1000; // 1 minute

function loadSampleData() {
  const filePath = path.join(
    process.cwd(),
    "app",
    "data",
    "sample_events.json"
  );
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

export async function GET() {
  const now = Date.now();

  // 1️⃣ Serve hot cache
  if (cache.data && now - cache.lastFetch < CACHE_TTL) {
    return Response.json({
      events: cache.data,
      lastUpdated: cache.lastFetch,
      source: "memory-cache",
    });
  }

  // 2️⃣ Try live AbuseIPDB
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
      throw new Error("AbuseIPDB error");
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
    // 3️⃣ Fallback to disk sample (BOOTSTRAP MODE)
    try {
      const sample = loadSampleData();

      return Response.json({
        events: sample,
        lastUpdated: now,
        source: "sample-data",
      });
    } catch {
      return Response.json(
        { status: "error", message: "Threat feed fetch failed" },
        { status: 503 }
      );
    }
  }
}
