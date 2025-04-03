import { NextResponse } from "next/server";
import { isItemLikelyExempt, getSuggestedCategories } from "../../../utils/vatExemptionsGuide";

// Function to detect and enhance a query about a specific amount
const enhanceUserMessage = (message: string): string => {
  // Check for specific amount mentions with regex for various formats
  const amountRegex = /₦?\s*([\d,]+(?:\.\d+)?)\s*(?:naira)?/i;
  const match = message.match(amountRegex);

  // Extract product or item name if mentioned
  const productRegex =
    /(?:(?:for|on|of|buying|purchasing|selling|taking|using|about|like|such as)\s+(?:a|an|the|some)?\s*([a-zA-Z\s]+?)(?:\s+at|\s+worth|\s+costing|\s+for|\s+with|\?|\.|\!|$))|(?:(?:a|an|the|some)\s+([a-zA-Z\s]+?)(?:\s+(?:is|are|costs?|costs|priced|at|for|with)|\?|\.|\!|$))/i;
  const productMatch = message.match(productRegex);
  let productName = productMatch ? (productMatch[1] || productMatch[2] || "").trim() : "";

  // If no product is found with the regex, check if common exempt product names are mentioned
  if (!productName) {
    // Common medicines
    const medicineNames = [
      "panadol",
      "paracetamol",
      "ibuprofen",
      "aspirin",
      "medicine",
      "drug",
      "pharmaceutical",
    ];

    // Common baby products
    const babyProductNames = [
      "pampers",
      "huggies",
      "diaper",
      "nappy",
      "baby product",
      "baby food",
      "baby formula",
    ];

    // Common educational items
    const educationalItems = [
      "textbook",
      "notebook",
      "pencil",
      "pen",
      "ruler",
      "eraser",
      "calculator",
      "school supply",
    ];

    // Common basic food items
    const basicFoodItems = [
      "rice",
      "beans",
      "yam",
      "cassava",
      "potato",
      "vegetable",
      "fruit",
      "fish",
      "meat",
      "egg",
    ];

    // Combine all exempt product types
    const exemptProducts = [
      ...medicineNames,
      ...babyProductNames,
      ...educationalItems,
      ...basicFoodItems,
    ];

    for (const product of exemptProducts) {
      if (message.toLowerCase().includes(product)) {
        productName = product;
        break;
      }
    }
  }

  // If we have both an amount and a product, check if the product is VAT exempt
  if (match && productName) {
    // Extract and clean the amount (remove commas)
    const amount = parseFloat(match[1].replace(/,/g, ""));

    // Skip if not a valid number
    if (isNaN(amount)) return message;

    // Check if the product is likely VAT exempt
    const isExempt = isItemLikelyExempt(productName);
    const suggestedCategories = getSuggestedCategories(productName);

    if (isExempt) {
      // Format numbers with commas for thousands
      const formatNumber = (num: number) => {
        return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      };

      return (
        message +
        `\n\nIMPORTANT: The product "${productName}" appears to fall under VAT-exempt categories in Nigeria (${suggestedCategories.join(", ")}). No VAT should be calculated for this item.
      
For VAT-exempt items:
1. Price before VAT = ₦${formatNumber(amount)} (no VAT is applicable)
2. VAT amount = ₦0.00
3. Total price = ₦${formatNumber(amount)}`
      );
    }

    // Check if the amount is explicitly mentioned as VAT-inclusive
    const isVatInclusive =
      /vat[\s-]*inclusive|including vat|includes vat|with vat|price after vat/i.test(message);

    // Format numbers with commas for thousands
    const formatNumber = (num: number) => {
      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    if (isVatInclusive) {
      // If VAT-inclusive, calculate price before VAT
      const priceBeforeVAT = Math.round((amount / 1.075) * 100) / 100;
      const vatAmount = Math.round((amount - priceBeforeVAT) * 100) / 100;

      // Verify calculations
      const checkTotal = Math.round((priceBeforeVAT + vatAmount) * 100) / 100;

      return (
        message +
        `\n\nIMPORTANT: The product "${productName}" does not appear to be VAT-exempt in Nigeria. For a VAT-inclusive amount of ₦${formatNumber(amount)}, use these precise calculations:
      
1. Price before VAT = ₦${formatNumber(amount)} ÷ 1.075 = ₦${formatNumber(priceBeforeVAT)}
2. VAT amount = ₦${formatNumber(amount)} - ₦${formatNumber(priceBeforeVAT)} = ₦${formatNumber(vatAmount)}

Verification:
- Price before VAT + VAT amount = ₦${formatNumber(priceBeforeVAT)} + ₦${formatNumber(vatAmount)} = ₦${formatNumber(checkTotal)}

Always use exactly these values in your response and round to 2 decimal places.`
      );
    } else {
      // Default to VAT-exclusive calculations
      const vatAmount = Math.round(amount * 0.075 * 100) / 100;
      const totalAmount = Math.round((amount + vatAmount) * 100) / 100;

      return (
        message +
        `\n\nIMPORTANT: The product "${productName}" does not appear to be VAT-exempt in Nigeria. For a VAT-exclusive amount of ₦${formatNumber(amount)}, use these precise calculations:
      
1. VAT amount = ₦${formatNumber(amount)} × 0.075 = ₦${formatNumber(vatAmount)}
2. Total price = ₦${formatNumber(amount)} + ₦${formatNumber(vatAmount)} = ₦${formatNumber(totalAmount)}

Always use exactly these values in your response and round to 2 decimal places.`
      );
    }
  }

  // If we only have an amount but no product name
  if (match && !productName) {
    // Extract and clean the amount (remove commas)
    const amount = parseFloat(match[1].replace(/,/g, ""));

    // Skip if not a valid number
    if (isNaN(amount)) return message;

    // Check if the amount is explicitly mentioned as VAT-inclusive
    const isVatInclusive =
      /vat[\s-]*inclusive|including vat|includes vat|with vat|price after vat/i.test(message);

    // Format numbers with commas for thousands
    const formatNumber = (num: number) => {
      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    if (isVatInclusive) {
      // Calculate with proper precision for VAT-inclusive amount
      const priceBeforeVAT = Math.round((amount / 1.075) * 100) / 100;
      const vatAmount = Math.round((amount - priceBeforeVAT) * 100) / 100;

      // Verify calculations
      const checkTotal = Math.round((priceBeforeVAT + vatAmount) * 100) / 100;
      const checkVAT = Math.round(priceBeforeVAT * 0.075 * 100) / 100;

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
    } else {
      // Default to VAT-exclusive calculations
      const vatAmount = Math.round(amount * 0.075 * 100) / 100;
      const totalAmount = Math.round((amount + vatAmount) * 100) / 100;

      return (
        message +
        `\n\nIMPORTANT: For a VAT-exclusive amount of ₦${formatNumber(amount)}, use these precise calculations:
      
1. VAT amount = ₦${formatNumber(amount)} × 0.075 = ₦${formatNumber(vatAmount)}
2. Total price = ₦${formatNumber(amount)} + ₦${formatNumber(vatAmount)} = ₦${formatNumber(totalAmount)}

Verification:
- Net price + VAT amount = ₦${formatNumber(amount)} + ₦${formatNumber(vatAmount)} = ₦${formatNumber(totalAmount)}

Always use exactly these values in your response and round to 2 decimal places.`
      );
    }
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

    // Extract product or item name if mentioned
    const productRegex =
      /(?:(?:for|on|of|buying|purchasing|selling|taking|using|about|like|such as)\s+(?:a|an|the|some)?\s*([a-zA-Z\s]+?)(?:\s+at|\s+worth|\s+costing|\s+for|\s+with|\?|\.|\!|$))|(?:(?:a|an|the|some)\s+([a-zA-Z\s]+?)(?:\s+(?:is|are|costs?|costs|priced|at|for|with)|\?|\.|\!|$))/i;
    const productMatch = lowerMessage.match(productRegex);
    let productName = productMatch ? (productMatch[1] || productMatch[2] || "").trim() : "";

    // If no product is found with the regex, check if common exempt product names are mentioned
    if (!productName) {
      // Common medicines
      const medicineNames = [
        "panadol",
        "paracetamol",
        "ibuprofen",
        "aspirin",
        "medicine",
        "drug",
        "pharmaceutical",
      ];

      // Common baby products
      const babyProductNames = [
        "pampers",
        "huggies",
        "diaper",
        "nappy",
        "baby product",
        "baby food",
        "baby formula",
      ];

      // Common educational items
      const educationalItems = [
        "textbook",
        "notebook",
        "pencil",
        "pen",
        "ruler",
        "eraser",
        "calculator",
        "school supply",
      ];

      // Common basic food items
      const basicFoodItems = [
        "rice",
        "beans",
        "yam",
        "cassava",
        "potato",
        "vegetable",
        "fruit",
        "fish",
        "meat",
        "egg",
      ];

      // Combine all exempt product types
      const exemptProducts = [
        ...medicineNames,
        ...babyProductNames,
        ...educationalItems,
        ...basicFoodItems,
      ];

      for (const product of exemptProducts) {
        if (lowerMessage.includes(product)) {
          productName = product;
          break;
        }
      }
    }

    // Check if the product is VAT exempt
    if (productName) {
      const isExempt = isItemLikelyExempt(productName);
      const suggestedCategories = getSuggestedCategories(productName);

      if (isExempt && suggestedCategories.length > 0) {
        // Format numbers with commas for thousands
        const formatNumber = (num: number) => {
          return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        };

        return `Value Added Tax (VAT) in Nigeria is charged at 7.5% on most goods and services. Some items are VAT exempt or zero-rated, including basic food items, medical supplies, and educational materials.

The product "${productName}" appears to fall under the following VAT-exempt category in Nigeria: ${suggestedCategories.join(", ")}.

For VAT-exempt items:
- No VAT is calculated or charged
- The price before VAT equals the total price
- For your item priced at ₦${formatNumber(amount)}, the full amount is the actual cost with no VAT component

This means:
- Net price: ₦${formatNumber(amount)}
- VAT amount: ₦0.00
- Total price: ₦${formatNumber(amount)}`;
      }
    }

    // Check if the query is explicitly about VAT-inclusive prices
    const isVatInclusive =
      /vat[\s-]*inclusive|including vat|includes vat|with vat|price after vat/i.test(lowerMessage);

    // Format numbers with commas for thousands
    const formatNumber = (num: number) => {
      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    if (isVatInclusive) {
      // Calculate with proper precision for VAT-inclusive amount
      const priceBeforeVAT = Math.round((amount / 1.075) * 100) / 100;
      const vatAmount = Math.round((amount - priceBeforeVAT) * 100) / 100;

      return `Value Added Tax (VAT) in Nigeria is charged at 7.5% on most goods and services. Some items are VAT exempt or zero-rated, including basic food items, medical supplies, and educational materials.

For VAT-inclusive prices, you need to extract the original price before VAT:

1. To calculate the price before VAT from a VAT-inclusive amount: 
   Divide the total price by (1 + 7.5/100) = 1.075

2. For a product costing ₦${formatNumber(amount)} (VAT-inclusive):
   Price before VAT = ₦${formatNumber(amount)} ÷ 1.075 = ₦${formatNumber(priceBeforeVAT)}

3. VAT amount = ₦${formatNumber(amount)} - ₦${formatNumber(priceBeforeVAT)} = ₦${formatNumber(vatAmount)}

It's important to round calculations to 2 decimal places for currency values.`;
    } else {
      // Default to VAT-exclusive calculations
      const vatAmount = Math.round(amount * 0.075 * 100) / 100;
      const totalAmount = Math.round((amount + vatAmount) * 100) / 100;

      return `Value Added Tax (VAT) in Nigeria is charged at 7.5% on most goods and services. Some items are VAT exempt or zero-rated, including basic food items, medical supplies, and educational materials.

For VAT-exclusive prices (the default when a price is quoted):

1. To calculate the VAT amount from a net price: 
   Multiply the net price by the VAT rate (7.5/100 = 0.075)

2. For a product costing ₦${formatNumber(amount)} (VAT-exclusive):
   VAT amount = ₦${formatNumber(amount)} × 0.075 = ₦${formatNumber(vatAmount)}

3. Total price = ₦${formatNumber(amount)} + ₦${formatNumber(vatAmount)} = ₦${formatNumber(totalAmount)}

It's important to round calculations to 2 decimal places for currency values.`;
    }
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
                "You are a knowledgeable tax assistant focused on Nigerian tax regulations. Provide clear, accurate information about tax types, rates, calculations, and compliance requirements based on current Nigerian tax laws. Always aim to be helpful and educational.\n\nWhen dealing with VAT, ALWAYS check if the product or service is VAT exempt BEFORE calculating VAT. The following categories are generally VAT exempt in Nigeria:\n\n- Basic/unprocessed food items (raw vegetables, fruits, grains, unprocessed meat, eggs in shell, rice, beans, yams, potatoes, etc.)\n- Medical and pharmaceutical products (ALL medicines including Panadol, paracetamol, aspirin, ibuprofen, prescription medicines, over-the-counter medicines, medical equipment, hospital services, etc.)\n- Educational materials and services (tuition fees, educational books, textbooks, school supplies, notebooks, pens, pencils, rulers, etc.)\n- Books, newspapers, and educational resources (textbooks, religious books, magazines, dictionaries, encyclopedias, etc.)\n- Essential baby products (baby food, infant formula, diapers/nappies including branded products like Pampers and Huggies, baby toiletries, etc.)\n- Agricultural equipment and inputs (fertilizers, farm equipment, seeds)\n- Exported goods and services\n\nIMPORTANT: ALL MEDICINES AND MEDICAL PRODUCTS INCLUDING PANADOL ARE VAT EXEMPT. ALL ESSENTIAL BABY PRODUCTS INCLUDING PAMPERS AND OTHER DIAPER BRANDS ARE VAT EXEMPT. If a product is a medication, medical product, baby essential, or falls in other exempt categories, it is VAT exempt and NO VAT should be calculated.\n\nIf a product falls into these categories, clearly state that it is VAT exempt and NO VAT should be calculated.\n\nVAT CALCULATION APPROACH:\n\nIMPORTANT: ALWAYS ASSUME PRICES ARE VAT-EXCLUSIVE UNLESS SPECIFICALLY TOLD THE PRICE IS VAT-INCLUSIVE. By default, treat all prices as net prices that do not include VAT yet.\n\n1. For VAT-exclusive prices (DEFAULT assumption - when the user mentions a price without specifying if it includes VAT):\n   - Use the formula: VAT Amount = Net Price × VAT Rate\n   - For Nigeria's 7.5% VAT: VAT Amount = Net Price × 0.075\n   - Total Price = Net Price + VAT Amount\n   - Example: If an item costs ₦10,000 (VAT-exclusive), VAT Amount = ₦10,000 × 0.075 = ₦750, Total Price = ₦10,000 + ₦750 = ₦10,750\n\n2. For VAT-inclusive prices (ONLY when explicitly told the price already includes VAT):\n   - Use the formula: Price Before VAT = Total Price ÷ (1 + VAT Rate)\n   - For Nigeria's 7.5% VAT: Price Before VAT = Total Price ÷ 1.075\n   - VAT Amount = Total Price - Price Before VAT\n   - Example: If an item costs ₦10,000 (VAT-inclusive), Price Before VAT = ₦10,000 ÷ 1.075 = ₦9,302.33, VAT Amount = ₦10,000 - ₦9,302.33 = ₦697.67\n\nAlways provide a clear step-by-step explanation for each calculation, showing the formula used and how each value was derived. Format currency values with the Naira symbol (₦) and always use proper comma separators for thousands.\n\nIMPORTANT: When a user mentions a specific amount like ₦10,000, use EXACTLY that amount in your calculations and examples. Do not substitute it with ₦50,000 or any other amount. Be very precise and accurate with the values the user provides.\n\nCORRECT CALCULATIONS WITH PROPER DECIMAL PRECISION:\n- For ₦10,000 (VAT-exclusive): VAT Amount = ₦10,000 × 0.075 = ₦750, Total = ₦10,750\n- For ₦50,000 (VAT-exclusive): VAT Amount = ₦50,000 × 0.075 = ₦3,750, Total = ₦53,750\n- For ₦10,000 (VAT-inclusive): Price Before VAT = ₦10,000 ÷ 1.075 = ₦9,302.33, VAT = ₦697.67\n\nAlways double-check your calculations before responding to ensure they satisfy these mathematical relationships:\n1. For VAT-exclusive: Net Price + VAT Amount = Total Price\n2. For VAT-inclusive: Price Before VAT + VAT Amount = Total Price\n3. Total amounts should be rounded to 2 decimal places for currency values.",
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
