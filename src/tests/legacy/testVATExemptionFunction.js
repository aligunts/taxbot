// Test the VAT exemption checking function directly
// This is a simplified version of the checkForVATExemption function from Chat.tsx

// Helper function for basic stemming to handle plurals
const stemWord = (word) => {
  if (word.length <= 3) return word;

  // Handle common plural endings
  if (word.endsWith("ies") && word.length > 4) {
    return word.slice(0, -3) + "y";
  } else if (word.endsWith("es") && word.length > 3) {
    return word.slice(0, -2);
  } else if (word.endsWith("s") && !word.endsWith("ss") && word.length > 3) {
    return word.slice(0, -1);
  }

  return word;
};

// Replace with your current exemptedItems object
const exemptedItems = {
  medicalAndPharmaceutical: [
    "medicine",
    "drug",
    "medication",
    "pharmaceutical",
    "pharmacy",
    "hospital",
    "clinic",
    "healthcare",
    "health care",
    "medical",
    "prescription",
    "treatment",
    "therapy",
    "doctor",
    "healthcare provider",
    "medical equipment",
    "medical supplies",
    "medical device",
    "surgical",
    "vaccine",
    "immunization",
    "diagnostic",
    "ambulance",
    "first aid",
  ],
  basicFoodItems: [
    "rice",
    "beans",
    "yam",
    "cassava",
    "maize",
    "corn",
    "milk",
    "fruit",
    "vegetable",
    "bread",
    "cereals",
    "grain",
    "flour",
    "pasta",
    "egg",
    "potato",
    "tomato",
    "onion",
    "garri",
    "semovita",
    "wheat",
    "sugar",
    "salt",
    "cooking oil",
    "palm oil",
    "groundnut",
    "legume",
    "tuber",
    "plantain",
    "banana",
    "meat",
    "fish",
    "poultry",
    "seafood",
    "beef",
    "chicken",
    "water",
    "unprocessed food",
  ],
  educationalMaterials: [
    "book",
    "textbook",
    "educational material",
    "school",
    "learning",
    "teaching",
    "notebook",
    "exercise book",
    "pencil",
    "pen",
    "crayon",
    "educational equipment",
    "school supplies",
    "stationery",
    "educational book",
    "academic",
  ],
  babyProducts: [
    "baby",
    "infant",
    "toddler",
    "diaper",
    "formula",
    "baby food",
    "baby milk",
    "baby clothing",
    "baby toiletries",
    "baby lotion",
    "baby oil",
    "baby powder",
    "baby wipe",
    "baby shampoo",
    "baby soap",
    "baby cream",
    "baby toy",
    "baby blanket",
    "baby bottle",
    "baby monitor",
    "crib",
    "cradle",
    "stroller",
    "pacifier",
    "teether",
    "baby carrier",
    "baby walker",
    "nappy",
  ],
  agriculturalEquipment: [
    "farm equipment",
    "farm machinery",
    "tractor",
    "plough",
    "harvester",
    "irrigation",
    "fertilizer",
    "pesticide",
    "farming tools",
    "agricultural",
    "farming",
    "crop",
    "seed",
    "livestock",
    "poultry equipment",
    "greenhouse",
    "fencing",
    "animal feed",
  ],
  exportServices: [
    "export service",
    "export good",
    "export product",
    "international shipping",
    "overseas delivery",
    "foreign market",
    "export business",
    "customs",
    "export trade",
  ],
};

