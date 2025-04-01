// Test script for querying with edge cases

// Simplified version of the extraction and exemption logic
const checkExemption = (query) => {
  console.log(`Testing query: "${query}"`);

  // Mock exempted items from the real application
  const exemptedItems = {
    babyProducts: [
      "baby",
      "infant",
      "toddler",
      "diaper",
      "nappy",
      "formula",
      "baby food",
      "baby milk",
      "baby clothing",
      "baby shoe",
    ],
    basicFoodItems: [
      "rice",
      "beans",
      "yam",
      "cassava",
      "maize",
      "corn",
      "milk",
      "dairy",
      "egg",
      "bread",
    ],
  };

  // Extract potential items (simplified)
  const extractPotentialItems = (q) => {
    const cleanedQuery = q.toLowerCase().replace(/[.,?!;:(){}[\]'"]/g, " ");

    // Common VAT phrases
    const splitPatterns = ["vat on", "vat for", "calculate vat on"];
    let itemPart = cleanedQuery;

    for (const pattern of splitPatterns) {
      if (cleanedQuery.includes(pattern)) {
        const parts = cleanedQuery.split(pattern);
        if (parts.length > 1) {
          itemPart = parts[1].trim();
          break;
        }
      }
    }

    // Stop words including problematic terms
    const stopWords = [
      "a",
      "an",
      "the",
      "is",
      "are",
      "in",
      "for",
      "on",
      "of",
      "to",
      "with",
      "by",
      "at",
      "from",
      "per",
      "each",
      "worth",
      "valued",
      "costing",
      "about",
      "kg",
      "meter",
      "bottle",
      "carton",
      "hour",
    ];

    // Filter words
    const filteredWords = itemPart
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.includes(word))
      .map((word) => word.trim());

    console.log("Filtered words:", filteredWords);

    // Create combinations
    const items = [];
    items.push(...filteredWords);

    // Add 2-word combinations
    for (let i = 0; i < filteredWords.length - 1; i++) {
      items.push(`${filteredWords[i]} ${filteredWords[i + 1]}`);
    }

    // Full part as well
    items.push(itemPart);

    return items;
  };

  // Check for exemptions using stemming logic
  const items = extractPotentialItems(query);
  console.log("Potential items:", items);

  let matches = [];

  // Check against each category
  for (const [category, keywords] of Object.entries(exemptedItems)) {
    for (const item of items) {
      for (const keyword of keywords) {
        let isMatch = false;

        if (keyword.includes(" ")) {
          // Multi-word keywords
          isMatch = item.includes(keyword) || keyword.includes(item);
        } else {
          // Single-word keywords with stemming
          const itemStems = [item];

          // Basic singular/plural handling
          if (item.endsWith("s")) {
            itemStems.push(item.slice(0, -1)); // Plural to singular
          } else {
            itemStems.push(item + "s"); // Singular to plural
          }

          // Special cases for irregular plurals
          if (item.endsWith("ies")) {
            itemStems.push(item.slice(0, -3) + "y"); // e.g., "babies" -> "baby"
          } else if (item.endsWith("y")) {
            itemStems.push(item.slice(0, -1) + "ies"); // e.g., "baby" -> "babies"
          }

          // Check with word boundaries
          const pattern = new RegExp(`\\b${keyword}\\b`, "i");
          const commonPrefixesSuffixes = [
            "per",
            "pro",
            "pre",
            "post",
            "re",
            "un",
            "in",
            "ex",
            "co",
          ];

          // Check if keyword matches any stemmed item
          for (const stemmedItem of itemStems) {
            if (
              pattern.test(stemmedItem) &&
              (keyword.length > 3 || !commonPrefixesSuffixes.includes(keyword))
            ) {
              isMatch = true;
              break;
            }
          }

          // Also check if item matches any stemmed keyword
          if (!isMatch) {
            const keywordStems = [keyword];

            if (keyword.endsWith("s")) {
              keywordStems.push(keyword.slice(0, -1));
            } else {
              keywordStems.push(keyword + "s");
            }

            if (keyword.endsWith("ies")) {
              keywordStems.push(keyword.slice(0, -3) + "y");
            } else if (keyword.endsWith("y")) {
              keywordStems.push(keyword.slice(0, -1) + "ies");
            }

            for (const stemmedKeyword of keywordStems) {
              const stemPattern = new RegExp(`\\b${stemmedKeyword}\\b`, "i");
              if (
                stemPattern.test(item) &&
                (stemmedKeyword.length > 3 || !commonPrefixesSuffixes.includes(stemmedKeyword))
              ) {
                isMatch = true;
                break;
              }
            }
          }
        }

        if (isMatch) {
          matches.push({
            item: item,
            keyword: keyword,
            category: category,
          });
        }
      }
    }
  }

  // Print results
  if (matches.length > 0) {
    console.log("✅ EXEMPT ITEMS FOUND:");
    matches.forEach((match) => {
      console.log(
        `  - Item: "${match.item}" matches keyword "${match.keyword}" in ${match.category}`
      );
    });
  } else {
    console.log("❌ NO EXEMPT ITEMS FOUND");
  }

  console.log("-".repeat(70));
};

// Test queries focusing on edge cases
const testQueries = [
  // Query with "per" that should not match as baby product
  "Calculate VAT on 3 items at ₦200 per item",

  // Query with "diapers" (plural) to test stemming
  "What is the VAT on diapers?",

  // Query with "diaper" (singular) to test stemming
  "Calculate VAT on diaper package",

  // Query with "rice" (basic food item)
  "Calculate VAT on 5kg of rice",

  // Query with "baby food" (multi-word keyword)
  "How much VAT on baby food?",

  // Query with compound phrase containing "per"
  "Calculate VAT for performance evaluation at ₦5,000",

  // Query with irregular plural "babies"
  "What is the VAT on babies formula?",

  // Query with actual product "perspiration cream"
  "Calculate VAT on perspiration cream",
];

// Run tests
testQueries.forEach((query) => {
  checkExemption(query);
});
