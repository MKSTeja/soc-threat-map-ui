import { NextResponse } from "next/server";
import data from "@/app/data/sample_events.json";

export async function GET() {
  return NextResponse.json(data);
}
