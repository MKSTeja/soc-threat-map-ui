"use client";

import { useEffect } from "react";

export default function ThreatMap({ events }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const L = require("leaflet");

    const map = L.map("map").setView([20, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    events.forEach(e => {
      if (!e.lat || !e.lon) return;

      L.circleMarker([e.lat, e.lon], {
        radius: 6,
        color: "red",
      })
        .addTo(map)
        .bindPopup(
          `IP: ${e.source_ip || e.ipAddress}<br/>
           Country: ${e.country || e.countryCode}<br/>
           Confidence: ${e.confidence || e.abuseConfidenceScore}`
        );
    });

    return () => map.remove();
  }, [events]);

  return (
    <div
      id="map"
      style={{ height: "500px", width: "100%", marginBottom: 24 }}
    />
  );
}
