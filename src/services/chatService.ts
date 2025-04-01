/**
 * Chat API service for handling communication with the backend
 */

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  message: string;
  error?: string;
  details?: string;
}

/**
 * Sends a chat message to the API
 * @param messages The array of messages in the conversation
 * @returns Response from the chat API
 */
export const sendChatMessage = async (messages: Message[]): Promise<ChatResponse> => {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get response");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Chat API error:", error);
    return {
      message: "",
      error: error instanceof Error ? error.message : "Unknown error occurred",
      details: "Failed to communicate with the chat service",
    };
  }
};

/**
 * Utility function to extract numbers from a message
 * @param message The message to extract numbers from
 * @returns Array of extracted numbers
 */
export const extractNumbersFromMessage = (message: string): number[] => {
  // Match currency amounts (with or without currency symbols) and numeric values
  const numberRegex = /(?:₦|NGN|N|\$)?\s*([0-9,]+(?:\.[0-9]+)?)/gi;
  const matches = Array.from(message.matchAll(numberRegex));
  
  return matches
    .map(match => {
      // Extract the number part and remove commas
      const numberStr = match[1].replace(/,/g, "");
      return parseFloat(numberStr);
    })
    .filter(num => !isNaN(num)); // Filter out any NaN values
};

/**
 * Enhanced utility function to extract numbers, quantities, and unit prices from a message
 * @param message The message to analyze
 * @returns Object containing extracted values and context
 */
export const extractPriceAndQuantityFromMessage = (message: string): {
  numbers: number[];
  quantity?: number;
  unitPrice?: number;
  unit?: string;
  totalAmount?: number;
} => {
  try {
    if (!message || typeof message !== 'string') {
      return { numbers: [] };
    }
    
    const numbers = extractNumbersFromMessage(message);
    const result: {
      numbers: number[];
      quantity?: number;
      unitPrice?: number;
      unit?: string;
      totalAmount?: number;
    } = { numbers };
    
    // Lowercase the message for easier pattern matching
    const lowercaseMsg = message.toLowerCase();
    
    // Check for "X [unit] at/for Y [currency] per [unit]" pattern
    // This handles cases like "500 yards of fabric at 2000 naira per yard"
    try {
      const perUnitPattern = /(\d[\d,]*(?:\.\d+)?)\s+([a-z]+)(?:s|es)?\s+(?:of\s+[\w\s]+\s+)?(?:at|for)\s+(?:₦|NGN|N|\$)?\s*(\d[\d,]*(?:\.\d+)?)\s+(?:naira|per)\s+\2/i;
      const perUnitMatch = lowercaseMsg.match(perUnitPattern);
      
      if (perUnitMatch && perUnitMatch.length >= 4) {
        // Group 1: quantity, Group 2: unit, Group 3: price per unit
        const quantity = parseFloat(perUnitMatch[1].replace(/,/g, ""));
        const unit = perUnitMatch[2];
        const unitPrice = parseFloat(perUnitMatch[3].replace(/,/g, ""));
        
        if (!isNaN(quantity) && !isNaN(unitPrice) && quantity > 0 && unitPrice > 0) {
          result.quantity = quantity;
          result.unitPrice = unitPrice;
          result.unit = unit;
          result.totalAmount = quantity * unitPrice;
          return result;
        }
      }
    } catch (e) {
      console.error("Error matching per unit pattern:", e);
      // Continue to next pattern
    }
    
    // If no specific pattern matched but we have two numbers,
    // try to determine quantity and unit price based on context
    if (numbers.length >= 2) {
      try {
        // Look for common quantity indicators
        const hasQuantityIndicator = /\b(?:pcs|pieces|yards|meters|units|items|qty|quantity)\b/i.test(lowercaseMsg);
        const hasPriceIndicator = /\b(?:at|for|costs?|price|per|each)\b/i.test(lowercaseMsg);
        
        if (hasQuantityIndicator && hasPriceIndicator) {
          // Assume first number is quantity, second is price
          // This handles cases like "Calculate VAT on 500 items at 2000 each"
          const quantity = numbers[0];
          const unitPrice = numbers[1];
          
          if (quantity > 0 && unitPrice > 0) {
            result.quantity = quantity;
            result.unitPrice = unitPrice;
            result.totalAmount = quantity * unitPrice;
            
            // Try to extract the unit
            const unitMatch = lowercaseMsg.match(/\b(pcs|pieces|yards|meters|units|items)\b/i);
            if (unitMatch) {
              result.unit = unitMatch[1].toLowerCase();
            }
          }
        }
      } catch (e) {
        console.error("Error in quantity/price extraction:", e);
      }
    }
    
    // If we still don't have a total amount but have at least one number, use the first number
    if (!result.totalAmount && numbers.length > 0) {
      result.totalAmount = numbers[0];
    }
    
    return result;
  } catch (error) {
    console.error("Error in extractPriceAndQuantityFromMessage:", error);
    return { numbers: [] };
  }
}; 