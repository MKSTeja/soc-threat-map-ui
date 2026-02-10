// app/api/events/route.js

import fs from "fs";
import path from "path";

let cache = {
  rawEvents: null,
  lastFetch: 0,
};

const CACHE_TTL = 60 * 1000; // 1 minute

function loadSampleData() {
  const filePath = path.join(process.cwd(), "app", "data", "sample_events.json");
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/**
 * Country-level aggregation ONLY for map
 */
function aggregateByCountry(events) {
  const map = {};

  for (const e of events) {
    if (!e.country || e.country === "unknown") continue;

    if (!map[e.country]) {
      map[e.country] = {
        country: e.country,
        count: 0,
        sumConfidence: 0,
        maxSeverity: e.severity,
      };
    }

    map[e.country].count += 1;
    map[e.country].sumConfidence += e.confidence;

    const rank = { medium: 1, high: 2, critical: 3 };
    if (rank[e.severity] > rank[map[e.country].maxSeverity]) {
      map[e.country].maxSeverity = e.severity;
    }
  }

  return Object.values(map).map((c) => ({
    country: c.country,
    count: c.count,
    avgConfidence: Math.round(c.sumConfidence / c.count),
    severity: c.maxSeverity,
  }));
}

export async function GET() {
  const now = Date.now();

  // 1️⃣ Serve hot cache
  if (cache.rawEvents && now - cache.lastFetch < CACHE_TTL) {
    return Response.json({
      rawEvents: cache.rawEvents, // TABLE
      aggregations: {
        byCountry: aggregateByCountry(cache.rawEvents), // MAP
      },
      lastUpdated: cache.lastFetch,
      source: "memory-cache",
    });
  }

  // 2️⃣ Try live AbuseIPDB
  try {
    const res = await fetch(
      "https://api.abuseipdb.com/api/v2/blacklist?confidenceMinimum=30",
      {
        headers: {
          Key: process.env.ABUSEIPDB_API_KEY,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) throw new Error("AbuseIPDB error");

    const json = await res.json();

    const normalized = json.data
      .filter((e) => e.ipAddress) // 🔥 removes hyphen / blank rows
      .map((e) => ({
        ip: e.ipAddress,
        country: e.countryCode ?? "unknown",
        confidence: e.abuseConfidenceScore,
        lastSeen: e.lastReportedAt ?? "unknown",
        severity:
          e.abuseConfidenceScore >= 90
            ? "critical"
            : e.abuseConfidenceScore >= 70
            ? "high"
            : "medium",
      }));

    cache = {
      rawEvents: normalized,
      lastFetch: now,
    };

    return Response.json({
      rawEvents: normalized,
      aggregations: {
        byCountry: aggregateByCountry(normalized),
      },
      lastUpdated: now,
      source: "abuseipdb",
    });
  } catch (err) {
    // 3️⃣ Fallback: disk sample
    const sample = loadSampleData().filter((e) => e.ip);

    return Response.json({
      rawEvents: sample,
      aggregations: {
        byCountry: aggregateByCountry(sample),
      },
      lastUpdated: now,
      source: "sample-data",
    });
  }
}
