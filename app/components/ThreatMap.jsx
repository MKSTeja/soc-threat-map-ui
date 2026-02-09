"use client";

import { useEffect } from "react";

const COUNTRY_COORDS = {
  DE: [51.1657, 10.4515],
  RO: [45.9432, 24.9668],
  NL: [52.1326, 5.2913],
  US: [37.0902, -95.7129],
  CN: [35.8617, 104.1954],
  RU: [61.5240, 105.3188],
  IN: [20.5937, 78.9629],
};

export default function ThreatMap({ events }) {
  useEffect(() => {
    if (!window.L) return;

    const map = window.L.map("map").setView([20, 0], 2);

    window.L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "© OpenStreetMap contributors",
      }
    ).addTo(map);

    events.forEach((e) => {
      const coords = COUNTRY_COORDS[e.country];

      if (!coords) return;

      const color =
        e.severity === "critical"
          ? "red"
          : e.severity === "high"
          ? "orange"
          : "yellow";

      window.L.circleMarker(coords, {
        radius: 8,
        color,
        fillColor: color,
        fillOpacity: 0.7,
      })
        .addTo(map)
        .bindPopup(
          `<b>IP:</b> ${e.ip}<br/>
           <b>Country:</b> ${e.country}<br/>
           <b>Confidence:</b> ${e.confidence}`
        );
    });

    return () => {
      map.remove();
    };
  }, [events]);

  return (
    <div
      id="map"
      style={{
        height: "450px",
        width: "100%",
        marginBottom: "24px",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    />
  );
}
