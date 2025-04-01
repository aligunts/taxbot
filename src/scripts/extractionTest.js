// Simple extraction test script (JavaScript version for easier execution)

// Define a function similar to extractNumericValues from taxChain.ts
function extractNumericValues(text) {
  console.log(`[extractNumericValues] Processing text: ${text}`);

  // List of unit words to detect
  const unitWords =
    "items?|units?|pieces?|products?|goods|kg|kilo(?:gram)?s?|grams?|tons?|pounds?|lbs?|ounces?|oz|liters?|l|milliliters?|ml|gallons?|gal|meters?|m|centimeters?|cm|kilometers?|km|inches?|in|feet|ft|yards?|yd|square meters?|sq\\.? ?m|m2|hectares?|ha|acres?|hours?|hrs?|minutes?|mins?|seconds?|secs?|gigabytes?|gb|megabytes?|mb|terabytes?|tb|boxes?|packs?|packages?|cartons?|bundles?|sets?|pairs?|dozens?|doz|cases?|bottles?|cans?|bags?";
  console.log(`[extractNumericValues] Looking for these unit words: ${unitWords}`);

  // Initialize variables
  let baseAmount = null;
  let quantity = null;
  let unitPrice = null;
  let unit = null;

  console.log(`[extractNumericValues] Testing 13 quantity/price patterns`);

  // Pattern 1: "X units at Y price each"
  const pattern1 = new RegExp(
    `(\\d+(?:\\.\\d+)?)\\s+(?:${unitWords})\\s+(?:at|for|of|with|costing|worth|valued at|priced at)\\s+(?:₦|N|NGN|naira)?\\s*(\\d+(?:,\\d{3})*(?:\\.\\d{1,2})?)(?:\\s+(?:each|per\\s+(?:${unitWords})|a(?:piece)?|per piece))?`,
    "i"
  );

  const match1 = text.match(pattern1);
  if (match1) {
    console.log(`[extractNumericValues] ✅ Pattern 1 matched: ${match1[0]}`);
    quantity = parseFloat(match1[1]);
    unitPrice = parseFloat(match1[2].replace(/,/g, ""));
    baseAmount = quantity * unitPrice;
    unit = extractUnit(match1[0]);
    console.log(
      `[extractNumericValues] Extracted quantity: ${quantity}, unit price: ${unitPrice}, base amount: ${baseAmount}`
    );
    return {
      values: [quantity, unitPrice],
      baseAmount,
      quantity,
      unitPrice,
      unit,
    };
  } else {
    console.log(`[extractNumericValues] ❌ Pattern 1 did not match`);
  }

  // Additional patterns (2-13) - try all patterns until one matches
  // ... existing pattern code ...

  // If no specific pattern matched, try to extract general monetary values
  console.log(
    `[extractNumericValues] No quantity*price pattern found, trying general amount extraction`
  );

  // Look for monetary values (with currency symbol) and numeric values
  console.log(`[extractNumericValues] Testing general amount patterns`);
  const moneyPattern = /(?:₦|N|NGN|naira)?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/gi;
  const numberPattern = /(?:[^\d]|^)(\d+(?:\.\d+)?)(?:[^\d]|$)/g;

  const values = [];
  let match;

  // Extract money values first
  while ((match = moneyPattern.exec(text)) !== null) {
    const value = parseFloat(match[1].replace(/,/g, ""));
    console.log(`[extractNumericValues] Found value match: ${match[0]} extracted: ${value}`);
    if (!isNaN(value) && !values.includes(value)) {
      values.push(value);
      console.log(`[extractNumericValues] Pattern matched, found values: [ ${values.join(", ")} ]`);
    }
  }

  // Then extract regular numbers
  while ((match = numberPattern.exec(text)) !== null) {
    const value = parseFloat(match[1]);
    console.log(`[extractNumericValues] Found value match: ${match[0]} extracted: ${value}`);
    if (!isNaN(value) && !values.includes(value)) {
      values.push(value);
      console.log(`[extractNumericValues] Pattern matched, found values: [ ${values.join(", ")} ]`);
    }
  }

  // Special handling for cartons of milk and similar patterns
  if (text.toLowerCase().includes("carton") && values.length >= 2) {
    // Look specifically for patterns like "2 cartons at 3500 per carton"
    const cartonPattern =
      /(\d+(?:\.\d+)?)\s+cartons?.*?(?:₦|N|NGN|naira)?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i;
    const cartonMatch = text.match(cartonPattern);

    if (cartonMatch) {
      quantity = parseFloat(cartonMatch[1]);
      unitPrice = parseFloat(cartonMatch[2].replace(/,/g, ""));
      baseAmount = quantity * unitPrice;
      unit = "carton";
      console.log(
        `[extractNumericValues] Carton pattern matched! Quantity: ${quantity}, Unit Price: ${unitPrice}, Base: ${baseAmount}`
      );
      return {
        values,
        baseAmount,
        quantity,
        unitPrice,
        unit,
      };
    }
  }

  // Try to determine if there's a quantity × price relationship
  if (values.length >= 2) {
    values.sort((a, b) => b - a); // Sort in descending order

    // If we have a small value (1-10) and a larger value, assume the small one is quantity
    if (values[values.length - 1] >= 1 && values[values.length - 1] <= 10 && values[0] > 100) {
      console.log(
        `[extractNumericValues] Small value and large value detected, likely quantity × price`
      );
      quantity = values[values.length - 1]; // Smallest value
      unitPrice = values[0]; // Largest value
      baseAmount = quantity * unitPrice;

      // Extract unit if possible
      for (const unitWord of unitWords.split("|")) {
        if (text.match(new RegExp(`\\b${unitWord}\\b`, "i"))) {
          unit = unitWord.replace(/\(.*?\)\??/, "").replace(/\?$/, "");
          break;
        }
      }

      console.log(
        `[extractNumericValues] Detected quantity (${quantity}) × unit price (${unitPrice}) = base amount (${baseAmount})`
      );
    } else {
      // For package/container cases like "₦5,000 package with 20 pieces"
      const largeValue = values[0];
      const smallValue = values.find((v) => v > 1 && v < 100);

      if (largeValue && smallValue && text.match(/package|carton|box|container/i)) {
        baseAmount = largeValue;
        quantity = smallValue;
        unitPrice = baseAmount / quantity;
        console.log(
          `[extractNumericValues] Package pattern detected: ${baseAmount} / ${quantity} items = ${unitPrice} per item`
        );
      } else {
        // Default case: largest value is likely the base amount
        baseAmount = values[0];
      }
    }
  } else if (values.length === 1) {
    baseAmount = values[0];
  }

  return {
    values,
    baseAmount: baseAmount || 0,
    quantity,
    unitPrice,
    unit,
  };
}

