"use client";

import { useEffect } from "react";

export default function ThreatMap({ events }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Prevent map re-init on refresh
    if (window._threatMapInitialized) return;
    window._threatMapInitialized = true;

    const L = window.L;

    const map = L.map("map", {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      worldCopyJump: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    events.forEach((e) => {
      if (!e.lat || !e.lon) return;

      const color =
        e.confidence >= 80
          ? "red"
          : e.confidence >= 50
          ? "orange"
          : "yellow";

      L.circleMarker([e.lat, e.lon], {
        radius: 6,
        color,
        fillOpacity: 0.8,
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
      window._threatMapInitialized = false;
    };
  }, [events]);

  return (
    <div
      id="map"
      style={{
        height: "420px",
        width: "100%",
        borderRadius: "12px",
        marginBottom: "24px",
      }}
    />
  );
}
