import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Simple test request to Mistral API
    const response = await fetch("https://api.mistral.ai/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
    });

    if (!response.ok) {
      let errorText = await response.text().catch(() => "");
      throw new Error(`Mistral API error: ${response.status} ${errorText}`);
    }

    const models = await response.json();

    return NextResponse.json({
      success: true,
      models: models.data || models,
      apiKeyIsSet: !!process.env.MISTRAL_API_KEY,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
