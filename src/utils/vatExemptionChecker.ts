import { exemptedItems, synonymMap, formatCategoryName, exemptionDetails } from "@/shared/constants/exemptedItems";

/**
 * Extracts potential items from a query string for VAT exemption checking
 */
export const extractPotentialItems = (query: string): string[] => {
  // Clean and normalize query
  const cleanedQuery = query.toLowerCase().replace(/[^\w\s]/g, " ");
  
  // Split into words and filter out common words, short words, and numbers
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be", "being", "been",
    "do", "does", "did", "will", "shall", "should", "would", "can", "could", "may", "might",
    "must", "have", "has", "had", "having", "i", "you", "he", "she", "it", "we", "they",
    "vat", "tax", "exemption", "exempt", "exempted", "taxable", "rate", "amount", "total",
    "calculate", "calculation", "pay", "paid", "cost", "price", "charge", "fee", "money"
  ]);
  
  const words = cleanedQuery.split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w) && !/^\d+$/.test(w));
  
  // Generate potential items: individual words and adjacent word pairs
  const potentialItems: string[] = [];
  
  // Add individual words
  potentialItems.push(...words);
  
  // Add adjacent word pairs
  for (let i = 0; i < words.length - 1; i++) {
    potentialItems.push(`${words[i]} ${words[i + 1]}`);
  }
  
  // Add triple word combinations for more context
  for (let i = 0; i < words.length - 2; i++) {
    potentialItems.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }
  
  return potentialItems;
};

/**
 * Expands a list of items with synonyms for better matching
 */
export const expandItemsWithSynonyms = (items: string[]): Set<string> => {
  const expandedItems = new Set<string>(items);
  
  for (const item of items) {
    for (const [word, synonyms] of Object.entries(synonymMap)) {
      if (item.includes(word)) {
        for (const synonym of synonyms) {
          expandedItems.add(item.replace(word, synonym));
        }
      }
    }
  }
  
  return expandedItems;
};

/**
 * Checks if a query contains export-related terms
 */
export const isExportRelated = (query: string): boolean => {
  const lowercaseQuery = query.toLowerCase();
  return (
    lowercaseQuery.includes("export") &&
    (lowercaseQuery.includes("service") ||
     lowercaseQuery.includes("good") ||
     lowercaseQuery.includes("product") ||
     lowercaseQuery.includes("shipping") ||
     lowercaseQuery.includes("international"))
  );
};

/**
 * Check if an item matches a keyword with confidence score
 */
export const getMatchConfidence = (item: string, keyword: string): { isMatch: boolean, confidence: number } => {
  let isMatch = false;
  let confidence = 0;
  
  // For short keywords (4 chars or less), use strict word boundary matching
  if (keyword.length <= 4) {
    // Exact word boundary match
    if (new RegExp(`\\b${keyword}\\b`, "i").test(item)) {
      isMatch = true;
      confidence = 85; // High confidence for exact match of short word
    }
    // Plural form match
    else if (new RegExp(`\\b${keyword}s\\b`, "i").test(item)) {
      isMatch = true;
      confidence = 80; // Slightly lower for plural form
    }
  }
  // For single-word longer keywords, use word boundary matching
  else if (!keyword.includes(" ")) {
    // Exact word boundary match
    if (new RegExp(`\\b${keyword}\\b`, "i").test(item)) {
      isMatch = true;
      confidence = 90; // Higher confidence for exact match of longer word
    }
    // If no exact match, try checking for stemmed forms or partial matches for longer words
    else if (keyword.length > 6) {
      // For longer words, allow partial word match (e.g., "pharmaceutical" in "pharmaceuticals")
      if (item.includes(keyword)) {
        isMatch = true;
        confidence = 85; // Good confidence for substring match
      } else if (keyword.includes(item) && item.length > 4) {
        isMatch = true;
        confidence = 75; // Lower confidence when item is part of keyword
      }
    }
  }
  // For multi-word keywords
  else if (keyword.includes(" ")) {
    // If both item and keyword have spaces, check if one contains the other
    if (item.includes(" ")) {
      if (item.includes(keyword)) {
        isMatch = true;
        confidence = 95; // Very high confidence when multi-word keyword is found in item
      } else if (keyword.includes(item)) {
        isMatch = true;
        confidence = 85; // Good confidence when item is part of multi-word keyword
      }
    }
    // If only keyword has spaces but item is a single word, check if the item appears in the keyword
    else {
      const keywordParts = keyword.split(" ");
      const exactPartMatch = keywordParts.some((part) =>
        new RegExp(`\\b${part}\\b`, "i").test(item)
      );
      if (exactPartMatch) {
        isMatch = true;
        confidence = 70; // Moderate confidence for matching part of multi-word keyword
      } else if (keywordParts.some((part) => item === part)) {
        isMatch = true;
        confidence = 80; // Better confidence for exact equality with a part
      }
    }
  }
  
  return { isMatch, confidence };
};

