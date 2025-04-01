// Test script for extracting numeric values

const extractNumericValues = (text) => {
  console.log(`\nExtracting from: "${text}"`);

  // Initialize return object
  const result = { baseAmount: null, quantity: null, unitPrice: null, unit: undefined };

  // Support for various units of measurement
  const unitWords = [
    // Count units
    "items?",
    "units?",
    "pieces?",
    "products?",
    "goods",
    // Weight units
    "kg",
    "kilo(?:gram)?s?",
    "grams?",
    "tons?",
    "pounds?",
    "lbs?",
    "ounces?",
    "oz",
    // Volume units
    "liters?",
    "l",
    "milliliters?",
    "ml",
    "gallons?",
    "gal",
    // Length units
    "meters?",
    "m",
    "centimeters?",
    "cm",
    "kilometers?",
    "km",
    "inches?",
    "in",
    "feet",
    "ft",
    "yards?",
    "yd",
    // Area units
    "square meters?",
    "sq\\.? ?m",
    "m2",
    "hectares?",
    "ha",
    "acres?",
    // Time units
    "hours?",
    "hrs?",
    "minutes?",
    "mins?",
    "seconds?",
    "secs?",
    // Data units
    "gigabytes?",
    "gb",
    "megabytes?",
    "mb",
    "terabytes?",
    "tb",
    // Generic containers
    "boxes?",
    "packs?",
    "packages?",
    "cartons?",
    "bundles?",
    "sets?",
    "pairs?",
    "dozens?",
    "doz",
    "cases?",
    "bottles?",
    "cans?",
    "bags?",
  ];

  // Convert to regex-ready string with proper word boundaries
  const unitWordsPattern = unitWords.join("|");

  // Helper function to extract and standardize unit from text
  const extractUnit = (text) => {
    try {
      const lowerText = text.toLowerCase();

      // Prioritize explicit pattern matching for specific units
      if (/\b(?:kg|kilo(?:gram)?s?)\b/i.test(lowerText)) {
        return "kg";
      } else if (/\b(?:g|gram)s?\b/i.test(lowerText)) {
        return "g";
      } else if (/\b(?:bottle)s?\b/i.test(lowerText)) {
        return "bottle(s)";
      } else if (/\b(?:carton)s?\b/i.test(lowerText)) {
        return "carton(s)";
      } else if (/\b(?:item|unit|piece|product)s?\b/i.test(lowerText)) {
        return "item(s)";
      } else if (/\b(?:meter)s?\b/i.test(lowerText)) {
        return "m";
      } else if (/\b(?:hour)s?\b/i.test(lowerText)) {
        return "hour(s)";
      } else if (/\b(?:liter)s?\b/i.test(lowerText)) {
        return "liter(s)";
      } else if (/\b(?:pack|package)s?\b/i.test(lowerText)) {
        return "pack(s)";
      }

      // Generic unit search if no specific match was found
      for (const unit of unitWords) {
        const regex = new RegExp(`\\b${unit}\\b`, "i");
        if (regex.test(lowerText)) {
          // Basic standardization
          if (unit.startsWith("item") || unit.startsWith("unit") || unit.startsWith("piece")) {
            return "item(s)";
          } else if (unit.startsWith("kg") || unit.startsWith("kilo")) {
            return "kg";
          } else if (unit.startsWith("gram")) {
            return "g";
          } else if (unit.startsWith("meter")) {
            return "m";
          } else if (unit.startsWith("hour")) {
            return "hour(s)";
          } else if (unit.startsWith("liter")) {
            return "liter(s)";
          } else if (unit.startsWith("bottle")) {
            return "bottle(s)";
          } else if (unit.startsWith("carton")) {
            return "carton(s)";
          } else if (unit.startsWith("pack")) {
            return "pack(s)";
          }
          return unit.replace(/s\?$/, "(s)");
        }
      }
    } catch (error) {
      console.error("Error in extractUnit:", error);
    }

    // Return undefined if no unit found
    return undefined;
  };

  const queryLower = text.toLowerCase();

  // First look for quantity x price patterns with various units
  const quantityPricePatterns = [
    // Pattern 1: X units at Y naira each - standard count units + measurement units
    {
      pattern: new RegExp(
        `(\\d+(?:\\.\\d+)?)\\s*(${unitWordsPattern})\\s*(?:at|for|of|with|costing|worth|valued at|priced at)\\s*(?:₦|N|NGN|naira)?\\s*(\\d[\\d,]*(?:\\.\\d{1,2})?)\\s*(?:each|per\\s+(?:${unitWordsPattern})|a\\s+(?:${unitWordsPattern})|apiece|a piece)`,
        "i"
      ),
      name: "X units at Y naira each",
    },

    // Pattern 2: X units for Y naira in total
    {
      pattern: new RegExp(
        `(\\d+(?:\\.\\d+)?)\\s*(${unitWordsPattern})\\s*(?:for|at|costing|worth|valued at|priced at)\\s*(?:a total of)?\\s*(?:₦|N|NGN|naira)?\\s*(\\d[\\d,]*(?:\\.\\d{1,2})?)\\s*(?:in total|total|altogether|in all|combined)`,
        "i"
      ),
      name: "X units for Y naira total",
    },

    // Pattern 3: Y naira for X units
    {
      pattern: new RegExp(
        `(?:₦|N|NGN|naira)?\\s*(\\d[\\d,]*(?:\\.\\d{1,2})?)\\s*(?:for|per|to purchase|to buy)\\s*(\\d+(?:\\.\\d+)?)\\s*(${unitWordsPattern})`,
        "i"
      ),
      name: "Y naira for X units",
    },

    // Pattern 4: Y naira each for X units
    {
      pattern: new RegExp(
        `(?:₦|N|NGN|naira)?\\s*(\\d[\\d,]*(?:\\.\\d{1,2})?)\\s*(?:each|per\\s+(${unitWordsPattern})|apiece|a piece)\\s*(?:for|to purchase|to buy)?\\s*(\\d+(?:\\.\\d+)?)\\s*(${unitWordsPattern})?`,
        "i"
      ),
      name: "Y naira each for X units",
    },

    // Pattern 5: Y naira per unit for X units
    {
      pattern: new RegExp(
        `(?:₦|N|NGN|naira)?\\s*(\\d[\\d,]*(?:\\.\\d{1,2})?)\\s*per\\s*(${unitWordsPattern})\\s*(?:for|of|with)?\\s*(\\d+(?:\\.\\d+)?)(?:\\s*(${unitWordsPattern}))?`,
        "i"
      ),
      name: "Y naira per unit for X units",
    },

    // Pattern 6: total of Y naira for X units
    {
      pattern: new RegExp(
        `(?:a |the )?total(?:\\s+of)?\\s*(?:₦|N|NGN|naira)?\\s*(\\d[\\d,]*(?:\\.\\d{1,2})?)\\s*for\\s*(\\d+(?:\\.\\d+)?)\\s*(${unitWordsPattern})`,
        "i"
      ),
      name: "Total Y naira for X units",
    },

    // Pattern 7: X * Y (multiplication)
    {
      pattern:
        /(\d+(?:\.\d+)?)\s*(?:\*|x|times|multiplied by)\s*(?:₦|N|NGN|naira)?\s*(\d[\d,]*(?:\.\d{1,2})?)/i,
      name: "X * Y (multiplication)",
    },

    // Pattern 8: Y * X (multiplication reversed)
    {
      pattern:
        /(?:₦|N|NGN|naira)?\s*(\d[\d,]*(?:\.\d{1,2})?)\s*(?:\*|x|times|multiplied by)\s*(\d+(?:\.\d+)?)/i,
      name: "Y * X (multiplication reversed)",
    },

    // Pattern 9: Y naira per unit for X units of something
    {
      pattern: new RegExp(
        `(?:₦|N|NGN|naira)?\\s*(\\d[\\d,]*(?:\\.\\d{1,2})?)\\s*per\\s*(${unitWordsPattern})(?:\\s+for|\\s+of|\\s+with)?\\s*(\\d+(?:\\.\\d+)?)\\s*(${unitWordsPattern})?`,
        "i"
      ),
      name: "Y naira per unit for X units of...",
    },

    // Pattern 10: Y naira for a package containing X units
    {
      pattern: new RegExp(
        `(?:₦|N|NGN|naira)?\\s*(\\d[\\d,]*(?:\\.\\d{1,2})?)\\s*for\\s*(?:a|one|1|each)?\\s*(?:package|pack|box|carton|bundle|set|case|pack)\\s*(?:of|with|containing)\\s*(\\d+(?:\\.\\d+)?)\\s*(${unitWordsPattern})?`,
        "i"
      ),
      name: "Y naira for package containing X units",
    },

    // Pattern 11: Simple X qty at/for Y each
    {
      pattern: new RegExp(
        `(\\d+(?:\\.\\d+)?)\\s*(${unitWordsPattern})?\\s*(?:at|for|of)\\s*(?:₦|N|NGN|naira)?\\s*(\\d[\\d,]*(?:\\.\\d{1,2})?)(?:\\s*each|\\s*per)?`,
        "i"
      ),
      name: "Simple X qty at Y each",
    },

    // Pattern 12: Simplified "Calculate VAT on X items at Y naira each"
    {
      pattern: new RegExp(
        `(?:on|for)\\s+(\\d+(?:\\.\\d+)?)\\s*(${unitWordsPattern})\\s*at\\s*(?:₦|N|NGN|naira)?\\s*(\\d[\\d,]*(?:\\.\\d{1,2})?)`,
        "i"
      ),
      name: "On X items at Y naira each",
    },

    // Pattern 13: Specifically for "cartons of milk" cases and similar
    {
      pattern: new RegExp(
        `(\\d+(?:\\.\\d+)?)\\s*(cartons?|bottles?|packs?)(?:\\s+of\\s+\\w+)?\\s*at\\s*(?:₦|N|NGN|naira)?\\s*(\\d[\\d,]*(?:\\.\\d{1,2})?)`,
        "i"
      ),
      name: "X cartons of product at Y price",
    },
  ];

  // Try all patterns to find a match
  for (const { pattern, name } of quantityPricePatterns) {
    const match = pattern.exec(queryLower);
    if (match) {
      console.log(`✓ Pattern matched: "${name}"`);
      console.log(
        `  Match groups:`,
        match.slice(1).map((m) => m || "undefined")
      );

      // Extract values based on pattern
      let quantity, price, unitText;

      // Check pattern format to determine which group is quantity vs price
      if (
        name.startsWith("X") ||
        name.startsWith("On") ||
        name === "X cartons of product at Y price"
      ) {
        // If pattern starts with quantity group
        quantity = parseFloat(match[1].replace(/,/g, ""));

        // Check for unit in the match groups and filter out undefined/empty values
        const validGroups = match.slice(1).filter((g) => g && g.trim() !== "");
        if (validGroups.length > 1 && !/^\d+/.test(validGroups[1])) {
          unitText = validGroups[1];
        }

        // Get price from the remaining numeric group
        for (let i = 1; i < match.length; i++) {
          if (match[i] && /^\d/.test(match[i])) {
            const value = parseFloat(match[i].replace(/,/g, ""));
            if (value !== quantity) {
              price = value;
              break;
            }
          }
        }
      } else if (name.startsWith("Y")) {
        // If pattern starts with price group
        price = parseFloat(match[1].replace(/,/g, ""));

        // Extract quantity and unit from remaining groups
        for (let i = 2; i < match.length; i++) {
          if (match[i] && /^\d/.test(match[i])) {
            quantity = parseFloat(match[i].replace(/,/g, ""));
          } else if (match[i] && !unitText && match[i].trim() !== "") {
            unitText = match[i];
          }
        }
      } else {
        // For other pattern types, try to determine from context
        const values = [];
        for (let i = 1; i < match.length; i++) {
          if (match[i] && /^\d/.test(match[i])) {
            const val = parseFloat(match[i].replace(/,/g, ""));
            if (!isNaN(val)) values.push({ index: i, value: val });
          } else if (match[i] && match[i].trim() !== "") {
            unitText = match[i];
          }
        }

        if (values.length >= 2) {
          // Sort numerically to find smallest (likely quantity) and largest (likely price)
          values.sort((a, b) => a.value - b.value);
          quantity = values[0].value;
          price = values[values.length - 1].value;
        } else if (values.length === 1) {
          price = values[0].value;
        }
      }

      // Try to extract unit from the match or full text if not found
      if (!unitText) {
        // Search the full text for units
        unitText = "";
        const unitMatches = [];

        // Look for each unit word in the text
        for (const unit of unitWords) {
          const regex = new RegExp(`\\b${unit}\\b`, "i");
          if (regex.test(queryLower)) {
            unitMatches.push(unit.replace(/s\?$/, ""));
          }
        }

        if (unitMatches.length > 0) {
          unitText = unitMatches[0]; // Use the first matched unit
        }
      }

      // Validate extracted values
      if (!isNaN(quantity) && !isNaN(price) && quantity > 0 && price > 0) {
        console.log(
          `  Extracted: quantity=${quantity}, price=${price}, unit=${unitText || "undefined"}`
        );

        // Round to 2 decimal places
        result.quantity = Math.round(quantity * 100) / 100;
        result.unitPrice = Math.round(price * 100) / 100;
        result.baseAmount = Math.round(quantity * price * 100) / 100;

        // Set the standardized unit if found
        if (unitText) {
          result.unit = extractUnit(unitText);
        } else {
          // If no unit was found in the match groups, try to find in the full text
          result.unit = extractUnit(queryLower);
        }

        console.log(
          `  Final: quantity=${result.quantity}, unitPrice=${result.unitPrice}, baseAmount=${result.baseAmount}, unit=${result.unit || "undefined"}`
        );
        return result;
      } else {
        console.log(`  ⚠️ Invalid values: quantity=${quantity}, price=${price}`);
      }
    }
  }

  // If no quantity-price pattern matches, try to extract general amount
  console.log("No quantity-price pattern matched, extracting general amount...");

  // Look for monetary values with currency symbols
  const moneyPattern = /(?:₦|N|NGN|naira)?\s*(\d[\d,]*(?:\.\d{1,2})?)/gi;
  const moneyValues = [];
  let match;

  while ((match = moneyPattern.exec(queryLower)) !== null) {
    const cleanAmount = match[1].replace(/,/g, "");
    const amount = parseFloat(cleanAmount);
    if (!isNaN(amount) && amount > 0) {
      moneyValues.push(amount);
    }
  }

  // Look for general numbers
  const numberPattern = /(\d[\d,]*(?:\.\d{1,2})?)/g;
  const numbers = [];

  while ((match = numberPattern.exec(queryLower)) !== null) {
    const cleanNumber = match[1].replace(/,/g, "");
    const number = parseFloat(cleanNumber);
    if (!isNaN(number) && number > 0 && !moneyValues.includes(number)) {
      numbers.push(number);
    }
  }

  console.log(`  Found money values: ${moneyValues.join(", ")}`);
  console.log(`  Found general numbers: ${numbers.join(", ")}`);

  // Combine all values and check for quantity-price pattern
  const allValues = [...moneyValues, ...numbers].sort((a, b) => b - a);

  if (allValues.length > 0) {
    console.log(`  All values in descending order: ${allValues.join(", ")}`);

    // Try to detect a quantity-price relationship
    if (allValues.length >= 2) {
      // Get the largest and smallest values
      const largest = allValues[0];
      const smallest = allValues[allValues.length - 1];

      // Check if the query mentions units for the smaller number
      const smallestPattern = new RegExp(`(${smallest.toString()})\\s*(${unitWordsPattern})`, "i");
      const smallestMatch = smallestPattern.exec(queryLower);

      // If smallest number is followed by a unit and is reasonably small (likely quantity)
      if ((smallestMatch || smallest <= 10) && largest >= smallest * 2) {
        result.quantity = smallest;
        result.unitPrice = largest;
        result.baseAmount = Math.round(smallest * largest * 100) / 100;

        // Extract unit from the match or from the entire query
        if (smallestMatch && smallestMatch[2]) {
          result.unit = extractUnit(smallestMatch[2]);
        } else {
          result.unit = extractUnit(queryLower);
        }

        console.log(
          `  Detected quantity-price relationship: ${smallest} * ${largest} = ${result.baseAmount} with unit: ${result.unit || "undefined"}`
        );
      } else {
        // If there's no clear quantity-price relationship, use the largest value as the base amount
        result.baseAmount = largest;
        console.log(`  Using largest value as base amount: ${largest}`);
      }
    } else {
      // If we only have one value, use it as the base amount
      result.baseAmount = allValues[0];
      console.log(`  Using only value as base amount: ${allValues[0]}`);
    }
  }

  // Last check for units if not already set and if we have a quantity
  if (result.quantity && !result.unit) {
    result.unit = extractUnit(queryLower);
  }

  return result;
};

