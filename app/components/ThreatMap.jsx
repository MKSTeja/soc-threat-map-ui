"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const COUNTRY_COORDS = {
  DE: [51.1657, 10.4515],
  RO: [45.9432, 24.9668],
  NL: [52.1326, 5.2913],
  US: [37.0902, -95.7129],
  CN: [35.8617, 104.1954],
  IN: [20.5937, 78.9629],
};

function normalizeCountry(code) {
  if (!code) return null;
  return code.toUpperCase().slice(0, 2);
}

export default function ThreatMap({ events, aggregationMode }) {
  if (!events.length) {
    return (
      <div style={{ height: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
        No data
      </div>
    );
  }

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: 420, borderRadius: 12 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {events.map((e, i) => {
        const country = normalizeCountry(e.country);
        const coords = COUNTRY_COORDS[country];
        if (!coords) return null;

        return (
          <CircleMarker
            key={i}
            center={coords}
            radius={Math.min(18, 6 + (e.count ?? 1))}
            fillOpacity={0.8}
          >
            <Popup>
              {aggregationMode === "ip" && <div>IP: {e.ip}</div>}
              <div>Country: {country}</div>
              <div>Count: {e.count ?? 1}</div>
              <div>Severity: {e.severity}</div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
