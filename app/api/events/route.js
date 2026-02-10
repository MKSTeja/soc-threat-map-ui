// app/api/events/route.js

import fs from "fs";
import path from "path";

let cache = {
  events: null,
  lastFetch: 0,
};

const CACHE_TTL = 60 * 1000;

/* ---------- helpers ---------- */

function loadSampleData() {
  const filePath = path.join(process.cwd(), "app", "data", "sample_events.json");
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeBlacklist(data) {
  return data.map((e) => ({
    ip: e.ipAddress ?? "unknown",
    country: e.countryCode ?? "unknown",
    confidence: e.abuseConfidenceScore,
    lastSeen: e.lastReportedAt ?? "unknown",
    severity:
      e.abuseConfidenceScore >= 90
        ? "critical"
        : e.abuseConfidenceScore >= 70
        ? "high"
        : "medium",
    source: "blacklist",
  }));
}

function normalizeReports(data) {
  return data.map((e) => ({
    ip: e.ipAddress ?? "unknown",
    country: e.countryCode ?? "unknown",
    confidence: e.abuseConfidenceScore ?? 30,
    lastSeen: e.reportedAt ?? "unknown",
    severity: "medium",
    source: "reports",
  }));
}

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

function aggregateByIP(events) {
  const map = {};
  const rank = { medium: 1, high: 2, critical: 3 };

  for (const e of events) {
    if (!e.ip || e.ip === "unknown") continue;

    if (!map[e.ip]) {
      map[e.ip] = {
        ip: e.ip,
        country: e.country,
        confidence: e.confidence,
        lastSeen: e.lastSeen,
        maxSeverity: e.severity,
        count: 0,
      };
    }

    map[e.ip].count++;
    if (rank[e.severity] > rank[map[e.ip].maxSeverity]) {
      map[e.ip].maxSeverity = e.severity;
    }
  }

  return Object.values(map);
}

/* ---------- route ---------- */

export async function GET(req) {
  const now = Date.now();
  const { searchParams } = new URL(req.url);

  const aggregate = searchParams.get("aggregate") || "country";
  const severity = searchParams.get("severity") || "all";

  if (cache.events && now - cache.lastFetch < CACHE_TTL) {
    return Response.json(buildResponse(cache.events));
  }

  try {
    /* ---- Feed 1: Blacklist ---- */
    const blacklistRes = await fetch(
      "https://api.abuseipdb.com/api/v2/blacklist?confidenceMinimum=0",
      {
        headers: {
          Key: process.env.ABUSEIPDB_API_KEY,
          Accept: "application/json",
        },
      }
    );

    if (!blacklistRes.ok) throw new Error("Blacklist failed");

    const blacklistJson = await blacklistRes.json();
    const blacklistEvents = normalizeBlacklist(blacklistJson.data);

    /* ---- Feed 2: Reports (fallback-friendly) ---- */
    let reportEvents = [];
    try {
      const reportsRes = await fetch(
        "https://api.abuseipdb.com/api/v2/reports?perPage=25",
        {
          headers: {
            Key: process.env.ABUSEIPDB_API_KEY,
            Accept: "application/json",
          },
        }
      );

      if (reportsRes.ok) {
        const reportsJson = await reportsRes.json();
        reportEvents = normalizeReports(reportsJson.data || []);
      }
    } catch {
      /* reports optional */
    }

    const allEvents = [...blacklistEvents, ...reportEvents];

    cache = { events: allEvents, lastFetch: now };
    return Response.json(buildResponse(allEvents));
  } catch {
    const sample = loadSampleData();
    return Response.json(buildResponse(sample));
  }

  function buildResponse(events) {
    const filtered =
      severity === "all"
        ? events
        : events.filter((e) => e.severity === severity);

    return {
      events: filtered, // raw → table
      mapData:
        aggregate === "ip"
          ? aggregateByIP(filtered)
          : aggregateByCountry(filtered),
      lastUpdated: now,
    };
  }
}
