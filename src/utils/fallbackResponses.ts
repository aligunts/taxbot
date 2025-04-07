/**
 * Fallback responses for when the API is unavailable
 */

const fallbackResponses = [
  {
    keywords: ["hello", "hi", "hey", "greetings"],
    response:
      "Hello! I'm your tax assistant. I can help with Nigerian tax questions, but I'm currently in offline mode due to connection issues.",
  },
  {
    keywords: ["vat", "value added tax"],
    response:
      "Standard VAT in Nigeria is 7.5%. Some items like basic food, medical supplies, and educational materials are VAT exempt.",
  },
  {
    keywords: ["cra", "consolidated relief allowance"],
    response:
      "Consolidated Relief Allowance (CRA) is calculated as the greater of ₦200,000 or 21% of gross income (which is the sum of 1% + 20% of gross income).",
  },
  {
    keywords: ["bracket", "tax bracket", "personal income tax"],
    response:
      "Nigerian personal income tax follows progressive brackets: 7% (first ₦300k), 11% (next ₦300k), 15% (next ₦500k), 19% (next ₦500k), 21% (next ₦1.6M), and 24% (excess over ₦3.2M).",
  },
  {
    keywords: ["pension", "pension contribution"],
    response:
      "The standard pension contribution in Nigeria is 8% of gross income from the employee, with a maximum contribution cap of ₦500,000.",
  },
];

/**
 * Get a fallback response based on keywords in the user's message
 * @param message The user's message
 * @returns A fallback response or a default message
 */
export function getFallbackResponse(message: string): string {
  const lowercaseMessage = message.toLowerCase();

  // Check if any of the keyword sets match
  for (const { keywords, response } of fallbackResponses) {
    if (keywords.some((keyword) => lowercaseMessage.includes(keyword))) {
      return response;
    }
  }

  // Default response if no keywords match
  return "I'm currently in offline mode due to connection issues. I can normally help with Nigerian tax calculations, VAT, CRA, and tax brackets. Please try again later.";
}

export default getFallbackResponse;
