// app/page.js (SERVER COMPONENT)

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>✅ Page Loaded</h1>
      <p>If you see this, the server is healthy.</p>
    </main>
  );
}
