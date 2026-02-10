"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Country centroids (ISO-2)
 */
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

function normalizeCountry(code) {
  if (!code || typeof code !== "string") return null;
  return code.toUpperCase().slice(0, 2);
}

function getColor(severity) {
  if (severity === "critical") return "#ff2b2b";
  if (severity === "high") return "#ff8c00";
  return "#ffd700";
}

function getRadius(severity) {
  if (severity === "critical") return 14;
  if (severity === "high") return 10;
  return 7;
}

export default function ThreatMap({ events }) {
  if (!Array.isArray(events) || events.length === 0) {
    return (
      <div
        style={{
          height: 420,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 12,
          background: "#020617",
          color: "#94a3b8",
          fontFamily: "monospace",
          marginBottom: 24,
        }}
      >
        No threat data available (feed idle or rate-limited)
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
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
          const countryCode = normalizeCountry(
            e.country || e.countryCode
          );

          const coords = COUNTRY_COORDS[countryCode];
          if (!coords) return null;

          return (
            <CircleMarker
              key={i}
              center={coords}
              radius={getRadius(e.severity)}
              fillColor={getColor(e.severity)}
              fillOpacity={0.85}
              color="#000"
              weight={1}
            >
              <Popup>
                <strong>{e.ip}</strong>
                <br />
                Country: {countryCode}
                <br />
                Confidence: {e.confidence}
                <br />
                Severity: {e.severity}
                <br />
                Last Seen:{" "}
                {e.lastSeen
                  ? new Date(e.lastSeen).toUTCString()
                  : "unknown"}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div
        style={{
          marginTop: 8,
          fontSize: 13,
          display: "flex",
          gap: 16,
          fontFamily: "monospace",
        }}
      >
        <span style={{ color: "#ff2b2b" }}>● Critical</span>
        <span style={{ color: "#ff8c00" }}>● High</span>
        <span style={{ color: "#ffd700" }}>● Medium</span>
      </div>
    </div>
  );
}
