import { NextResponse } from "next/server";

/**
 * Checks if the required environment variables are set
 * This endpoint should be called before making any other API calls
 * to ensure the server is configured correctly
 */
export async function GET() {
  const missingKeys = [];
  const availableKeys = [];

  // Check if the Mistral API keys are set
  if (!process.env.MISTRAL_API_KEY && !process.env.MISTRAL_API_KEY_2) {
    missingKeys.push("MISTRAL_API_KEY and MISTRAL_API_KEY_2");
  } else {
    if (process.env.MISTRAL_API_KEY) {
      availableKeys.push("MISTRAL_API_KEY");
    }
    if (process.env.MISTRAL_API_KEY_2) {
      availableKeys.push("MISTRAL_API_KEY_2");
    }
  }

  // Check if the Google API key is set (if your application uses it)
  if (!process.env.GOOGLE_API_KEY) {
    missingKeys.push("GOOGLE_API_KEY");
  } else {
    availableKeys.push("GOOGLE_API_KEY");
  }

  // If any keys are missing, return an error
  if (missingKeys.length > 0) {
    return NextResponse.json(
      {
        success: false,
        message: `Missing environment variables: ${missingKeys.join(", ")}`,
        missingKeys,
        availableKeys,
      },
      { status: 500 }
    );
  }

  // If all keys are set, return success
  return NextResponse.json(
    {
      success: true,
      message: "All required environment variables are set",
      availableKeys,
    },
    { status: 200 }
  );
}
