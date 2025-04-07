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
        const taxRate = companySize === "small" ? 0 : companySize === "medium" ? 0.2 : 0.3;

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

🇳🇬 **Company Income Tax for ₦${displayValue} ${unitLabel} Turnover**

**Company Classification**:
- Size: ${companySize.charAt(0).toUpperCase() + companySize.slice(1)} (turnover-based)
- Applicable Tax Rate: ${(taxRate * 100).toFixed(0)}%

**📊 Calculation Steps**:
1. Annual Turnover: ₦${formatNumber(turnover)}
2. Estimated Taxable Profit: ₦${formatNumber(turnover)} × 0.4 = ₦${formatNumber(estimatedProfit)}
3. CIT Amount: ₦${formatNumber(estimatedProfit)} × ${taxRate} = ₦${formatNumber(taxPayable)}

✅ **Final Tax Payable**: ₦${formatNumber(taxPayable)}

🔍 **Note**: Tax brackets are Small (<₦25M): 0%, Medium (₦25M-₦100M): 20%, Large (>₦100M): 30%`;
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
          `

🇳🇬 **VAT Calculation for ${productName} (VAT-inclusive Amount)**

**📊 Breakdown**:
1. VAT-inclusive Amount: ₦${formatNumber(amount)}
2. Price before VAT: ₦${formatNumber(priceBeforeVAT)}
3. VAT Amount (7.5%): ₦${formatNumber(vatAmount)}

✅ **Verification**: ₦${formatNumber(priceBeforeVAT)} + ₦${formatNumber(vatAmount)} = ₦${formatNumber(checkTotal)}`
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
          `

🔍 **VAT Status Undetermined**

VAT status of "${productName}" unclear.

**Please specify category**:
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
          `

🇳🇬 **VAT Calculation for ${productName}**

**VAT Status**: ✅ Exempt (${category})

**Calculation**:
1. Price: ₦${formatNumber(amount)}
2. VAT (0%): ₦0.00
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
          `

🇳🇬 **VAT Calculation for ${productName} (VAT-inclusive)**

**📊 Breakdown**:
1. VAT-inclusive Price: ₦${formatNumber(amount)}
2. Price before VAT: ₦${formatNumber(priceBeforeVAT)}
3. VAT Amount (7.5%): ₦${formatNumber(vatAmount)}

✅ **Verification**: ₦${formatNumber(priceBeforeVAT)} + ₦${formatNumber(vatAmount)} = ₦${formatNumber(checkTotal)}`
        );
      } else {
        // Default to VAT-exclusive calculations
        const vatAmount = Math.round(amount * 0.075 * 100) / 100;
        const totalAmount = Math.round((amount + vatAmount) * 100) / 100;

        return (
          message +
          `

🇳🇬 **VAT Calculation for ${productName} (VAT-exclusive)**

**📊 Breakdown**:
1. Price without VAT: ₦${formatNumber(amount)}
2. VAT (7.5%): ₦${formatNumber(vatAmount)}
3. Total Price: ₦${formatNumber(totalAmount)}

🔍 **Note**: Standard VAT rate of 7.5% applies as this item is not VAT-exempt.`
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

        return `🇳🇬 **VAT Calculation (Price Before VAT)**

**📊 Breakdown**:
1. VAT-inclusive Amount: ₦${formatNumber(amount)}
2. Price before VAT: ₦${formatNumber(amount)} ÷ 1.075 = ₦${formatNumber(priceBeforeVAT)}
3. VAT Amount: ₦${formatNumber(vatAmount)}

✅ **Verification**: ₦${formatNumber(priceBeforeVAT)} + ₦${formatNumber(vatAmount)} = ₦${formatNumber(checkTotal)}`;
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
          `

🇳🇬 **VAT Calculation (VAT-inclusive)**

**📊 Breakdown**:
1. VAT-inclusive Price: ₦${formatNumber(amount)}
2. Price before VAT: ₦${formatNumber(priceBeforeVAT)}
3. VAT Amount (7.5%): ₦${formatNumber(vatAmount)}

