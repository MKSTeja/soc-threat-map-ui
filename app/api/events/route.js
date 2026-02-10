// app/api/events/route.js

import fs from "fs";
import path from "path";

let cache = {
  data: null,
  lastFetch: 0,
};

const CACHE_TTL = 60 * 1000; // 1 min

function loadSampleData() {
  const filePath = path.join(process.cwd(), "app", "data", "sample_events.json");
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/**
 * Aggregate for MAP only
 * Table must always use raw events
 */
function aggregateByCountry(events) {
  const map = {};
  const rank = { medium: 1, high: 2, critical: 3 };

  for (const e of events) {
    if (!e.country || e.country === "unknown") continue;

    if (!map[e.country]) {
      map[e.country] = {
        country: e.country,
        count: 0,
        maxSeverity: e.severity,
      };
    }

    map[e.country].count++;

    if (rank[e.severity] > rank[map[e.country].maxSeverity]) {
      map[e.country].maxSeverity = e.severity;
    }
  }

  return Object.values(map);
}

function normalize(events) {
  return events
    .filter(e => e && (e.ipAddress || e.ip))
    .map(e => ({
      ip: e.ipAddress ?? e.ip ?? "unknown",
      country: e.countryCode ?? "unknown",
      confidence: e.abuseConfidenceScore ?? 0,
      lastSeen: e.lastReportedAt ?? "unknown",
      severity:
        e.abuseConfidenceScore >= 90
          ? "critical"
          : e.abuseConfidenceScore >= 70
          ? "high"
          : "medium",
    }));
}

export async function GET() {
  const now = Date.now();

  // 1️⃣ Serve hot cache
  if (cache.data && now - cache.lastFetch < CACHE_TTL) {
    return Response.json({
      // 🔙 legacy keys (UI expects these)
      events: cache.data,
      geoSummary: aggregateByCountry(cache.data),

      // 🆕 new structured keys (future)
      rawEvents: cache.data,
      aggregations: {
        byCountry: aggregateByCountry(cache.data),
      },

      lastUpdated: cache.lastFetch,
      source: "memory-cache",
    });
  }

  // 2️⃣ Live AbuseIPDB
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
    const normalized = normalize(json.data);

    cache = {
      data: normalized,
      lastFetch: now,
    };

    return Response.json({
      // 🔙 legacy
      events: normalized,
      geoSummary: aggregateByCountry(normalized),

      // 🆕 new
      rawEvents: normalized,
      aggregations: {
        byCountry: aggregateByCountry(normalized),
      },

      lastUpdated: now,
      source: "abuseipdb",
    });
  } catch (err) {
    // 3️⃣ Fallback → sample data
    const sample = loadSampleData();
    const normalized = normalize(sample);

    return Response.json({
      // 🔙 legacy
      events: normalized,
      geoSummary: aggregateByCountry(normalized),

      // 🆕 new
      rawEvents: normalized,
      aggregations: {
        byCountry: aggregateByCountry(normalized),
      },

      lastUpdated: now,
      source: "sample-data",
    });
  }
}
