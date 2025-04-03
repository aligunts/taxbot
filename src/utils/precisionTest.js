/**
 * Precision test for VAT calculations
 *
 * This script verifies the accuracy of VAT calculations using Decimal.js for maximum precision.
 */

const Decimal = require("decimal.js");

// Set high precision
Decimal.set({ precision: 30, rounding: Decimal.ROUND_HALF_UP });

// Nigerian VAT rate
const VAT_RATE = 0.075; // 7.5%

/**
 * Calculate VAT with maximum precision
 */
function calculateVATPrecise(amount, isInclusive = false) {
  console.log("\n===== PRECISION VAT CALCULATION =====");
  console.log(`Input amount: ${amount}, isInclusive: ${isInclusive}`);

  // Convert to Decimal for precision
  const decimalAmount = new Decimal(amount);
  const vatRate = new Decimal(VAT_RATE);

  let baseAmount, vatAmount, total;

  if (isInclusive) {
    // Price Before VAT = Total Price / (1 + VAT Rate)
    const divisor = vatRate.plus(1);
    baseAmount = decimalAmount.div(divisor);

    console.log(`\nDivisor (1 + VAT Rate): ${divisor.toString()}`);
    console.log(`Base amount calculation: ${decimalAmount.toString()} / ${divisor.toString()}`);
    console.log(`Base amount (full precision): ${baseAmount.toString()}`);

    // VAT Amount = Total - Base Amount
    vatAmount = decimalAmount.minus(baseAmount);
    console.log(`VAT amount (full precision): ${vatAmount.toString()}`);

    total = decimalAmount;
  } else {
    baseAmount = decimalAmount;

    // VAT Amount = Base Amount * VAT Rate
    vatAmount = baseAmount.times(vatRate);
    console.log(`VAT amount calculation: ${baseAmount.toString()} * ${vatRate.toString()}`);
    console.log(`VAT amount (full precision): ${vatAmount.toString()}`);

    // Total = Base + VAT
    total = baseAmount.plus(vatAmount);
    console.log(`Total amount (full precision): ${total.toString()}`);
  }

  // Verify calculations
  console.log("\n===== VERIFICATION CHECKS =====");

  // Check if Base + VAT = Total
  const calculatedTotal = baseAmount.plus(vatAmount);
  console.log(`Base + VAT = ${calculatedTotal.toString()}`);
  console.log(`Matches original total: ${calculatedTotal.eq(total)}`);

  // Check if VAT = Base * Rate
  const calculatedVAT = baseAmount.times(vatRate);
  console.log(`Base * VAT Rate = ${calculatedVAT.toString()}`);
  console.log(`Matches calculated VAT: ${calculatedVAT.eq(vatAmount.round(20))}`);

  // Check if Base = Total / (1 + Rate)
  const calculatedBase = total.div(vatRate.plus(1));
  console.log(`Total / (1 + VAT Rate) = ${calculatedBase.toString()}`);
  console.log(`Matches calculated base: ${calculatedBase.eq(baseAmount.round(20))}`);

  // Formatted results (2 decimal places)
  console.log("\n===== FORMATTED RESULTS (2 decimal places) =====");
  console.log(`Base amount: ${baseAmount.toFixed(2)}`);
  console.log(`VAT amount: ${vatAmount.toFixed(2)}`);
  console.log(`Total: ${total.toFixed(2)}`);

  // Double-check with string arithmetic for exact precision
  console.log("\n===== STRING-BASED VERIFICATION =====");
  if (isInclusive) {
    console.log(`Using formula: PBV = TP / (1 + VAT Rate)`);
    console.log(`PBV = ${amount} / (1 + ${VAT_RATE}) = ${baseAmount.toFixed(10)}`);
    console.log(`VAT = ${amount} - ${baseAmount.toFixed(10)} = ${vatAmount.toFixed(10)}`);
  } else {
    console.log(`Using formula: VAT = PBV * VAT Rate`);
    console.log(`VAT = ${amount} * ${VAT_RATE} = ${vatAmount.toFixed(10)}`);
    console.log(`Total = ${amount} + ${vatAmount.toFixed(10)} = ${total.toFixed(10)}`);
  }

  return {
    baseAmount: baseAmount.toFixed(2),
    vatAmount: vatAmount.toFixed(2),
    total: total.toFixed(2),
  };
}

// Test cases
console.log("TEST CASE 1: VAT-inclusive price of ₦10,000");
const result1 = calculateVATPrecise(10000, true);
console.log(JSON.stringify(result1, null, 2));

console.log("\nTEST CASE 2: VAT-exclusive price of ₦10,000");
const result2 = calculateVATPrecise(10000, false);
console.log(JSON.stringify(result2, null, 2));

console.log("\nTEST CASE 3: Special case - VAT-inclusive price of ₦9,259.258");
const result3 = calculateVATPrecise(9259.258, true);
console.log(JSON.stringify(result3, null, 2));
