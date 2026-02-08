import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const revalidate = 300; // 🔑 this makes it "live"

export async function GET() {
  const filePath = path.join(process.cwd(), "data", "sample_events.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  return NextResponse.json(data);
}
