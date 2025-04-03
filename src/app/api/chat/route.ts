import { NextResponse } from "next/server";

// Function to detect and enhance a query about a specific amount
const enhanceUserMessage = (message: string): string => {
  // Check for specific amount mentions with regex for various formats
  const amountRegex = /₦?\s*([\d,]+(?:\.\d+)?)\s*(?:naira)?/i;
  const match = message.match(amountRegex);

  if (match) {
    // Extract and clean the amount (remove commas)
    const amount = parseFloat(match[1].replace(/,/g, ""));

    // Skip if not a valid number
    if (isNaN(amount)) return message;

    // Calculate with proper precision
    const priceBeforeVAT = Math.round((amount / 1.075) * 100) / 100;
    const vatAmount = Math.round((amount - priceBeforeVAT) * 100) / 100;

    // Verify calculations
    const checkTotal = Math.round((priceBeforeVAT + vatAmount) * 100) / 100;
    const checkVAT = Math.round(priceBeforeVAT * 0.075 * 100) / 100;

    // Format numbers with commas for thousands
    const formatNumber = (num: number) => {
      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Add specific guidance for this amount
    return (
      message +
      `\n\nIMPORTANT: For a VAT-inclusive amount of ₦${formatNumber(amount)}, use these precise calculations:
    
1. Price before VAT = ₦${formatNumber(amount)} ÷ 1.075 = ₦${formatNumber(priceBeforeVAT)}
2. VAT amount = ₦${formatNumber(amount)} - ₦${formatNumber(priceBeforeVAT)} = ₦${formatNumber(vatAmount)}

Verification:
- Price before VAT + VAT amount = ₦${formatNumber(priceBeforeVAT)} + ₦${formatNumber(vatAmount)} = ₦${formatNumber(checkTotal)}
- VAT amount can also be calculated as: Price before VAT × 0.075 = ₦${formatNumber(priceBeforeVAT)} × 0.075 = ₦${formatNumber(checkVAT)}

Always use exactly these values in your response and round to 2 decimal places.`
    );
  }

  return message;
};

// Basic fallback responses for common tax-related questions
const getFallbackResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("income tax") || lowerMessage.includes("cit")) {
    return "Companies Income Tax (CIT) in Nigeria is charged at 30% of taxable profits for large companies. Small companies with turnover less than ₦25 million are exempt, while medium companies with turnover between ₦25-100 million pay 20%.";
  }

  if (lowerMessage.includes("vat") || lowerMessage.includes("value added tax")) {
    // Extract any mentioned amount
    const amountMatch = lowerMessage.match(/₦?\s*([\d,]+(?:\.\d+)?)\s*(?:naira)?/i);
    let amount = 10000; // Default example

    if (amountMatch) {
      const extractedAmount = parseFloat(amountMatch[1].replace(/,/g, ""));
      if (!isNaN(extractedAmount)) {
        amount = extractedAmount;
      }
    }

    // Calculate with proper precision
    const priceBeforeVAT = Math.round((amount / 1.075) * 100) / 100;
    const vatAmount = Math.round((amount - priceBeforeVAT) * 100) / 100;

    // Format numbers with commas for thousands
    const formatNumber = (num: number) => {
      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return `Value Added Tax (VAT) in Nigeria is charged at 7.5% on most goods and services. Some items are VAT exempt or zero-rated, including basic food items, medical supplies, and educational materials.

To calculate the price before VAT from a VAT-inclusive amount: Divide the total price by (1 + 7.5/100) = 1.075.

For a product costing ₦${formatNumber(amount)} (VAT inclusive):

1. Price before VAT = ₦${formatNumber(amount)} ÷ 1.075 = ₦${formatNumber(priceBeforeVAT)}
2. VAT amount = ₦${formatNumber(amount)} - ₦${formatNumber(priceBeforeVAT)} = ₦${formatNumber(vatAmount)}

It's important to round calculations to 2 decimal places for currency values.`;
  }

  if (lowerMessage.includes("capital gains") || lowerMessage.includes("cgt")) {
    return "Capital Gains Tax (CGT) in Nigeria is charged at 10% on gains from disposal of assets including property, shares, and other capital assets. There are some exemptions for primary residences and certain agricultural land.";
  }

  if (
    lowerMessage.includes("tax") ||
    lowerMessage.includes("firs") ||
    lowerMessage.includes("revenue")
  ) {
    return "The Federal Inland Revenue Service (FIRS) is the Nigerian government agency responsible for tax collection and administration. They oversee various taxes including Company Income Tax, Value Added Tax, and Personal Income Tax for residents of the Federal Capital Territory.";
  }

  // Generic response for other tax-related queries
  return "As your tax assistant, I can provide information on various Nigerian tax types like Company Income Tax (30%), Value Added Tax (7.5%), and Capital Gains Tax (10%). For more specific information, please ask about a particular tax type or visit the FIRS website at firs.gov.ng.";
};

