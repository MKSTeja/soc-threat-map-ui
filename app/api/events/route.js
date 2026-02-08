import { NextResponse } from "next/server";
import data from "../../data/sample_events.json";
";

export async function GET() {
  return NextResponse.json(data);
}