✅ **Verification**: ₦${formatNumber(priceBeforeVAT)} + ₦${formatNumber(vatAmount)} = ₦${formatNumber(checkTotal)}`
        );
      } else {
        // Default to VAT-exclusive calculations
        const vatAmount = Math.round(amount * 0.075 * 100) / 100;
        const totalAmount = Math.round((amount + vatAmount) * 100) / 100;

        return (
          message +
          `

🇳🇬 **VAT Calculation (VAT-exclusive)**

**📊 Breakdown**:
1. Price without VAT: ₦${formatNumber(amount)}
2. VAT (7.5%): ₦${formatNumber(vatAmount)}
3. Total Price: ₦${formatNumber(totalAmount)}

🔍 **Note**: Standard VAT rate of 7.5% applies.`
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
    const taxRate = companySize === "small" ? 0 : companySize === "medium" ? 0.2 : 0.3;

    // Assume profit is 40% of turnover for calculation purposes
    const estimatedProfit = turnover * 0.4;
    const taxPayable = estimatedProfit * taxRate;

    // Format numbers with commas for thousands
    const formatNumber = (num: number) => {
      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return `🇳🇬 **Company Income Tax for ₦${formatNumber(turnover / 1000000)} Million Turnover**

**Company Classification**:
- Company Size: ${companySize.charAt(0).toUpperCase() + companySize.slice(1)}
- Applicable Tax Rate: ${(taxRate * 100).toFixed(0)}%

**📊 Calculation Steps**:
1. Annual Turnover: ₦${formatNumber(turnover)}
2. Estimated Taxable Profit: ₦${formatNumber(turnover)} × 0.4 = ₦${formatNumber(estimatedProfit)}
3. CIT Amount: ₦${formatNumber(estimatedProfit)} × ${taxRate} = ₦${formatNumber(taxPayable)}

✅ **Final Tax Payable**: ₦${formatNumber(taxPayable)}

🔍 **Need a more precise calculation?** 
Share your actual profit figure instead of using the estimated 40% of turnover.`;
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
      return `🔍 **VAT Status Undetermined**

Cannot determine VAT status of "${productName}".

**Please clarify category**:
- Medical/pharmaceutical product
- Baby product
- Educational material
- Basic food item
- Agricultural input
- Religious item`;
    }

    if (isExempt) {
      return `🇳🇬 **VAT Calculation for ${productName}**

**VAT Status**: ✅ Exempt (${category})

**Calculation**:
1. Base Price: ₦${formatNumber(amount)}
2. VAT (0%): ₦0.00
3. Total: ₦${formatNumber(amount)}`;
    }
  }

  // Check if the amount is explicitly mentioned as VAT-inclusive
  const isVatInclusive =
    /vat[\s-]*inclusive|including vat|includes vat|with vat|price after vat/i.test(message);

  const productInfo = productName ? ` for "${productName}"` : "";

  if (isVatInclusive) {
    // Calculate with proper precision for VAT-inclusive amount
    const priceBeforeVAT = Math.round((amount / 1.075) * 100) / 100;
    const vatAmount = Math.round((amount - priceBeforeVAT) * 100) / 100;

    // Verify calculations
    const checkTotal = Math.round((priceBeforeVAT + vatAmount) * 100) / 100;

    return `🇳🇬 **VAT Calculation (VAT-inclusive)**${productInfo}

**📊 Breakdown**:
1. VAT-inclusive Amount: ₦${formatNumber(amount)}
2. Price before VAT: ₦${formatNumber(amount)} ÷ 1.075 = ₦${formatNumber(priceBeforeVAT)}
3. VAT Amount (7.5%): ₦${formatNumber(vatAmount)}

✅ **Verification**: ₦${formatNumber(priceBeforeVAT)} + ₦${formatNumber(vatAmount)} = ₦${formatNumber(checkTotal)}`;
  } else {
    // Default to VAT-exclusive calculations
    const vatAmount = Math.round(amount * 0.075 * 100) / 100;
    const totalAmount = Math.round((amount + vatAmount) * 100) / 100;

    return `🇳🇬 **VAT Calculation (VAT-exclusive)**${productInfo}

