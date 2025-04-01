import { extractNumericValues } from "../utils/taxChain";

// Define the extended type that includes the unit property
interface ExtendedExtractedValues {
  values: number[];
  quantity?: number;
  unitPrice?: number;
  baseAmount?: number;
  unit?: string;
}

// Function to format test results with enhanced debug info
function formatExtractedValues(text: string, result: ExtendedExtractedValues) {
  console.log("\n" + "=".repeat(80));
  console.log(`QUERY: "${text}"`);
  console.log("-".repeat(80));

  // Test common regex patterns directly for debugging
  const debugPatterns = [
    {
      name: "X items at Y price each",
      pattern:
        /(\\d+(?:\\.\\d+)?)\\s*(?:items?|units?|pieces?)\\s*(?:at|for)\\s*(?:₦|N|NGN|naira)?\\s*([\\d,]+(?:\\.\\d{1,2})?)\\s*(?:each|per)/i,
    },
    {
      name: "Y price for X items",
      pattern:
        /(?:₦|N|NGN|naira)?\\s*([\\d,]+(?:\\.\\d{1,2})?)\\s*(?:for|per)\\s*(\\d+(?:\\.\\d+)?)\\s*(?:items?|units?|pieces?)/i,
    },
    {
      name: "X kg at Y price per kg",
      pattern:
        /(\\d+(?:\\.\\d+)?)\\s*(?:kg|kilos?|kilograms?)\\s*(?:at|for)\\s*(?:₦|N|NGN|naira)?\\s*([\\d,]+(?:\\.\\d{1,2})?)\\s*(?:per|each)/i,
    },
  ];

  console.log("DIRECT REGEX PATTERN TESTING:");
  for (const pattern of debugPatterns) {
    try {
      const regex = new RegExp(pattern.pattern.source, "i");
      const match = text.match(regex);
      console.log(`- ${pattern.name}: ${match ? "✅ MATCH" : "❌ NO MATCH"}`);
      if (match) {
        console.log(`  Groups: ${JSON.stringify(match.slice(1))}`);
      }
    } catch (e) {
      console.log(`- ${pattern.name}: ⚠️ ERROR: ${e.message}`);
    }
  }

  console.log("\nAll values found:");
  if (result.values.length === 0) {
    console.log("  No numeric values found");
  } else {
    result.values.forEach((value, index) => {
      console.log(
        `  Value ${index + 1}: ₦${value.toLocaleString("en-NG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      );
    });
  }

  console.log("\nDetailed extraction:");

  if (result.quantity !== undefined && result.unitPrice !== undefined) {
    console.log(`  Quantity detected: ${result.quantity} ${result.unit || "item(s)"}`);
    console.log(
      `  Unit price detected: ₦${result.unitPrice.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} per ${(result.unit || "item").replace(/\(.*\)/, "")}`
    );
    console.log(
      `  Calculated base amount: ${result.quantity} ${result.unit || "item(s)"} × ₦${result.unitPrice.toLocaleString(
        "en-NG",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )} = ₦${result.baseAmount?.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    );
  } else if (result.baseAmount !== undefined) {
    console.log(
      `  Base amount: ₦${result.baseAmount.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    );
  } else {
    console.log("  No base amount could be determined");
  }

  if (result.baseAmount !== undefined) {
    const vatAmount = Math.round(result.baseAmount * 0.075 * 100) / 100;
    const totalAmount = Math.round((result.baseAmount + vatAmount) * 100) / 100;

    console.log("\nVAT Calculation:");
    console.log(
      `  Base Amount: ₦${result.baseAmount.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    );
    console.log(
      `  VAT (7.5%): ₦${vatAmount.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    );
    console.log(
      `  Total (including VAT): ₦${totalAmount.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    );
  }
}

// Add some specific test cases for debugging extraction issues
const debugTests = [
  // Add problematic test cases here
  "Calculate VAT on 5 kg rice at ₦400 per kg",
  "How much VAT for 1.5 kilograms at ₦2,400 per kg?",
  "Calculate VAT on 3 items at ₦200 each",
  "Calculate VAT for ₦10,000 worth of services",
  "What is the VAT on 2.5 meters of fabric at ₦1,500 per meter?",
  "Calculate VAT on ₦300 per hour for 4 hours of service",
  "What is the VAT on a ₦5,000 package containing 20 pieces?",
  "Calculate VAT on 3 products worth ₦2,000 each",
  "What is the VAT on 6 bottles at ₦250 per bottle?",
  "Calculate VAT on 2 cartons of milk at ₦3,500 per carton",
];

// Run tests with more detailed debugging
console.log("NUMERIC VALUE EXTRACTION DEBUG TEST");
console.log("==================================");

debugTests.forEach((query) => {
  const result = extractNumericValues(query) as ExtendedExtractedValues;
  formatExtractedValues(query, result);
});

// Regular test queries to run as well
const testQueries = [
  // Basic amount queries
  "Calculate VAT on ₦10,000",
  "How much VAT for N1500?",
  "What is the VAT on 2500 naira?",

  // Standard quantity and unit price queries
  "Calculate VAT on 5 items at ₦200 each",
  "3 products worth ₦1,000 each",
  "What is the VAT on 10 units at ₦500 per unit?",
  "Compute VAT for ₦250 * 4",
  "7 items costing ₦350 per piece",

  // Weight unit queries
  "Calculate VAT on 2.5 kg of rice at ₦400 per kg",
  "What is VAT on 1.5 kilograms of meat at ₦2,400 per kg?",
  "Calculate VAT for 500 grams of sugar at ₦2 per gram",

  // Volume unit queries
  "Calculate VAT on 5 liters of oil at ₦600 per liter",
  "What is the VAT on 750 ml of perfume at ₦0.80 per ml?",

  // Length and area unit queries
  "Calculate VAT for 10 meters of fabric at ₦150 per meter",
  "What is the VAT on 25 square meters of tiles at ₦2,000 per sq m?",
  "Calculate VAT on 1.5 hectares of land at ₦500,000 per hectare",

  // Container unit queries
  "Calculate VAT for 3 boxes of supplies at ₦5,000 per box",
  "What is the VAT on 6 bottles of water at ₦250 each?",
  "Calculate VAT on 2 cartons of milk at ₦3,500 per carton",
  "What is the VAT on 10 bags of cement at ₦4,000 per bag?",

  // Bulk quantity queries
  "Calculate VAT on ₦5,000 for a pack of 20 units",
  "What is the VAT on ₦15,000 for a case containing 30 bottles?",

  // Time-based service queries
  "Calculate VAT on ₦300 per hour for 4.5 hours of service",
  "What is the VAT on ₦5,000 per day for 3 days of rental?",

  // Complex queries
  "Calculate VAT on 3 products at ₦2,000 each plus shipping of ₦500",
  "What is the VAT on 5 items at ₦199.99 each with a discount of ₦100?",
  "Calculate VAT for 2 kg of meat at ₦2,500/kg and 1.5 kg of fish at ₦3,000/kg",

  // Edge cases
  "What are the VAT exemptions?",
  "The item costs -₦1,500.00",
  "Calculate VAT on ₦0.00",

  // Comma as decimal separator
  "Calculate VAT on 5 items at ₦199,99 each",
  "Calculate VAT on 2,5 kg of rice at ₦400 per kg",
];

// Run standard tests as well
console.log("\n\nSTANDARD TEST CASES");
console.log("=================");

testQueries.forEach((query) => {
  const result = extractNumericValues(query) as ExtendedExtractedValues;
  formatExtractedValues(query, result);
});

// Instructions for running the test
console.log("\n" + "=".repeat(80));
console.log("To run this test script:");
console.log("1. Make sure TypeScript is installed: npm install -g typescript ts-node");
console.log("2. Run the script with: ts-node src/scripts/testExtraction.ts");
console.log("=".repeat(80));
