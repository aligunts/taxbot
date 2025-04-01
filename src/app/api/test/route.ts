import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    hasApiKey: !!process.env.MISTRAL_API_KEY,
    apiKeyStart: process.env.MISTRAL_API_KEY
      ? process.env.MISTRAL_API_KEY.substring(0, 4) + "..."
      : "not set",
  });
}
