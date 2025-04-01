import { NextResponse } from "next/server";

// Basic fallback responses for common tax-related questions
const getFallbackResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("income tax") || lowerMessage.includes("cit")) {
    return "Companies Income Tax (CIT) in Nigeria is charged at 30% of taxable profits for large companies. Small companies with turnover less than ₦25 million are exempt, while medium companies with turnover between ₦25-100 million pay 20%.";
  }
  
  if (lowerMessage.includes("vat") || lowerMessage.includes("value added tax")) {
    return "Value Added Tax (VAT) in Nigeria is charged at 7.5% on most goods and services. Some items are VAT exempt or zero-rated, including basic food items, medical supplies, and educational materials.";
  }
  
  if (lowerMessage.includes("capital gains") || lowerMessage.includes("cgt")) {
    return "Capital Gains Tax (CGT) in Nigeria is charged at 10% on gains from disposal of assets including property, shares, and other capital assets. There are some exemptions for primary residences and certain agricultural land.";
  }
  
  return "I'm currently having trouble connecting to my knowledge base. For accurate tax information, please consider visiting the Federal Inland Revenue Service (FIRS) website at firs.gov.ng.";
};

export async function POST(req: Request) {
  try {
    // Parse the JSON request body
    const body = await req.json();
    const messages = body.messages || [];
    
    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request format: messages array is required" },
        { status: 400 }
      );
    }
    
    // Get the user's message (last message in the array)
    const userMessage = messages[messages.length - 1]?.content || "";
    
    // Check if API key is available
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      console.log("Mistral API key not found, using fallback response");
      return NextResponse.json(
        { content: getFallbackResponse(userMessage) },
        { status: 200 }
      );
    }
    
    // Prepare the API request
    try {
      // Set up a timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "mistral-tiny",
          messages: [
            {
              role: "system",
              content: "You are a knowledgeable tax assistant focused on Nigerian tax regulations. Provide clear, accurate information about tax types, rates, calculations, and compliance requirements based on current Nigerian tax laws. Always aim to be helpful and educational."
            },
            ...messages
          ],
          max_tokens: 1024
        }),
        signal: controller.signal
      });
      
      // Clear the timeout to prevent memory leaks
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Log the error details for debugging
        const errorData = await response.json().catch(() => ({}));
        console.error("API response error:", response.status, errorData);
        
        // Return a fallback response
        return NextResponse.json(
          { content: getFallbackResponse(userMessage) },
          { status: 200 }
        );
      }
      
      const data = await response.json();
      const assistantMessage = data.choices[0]?.message?.content || 
                              "I apologize, but I couldn't process your request right now. Please try again.";
      
      return NextResponse.json({ content: assistantMessage }, { status: 200 });
      
    } catch (error) {
      console.error("Error calling Mistral API:", error);
      return NextResponse.json(
        { content: getFallbackResponse(userMessage) },
        { status: 200 }
      );
    }
    
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
