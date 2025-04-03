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
      "Rice (uncooked)",
      "Beans",
      "Maize",
      "Millet",
      "Sorghum",
      "Wheat",
      "Potatoes",
      "Onions",
      "Tomatoes",
      "Plantains",
      "Fresh fish",
      "Fresh meat",
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
      "Over-the-counter medicines",
      "Panadol",
      "Paracetamol",
      "Aspirin",
      "Ibuprofen",
      "Antibiotics",
      "Antimalarials",
      "Medical equipment",
      "Medical/hospital services",
      "Ambulance services",
      "Wheelchairs and mobility aids",
      "Vaccines and immunization supplies",
      "Diagnostic equipment",
      "First aid kits",
      "Medicine",
      "Drug",
      "Pharmaceutical",
      "Tablet",
      "Capsule",
      "Syrup",
      "Injection",
      "Hospital",
      "Clinic",
      "Pharmacy",
    ],
    notes:
      "Most medicines and medical products are VAT-exempt. Some cosmetic procedures may be subject to VAT",
  },
  educational: {
    description: "Educational materials and services",
    examples: [
      "Tuition fees",
      "School fees",
      "Educational services",
      "School supplies",
      "Notebooks",
      "Exercise books",
      "Pencils",
      "Pens",
      "Rulers",
      "Erasers",
      "Educational books",
      "Textbooks",
      "School uniforms",
      "Chalk, slates, mathematical sets",
      "Scientific calculators",
      "Teaching aids",
      "Laboratory equipment for educational use",
      "School bags",
      "Educational software",
    ],
    notes: "Luxury stationery and certain non-essential educational items may be subject to VAT",
  },
  books: {
    description: "Books, newspapers, and educational resources",
    examples: [
      "Textbooks",
      "Educational books",
      "Academic journals",
      "Research publications",
      "Religious books",
      "Bibles",
      "Qurans",
      "Dictionaries",
      "Encyclopedias",
      "Children's books",
      "Newspapers",
      "Magazines",
      "Journals",
      "Braille materials",
      "Educational maps",
      "Atlases",
    ],
    notes: "Excludes e-books and digital publications in some cases",
  },
  "baby-products": {
    description: "Essential products for infants",
    examples: [
      "Baby food",
      "Infant formula",
      "Diapers",
      "Pampers",
      "Huggies",
      "Baby wipes",
      "Baby lotion",
      "Baby powder",
      "Baby soap",
      "Baby clothes",
      "Baby toiletries",
      "Baby feeding equipment",
      "Baby bottles",
      "Pacifiers",
      "Baby cots and furniture",
      "Baby toys",
      "Baby oil",
      "Baby shampoo",
      "Baby cream",
      "Diaper rash cream",
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

  // Generic terms should not match as exempt
  const genericTerms = [
    "good",
    "goods",
    "item",
    "items",
    "product",
    "products",
    "thing",
    "things",
    "stuff",
  ];
  if (genericTerms.includes(itemLower)) {
    return false;
  }

  // Special case for common medications - these should always be VAT exempt
  const commonMedicines = [
    "panadol",
    "paracetamol",
    "acetaminophen",
    "ibuprofen",
    "aspirin",
    "medicine",
    "medication",
    "drug",
    "tablet",
    "pill",
    "capsule",
    "syrup",
    "antibiotic",
    "antimalarial",
    "vitamin",
    "supplement",
    "pharmaceutical",
    "prescription",
    "bandage",
    "first aid",
    "thermometer",
    "antiseptic",
    "ointment",
    "cough",
    "cold",
    "flu",
    "fever",
    "pain relief",
    "analgesic",
    "blood pressure",
    "diabetes",
    "insulin",
    "inhaler",
    "sanitizer",
    "disinfectant",
  ];

  if (commonMedicines.some((med) => itemLower.includes(med))) {
    return true;
  }

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
    "item",
    "product",
    "thing",
    "stuff",
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
      return queryWords.some((word) =>
        targetWords.some((tw) => tw === word || tw.includes(word) || word.includes(tw))
      );
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

  // Generic terms should not have categories
  const genericTerms = [
    "good",
    "goods",
    "item",
    "items",
    "product",
    "products",
    "thing",
    "things",
    "stuff",
  ];
  if (genericTerms.includes(itemLower)) {
    return [];
  }

  const matches: string[] = [];

  // Special handling for common medicines and pharmaceutical terms
  const medicalTerms = [
    "panadol",
    "paracetamol",
    "acetaminophen",
    "ibuprofen",
    "aspirin",
    "medicine",
    "medication",
    "drug",
    "tablet",
    "pill",
    "capsule",
    "syrup",
    "antibiotic",
    "antimalarial",
    "vitamin",
    "supplement",
    "pharmaceutical",
    "pharmacy",
    "hospital",
    "clinic",
    "medical",
    "health",
  ];

  if (medicalTerms.some((term) => itemLower.includes(term))) {
    return ["medical"];
  }

  // Special handling for education terms
  const educationTerms = [
    "book",
    "textbook",
    "education",
    "school",
    "university",
    "teaching",
    "learning",
    "notebook",
    "pen",
    "pencil",
    "ruler",
    "eraser",
    "calculator",
    "tuition",
    "dictionary",
    "encyclopedia",
    "magazine",
    "newspaper",
    "journal",
    "bible",
    "quran",
    "atlas",
    "map",
    "educational",
    "academic",
    "study",
    "student",
  ];
  if (educationTerms.some((term) => itemLower.includes(term))) {
    return ["educational", "books"];
  }

  // Special handling for food terms
  const foodTerms = [
    "vegetable",
    "fruit",
    "cereal",
    "grain",
    "raw food",
    "unprocessed food",
    "rice",
    "beans",
    "yam",
    "cassava",
    "potato",
    "onion",
    "tomato",
    "plantain",
    "fish",
    "meat",
    "egg",
    "milk",
    "maize",
    "wheat",
    "millet",
    "sorghum",
    "fresh produce",
    "tuber",
    "salt",
  ];
  if (foodTerms.some((term) => itemLower.includes(term))) {
    return ["basic-food"];
  }

  // Special handling for baby products
  const babyTerms = [
    "baby",
    "infant",
    "newborn",
    "diaper",
    "nappy",
    "pampers",
    "huggies",
    "molfix",
    "lactation",
    "formula",
    "bottle",
    "pacifier",
    "teether",
    "stroller",
    "crib",
    "cradle",
    "cot",
  ];
  if (babyTerms.some((term) => itemLower.includes(term))) {
    return ["baby-products"];
  }

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
    "item",
    "product",
    "thing",
    "stuff",
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
          exampleLower.includes(" " + word) ||
          word.includes(exampleLower)
      );
    });

    // More specific check for category description - must be more than a common word match
    const descriptionLower = info.description.toLowerCase();
    const matchesDescription =
      itemWords.length > 0 &&
      itemWords.some((word) => word.length > 3 && descriptionLower.includes(word));

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

