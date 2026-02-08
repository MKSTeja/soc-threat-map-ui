export const metadata = {
  title: "Threat Map MVP",
  description: "Low-cost SOC threat visibility dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>

      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#0b0f14",
          color: "#e6edf3",
        }}
      >
        {children}

        {/* Leaflet JS */}
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      </body>
    </html>
  );
}
