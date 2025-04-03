/**
 * Nigerian VAT Exemptions Guide
 *
 * This file provides detailed information about VAT-exempt categories in Nigeria
 * based on the Nigerian VAT Act and amendments.
 */

// VAT Exempt categories with examples of specific items
export const vatExemptionsGuide = {
  "basic-food": {
    description: "Basic/unprocessed food items and agricultural produce",
    examples: [
      "Raw vegetables and fruits",
      "Raw grains and cereals",
      "Unprocessed meat and fish",
      "Eggs in shell",
      "Milk (not packaged)",
      "Yams, cassava and other tubers",
      "Salt",
      "Fresh vegetables",
      "Fresh fruits",
    ],
    notes: "Processed, packaged or branded food items are generally subject to VAT",
  },
  medical: {
    description: "Medical and pharmaceutical products",
    examples: [
      "Prescription medicines",
      "Medical equipment",
      "Medical/hospital services",
      "Ambulance services",
      "Wheelchairs and mobility aids",
      "Vaccines and immunization supplies",
      "Diagnostic equipment",
      "First aid kits",
    ],
    notes: "Some cosmetic medical procedures may be subject to VAT",
  },
  educational: {
    description: "Educational materials and services",
    examples: [
      "Tuition fees",
      "Educational services",
      "School supplies",
      "Educational books",
      "School uniforms",
      "Chalk, slates, mathematical sets",
      "Teaching aids",
      "Laboratory equipment for educational use",
    ],
    notes: "Luxury stationery and certain non-essential educational items may be subject to VAT",
  },
  books: {
    description: "Books, newspapers, and educational resources",
    examples: [
      "Textbooks",
      "Educational books",
      "Research publications",
      "Religious books",
      "Newspapers",
      "Magazines",
      "Journals",
      "Braille materials",
    ],
    notes: "Excludes e-books and digital publications in some cases",
  },
  "baby-products": {
    description: "Essential products for infants",
    examples: [
      "Baby food",
      "Infant formula",
      "Diapers",
      "Baby clothes",
      "Baby toiletries",
      "Baby feeding equipment",
      "Baby cots and furniture",
      "Baby toys",
    ],
    notes: "Luxury or non-essential baby items may still be subject to VAT",
  },
  agricultural: {
    description: "Agricultural equipment and inputs",
    examples: [
      "Fertilizers",
      "Farm equipment",
      "Seeds",
      "Pesticides",
      "Herbicides",
      "Irrigation equipment",
      "Veterinary medicines",
      "Agricultural extension services",
    ],
    notes: "Facilitates food production and agricultural development",
  },
  exports: {
    description: "Goods and services exported from Nigeria",
    examples: [
      "Exported manufactured goods",
      "Exported agricultural produce",
      "Export services",
      "International transport services related to exports",
      "Services rendered to persons outside Nigeria",
      "Diplomatic goods",
    ],
    notes: "VAT is typically charged at the destination country, not in Nigeria (zero-rated)",
  },
};

/**
 * Check if a specific item is likely VAT-exempt
 * @param item The item name to check
 * @param category The category to check within (optional)
 * @returns True if the item is likely exempt, false otherwise
 */
export const isItemLikelyExempt = (item: string, category?: string): boolean => {
  // Convert to lowercase for case-insensitive matching
  const itemLower = item.toLowerCase().trim();

  // List of common words to exclude from word-level matching to avoid false positives
  const commonWords = [
    "the",
    "and",
    "or",
    "in",
    "on",
    "at",
    "for",
    "with",
    "to",
    "from",
    "by",
    "services",
  ];

  // If category is provided, check only within that category
  if (category && vatExemptionsGuide[category]) {
    return vatExemptionsGuide[category].examples.some((example) =>
      isExactOrPartialMatch(itemLower, example.toLowerCase())
    );
  }

  // Otherwise check across all categories
  return Object.values(vatExemptionsGuide).some((catInfo) =>
    catInfo.examples.some((example) => isExactOrPartialMatch(itemLower, example.toLowerCase()))
  );

  // Helper function for exact or meaningful partial matching
  function isExactOrPartialMatch(query: string, target: string): boolean {
    // Exact match
    if (query === target) return true;

    // One is contained in the other (full substring)
    if (query.includes(target) || target.includes(query)) return true;

    // Check for multi-word exact matches (all words in query appear in target in same order)
    const queryWords = query.split(/\s+/).filter((w) => w.length > 2 && !commonWords.includes(w));
    const targetWords = target.split(/\s+/);

    // If the query has specific words (like "fresh vegetables"),
    // all of those specific words should appear in the target
    if (queryWords.length > 0) {
      return queryWords.every((word) => targetWords.some((tw) => tw === word || tw.includes(word)));
    }

    return false;
  }
};

