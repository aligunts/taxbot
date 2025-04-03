import { NextResponse } from "next/server";
import {
  isItemLikelyExempt,
  getSuggestedCategories,
  checkOnlineVatExemption,
} from "../../../utils/vatExemptionsGuide";

// Function to detect and enhance a query about a specific amount
const enhanceUserMessage = async (message: string): Promise<string> => {
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

    // Format numbers with commas for thousands
    const formatNumber = (num: number) => {
      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Check if they're asking for "price before VAT" for a VAT-inclusive price
    const askingForPriceBeforeVAT =
      message.toLowerCase().includes("price before vat") ||
      message.toLowerCase().includes("calculate the price before vat") ||
      message.toLowerCase().includes("what is the price before vat") ||
      (message.toLowerCase().includes("before vat") && message.toLowerCase().includes("price"));

    // Check if the amount is explicitly mentioned as VAT-inclusive
    const isVatInclusive =
      /vat[\s-]*inclusive|including vat|includes vat|with vat|price after vat/i.test(message);

    // If asking specifically about price before VAT, treat the amount as VAT-inclusive
    if (askingForPriceBeforeVAT) {
      // When asking for "price before VAT", we treat the amount as VAT-inclusive
      const priceBeforeVAT = Math.round((amount / 1.075) * 100) / 100;
      const vatAmount = Math.round((amount - priceBeforeVAT) * 100) / 100;

      // Verify calculations
      const checkTotal = Math.round((priceBeforeVAT + vatAmount) * 100) / 100;

      return (
        message +
        `\n\nIMPORTANT: When asking for the "price before VAT", I need to calculate what the price was before VAT was added. For a total amount of ₦${formatNumber(amount)} (VAT-inclusive), the calculations are:

1. Price before VAT = ₦${formatNumber(amount)} ÷ 1.075 = ₦${formatNumber(priceBeforeVAT)}
2. VAT amount = ₦${formatNumber(amount)} - ₦${formatNumber(priceBeforeVAT)} = ₦${formatNumber(vatAmount)}

Verification:
- Price before VAT + VAT amount = ₦${formatNumber(priceBeforeVAT)} + ₦${formatNumber(vatAmount)} = ₦${formatNumber(checkTotal)}

Always use exactly these values in your response and round to 2 decimal places.`
      );
    }

    // Check online if the product is VAT exempt
    const exemptionCheck = await checkOnlineVatExemption(productName);
    const isExempt = exemptionCheck.isExempt;
    const category = exemptionCheck.category || "";
    const source = exemptionCheck.source || "online-check";
    const confidence = exemptionCheck.confidence || 0;
    const uncertain = exemptionCheck.uncertain || false;

    // If we're uncertain about the product, ask for clarification
    if (uncertain) {
      return (
        message +
        `\n\nI'm not completely certain about the VAT status of "${productName}" as it could fall under different categories. 

Could you please clarify which category your product falls under? Is it:
- A medical or pharmaceutical product
- A baby product
- An educational material or book
- A basic/unprocessed food item
- An agricultural input
- A religious item

This will help me determine whether it's VAT-exempt or not.`
      );
    }

    if (isExempt) {
      // Format numbers with commas for thousands
      return (
        message +
        `\n\nIMPORTANT: "${productName}" falls under VAT-exempt category in Nigeria: ${category}. No VAT should be calculated for this item.
      
For VAT-exempt items:
1. Price before VAT = ₦${formatNumber(amount)} (no VAT is applicable)
2. VAT amount = ₦0.00
3. Total price = ₦${formatNumber(amount)}`
      );
    }

    if (isVatInclusive) {
      // If VAT-inclusive, calculate price before VAT
      const priceBeforeVAT = Math.round((amount / 1.075) * 100) / 100;
      const vatAmount = Math.round((amount - priceBeforeVAT) * 100) / 100;

      // Verify calculations
      const checkTotal = Math.round((priceBeforeVAT + vatAmount) * 100) / 100;

      return (
        message +
        `\n\nIMPORTANT: "${productName}" is NOT VAT-exempt in Nigeria. For a VAT-inclusive amount of ₦${formatNumber(amount)}, use these precise calculations:
      
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
        `\n\nIMPORTANT: "${productName}" is NOT VAT-exempt in Nigeria. For a VAT-exclusive amount of ₦${formatNumber(amount)}, use these precise calculations:
      
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

    // Format numbers with commas for thousands
    const formatNumber = (num: number) => {
      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Check if they're asking for "price before VAT" calculation
    const askingForPriceBeforeVAT =
      message.toLowerCase().includes("price before vat") ||
      message.toLowerCase().includes("calculate the price before vat") ||
      message.toLowerCase().includes("what is the price before vat") ||
      (message.toLowerCase().includes("before vat") && message.toLowerCase().includes("price"));

    // If asking about "price before VAT", assume the amount given is VAT-inclusive
    if (askingForPriceBeforeVAT) {
      // When asking for "price before VAT", we treat the amount as VAT-inclusive
      const priceBeforeVAT = Math.round((amount / 1.075) * 100) / 100;
      const vatAmount = Math.round((amount - priceBeforeVAT) * 100) / 100;

      // Verify calculations
      const checkTotal = Math.round((priceBeforeVAT + vatAmount) * 100) / 100;

      return `When asking for the "price before VAT", I need to calculate what the price was before VAT was added. For a total amount of ₦${formatNumber(amount)} (VAT-inclusive), the calculations are:

1. Price before VAT = ₦${formatNumber(amount)} ÷ 1.075 = ₦${formatNumber(priceBeforeVAT)}
2. VAT amount = ₦${formatNumber(amount)} - ₦${formatNumber(priceBeforeVAT)} = ₦${formatNumber(vatAmount)}

Verification:
- Price before VAT + VAT amount = ₦${formatNumber(priceBeforeVAT)} + ₦${formatNumber(vatAmount)} = ₦${formatNumber(checkTotal)}

These calculations assume the amount you provided (₦${formatNumber(amount)}) is VAT-inclusive, which is the total amount after VAT was added.`;
    }

    // Check if the amount is explicitly mentioned as VAT-inclusive
    const isVatInclusive =
      /vat[\s-]*inclusive|including vat|includes vat|with vat|price after vat/i.test(message);

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

// Function to generate a fallback response when the AI doesn't adequately address a VAT-related question
const getFallbackResponse = async (message: string): Promise<string> => {
  // Extract the amount mentioned (default to ₦10,000 if none found)
  const amountRegex = /₦?\s*([\d,]+(?:\.\d+)?)\s*(?:naira)?/i;
  const match = message.match(amountRegex);
  const amount = match ? parseFloat(match[1].replace(/,/g, "")) : 10000; // Default amount

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

  // Format numbers with commas for thousands
  const formatNumber = (num: number) => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (productName) {
    // Check online for VAT exemption status
    const exemptionCheck = await checkOnlineVatExemption(productName);
    const isExempt = exemptionCheck.isExempt;
    const category = exemptionCheck.category || "";
    const source = exemptionCheck.source || "online-check";
    const confidence = exemptionCheck.confidence || 0;
    const uncertain = exemptionCheck.uncertain || false;

    // If we're uncertain about the product, ask for clarification
    if (uncertain) {
      return `I'm not completely certain about the VAT status of "${productName}" as it could fall under different categories.

Could you please clarify which category your product falls under? Is it:
- A medical or pharmaceutical product
- A baby product
- An educational material or book
- A basic/unprocessed food item
- An agricultural input
- A religious item

This will help me determine whether it's VAT-exempt or not.`;
    }

    if (isExempt) {
      return `"${productName}" falls under the VAT-exempt category in Nigeria: ${category}. 

For VAT-exempt items like ${productName}:
1. Price before VAT = ₦${formatNumber(amount)} (no VAT is applicable)
2. VAT amount = ₦0.00
3. Total price = ₦${formatNumber(amount)}

Remember that in Nigeria, VAT exemptions apply to essential items including medicines, basic food items, books and educational materials, baby products, and certain agricultural inputs.`;
    }
  }

  // Check if the amount is explicitly mentioned as VAT-inclusive
  const isVatInclusive =
    /vat[\s-]*inclusive|including vat|includes vat|with vat|price after vat/i.test(message);

  const productInfo = productName ? `for "${productName}" (which is not VAT-exempt)` : "";

  if (isVatInclusive) {
    // Calculate with proper precision for VAT-inclusive amount
    const priceBeforeVAT = Math.round((amount / 1.075) * 100) / 100;
    const vatAmount = Math.round((amount - priceBeforeVAT) * 100) / 100;

    // Verify calculations
    const checkTotal = Math.round((priceBeforeVAT + vatAmount) * 100) / 100;
    const checkVAT = Math.round(priceBeforeVAT * 0.075 * 100) / 100;

    return `For a VAT-inclusive amount of ₦${formatNumber(amount)} ${productInfo}, here's how to calculate the values correctly:

1. Price before VAT = ₦${formatNumber(amount)} ÷ 1.075 = ₦${formatNumber(priceBeforeVAT)}
2. VAT amount = ₦${formatNumber(amount)} - ₦${formatNumber(priceBeforeVAT)} = ₦${formatNumber(vatAmount)}

Verification:
- Price before VAT + VAT amount = ₦${formatNumber(priceBeforeVAT)} + ₦${formatNumber(vatAmount)} = ₦${formatNumber(checkTotal)}
- VAT amount can also be calculated as: Price before VAT × 0.075 = ₦${formatNumber(priceBeforeVAT)} × 0.075 = ₦${formatNumber(checkVAT)}

By default, I assume prices are VAT-exclusive unless specifically stated as VAT-inclusive.`;
  } else {
    // Default to VAT-exclusive calculations
    const vatAmount = Math.round(amount * 0.075 * 100) / 100;
    const totalAmount = Math.round((amount + vatAmount) * 100) / 100;

    return `For a VAT-exclusive amount of ₦${formatNumber(amount)} ${productInfo}, here's how to calculate the values correctly:

1. VAT amount = ₦${formatNumber(amount)} × 0.075 = ₦${formatNumber(vatAmount)}
2. Total price = ₦${formatNumber(amount)} + ₦${formatNumber(vatAmount)} = ₦${formatNumber(totalAmount)}

By default, I assume prices are VAT-exclusive unless specifically stated as VAT-inclusive.`;
  }
};

// Function to handle API requests to /api/chat
export async function POST(req: Request) {
  try {
    // Get user message from request body
    const body = await req.json();
    const userMessage = body.message || "";

    // Avoid empty messages
    if (!userMessage.trim()) {
      return NextResponse.json({ error: "Please provide a message" }, { status: 400 });
    }

    // Enhanced the user message with potential calculations
    let enhancedUserMessage;
    try {
      // Add a timeout to the enhanceUserMessage function to prevent hanging
      const enhancePromise = enhanceUserMessage(userMessage);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timed out checking VAT status")), 5000)
      );

      enhancedUserMessage = await Promise.race([enhancePromise, timeoutPromise]);
    } catch (error) {
      console.error("Error enhancing user message:", error);
      enhancedUserMessage = userMessage;
    }

    // Structure messages for the API
    const enhancedMessages = [
      {
        role: "system",
        content: `You are a Nigerian tax chatbot, specializing in helping users understand Value Added Tax (VAT) calculations and exemptions in Nigeria.

Key information about VAT in Nigeria:
- The current VAT rate is 7.5%
- ALWAYS assume prices are VAT-exclusive by default unless explicitly stated as VAT-inclusive
- IMPORTANT: Generic terms like "good", "item", or "product" are NEVER VAT-exempt. Generic terms ALWAYS require VAT calculation of 7.5%. Only specific products in exempt categories are exempt.
- VAT exempt categories include:
  - Basic food items (rice, beans, yam, cassava, etc.)
  - Medical and pharmaceutical products (ALL medicines are VAT EXEMPT)
  - Books and educational materials
  - Baby products (such as Pampers, Huggies, and Molfix diapers are VAT EXEMPT)
  - Agricultural equipment and fertilizers
  - Exports (zero-rated)
  - Religious items

For VAT-exclusive prices (DEFAULT ASSUMPTION):
1. VAT Amount = Price before VAT × 0.075
2. Total Price = Price before VAT + VAT Amount

For VAT-inclusive prices (only if specifically mentioned as such):
1. Price before VAT = VAT-inclusive price ÷ 1.075
2. VAT Amount = VAT-inclusive price - Price before VAT
3. Verify: Price before VAT + VAT Amount = VAT-inclusive price

Verification steps for all calculations:
- Always include precise step-by-step calculations
- Round all currency values to 2 decimal places
- Format with commas for thousands: ₦1,000.00

Example 1: For a VAT-exclusive price of ₦10,000:
1. VAT amount = ₦10,000 × 0.075 = ₦750.00
2. Total price = ₦10,000 + ₦750.00 = ₦10,750.00

Example 2: For a VAT-inclusive price of ₦10,000:
1. Price before VAT = ₦10,000 ÷ 1.075 = ₦9,302.33
2. VAT amount = ₦10,000 - ₦9,302.33 = ₦697.67
3. Verify: ₦9,302.33 + ₦697.67 = ₦10,000.00

NEVER EVER say an "item" or "product" is VAT-exempt without knowing the specific type. If someone asks about "an item" or "a product" without specifying what it is, ALWAYS calculate VAT at 7.5%.

DO NOT use phrases like "It seems there might be a misunderstanding" or "not all items are VAT-exempt" in your responses. Instead, focus on answering the specific question and providing accurate tax information.

If you're unsure whether a product is VAT-exempt, ASK the user which category their product falls under. For example: "Could you please clarify which category your product falls under? Is it a medical product, baby product, educational material, basic food item, etc.?"

Remember to check if a product is VAT exempt before calculating VAT, in which case no VAT applies.

If a user gives you an example with specific amounts, use EXACTLY those amounts in your calculations rather than making up new ones.

IMPORTANT: DO NOT say that you checked an online database. Simply state whether a product is VAT-exempt or not based on the categories.`,
      },
      {
        role: "user",
        content: enhancedUserMessage,
      },
    ];

    // Call chat completion API
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      console.log("Mistral API key not found, using fallback response");
      try {
        // Add timeout protection to fallback response
        const fallbackPromise = getFallbackResponse(userMessage);
        const timeoutPromise = new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error("Timed out generating fallback response")), 5000)
        );

        const fallbackContent = await Promise.race([fallbackPromise, timeoutPromise]);
        return NextResponse.json({ content: fallbackContent }, { status: 200 });
      } catch (error) {
        console.error("Error generating fallback response:", error);
        return NextResponse.json(
          {
            content: "I'm experiencing some technical issues. Please try again later.",
          },
          { status: 200 }
        );
      }
    }

    try {
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "mistral-large-latest",
          messages: enhancedMessages,
          temperature: 0.3,
          max_tokens: 1024,
        }),
      });

      const data = await response.json();

      if (
        !data.choices ||
        !data.choices[0] ||
        !data.choices[0].message ||
        !data.choices[0].message.content
      ) {
        console.error("Unexpected API response format:", data);
        // Return a fallback response
        try {
          // Add timeout protection to fallback response
          const fallbackPromise = getFallbackResponse(userMessage);
          const timeoutPromise = new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error("Timed out generating fallback response")), 5000)
          );

          const fallbackContent = await Promise.race([fallbackPromise, timeoutPromise]);
          return NextResponse.json({ content: fallbackContent }, { status: 200 });
        } catch (error) {
          console.error("Error generating fallback response:", error);
          return NextResponse.json(
            {
              content: "I'm experiencing some technical issues. Please try again later.",
            },
            { status: 200 }
          );
        }
      }

      return NextResponse.json(
        {
          content:
            data.choices[0].message.content ||
            "I couldn't process your request properly. Please try again.",
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error calling Mistral API:", error);
      try {
        // Add timeout protection to fallback response
        const fallbackPromise = getFallbackResponse(userMessage);
        const timeoutPromise = new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error("Timed out generating fallback response")), 5000)
        );

        const fallbackContent = await Promise.race([fallbackPromise, timeoutPromise]);
        return NextResponse.json({ content: fallbackContent }, { status: 200 });
      } catch (fallbackError) {
        console.error("Error generating fallback response:", fallbackError);
        return NextResponse.json(
          {
            content: "I'm experiencing some technical issues. Please try again later.",
          },
          { status: 200 }
        );
      }
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Error processing request" }, { status: 500 });
  }
}
