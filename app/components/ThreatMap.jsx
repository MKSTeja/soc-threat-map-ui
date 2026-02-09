"use client";

import { useEffect, useRef } from "react";

export default function ThreatMap({ events }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.L || mapRef.current) return;

    const L = window.L;

    const map = L.map("threat-map").setView([20, 0], 2);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    events.forEach((e) => {
      if (!e.lat || !e.lon) return;

      L.circleMarker([e.lat, e.lon], {
        radius: 6,
        color: e.severity === "high" ? "red" : "orange",
        fillOpacity: 0.7,
      })
        .addTo(map)
        .bindPopup(
          `<strong>IP:</strong> ${e.ip}<br/>
           <strong>Country:</strong> ${e.country}<br/>
           <strong>Confidence:</strong> ${e.confidence}`
        );
    });
  }, [events]);

  return (
    <div
      id="threat-map"
      style={{
        height: "500px",
        width: "100%",
        marginTop: "20px",
        borderRadius: "8px",
      }}
    />
  );
}