// Extract potential items from the query for matching
const extractPotentialItems = (text) => {
  // Clean the text by replacing punctuation with spaces
  const cleanedText = text.replace(/[.,?!;:(){}[\]'"]/g, " ");

  // Split by common VAT calculation phrases to isolate the item part
  const splitPatterns = [
    "vat on",
    "vat for",
    "calculate vat on",
    "calculate vat for",
    "compute vat on",
    "compute vat for",
    "value added tax on",
    "value added tax for",
    "how much vat on",
    "how much vat for",
    "what is the vat on",
    "what is the vat for",
  ];

  let itemPart = cleanedText;
  for (const pattern of splitPatterns) {
    if (cleanedText.includes(pattern)) {
      const parts = cleanedText.split(pattern);
      if (parts.length > 1) {
        itemPart = parts[1].trim();
        break;
      }
    }
  }

  // A more comprehensive list of stop words to filter out
  const stopWords = [
    "a",
    "an",
    "the",
    "this",
    "that",
    "these",
    "those",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "in",
    "on",
    "at",
    "by",
    "for",
    "with",
    "about",
    "against",
    "between",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "to",
    "from",
    "up",
    "down",
    "and",
    "but",
    "or",
    "as",
    "if",
    "then",
    "else",
    "when",
    "than",
    "so",
    "no",
    "not",
    "only",
    "own",
    "same",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "per",
    "each",
    "every",
    "all",
    "any",
    "both",
    "which",
    "worth",
    "valued",
    "costing",
  ];

  // Filter words and create potential items
  const filteredWords = itemPart
    .split(/\s+/)
    .filter((word) => word.length > 1 && !stopWords.includes(word))
    .map((word) => word.trim().toLowerCase());

  const items = [];

  // Add individual words and their stems
  for (const word of filteredWords) {
    items.push(word);

    // Add stemmed version if different
    const stemmed = stemWord(word);
    if (stemmed !== word) {
      items.push(stemmed);
    }
  }

  // Add consecutive word combinations (2 and 3 word phrases)
  for (let i = 0; i < filteredWords.length - 1; i++) {
    // 2-word phrases
    items.push(`${filteredWords[i]} ${filteredWords[i + 1]}`);

    // 3-word phrases
    if (i < filteredWords.length - 2) {
      items.push(`${filteredWords[i]} ${filteredWords[i + 1]} ${filteredWords[i + 2]}`);
    }
  }

  // Add the full item part
  if (itemPart.trim().length > 0) {
    items.push(itemPart.trim().toLowerCase());
  }

  // Capture item+quantity patterns (e.g., "5kg rice", "10 packs formula")
  const quantityItemPatterns =
    /(\d+)[\s-]*(?:kg|g|ml|l|pcs|items?|packs?|cartons?|bottles?|boxes?|bags?|pieces?)\s+(\w+)/gi;
  let quantityMatch;

  while ((quantityMatch = quantityItemPatterns.exec(text)) !== null) {
    if (quantityMatch[2] && quantityMatch[2].length > 1) {
      items.push(quantityMatch[2].toLowerCase());
    }
  }

  // Remove duplicates
  return Array.from(new Set(items));
};

// Check if a query is about VAT-exempt items
const checkForVATExemption = (query) => {
  const lowercaseQuery = query.toLowerCase();

  // Only process if this is a VAT-related query
  if (!lowercaseQuery.includes("vat") && !lowercaseQuery.includes("value added tax")) {
    return null;
  }

  const potentialItems = extractPotentialItems(lowercaseQuery);
  console.log("[DEBUG] Potential exempt items:", potentialItems);

  // Special case for export services - check directly if the full query mentions exports
  if (
    lowercaseQuery.includes("export") &&
    (lowercaseQuery.includes("service") ||
      lowercaseQuery.includes("good") ||
      lowercaseQuery.includes("product") ||
      lowercaseQuery.includes("shipping") ||
      lowercaseQuery.includes("international"))
  ) {
    console.log("[DEBUG] Export service match found in full query");
    return `Items for export are exempt from VAT under the category of "exportServices"`;
  }

  // Check each category for matches
  for (const [category, keywords] of Object.entries(exemptedItems)) {
    for (const item of potentialItems) {
      for (const keyword of keywords) {
        // Special case for exportServices - require exact phrase match
        if (category === "exportServices") {
          // Skip this loop since we've already handled exportServices above
          continue;
        }

        // More precise matching using word boundaries for short keywords
        if (
          (keyword.length <= 4 &&
            (new RegExp(`\\b${keyword}\\b`, "i").test(item) ||
              new RegExp(`\\b${keyword}s\\b`, "i").test(item))) ||
          // Broader matching for longer keywords but still maintain some precision
          (keyword.length > 4 &&
            // For longer keywords, make matching more precise
            (new RegExp(`\\b${keyword}\\b`, "i").test(item) ||
              // Allow partial match only for multi-word items and keywords
              (item.includes(" ") &&
                keyword.includes(" ") &&
                (item.includes(keyword) || keyword.includes(item)))))
        ) {
          // Found a match
          console.log(
            `[DEBUG] VAT exemption match: item="${item}", keyword="${keyword}", category="${category}"`
          );
          return `Item "${item}" is exempt from VAT under the category of "${category}"`;
        }
      }
    }
  }

  // No exemption found
  return null;
};

// Test cases for the VAT exemption function
const testCases = [
  // Cases with "per" that should NOT be exempt
  "Calculate VAT on items worth N5000 per person",
  "What's the VAT on a service costing N10,000 per month?",
  "How much VAT on a product that costs N2000 per unit?",
  "Calculate VAT on a subscription of N5000 per year",

  // Actual baby products that SHOULD be exempt
  "How much VAT on diapers?",
  "Calculate VAT on baby formula",
  "What's the VAT on infant clothing?",

  // Mixed cases that include both "per" and baby products
  "Calculate VAT on diapers at N1000 per pack",
  "What's the VAT on baby formula costing N5000 per can?",

  // Plural forms
  "How much VAT on tomatoes?",
  "Calculate VAT on textbooks",

  // Edge cases
  "Calculate VAT on a personal computer",
  "What's the VAT on permanent markers?",

  // Export service tests
  "What's the VAT on export services?",
  "Calculate VAT on services for export",
  "How much VAT on goods for export?",
  "Calculate VAT on international shipping",
];

// Run all the test cases
for (const testCase of testCases) {
  console.log(`\nTesting: "${testCase}"`);
  const result = checkForVATExemption(testCase);
  console.log(`Result: ${result || "No exemption found"}`);
}

// Test a specific query
function testSpecificQuery(query) {
  console.log(`\n--- DETAILED TEST FOR: "${query}" ---`);
  console.log("Checking for VAT exemption...");
  const result = checkForVATExemption(query);
  console.log(`Result: ${result || "No exemption found"}`);
}

// Add specific tests here
testSpecificQuery("Calculate VAT on items worth N5000 per person");
testSpecificQuery("How much VAT on diapers?");
testSpecificQuery("What's the VAT on export services?");
