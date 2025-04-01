import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasApiKey: !!process.env.MISTRAL_API_KEY,
    keyFirstChars: process.env.MISTRAL_API_KEY
      ? process.env.MISTRAL_API_KEY.substring(0, 4) + "..."
      : "not set",
    nodeEnv: process.env.NODE_ENV,
  });
}