export async function POST(req: Request) {
  try {
    // Parse the JSON request body
    const body = await req.json();
    const messages = body.messages || [];

    console.log("Received messages:", JSON.stringify(messages));

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.log("Invalid request format: messages array is empty or not valid");
      return NextResponse.json(
        { error: "Invalid request format: messages array is required" },
        { status: 400 }
      );
    }

    // Get the user's message (last message in the array)
    const userMessage = messages[messages.length - 1]?.content || "";
    console.log("Latest user message:", userMessage);

    // Check if API key is available
    const apiKey = process.env.MISTRAL_API_KEY;
    console.log("API key available:", !!apiKey);

    if (!apiKey) {
      console.log("Mistral API key not found, using fallback response");
      return NextResponse.json({ content: getFallbackResponse(userMessage) }, { status: 200 });
    }

    // Prepare the API request
    try {
      // Set up a timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      console.log("Calling Mistral API with key:", apiKey ? "Key exists" : "No key");

      // Create a copy of the messages array to avoid modifying the original
      const enhancedMessages = [...messages];

      // Enhance the last user message if it contains specific amounts
      if (
        enhancedMessages.length > 0 &&
        enhancedMessages[enhancedMessages.length - 1].role === "user"
      ) {
        enhancedMessages[enhancedMessages.length - 1] = {
          ...enhancedMessages[enhancedMessages.length - 1],
          content: enhanceUserMessage(enhancedMessages[enhancedMessages.length - 1].content),
        };
      }

      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: "mistral-tiny",
          messages: [
            {
              role: "system",
              content:
                "You are a knowledgeable tax assistant focused on Nigerian tax regulations. Provide clear, accurate information about tax types, rates, calculations, and compliance requirements based on current Nigerian tax laws. Always aim to be helpful and educational.\n\nWhen explaining VAT calculations, always use the correct methodology as follows:\n\n1. For calculating price before VAT from VAT-inclusive amount: Divide the total price by (1 + VAT rate/100). For Nigeria's 7.5% VAT: Price Before VAT = Total Price ÷ (1 + 7.5/100) = Total Price ÷ 1.075\n\n2. For calculating VAT amount: Subtract the price before VAT from the total price. VAT Amount = Total Price - Price Before VAT\n\nAlways provide a clear step-by-step explanation for each calculation, showing the formula used and how each value was derived. Format currency values with the Naira symbol (₦) and always use proper comma separators for thousands.\n\nIMPORTANT: When a user mentions a specific amount like ₦10,000, use EXACTLY that amount in your calculations and examples. Do not substitute it with ₦50,000 or any other amount. Be very precise and accurate with the values the user provides.\n\nCORRECT CALCULATIONS WITH PROPER DECIMAL PRECISION:\n- For ₦10,000 (VAT inclusive): Price before VAT = ₦10,000 ÷ 1.075 = ₦9,302.33, VAT = ₦697.67\n- For ₦50,000 (VAT inclusive): Price before VAT = ₦50,000 ÷ 1.075 = ₦46,511.63, VAT = ₦3,488.37\n- For ₦100,000 (VAT inclusive): Price before VAT = ₦100,000 ÷ 1.075 = ₦93,023.26, VAT = ₦6,976.74\n\nAlways double-check your calculations before responding to ensure they satisfy these mathematical relationships:\n1. Price Before VAT + VAT Amount = Total Price (VAT inclusive)\n2. VAT Amount = Price Before VAT × (7.5/100)\n3. Total amounts should be rounded to 2 decimal places for currency values.",
            },
            ...enhancedMessages,
          ],
          max_tokens: 1024,
        }),
        signal: controller.signal,
      });

      // Clear the timeout to prevent memory leaks
      clearTimeout(timeoutId);

      if (!response.ok) {
        // Log the error details for debugging
        const errorData = await response.json().catch(() => ({}));
        console.error("API response error:", response.status, errorData);

        // Return a fallback response
        return NextResponse.json({ content: getFallbackResponse(userMessage) }, { status: 200 });
      }

      const data = await response.json();
      const assistantMessage =
        data.choices[0]?.message?.content ||
        "I apologize, but I couldn't process your request right now. Please try again.";

      return NextResponse.json({ content: assistantMessage }, { status: 200 });
    } catch (error) {
      console.error("Error calling Mistral API:", error);
      return NextResponse.json({ content: getFallbackResponse(userMessage) }, { status: 200 });
    }
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
