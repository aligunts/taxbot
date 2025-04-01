// Test the VAT exemption functionality with various queries
const axios = require("axios");

async function testExemption(query) {
  console.log(`\nTesting: "${query}"`);
  try {
    const response = await axios.post("http://localhost:3000/api/chat", {
      messages: [{ role: "user", content: query }],
    });

    console.log(`Response: ${response.data.message.substring(0, 150)}...\n`);
    return response.data;
  } catch (error) {
    console.error(`Error testing "${query}": ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data).substring(0, 200)}`);
    }
    return null;
  }
}

// Helper function to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Test cases for different exemption categories
const testCases = [
  // Medical and pharmaceutical tests
  "How much VAT should I pay on medicine?",
  "Calculate VAT on prescription drugs",
  "What is the VAT on medical equipment?",

  // Basic food items tests
  "How much VAT should I pay on tomatoes?",
  "Calculate VAT on 5kg of rice",
  "What is the VAT on beans?",

  // Educational materials tests
  "How much VAT on textbooks?",
  "Calculate VAT on school supplies",
  "What is the VAT for educational books?",

  // Baby products tests
  "How much VAT on diapers?",
  "Calculate VAT on baby formula",
  "What is the VAT on baby wipes?",

  // Agricultural equipment tests
  "How much VAT on farming tools?",
  "Calculate VAT on a tractor",
  "What is the VAT on fertilizer?",

  // Export services tests
  "How much VAT on export services?",
  "Calculate VAT on goods for export",

  // Test plural forms
  "How much VAT on tomatoes?",
  "What is the VAT on diapers?",

  // Test for stopwords (should not match as exempt)
  "Calculate VAT on items worth N5000 per person",
  "What's the VAT on a service costing N10,000 per month?",
];

async function runTests() {
  console.log("Starting VAT Exemption Tests...");

  for (const testCase of testCases) {
    await testExemption(testCase);
    // Add a delay between requests to avoid overwhelming the server
    await delay(1000);
  }

  console.log("All tests completed!");
}

runTests().catch(console.error);
