// Test script for the chat extraction function

// Mock the extractUnit function from Chat.tsx
const extractUnit = (text) => {
  try {
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
    ].join("|");

    // Prioritize explicit pattern matching for specific units
    const lowerText = text.toLowerCase();

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

    // If no specific unit pattern matched, fall back to general search
    const unitPattern = new RegExp(`(?:${unitWords})`, "i");
    const match = text.match(unitPattern);

    if (match) {
      const unitText = match[0].toLowerCase();

      // Standardize unit terminology
      if (/items?|units?|pieces?|products?|goods/.test(unitText)) {
        return "item(s)";
      } else if (/kilo(?:gram)?s?|kg/.test(unitText)) {
        return "kg";
      } else if (/grams?/.test(unitText)) {
        return "g";
      } else if (/liters?|l/.test(unitText)) {
        return "liter(s)";
      } else if (/milliliters?|ml/.test(unitText)) {
        return "ml";
      } else if (/meters?|m/.test(unitText) && !/square/.test(text)) {
        return "m";
      } else if (/square meters?|sq\.? ?m|m2/.test(unitText)) {
        return "m²";
      } else if (/boxes?/.test(unitText)) {
        return "box(es)";
      } else if (/packs?|packages?/.test(unitText)) {
        return "pack(s)";
      } else if (/cartons?/.test(unitText)) {
        return "carton(s)";
      } else if (/bottles?/.test(unitText)) {
        return "bottle(s)";
      } else if (/cans?/.test(unitText)) {
        return "can(s)";
      } else if (/bags?/.test(unitText)) {
        return "bag(s)";
      }

      // If no standardization is needed, return as is
      return unitText;
    }
  } catch (error) {
    console.error("Error extracting unit:", error);
  }

  // Default to undefined if no unit is found
  return undefined;
};

// Test the extraction function with problematic cases
const testCases = [
  { text: "5 kg rice at ₦400 per kg", expectedUnit: "kg" },
  { text: "1.5 kilograms at ₦2,400 per kg", expectedUnit: "kg" },
  { text: "3 items at ₦200 each", expectedUnit: "item(s)" },
  { text: "a ₦5,000 package containing 20 pieces", expectedUnit: "item(s)" },
  { text: "2.5 meters of fabric at ₦1,500 per meter", expectedUnit: "m" },
  { text: "₦300 per hour for 4 hours of service", expectedUnit: "hour(s)" },
  { text: "6 bottles at ₦250 per bottle", expectedUnit: "bottle(s)" },
  { text: "2 cartons of milk at ₦3,500 per carton", expectedUnit: "carton(s)" },
];

// Run the tests
console.log("TESTING UNIT EXTRACTION");
console.log("======================");

testCases.forEach(({ text, expectedUnit }) => {
  const extractedUnit = extractUnit(text);
  const passed = extractedUnit === expectedUnit;

  console.log(`Query: "${text}"`);
  console.log(`Expected unit: "${expectedUnit}"`);
  console.log(`Extracted unit: "${extractedUnit}"`);
  console.log(`Test ${passed ? "PASSED ✓" : "FAILED ✗"}`);
  console.log("-".repeat(50));
});

// Mock function to test the regex patterns
function testRegexPatterns(query) {
  console.log(`\nTesting regex patterns for query: "${query}"`);

  // Define unit words for regex patterns
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
  ].join("|");

  // Test multiple regex patterns
  const patterns = [
    // Pattern 1: "X units at Y price each"
    {
      name: "Pattern 1: X units at Y price each",
      regex: new RegExp(
        `(\\d+(?:\\.\\d+)?)\\s+((?:${unitWords}))\\s+at\\s+(?:₦|N|NGN|naira)?\\s*(\\d+(?:,\\d+)*(?:\\.\\d+)?)\\s+each`,
        "i"
      ),
    },

    // Pattern 2: "X units at Y price per unit"
    {
      name: "Pattern 2: X units at Y price per unit",
      regex: new RegExp(
        `(\\d+(?:\\.\\d+)?)\\s+((?:${unitWords}))\\s+at\\s+(?:₦|N|NGN|naira)?\\s*(\\d+(?:,\\d+)*(?:\\.\\d+)?)\\s+per\\s+(?:${unitWords})`,
        "i"
      ),
    },

    // Pattern 3: Special case for cartons
    {
      name: "Pattern 3: X cartons of product at Y price per carton",
      regex: new RegExp(
        `(\\d+(?:\\.\\d+)?)\\s+(cartons?)\\s+of\\s+\\w+\\s+at\\s+(?:₦|N|NGN|naira)?\\s*(\\d+(?:,\\d+)*(?:\\.\\d+)?)\\s+per\\s+carton`,
        "i"
      ),
    },

    // Pattern 4: Special case for bottles
    {
      name: "Pattern 4: X bottles at Y price per bottle",
      regex: new RegExp(
        `(\\d+(?:\\.\\d+)?)\\s+(bottles?)\\s+at\\s+(?:₦|N|NGN|naira)?\\s*(\\d+(?:,\\d+)*(?:\\.\\d+)?)\\s+per\\s+bottle`,
        "i"
      ),
    },

    // Pattern 5: Simple items pattern
    {
      name: "Pattern 5: Simple items pattern",
      regex: new RegExp(
        `(\\d+(?:\\.\\d+)?)\\s+(items?)\\s+at\\s+(?:₦|N|NGN|naira)?\\s*(\\d+(?:,\\d+)*(?:\\.\\d+)?)\\s+each`,
        "i"
      ),
    },
  ];

  // Check if any patterns match
  let anyMatched = false;
  for (const { name, regex } of patterns) {
    const match = regex.exec(query);
    if (match) {
      anyMatched = true;
      console.log(`✓ Pattern matched: "${name}"`);
      console.log(`  Quantity: ${match[1]}`);
      console.log(`  Unit: ${match[2]}`);
      console.log(`  Price: ${match[3]}`);
    } else {
      console.log(`✗ Pattern did not match: "${name}"`);
    }
  }

  // If no patterns matched, try a more flexible approach
  if (!anyMatched) {
    console.log("\nTrying more flexible patterns:");

    // Flexible pattern for quantity and price extraction
    const flexPattern = /(\d+(?:\.\d+)?)\s+\w+.*?(?:₦|N|NGN|naira)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i;
    const flexMatch = flexPattern.exec(query);

    if (flexMatch) {
      console.log(`✓ Flexible pattern matched!`);
      console.log(`  Potential quantity: ${flexMatch[1]}`);
      console.log(`  Potential price: ${flexMatch[2]}`);
    } else {
      console.log(`✗ Even flexible pattern failed to match`);
    }
  }

  console.log("-".repeat(50));
}

// Test regex patterns with problematic cases
console.log("\nTESTING REGEX PATTERNS");
console.log("=====================");

const regexTestCases = [
  "2 cartons of milk at ₦3,500 per carton",
  "6 bottles at ₦250 per bottle",
  "3 items at ₦200 each",
];

regexTestCases.forEach((query) => {
  testRegexPatterns(query);
});