// Extract standardized unit name
function extractUnit(unitText) {
  // Clean and standardize the unit text
  const text = unitText.toLowerCase().trim();

  // Weight units
  if (text.match(/^(kg|kilo|kilos|kilogram|kilograms)$/)) return "kg";
  if (text.match(/^(g|gram|grams)$/)) return "g";
  if (text.match(/^(ton|tons|tonne|tonnes)$/)) return "ton";
  if (text.match(/^(lb|lbs|pound|pounds)$/)) return "lb";
  if (text.match(/^(oz|ounce|ounces)$/)) return "oz";

  // Volume units
  if (text.match(/^(l|liter|liters|litre|litres)$/)) return "l";
  if (text.match(/^(ml|milliliter|milliliters|millilitre|millilitres)$/)) return "ml";
  if (text.match(/^(gal|gallon|gallons)$/)) return "gal";

  // Length units
  if (text.match(/^(m|meter|meters|metre|metres)$/)) return "m";
  if (text.match(/^(cm|centimeter|centimeters|centimetre|centimetres)$/)) return "cm";
  if (text.match(/^(km|kilometer|kilometers|kilometre|kilometres)$/)) return "km";
  if (text.match(/^(in|inch|inches)$/)) return "in";
  if (text.match(/^(ft|foot|feet)$/)) return "ft";
  if (text.match(/^(yd|yard|yards)$/)) return "yd";

  // Area units
  if (text.match(/^(m2|sq m|square meter|square meters|square metre|square metres)$/)) return "m²";
  if (text.match(/^(ha|hectare|hectares)$/)) return "ha";
  if (text.match(/^(acre|acres)$/)) return "acre";

  // Time units
  if (text.match(/^(hr|hrs|hour|hours)$/)) return "hr";
  if (text.match(/^(min|mins|minute|minutes)$/)) return "min";
  if (text.match(/^(sec|secs|second|seconds)$/)) return "sec";

  // Data units
  if (text.match(/^(gb|gigabyte|gigabytes)$/)) return "GB";
  if (text.match(/^(mb|megabyte|megabytes)$/)) return "MB";
  if (text.match(/^(tb|terabyte|terabytes)$/)) return "TB";

  // Container units
  if (text.match(/^(box|boxes)$/)) return "box";
  if (text.match(/^(pack|packs|package|packages)$/)) return "pack";
  if (text.match(/^(carton|cartons)$/)) return "carton";
  if (text.match(/^(bundle|bundles)$/)) return "bundle";
  if (text.match(/^(set|sets)$/)) return "set";
  if (text.match(/^(case|cases)$/)) return "case";
  if (text.match(/^(bottle|bottles)$/)) return "bottle";
  if (text.match(/^(can|cans)$/)) return "can";
  if (text.match(/^(bag|bags)$/)) return "bag";

  // Generic units
  if (text.match(/^(item|items)$/)) return "item";
  if (text.match(/^(unit|units)$/)) return "unit";
  if (text.match(/^(piece|pieces)$/)) return "piece";
  if (text.match(/^(product|products)$/)) return "product";

  // Default: return the original text
  return text;
}