// Test cases that previously had issues
const testQueries = [
  "Calculate VAT on 5 kg rice at ₦400 per kg",
  "How much VAT for 1.5 kilograms at ₦2,400 per kg?",
  "Calculate VAT on 3 items at ₦200 each",
  "What is the VAT on a ₦5,000 package containing 20 pieces?",
  "Calculate VAT for ₦10,000 worth of services",
  "What is the VAT on 2.5 meters of fabric at ₦1,500 per meter?",
  "Calculate VAT on ₦300 per hour for 4 hours of service",
  "What is the VAT on 6 bottles at ₦250 per bottle?",
  "Calculate VAT on 2 cartons of milk at ₦3,500 per carton",
];

// Run the tests
allQueries = [...new Set(testQueries)];
allQueries.forEach((query) => {
  console.log("\n" + "=".repeat(60));
  const result = extractNumericValues(query);
  console.log(`FINAL RESULT for "${query}":`);
  console.log(
    `- Base Amount: ${result.baseAmount !== null ? "₦" + result.baseAmount.toFixed(2) : "Not found"}`
  );
  console.log(
    `- Quantity: ${result.quantity !== null ? result.quantity : "Not found"}${result.unit ? " " + result.unit : ""}`
  );
  console.log(
    `- Unit Price: ${result.unitPrice !== null ? "₦" + result.unitPrice.toFixed(2) : "Not found"}`
  );
});

