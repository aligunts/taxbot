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

// Modify the try block in the POST handler to use sequential API keys if needed
try {
  // Log that we're about to make the API call
  console.log("Making API call to Mistral AI");

  // First try with the rotating API key strategy
  let response = await callMistralAPI(enhancedMessages);

  // If the first model fails with a potentially recoverable error, try the fallback model
  if (!response.ok && (response.status >= 500 || response.status === 429)) {
    console.log("Primary model request failed. Trying fallback model mistral-tiny");
    response = await callMistralAPI(enhancedMessages, "mistral-tiny");

    // If both models fail with the rotated key, try each key explicitly in sequence
    if (!response.ok && (response.status >= 500 || response.status === 429)) {
      const allKeys = getAllAvailableApiKeys();
      console.log(
        `Primary and fallback models failed. Trying each API key sequentially (${allKeys.length} keys available)`
      );

      // Try each key with the small model
      for (let i = 0; i < allKeys.length; i++) {
        const currentKey = allKeys[i];
        const keyPrefix = currentKey.substring(0, 4);

        console.log(
          `Attempting with key ${i + 1}/${allKeys.length}: ${keyPrefix}... and model mistral-small-latest`
        );

        try {
          response = await fetch("https://api.mistral.ai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentKey}`,
            },
            body: JSON.stringify({
              model: "mistral-small-latest",
              messages: enhancedMessages,
              temperature: 0.3,
              max_tokens: 1024,
            }),
          });

          // If this key works, break out of the loop
          if (response.ok) {
            console.log(`Success with key ${keyPrefix}... and model mistral-small-latest`);
            break;
          }

          console.log(`Key ${keyPrefix}... failed with status ${response.status}`);

          // If we've tried all keys with the small model and none worked, try the tiny model
          if (i === allKeys.length - 1) {
            console.log("All keys failed with small model. Trying tiny model with each key.");

            // Try each key with the tiny model
            for (let j = 0; j < allKeys.length; j++) {
              const lastKey = allKeys[j];
              const lastKeyPrefix = lastKey.substring(0, 4);

              console.log(
                `Last attempt with key ${j + 1}/${allKeys.length}: ${lastKeyPrefix}... and model mistral-tiny`
              );

              response = await fetch("https://api.mistral.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${lastKey}`,
                },
                body: JSON.stringify({
                  model: "mistral-tiny",
                  messages: enhancedMessages,
                  temperature: 0.3,
                  max_tokens: 1024,
                }),
              });

              // If this key works with tiny model, break out
              if (response.ok) {
                console.log(`Success with key ${lastKeyPrefix}... and model mistral-tiny`);
                break;
              }

              console.log(`Key ${lastKeyPrefix}... failed with tiny model as well`);
            }
          }
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
        content: "Sorry, I'm having trouble connecting to the AI service. Please try again later.",
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