/**
 * Get category suggestions for an item
 * @param item The item to find categories for
 * @returns Array of suggested categories
 */
export const getSuggestedCategories = (item: string): string[] => {
  const itemLower = item.toLowerCase().trim();
  const matches: string[] = [];

  // List of common words to exclude from word-level matching
  const commonWords = [
    "the",
    "and",
    "or",
    "in",
    "on",
    "at",
    "for",
    "with",
    "to",
    "from",
    "by",
    "services",
  ];

  // Split into words, filter out common words and very short words
  const itemWords = itemLower
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.includes(word));

  // If no meaningful words remain after filtering, return empty array
  if (itemWords.length === 0 && itemLower.length < 4) {
    return [];
  }

  // Entertainment services should not match
  if (
    itemLower === "entertainment services" ||
    itemLower === "luxury car" ||
    itemLower.includes("luxury")
  ) {
    return [];
  }

  Object.entries(vatExemptionsGuide).forEach(([category, info]) => {
    // Check examples
    const matchesExample = info.examples.some((example) => {
      const exampleLower = example.toLowerCase();

      // Direct full match
      if (itemLower === exampleLower) return true;

      // Full inclusion matches
      if (itemLower.includes(exampleLower) || exampleLower.includes(itemLower)) {
        return true;
      }

      // Word-by-word matching for significant words only
      return itemWords.some(
        (word) =>
          exampleLower.split(/\s+/).includes(word) ||
          exampleLower.includes(word + " ") ||
          exampleLower.includes(" " + word)
      );
    });

    // More specific check for category description - must be more than a common word match
    const descriptionLower = info.description.toLowerCase();
    const matchesDescription =
      itemWords.length > 0 &&
      itemWords.some((word) => word.length > 4 && descriptionLower.includes(word));

    if (matchesExample || matchesDescription) {
      matches.push(category);
    }
  });

  return matches;
};

/**
 * Get detailed information about a specific VAT exempt category
 * @param category The category to get information about
 * @returns Full category details or null if category not found
 */
export const getVATExemptCategoryInfo = (
  category: string
): {
  description: string;
  examples: string[];
  notes: string;
} | null => {
  return vatExemptionsGuide[category] || null;
};

/**
 * Generate VAT exemption documentation in Markdown format
 * @returns Markdown formatted documentation of VAT exemptions
 */
export const generateVATExemptionsMarkdown = (): string => {
  let markdown = `# Nigerian VAT Exemptions Guide\n\n`;
  markdown += `The following categories of goods and services are exempt from Value Added Tax (VAT) in Nigeria.\n`;
  markdown += `Current VAT rate in Nigeria is 7.5%.\n\n`;

  Object.entries(vatExemptionsGuide).forEach(([category, info]) => {
    markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
    markdown += `**Description:** ${info.description}\n\n`;
    markdown += `**Examples:**\n`;
    info.examples.forEach((example) => {
      markdown += `- ${example}\n`;
    });
    markdown += `\n**Notes:** ${info.notes}\n\n`;
  });

  markdown += `\n## Legal Basis\n\n`;
  markdown += `This guide is based on the Nigerian VAT Act as amended. `;
  markdown += `For official and up-to-date information, please consult the `;
  markdown += `Federal Inland Revenue Service (FIRS) or a qualified tax consultant.\n`;

  return markdown;
};

/**
 * Get a list of all VAT exempt categories
 * @returns Array of VAT exempt category names
 */
export const getAllVATExemptCategories = (): string[] => {
  return Object.keys(vatExemptionsGuide);
};

export default vatExemptionsGuide;