**📊 Breakdown**:
1. Base Price: ₦${formatNumber(amount)}
2. VAT (7.5%): ₦${formatNumber(amount)} × 0.075 = ₦${formatNumber(vatAmount)}
3. Total Amount: ₦${formatNumber(totalAmount)}

🔍 **Note**: Standard VAT rate of 7.5% applies${productName ? ` as "${productName}" is not VAT-exempt` : ""}.`;
  }
};

// Define a key rotation function to handle multiple API keys
function getAvailableApiKey(): string | null {
  // Define all available API keys
  const apiKeys = [
    process.env.MISTRAL_API_KEY,
    process.env.MISTRAL_API_KEY_2,
    process.env.MISTRAL_API_KEY_3,
  ];

  // Filter out undefined or empty keys
  const validKeys = apiKeys.filter((key) => key && key.trim().length > 0);

  if (validKeys.length === 0) {
    return null;
  }

  // Use a simple rotation strategy - get the current timestamp in seconds
  // and use modulo to select a key based on the current time
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  const keyIndex = currentTimeInSeconds % validKeys.length;

  // Get the selected key and log which key is being used (partial key for security)
  const selectedKey = validKeys[keyIndex];
  console.log(
    `Using API key ${keyIndex + 1}/${validKeys.length}: ${selectedKey?.substring(0, 4)}...`
  );

  return selectedKey;
}

// API call function with model parameter to allow for fallback attempts
async function callMistralAPI(messages: any[], model: string = "mistral-small-latest") {
  // Get an available API key using the rotation mechanism
  const apiKey = getAvailableApiKey();

  if (!apiKey) {
    throw new Error("No valid API keys available");
  }

  console.log(`Attempting API call with model: ${model}`);

  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    // If we get a rate limit error or unauthorized, log the specific key that failed
    if (response.status === 429 || response.status === 401) {
      const keyPrefix = apiKey.substring(0, 4);
      console.error(
        `API key ${keyPrefix}... returned status ${response.status}. This key might be rate-limited or invalid.`
      );
    }

    return response;
  } catch (error) {
    // Log the error with the key prefix for debugging
    const keyPrefix = apiKey.substring(0, 4);
    console.error(`API call with key ${keyPrefix}... failed with error:`, error);
    throw error;
  }
}

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
        content: `You are Taxbot — a Nigerian tax assistant specialized in VAT, Company Income Tax, and Personal Income Tax.

Your responses must be:
- Direct and professional
- Structured with markdown formatting
- Concise, using lists, tables, and clear breakdowns
- Free of greetings, apologies, or self-references
- Written in plain, accessible language

Use the following structure for tax-related queries:

1. **Context Heading** (e.g., "🇳🇬 Personal Income Tax for Teachers")
2. **Reliefs or Exemptions**:
   - Bullet point summary of applicable deductions (e.g., CRA, Pension)
3. **Calculation Steps or Tax Brackets**:
   - Use tables for progressive rates
   - Show formulas for VAT and CIT clearly
4. **Follow-Up Prompt**:
   - Ask for relevant info (salary, turnover, product type) if needed for precise calculation

## PERSONAL INCOME TAX RELIEFS
- Consolidated Relief Allowance (CRA): The greater of ₦200,000 or 21% of gross income (where 21% represents 1% + 20%)
- Pension Contribution: 8% of gross income (capped at ₦500,000)

## VAT INFORMATION
- Current VAT rate: 7.5%
- Assume prices are VAT-exclusive by default unless stated as VAT-inclusive
- VAT exempt categories: basic food items, medical products, books/educational materials, baby products, agricultural equipment, exports, religious items

## COMPANY INCOME TAX INFORMATION
- Company Income Tax rates in Nigeria are based on company size determined by turnover:
  - Small companies (turnover less than ₦25 million): 0% tax rate
  - Medium companies (turnover between ₦25 million and ₦100 million): 20% tax rate
  - Large companies (turnover over ₦100 million): 30% tax rate

