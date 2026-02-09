"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const COUNTRY_COORDS = {
  DE: [51.1657, 10.4515],
  RO: [45.9432, 24.9668],
  NL: [52.1326, 5.2913],
  US: [37.0902, -95.7129],
  CN: [35.8617, 104.1954],
  KR: [35.9078, 127.7669],
  JP: [36.2048, 138.2529],
  IN: [20.5937, 78.9629],
};

function getColor(severity) {
  if (severity === "critical") return "#ff2b2b";
  if (severity === "high") return "#ff8c00";
  return "#ffd700";
}

export default function ThreatMap({ events }) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: "420px", width: "100%", borderRadius: 12 }}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {events.map((e, i) => {
        const coords = COUNTRY_COORDS[e.country];
        if (!coords) return null;

        return (
          <CircleMarker
            key={i}
            center={coords}
            radius={8}
            fillColor={getColor(e.severity)}
            fillOpacity={0.85}
            color="black"
            weight={1}
          >
            <Popup>
              <strong>{e.ip}</strong><br />
              Country: {e.country}<br />
              Confidence: {e.confidence}<br />
              Severity: {e.severity}<br />
              Last Seen: {new Date(e.lastSeen).toUTCString()}
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
