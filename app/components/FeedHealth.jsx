"use client";

export default function FeedHealth({ lastUpdated, source }) {
  if (!lastUpdated) return null;

  const ageSeconds = Math.floor(
    (Date.now() - new Date(lastUpdated).getTime()) / 1000
  );

  let label = "LIVE";
  let color = "#16a34a"; // green

  if (ageSeconds > 500) {
    label = "STALE";
    color = "#dc2626"; // red
  } else if (ageSeconds > 200) {
    label = "DELAYED";
    color = "#f97316"; // orange
  }

  const sourceLabel =
    source === "abuseipdb"
      ? "AbuseIPDB (primary)"
      : "Local fallback feed";

  return (
    <div
      style={{
        margin: "12px 0 20px",
        padding: "10px 14px",
        borderRadius: 8,
        background: "#0f172a",
        border: `1px solid ${color}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 14,
      }}
    >
      <span>
        🩺 Feed Status:{" "}
        <strong style={{ color }}>{label}</strong>
        {" · "}
        <span style={{ opacity: 0.7 }}>
          {sourceLabel}
        </span>
      </span>

      <span>
        Last refresh:{" "}
        {new Date(lastUpdated).toUTCString()}
      </span>
    </div>
  );
}
