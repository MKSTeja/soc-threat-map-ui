// app/api/events/route.js

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.ABUSEIPDB_API_KEY;
  const now = new Date().toISOString();

  try {
    if (!apiKey) {
      throw new Error("Missing AbuseIPDB API key");
    }

    const res = await fetch(
      "https://api.abuseipdb.com/api/v2/blacklist?confidenceMinimum=90",
      {
        headers: {
          Key: apiKey,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error(`AbuseIPDB blocked (${res.status})`);
    }

    const json = await res.json();

    const events = json.data.slice(0, 25).map((e) => ({
      ip: e.ipAddress,
      country: e.countryCode,
      confidence: e.abuseConfidenceScore,
      severity:
        e.abuseConfidenceScore >= 90
          ? "critical"
          : e.abuseConfidenceScore >= 70
          ? "high"
          : "medium",
      lastSeen: e.lastReportedAt,
    }));

    return NextResponse.json({
      source: "abuseipdb",
      lastUpdated: now,
      events,
    });
  } catch (err) {
    // 🔁 Fallback to local dataset
    const filePath = path.join(
      process.cwd(),
      "app/data/sample_events.json"
    );

    const raw = fs.readFileSync(filePath, "utf-8");
    const events = JSON.parse(raw);

    return NextResponse.json({
      source: "fallback",
      reason: err.message,
      lastUpdated: now,
      events,
    });
  }
}

