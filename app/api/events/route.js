// app/api/events/route.js

import fs from "fs";
import path from "path";

let cache = {
  data: null,
  lastFetch: 0,
};

const CACHE_TTL = 60 * 1000;

function loadSampleData() {
  const filePath = path.join(process.cwd(), "app", "data", "sample_events.json");
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function aggregateByCountry(events) {
  const map = {};

  for (const e of events) {
    if (!e.country) continue;

    if (!map[e.country]) {
      map[e.country] = {
        country: e.country,
        count: 0,
        maxSeverity: e.severity,
      };
    }

    map[e.country].count++;

    const rank = { medium: 1, high: 2, critical: 3 };
    if (rank[e.severity] > rank[map[e.country].maxSeverity]) {
      map[e.country].maxSeverity = e.severity;
    }
  }

  return Object.values(map);
}

export async function GET() {
  const now = Date.now();

  if (cache.data && now - cache.lastFetch < CACHE_TTL) {
    return Response.json({
      events: cache.data,
      geoSummary: aggregateByCountry(cache.data),
      lastUpdated: cache.lastFetch,
      source: "memory-cache",
    });
  }

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

    const normalized = json.data.map((e) => ({
      ip: e.ipAddress ?? e.ip ?? "unknown",
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

    cache = { data: normalized, lastFetch: now };

    return Response.json({
      events: normalized,
      geoSummary: aggregateByCountry(normalized),
      lastUpdated: now,
      source: "abuseipdb",
    });
  } catch {
    const sample = loadSampleData();
    return Response.json({
      events: sample,
      geoSummary: aggregateByCountry(sample),
      lastUpdated: now,
      source: "sample-data",
    });
  }
}
