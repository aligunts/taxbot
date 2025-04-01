// Enhanced test for VAT exemption
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

// Basic stemming function to handle plurals
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

// Function to check if an item is VAT exempt with improved extraction and matching
function isVatExempt(query) {
  const lowercaseQuery = query.toLowerCase();

  // Only process if this is a VAT-related query
  if (!lowercaseQuery.includes("vat") && !lowercaseQuery.includes("value added tax")) {
    return { exempt: false, reason: "Not a VAT query" };
  }

  // Extract potential items from the query
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

    return [...new Set(items)]; // Remove duplicates
  };

  const potentialItems = extractPotentialItems(lowercaseQuery);
  console.log("Potential items:", potentialItems);

  // Check each category for matches
  for (const [category, keywords] of Object.entries(exemptedItems)) {
    for (const item of potentialItems) {
      for (const keyword of keywords) {
        // More precise matching using word boundaries for short keywords
        if (
          (keyword.length <= 4 &&
            (new RegExp(`\\b${keyword}\\b`, "i").test(item) ||
              new RegExp(`\\b${keyword}s\\b`, "i").test(item))) ||
          // Broader matching for longer keywords
          (keyword.length > 4 && (item.includes(keyword) || keyword.includes(item)))
        ) {
          return {
            exempt: true,
            category: category,
            matchedKeyword: keyword,
            item: item,
          };
        }
      }
    }
  }

  return { exempt: false };
}

// Extended test with various queries
const testQueries = [
  "Calculate VAT on baby formula",
  "What is the VAT on rice?",
  "Calculate VAT on a laptop",
  "How much VAT for hospital services?",
  "Calculate VAT on 5 kg rice at ₦400 per kg",
  "What is the VAT on 10 diapers at ₦150 each?",
  "VAT on educational books",
  "Calculate VAT for farm equipment",
  "VAT on export services to UK",
  "How much VAT on 20kg of beans?",
  "Calculate VAT on tomatoes",
  "VAT on baby toys",
  "Calculate VAT on laptops",
  "What is VAT on 5 bottles of milk?",
  "Calculate VAT on pharmaceutical products",
];

console.log("TESTING ENHANCED VAT EXEMPTION CHECKS");
console.log("====================================");

testQueries.forEach((query) => {
  const result = isVatExempt(query);
  console.log(`\nQuery: "${query}"`);
  if (result.exempt) {
    console.log(`✓ EXEMPT from VAT`);
    console.log(`  Category: ${result.category}`);
    console.log(`  Matched keyword: "${result.matchedKeyword}"`);
    console.log(`  Identified item: "${result.item}"`);
  } else {
    console.log(`✗ NOT exempt from VAT`);
    if (result.reason) {
      console.log(`  Reason: ${result.reason}`);
    }
  }
  console.log("-".repeat(50));
});