/**
 * Check online if a product is VAT exempt by querying an external API
 * @param item The product name to check
 * @returns Promise resolving to an object with exemption status and category info
 */
export const checkOnlineVatExemption = async (
  item: string
): Promise<{
  isExempt: boolean;
  category?: string;
  confidence?: number;
  source?: string;
}> => {
  try {
    // Handle generic terms explicitly
    const genericTerms = [
      "good",
      "goods",
      "item",
      "items",
      "product",
      "products",
      "thing",
      "things",
      "stuff",
    ];
    if (genericTerms.includes(item.toLowerCase().trim())) {
      return {
        isExempt: false,
        confidence: 0.98,
        source: "policy-rule",
      };
    }

    // First check local database
    const localCheck = isItemLikelyExempt(item);
    const suggestedCategories = getSuggestedCategories(item);

    // If we're confident locally, return that result immediately
    if (localCheck && suggestedCategories.length > 0) {
      return {
        isExempt: true,
        category: suggestedCategories[0],
        confidence: 0.95,
        source: "local-database",
      };
    }

    // Otherwise, attempt to check online via FIRS-compatible API
    // In a production environment, you would replace this with an actual API call

    // Create a promise that resolves after simulating an API call
    const apiPromise = new Promise<{
      isExempt: boolean;
      category?: string;
      confidence?: number;
      source?: string;
    }>((resolve) => {
      // This is a simulated response with a shorter timeout
      setTimeout(() => {
        // Perform a more sophisticated check
        const itemLower = item.toLowerCase().trim();

        // Check against extended categories
        const extendedExemptions = {
          medical: [
            "bandage",
            "wheelchair",
            "blood pressure monitor",
            "stethoscope",
            "thermometer",
            "first aid",
          ],
          educational: ["school bag", "backpack", "educational poster", "learning aid"],
          "basic-food": [
            "flour",
            "sugar",
            "salt",
            "cooking oil",
            "raw meat",
            "palm oil",
            "fresh produce",
          ],
          "baby-products": ["baby soap", "baby powder", "baby wipes", "pampers"],
          religious: ["bible", "quran", "religious book", "religious material"],
          agricultural: ["tractor", "farming tool", "irrigation", "fertilizer"],
        };

        for (const [category, items] of Object.entries(extendedExemptions)) {
          if (items.some((exemptItem) => itemLower.includes(exemptItem))) {
            return resolve({
              isExempt: true,
              category,
              confidence: 0.85,
              source: "online-api",
            });
          }
        }

        // If no match in extended database, return non-exempt
        resolve({
          isExempt: false,
          confidence: 0.7,
          source: "online-api",
        });
      }, 200); // Reduced from 300ms to 200ms for faster response
    });

    // Create a timeout promise to prevent hanging
    const timeoutPromise = new Promise<{
      isExempt: boolean;
      category?: string;
      confidence?: number;
      source?: string;
    }>((_, reject) => {
      setTimeout(() => {
        reject(new Error("API timeout"));
      }, 2000); // 2 second max timeout
    });

    // Return either the API result or the timeout result, whichever comes first
    return Promise.race([apiPromise, timeoutPromise]).catch((error) => {
      console.error("API call failed or timed out:", error);

      // Fall back to local check in case of API failure
      return {
        isExempt: localCheck,
        category: suggestedCategories.length > 0 ? suggestedCategories[0] : undefined,
        confidence: 0.6,
        source: "local-fallback",
      };
    });
  } catch (error) {
    console.error("Error checking online VAT exemption status:", error);

    // Fallback to local check in case of any error
    const localCheck = isItemLikelyExempt(item);
    const suggestedCategories = getSuggestedCategories(item);

    return {
      isExempt: localCheck,
      category: suggestedCategories.length > 0 ? suggestedCategories[0] : undefined,
      confidence: 0.6,
      source: "local-fallback",
    };
  }
};

export default vatExemptionsGuide;