## PERSONAL INCOME TAX INFORMATION
PIT uses progressive taxation with these brackets:

| Taxable Income Bracket    | Rate |
|---------------------------|------|
| First ₦300,000           | 7%   |
| Next ₦300,000            | 11%  |
| Next ₦500,000            | 15%  |
| Next ₦500,000            | 19%  |
| Next ₦1,600,000          | 21%  |
| Above ₦3,200,000         | 24%  |

Format currency as ₦1,000,000 with thousands separators.
Include emojis (📌, ✅, 🧮, 🔍) for readability.`,
      },
      {
        role: "user",
        content: enhancedUserMessage,
      },
    ];

    // Check if any API keys are available
    const apiKey = getAvailableApiKey();

    // Check if API key is available
    if (!apiKey) {
      console.error("No valid Mistral API keys available");
      return NextResponse.json(
        {
          error: "API configuration error: Missing Mistral API key",
          content: "I'm having trouble connecting to the AI service. Please contact support.",
        },
        { status: 500 }
      );
    }

    try {
      // Log that we're about to make the API call
      console.log("Making API call to Mistral AI");

      // Try with the main model first (switched to small model as default for reliability)
      let response = await callMistralAPI(enhancedMessages, "mistral-small-latest");

      // If the main model fails, try with a fallback model
      if (!response.ok && (response.status >= 500 || response.status === 429)) {
        console.log("Primary model request failed. Trying fallback model mistral-tiny");
        response = await callMistralAPI(enhancedMessages, "mistral-tiny");
      }

      // If both models fail, try with all API keys
      if (!response.ok && (response.status >= 500 || response.status === 429)) {
        // Get all valid API keys
        const apiKeys = [
          process.env.MISTRAL_API_KEY,
          process.env.MISTRAL_API_KEY_2,
          process.env.MISTRAL_API_KEY_3,
        ];
        const allKeys = apiKeys.filter((key) => key && key.trim().length > 0);

        console.log(
          `All models failed. Trying each API key sequentially (${allKeys.length} keys available)`
        );

        // Try all keys with both models
        let success = false;

        for (const model of ["mistral-small-latest", "mistral-tiny"]) {
          if (success) break;

          for (let i = 0; i < allKeys.length; i++) {
            const currentKey = allKeys[i];
            const keyPrefix = currentKey?.substring(0, 4);

            console.log(
              `Attempting with key ${i + 1}/${allKeys.length}: ${keyPrefix}... and model ${model}`
            );

            try {
              response = await fetch("https://api.mistral.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${currentKey}`,
                },
                body: JSON.stringify({
                  model: model,
                  messages: enhancedMessages,
                  temperature: 0.3,
                  max_tokens: 1024,
                }),
              });

              // If this key works, break out of the loop
              if (response.ok) {
                console.log(`Success with key ${keyPrefix}... and model ${model}`);
                success = true;
                break;
              }

              console.log(`Key ${keyPrefix}... failed with model ${model}: ${response.status}`);
            } catch (keyError) {
              console.error(`Error with key ${keyPrefix}:`, keyError);
              // Continue to the next key
            }
          }
        }
      }

      // Check if the response is ok after all attempts
      if (!response.ok) {
        // Get error details from response
        const errorData = await response.json().catch(() => ({}));
        console.error("Mistral API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });

        return NextResponse.json(
          {
            error: `AI service error: ${response.status} ${response.statusText}`,
            content:
              "Sorry, I'm having trouble connecting to the AI service. Please try again later.",
          },
          { status: response.status }
        );
      }

      // Parse the API response
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
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    } catch (error) {
      console.error("Unexpected error calling Mistral API:", error);
      return NextResponse.json(
        {
          error: "Failed to connect to AI service",
          content: "I'm having trouble with the connection. Please try again later.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Error processing request" }, { status: 500 });
  }
}
