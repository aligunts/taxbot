import { NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";

export async function GET() {
  try {
    // Initialize client
    const client = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY || "",
    });

    // Check if chat method exists
    const hasChatMethod = typeof client.chat === "function";

    // Get available methods
    const availableMethods = Object.keys(client);

    return NextResponse.json({
      success: true,
      apiKeyExists: !!process.env.MISTRAL_API_KEY,
      apiKeyFormat: process.env.MISTRAL_API_KEY?.substring(0, 6) + "...",
      clientType: typeof client,
      hasChatMethod,
      availableMethods,
      sdkVersion: require("@mistralai/mistralai/package.json").version,
    });
  } catch (error: any) {
    console.error("Test endpoint error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
