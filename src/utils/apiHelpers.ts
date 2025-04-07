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
    // Make the API request with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    const response = await fetchWithRetry(
      "/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
        signal: controller.signal,
        cache: "no-store", // Disable caching
      },
      3, // 3 retries
      300 // 300ms initial backoff
    );

    clearTimeout(timeoutId);

    // Parse the JSON response
    const data = await response.json().catch((e) => {
      console.error("Failed to parse JSON response:", e);
      return { error: "Invalid response format" };
    });

    // Check if the response was successful
    if (!response.ok) {
      // Log the error for debugging
      console.error("API error:", {
        status: response.status,
        statusText: response.statusText,
        error: data.error || "Unknown error",
        data,
      });

      throw new Error(data.error || `API error: ${response.status} ${response.statusText}`);
    }

    // Return the response data
    return data;
  } catch (error) {
    // Check for timeout errors
    if (error.name === "AbortError") {
      console.error("Request timed out");
      throw new Error("Request timed out. The server took too long to respond.");
    }

    // Log all errors with detailed information
    console.error("Error in sendChatMessage:", {
      error,
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
      status: error.status || "unknown",
    });

    // Log the request that caused the error
    console.log("Request that caused error:", {
      endpoint: "/api/chat",
      body: { message },
    });

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
    // Add timeout for the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

    const response = await fetch("/api/env-check", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      cache: "no-store", // Disable caching
    });

    clearTimeout(timeoutId);

    const data = await response
      .json()
      .catch(() => ({ success: false, message: "Invalid response format" }));

    // Add detailed logging
    console.log("API availability check result:", {
      status: response.status,
      ok: response.ok,
      data,
    });

    return {
      available: response.ok && data.success,
      message: data.message || "API is available",
      missingKeys: data.missingKeys || [],
    };
  } catch (error) {
    // Check for timeout errors
    if (error.name === "AbortError") {
      console.error("API availability check timed out");
      return {
        available: false,
        message: "API availability check timed out. The server took too long to respond.",
        missingKeys: ["CONNECTION_TIMEOUT"],
      };
    }

    console.error("API availability check failed:", error);
    return {
      available: false,
      message: "Could not connect to API server: " + (error.message || "Unknown error"),
      missingKeys: ["CONNECTION_ERROR"],
    };
  }
}

/**
 * Retries a fetch request with exponential backoff
 * @param url The URL to fetch
 * @param options Fetch options
 * @param retries Number of retries
 * @param backoff Initial backoff in ms
 * @returns A promise that resolves to the fetch response
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  backoff = 300
): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (retries <= 1) throw error;

    // Wait for the backoff period
    await new Promise((resolve) => setTimeout(resolve, backoff));

    // Retry with exponential backoff
    console.log(`Retrying fetch to ${url}, ${retries - 1} retries left`);
    return fetchWithRetry(url, options, retries - 1, backoff * 2);
  }
}
