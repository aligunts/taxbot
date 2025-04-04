import { NextResponse } from "next/server";
import {
  isItemLikelyExempt,
  getSuggestedCategories,
  checkOnlineVatExemption,
} from "../../../utils/vatExemptionsGuide";

// Function to detect and enhance a query about a specific amount
const enhanceUserMessage = async (message: string): Promise<string> => {
  const lowercaseMessage = message.toLowerCase();

  // Check if the message is about company income tax
  if (
    lowercaseMessage.includes("company income tax") ||
    lowercaseMessage.includes("company tax") ||
    lowercaseMessage.includes("corporate tax") ||
    (lowercaseMessage.includes("turnover") && lowercaseMessage.includes("tax")) ||
    (lowercaseMessage.includes("company") && lowercaseMessage.includes("tax"))
  ) {
    // Extract turnover amount if present
    const turnoverRegex =
      /(?:turnover|revenue|gross income|sales)(?:\s+is|\s+of|\s*:|\s*=)?\s*[\₦N]?\s*([\d,]+(?:\.\d+)?)\s*(?:million|m|billion|b)?/i;
    const turnoverMatch = message.match(turnoverRegex);

    if (turnoverMatch) {
      const rawAmount = parseFloat(turnoverMatch[1].replace(/,/g, ""));
      if (!isNaN(rawAmount)) {
        let turnover = rawAmount;

        // Check if there's a unit (million, billion)
        if (
          turnoverMatch[0].toLowerCase().includes("billion") ||
          turnoverMatch[0].toLowerCase().includes("b")
        ) {
          turnover = rawAmount * 1000000000;
        } else if (
          turnoverMatch[0].toLowerCase().includes("million") ||
          turnoverMatch[0].toLowerCase().includes("m")
        ) {
          turnover = rawAmount * 1000000;
        }

        // Determine company size based on turnover
        const companySize =
          turnover < 25000000 ? "small" : turnover < 100000000 ? "medium" : "large";

        // Determine tax rate based on company size
        const taxRate = companySize === "small" ? 0.2 : 0.3;

        // Assume profit is 40% of turnover for calculation purposes
        const estimatedProfit = turnover * 0.4;
        const taxPayable = estimatedProfit * taxRate;

        // Format numbers with commas for thousands
        const formatNumber = (num: number) => {
          return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        };

        const turnoverInMillions = turnover / 1000000;
        const unitLabel = turnoverInMillions >= 1000 ? "billion" : "million";
        const displayValue =
          turnoverInMillions >= 1000
            ? formatNumber(turnoverInMillions / 1000)
            : formatNumber(turnoverInMillions);

        return `${message}

## Company Income Tax Calculation (₦${displayValue} ${unitLabel} Turnover)

1. Company Size: ${companySize.charAt(0).toUpperCase() + companySize.slice(1)}
2. Tax Rate: ${(taxRate * 100).toFixed(1)}%
3. Estimated Taxable Profit: ₦${formatNumber(estimatedProfit)}
4. Tax Payable: ₦${formatNumber(taxPayable)}

Note: Small (<₦25M): 20% tax; Medium/Large: 30% tax`;
      }
    }
  }

  // Extract the amount mentioned in the message
  const amountRegex = /₦?\s*([\d,]+(?:\.\d+)?)\s*(?:naira)?/i;
  const match = message.match(amountRegex);

  if (match) {
    const amount = parseFloat(match[1].replace(/,/g, ""));

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
          `\n\n## VAT Calculation (VAT-inclusive ₦${formatNumber(amount)})

1. Price before VAT: ₦${formatNumber(priceBeforeVAT)}
2. VAT (7.5%): ₦${formatNumber(vatAmount)}
3. Total: ₦${formatNumber(checkTotal)}`
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
          `\n\nVAT status of "${productName}" unclear.

Please specify category:
- Medical/pharmaceutical product
- Baby product
- Educational material
- Basic food item
- Agricultural input
- Religious item`
        );
      }

      if (isExempt) {
        // Format numbers with commas for thousands
        return (
          message +
          `\n\n"${productName}" is VAT-exempt (${category}).

1. Price: ₦${formatNumber(amount)}
2. VAT: ₦0.00
3. Total: ₦${formatNumber(amount)}`
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
          `\n\n## VAT Calculation (VAT-inclusive ₦${formatNumber(amount)})

1. Price before VAT: ₦${formatNumber(priceBeforeVAT)}
2. VAT (7.5%): ₦${formatNumber(vatAmount)}
3. Total: ₦${formatNumber(checkTotal)}`
        );
      } else {
        // Default to VAT-exclusive calculations
        const vatAmount = Math.round(amount * 0.075 * 100) / 100;
        const totalAmount = Math.round((amount + vatAmount) * 100) / 100;

        return (
          message +
          `\n\n## VAT Calculation (VAT-exclusive ₦${formatNumber(amount)})

1. VAT (7.5%): ₦${formatNumber(vatAmount)}
2. Total: ₦${formatNumber(totalAmount)}`
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
          `\n\n## VAT Calculation (VAT-inclusive ₦${formatNumber(amount)})

1. Price before VAT: ₦${formatNumber(priceBeforeVAT)}
2. VAT (7.5%): ₦${formatNumber(vatAmount)}
3. Total: ₦${formatNumber(checkTotal)}`
        );
      } else {
        // Default to VAT-exclusive calculations
        const vatAmount = Math.round(amount * 0.075 * 100) / 100;
        const totalAmount = Math.round((amount + vatAmount) * 100) / 100;

        return (
          message +
          `\n\n## VAT Calculation (VAT-exclusive ₦${formatNumber(amount)})

1. VAT (7.5%): ₦${formatNumber(vatAmount)}
2. Total: ₦${formatNumber(totalAmount)}`
        );
      }
    }
  }

  return message;
};