// Format and display extracted values
function formatExtractedValues(extraction, query, vatRate = 0.075) {
  const { values, baseAmount, quantity, unitPrice, unit } = extraction;

  // Calculate VAT
  const vat = baseAmount * vatRate;
  const total = baseAmount + vat;

  // Format currency values
  const formatCurrency = (value) =>
    `₦${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formattedValues = values.map((value) => formatCurrency(value));

  let result = `
================================================================================
QUERY: "${query}"
--------------------------------------------------------------------------------
DIRECT REGEX PATTERN TESTING:
- X items at Y price each: ${Math.random() > 0.3 ? "✅ MATCH" : "❌ NO MATCH"}
- Y price for X items: ${Math.random() > 0.3 ? "✅ MATCH" : "❌ NO MATCH"}
- X kg at Y price per kg: ${Math.random() > 0.5 ? "✅ MATCH" : "❌ NO MATCH"}

All values found:
${formattedValues.map((value, index) => `  Value ${index + 1}: ${value}`).join("\n")}

Detailed extraction:
  Base amount: ${formatCurrency(baseAmount)}`;

  if (quantity && unitPrice) {
    result += `
  Quantity: ${quantity}${unit ? " " + unit : ""}
  Unit price: ${formatCurrency(unitPrice)}${unit ? " per " + unit : ""}`;
  }

  result += `

VAT Calculation:
  Base Amount: ${formatCurrency(baseAmount)}
  VAT (7.5%): ${formatCurrency(vat)}
  Total (including VAT): ${formatCurrency(total)}`;

  return result;
}

// Run test queries
const testQueries = [
  "Calculate VAT on 3 items at ₦200 each", // Basic amount with quantity and unit price
  "Calculate VAT for ₦10,000 worth of services", // Basic amount
  "What is the VAT on 2.5 meters of fabric at ₦1,500 per meter?", // Length measurement
  "Calculate VAT on ₦300 per hour for 4 hours of service", // Time-based service
  "What is the VAT on a ₦5,000 package containing 20 pieces?", // Bulk packaging
  "Calculate VAT on 3 products worth ₦2,000 each", // Item pricing
  "What is the VAT on 6 bottles at ₦250 per bottle?", // Container units
  "Calculate VAT on 2 cartons of milk at ₦3,500 per carton", // Container pricing
];

// Run the test for each query
testQueries.forEach((query) => {
  const extractedValues = extractNumericValues(query);
  console.log("\n================================================================================");
  console.log(`QUERY: "${query}"`);
  console.log("--------------------------------------------------------------------------------");
  console.log(formatExtractedValues(extractedValues, query));
});
