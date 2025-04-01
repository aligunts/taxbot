// Test specifically for the "per" keyword issue
const axios = require("axios");

// Helper function to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function testQuery(query, shouldBeExempt) {
  console.log(`\nTesting: "${query}"`);
  try {
    const response = await axios.post("http://localhost:3000/api/chat", {
      messages: [{ role: "user", content: query }],
    });

    const message = response.data.message;
    console.log(`Response: ${message.substring(0, 150)}...\n`);

    // Check if the response mentions item being exempt
    const markedAsExempt = message.toLowerCase().includes("exempt from vat");

    if (shouldBeExempt) {
      console.log(`Correctly marked as exempt: ${markedAsExempt ? "YES ✅" : "NO ❌"}`);
    } else {
      console.log(`Incorrectly marked as exempt: ${markedAsExempt ? "YES ❌" : "NO ✅"}`);
    }

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

// Test cases specifically for the "per" issue with expected results
const testCases = [
  // Cases with "per" that should NOT be exempt
  { query: "Calculate VAT on items worth N5000 per person", shouldBeExempt: false },
  { query: "What's the VAT on a service costing N10,000 per month?", shouldBeExempt: false },
  { query: "How much VAT on a product that costs N2000 per unit?", shouldBeExempt: false },
  { query: "Calculate VAT on a subscription of N5000 per year", shouldBeExempt: false },

  // Actual baby products that SHOULD be exempt
  { query: "How much VAT on diapers?", shouldBeExempt: true },
  { query: "Calculate VAT on baby formula", shouldBeExempt: true },
  { query: "What's the VAT on infant clothing?", shouldBeExempt: true },

  // Mixed cases that include both "per" and baby products - these SHOULD be exempt
  { query: "Calculate VAT on diapers at N1000 per pack", shouldBeExempt: true },
  { query: "What's the VAT on baby formula costing N5000 per can?", shouldBeExempt: true },
];

async function runTests() {
  console.log("Starting 'Per' Keyword Tests...");

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    await testQuery(testCase.query, testCase.shouldBeExempt);

    // Add a delay between requests to avoid overwhelming the server
    await delay(1500);
  }

  console.log("\nAll tests completed!");
}

runTests().catch(console.error);