// Format the result for display
const formatExtractedValues = (result, query) => {
  if (!result.baseAmount) {
    return `Could not extract monetary value from: "${query}"`;
  }

  // Calculate VAT and format numbers
  const vatRate = 0.075;
  const vatAmount = Math.round(result.baseAmount * vatRate * 100) / 100;
  const totalAmount = Math.round((result.baseAmount + vatAmount) * 100) / 100;

  let output = `For the query: "${query}"\n\n`;

  if (result.quantity !== null && result.unitPrice !== null) {
    output += `Quantity: ${result.quantity}${result.unit ? " " + result.unit : ""}\n`;
    output += `Unit Price: ₦${result.unitPrice.toFixed(2)}\n`;
    output += `Base Amount: ₦${result.baseAmount.toFixed(2)} (${result.quantity} × ₦${result.unitPrice.toFixed(2)})\n`;
  } else {
    output += `Base Amount: ₦${result.baseAmount.toFixed(2)}\n`;
  }

  output += `VAT (7.5%): ₦${vatAmount.toFixed(2)}\n`;
  output += `Total: ₦${totalAmount.toFixed(2)}\n`;

  return output;
};

// Display formatted results for easy verification
console.log("\n\n" + "=".repeat(80));
console.log("FORMATTED RESULTS");
console.log("=".repeat(80));

allQueries.forEach((query) => {
  const result = extractNumericValues(query);
  console.log("\n" + formatExtractedValues(result, query));
});