// Function to generate a fallback response when the AI doesn't adequately address a tax-related question
const getFallbackResponse = async (message: string): Promise<string> => {
  const lowercaseMessage = message.toLowerCase();

  // Check if the query is about company income tax
  if (
    lowercaseMessage.includes("company income tax") ||
    lowercaseMessage.includes("company tax") ||
    lowercaseMessage.includes("corporate tax") ||
    (lowercaseMessage.includes("turnover") && lowercaseMessage.includes("tax")) ||
    (lowercaseMessage.includes("company") && lowercaseMessage.includes("tax"))
  ) {
    // Extract turnover amount if present (default to ₦80 million if none found or not parseable)
    const turnoverRegex =
      /(?:turnover|revenue|gross income|sales)(?:\s+is|\s+of|\s*:|\s*=)?\s*[\₦N]?\s*([\d,]+(?:\.\d+)?)\s*(?:million|m|billion|b)?/i;
    const turnoverMatch = message.match(turnoverRegex);

    let turnover = 80000000; // Default turnover ₦80 million
    let turnoverUnit = "million";

    if (turnoverMatch) {
      const rawAmount = parseFloat(turnoverMatch[1].replace(/,/g, ""));
      if (!isNaN(rawAmount)) {
        // Check if there's a unit (million, billion)
        if (
          turnoverMatch[0].toLowerCase().includes("billion") ||
          turnoverMatch[0].toLowerCase().includes("b")
        ) {
          turnover = rawAmount * 1000000000;
          turnoverUnit = "billion";
        } else {
          turnover = rawAmount * 1000000;
          turnoverUnit = "million";
        }
      }
    }

    // Determine company size based on turnover
    const companySize = turnover < 25000000 ? "small" : turnover < 100000000 ? "medium" : "large";

    // Determine tax rate based on company size
    const taxRate = companySize === "small" ? 0.2 : 0.3;

    // Assume profit is 40% of turnover for calculation purposes
    const estimatedProfit = turnover * 0.4;
    const taxPayable = estimatedProfit * taxRate;

    // Format numbers with commas for thousands
    const formatNumber = (num: number) => {
      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return `## Company Income Tax Calculation for ₦${formatNumber(turnover / 1000000)} Million Turnover

### Inputs
- Annual Turnover: ₦${formatNumber(turnover)}
- Company Size: ${companySize.charAt(0).toUpperCase() + companySize.slice(1)} (turnover-based)
- Tax Rate: ${(taxRate * 100).toFixed(1)}%

### Calculation
1. Estimated Taxable Income: ₦${formatNumber(turnover)} × 0.4 = ₦${formatNumber(estimatedProfit)}
2. Tax Amount: ₦${formatNumber(estimatedProfit)} × ${taxRate} = ₦${formatNumber(taxPayable)}

Company Income Tax Payable: ₦${formatNumber(taxPayable)}

Note: Small companies (<₦25M) pay 20% tax; medium/large companies pay 30%`;
  }

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
      return `Cannot determine VAT status of "${productName}".

Please clarify category:
- Medical/pharmaceutical product
- Baby product
- Educational material
- Basic food item
- Agricultural input
- Religious item`;
    }

    if (isExempt) {
      return `"${productName}" is VAT-exempt (${category}).

1. Price: ₦${formatNumber(amount)}
2. VAT amount: ₦0.00
3. Total: ₦${formatNumber(amount)}`;
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

    return `## VAT Calculation (VAT-inclusive amount ₦${formatNumber(amount)})

1. Price before VAT: ₦${formatNumber(amount)} ÷ 1.075 = ₦${formatNumber(priceBeforeVAT)}
2. VAT amount: ₦${formatNumber(amount)} - ₦${formatNumber(priceBeforeVAT)} = ₦${formatNumber(vatAmount)}

Verification: ₦${formatNumber(priceBeforeVAT)} + ₦${formatNumber(vatAmount)} = ₦${formatNumber(checkTotal)}`;
  } else {
    // Default to VAT-exclusive calculations
    const vatAmount = Math.round(amount * 0.075 * 100) / 100;
    const totalAmount = Math.round((amount + vatAmount) * 100) / 100;

    return `## VAT Calculation (VAT-exclusive amount ₦${formatNumber(amount)})

1. VAT amount: ₦${formatNumber(amount)} × 0.075 = ₦${formatNumber(vatAmount)}
2. Total price: ₦${formatNumber(amount)} + ₦${formatNumber(vatAmount)} = ₦${formatNumber(totalAmount)}`;
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
        content: `You are a Nigerian tax calculator specializing in VAT and Company Income Tax calculations.

RESPONSE STYLE:
- Be direct and concise
- No self-references as a chatbot or AI
- No introductory text like "I'm a Nigerian tax chatbot" or "I can assist with..."
- Skip pleasantries like "I'm happy to help" or "please provide more details"
- Deliver calculations and facts immediately without preamble
- Use numbered lists and formatting for clarity
- Include only essential information

## COMPANY INCOME TAX INFORMATION
- Company Income Tax rates in Nigeria are based on company size determined by turnover:
  - Small companies (turnover less than ₦25 million): 20% tax rate
  - Medium companies (turnover between ₦25 million and ₦100 million): 30% tax rate
  - Large companies (turnover over ₦100 million): 30% tax rate
- Taxable income = Turnover - Allowable expenses - Deductions
- Company Income Tax = Taxable income × Tax rate

For example, with turnover of ₦80 million:
- Company size: Medium (based on turnover)
- Tax rate: 30%
- With ₦50 million in expenses/deductions
- Taxable income: ₦30,000,000
- Company Income Tax: ₦9,000,000

When given company turnover, FIRST determine company size, THEN apply correct tax rate.

## VAT INFORMATION
- Current VAT rate: 7.5%
- Assume prices are VAT-exclusive by default unless stated as VAT-inclusive
- Generic "goods" and "products" are NEVER VAT-exempt (always calculate 7.5%)
- VAT exempt categories: basic food items, medical products, books/educational materials, baby products, agricultural equipment, exports, religious items

VAT-exclusive calculation:
1. VAT Amount = Price before VAT × 0.075
2. Total Price = Price before VAT + VAT Amount

VAT-inclusive calculation:
1. Price before VAT = VAT-inclusive price ÷ 1.075
2. VAT Amount = VAT-inclusive price - Price before VAT

Always include precise calculations with amounts rounded to 2 decimal places.

IMPORTANT: If asked about company income tax or turnover taxation, DO NOT default to VAT calculations.`,
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