/**
 * Check if an item is VAT-exempt and in which category
 */
export const checkVatExemption = (
  query: string
): { isExempt: boolean; category?: string; confidence?: number } => {
  const lowercaseQuery = query.toLowerCase();
  
  // Handle export services case
  if (isExportRelated(lowercaseQuery)) {
    return { isExempt: true, category: "exportServices", confidence: 95 };
  }
  
  // Extract potential items from the query
  const potentialItems = extractPotentialItems(lowercaseQuery);
  
  // Expand items with synonyms
  const expandedItems = expandItemsWithSynonyms(potentialItems);
  
  // Check each category for matches
  for (const [category, keywords] of Object.entries(exemptedItems)) {
    // Skip exportServices as it's handled separately
    if (category === "exportServices") {
      continue;
    }
    
    for (const item of Array.from(expandedItems)) {
      for (const keyword of keywords) {
        const { isMatch, confidence } = getMatchConfidence(item, keyword);
        
        if (isMatch) {
          // Apply category-specific confidence adjustments
          let adjustedConfidence = confidence;
          
          // Boost confidence for basic food items and medical items as they're the most common exemptions
          if (category === "basicFoodItems" || category === "medicalAndPharmaceutical") {
            adjustedConfidence += 5;
          }
          
          // Reduce confidence slightly for agricultural equipment as it's more specific
          if (category === "agriculturalEquipment") {
            adjustedConfidence -= 5;
          }
          
          // Boost confidence if the match is very specific (exact match)
          if (item === keyword) {
            adjustedConfidence += 10;
            adjustedConfidence = Math.min(adjustedConfidence, 100); // Cap at 100
          }
          
          // If confidence is high enough, return the result
          if (adjustedConfidence >= 85) {
            return {
              isExempt: true,
              category,
              confidence: adjustedConfidence
            };
          }
        }
      }
    }
  }
  
  // No exemption found
  return { isExempt: false };
};

/**
 * Generate a formatted exemption response
 */
export const generateExemptionResponse = (category: string): string => {
  let exemptionResponse = "## VAT Exemption Notice\n\n";
  
  const categoryDisplay = formatCategoryName(category);
  const details = exemptionDetails[category]?.details || 
    "This item falls under VAT-exempt categories as per Nigerian tax law.";
  const legalBasis = exemptionDetails[category]?.legalBasis ||
    "VAT Act First Schedule";
  
  // Create a hypothetical price example to demonstrate zero VAT
  const baseAmount = 1000;
  const formattedAmount = baseAmount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  exemptionResponse += `The item falls under the "${categoryDisplay}" exemption category.\n\n`;
  exemptionResponse += `### Exemption Details\n\n${details}\n\n`;
  exemptionResponse += `### Legal Basis\n\n${legalBasis}\n\n`;
  exemptionResponse += "### Price Example\n\n";
  exemptionResponse += `- Item Cost: ₦${formattedAmount}\n`;
  exemptionResponse += "- VAT: ₦0.00 (Exempt)\n";
  exemptionResponse += `- Total Cost: ₦${formattedAmount}\n\n`;
  exemptionResponse += "---\n\n";
  exemptionResponse += "*Note: This information is provided based on current Nigerian VAT regulations. For official tax advice, please consult with a certified tax professional or the Federal Inland Revenue Service (FIRS).*";
  
  return exemptionResponse;
};

/**
 * Check VAT exemption for a query and generate a response if exempt
 * @returns Exemption response or null if not exempt
 */
export const checkExemptionAndGenerateResponse = (query: string): string | null => {
  const { isExempt, category } = checkVatExemption(query);
  
  if (isExempt && category) {
    return generateExemptionResponse(category);
  }
  
  return null;
}; 