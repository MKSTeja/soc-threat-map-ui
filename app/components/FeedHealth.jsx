"use client";

export default function FeedHealth({ lastUpdated, status }) {
  if (!lastUpdated) return null;

  const ageSeconds = Math.floor((Date.now() - lastUpdated) / 1000);

  let label = "LIVE";
  let color = "#16a34a"; // green

  if (ageSeconds > 500) {
    label = "STALE";
    color = "#dc2626"; // red
  } else if (ageSeconds > 200) {
    label = "DELAYED";
    color = "#f97316"; // orange
  }

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
      </span>

      <span>
        Last refresh:{" "}
        {new Date(lastUpdated).toUTCString()}
      </span>
    </div>
  );
}
