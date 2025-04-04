import { NextResponse } from "next/server";

/**
 * Checks if the required environment variables are set
 * This endpoint should be called before making any other API calls
 * to ensure the server is configured correctly
 */
export async function GET() {
  const missingKeys = [];

  // Check if the Mistral API key is set
  if (!process.env.MISTRAL_API_KEY) {
    missingKeys.push("MISTRAL_API_KEY");
  }

  // Check if the Google API key is set (if your application uses it)
  if (!process.env.GOOGLE_API_KEY) {
    missingKeys.push("GOOGLE_API_KEY");
  }

  // If any keys are missing, return an error
  if (missingKeys.length > 0) {
    return NextResponse.json(
      {
        success: false,
        message: `Missing environment variables: ${missingKeys.join(", ")}`,
        missingKeys,
      },
      { status: 500 }
    );
  }

  // If all keys are set, return success
  return NextResponse.json(
    {
      success: true,
      message: "All required environment variables are set",
    },
    { status: 200 }
  );
}
