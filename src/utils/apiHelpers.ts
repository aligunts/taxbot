/**
 * API helper functions for the Taxbot application
 */

/**
 * Sends a chat message to the API and returns the response
 * @param message The user's message to send to the API
 * @returns A promise that resolves to the API response
 */
export async function sendChatMessage(message: string) {
  // Don't send empty messages
  if (!message.trim()) {
    throw new Error("Message cannot be empty");
  }

  try {
    // Make the API request
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    // Parse the JSON response
    const data = await response.json();

    // Check if the response was successful
    if (!response.ok) {
      // Log the error for debugging
      console.error("API error:", {
        status: response.status,
        statusText: response.statusText,
        error: data.error || "Unknown error",
      });

      throw new Error(data.error || `API error: ${response.status} ${response.statusText}`);
    }

    // Return the response data
    return data;
  } catch (error) {
    // Log all errors
    console.error("Error in sendChatMessage:", error);

    // Re-throw the error to be handled by the caller
    throw error;
  }
}

/**
 * Checks if the API is available and configured correctly
 * @returns A promise that resolves to true if the API is available
 */
export async function checkApiAvailability() {
  try {
    const response = await fetch("/api/env-check", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return {
      available: response.ok,
      message: data.message || "API is available",
      missingKeys: data.missingKeys || [],
    };
  } catch (error) {
    console.error("API availability check failed:", error);
    return {
      available: false,
      message: "Could not connect to API server",
      missingKeys: ["UNKNOWN"],
    };
  }
}
