/**
 * Chatbot VAT Calculator
 *
 * This module provides VAT calculation functions for the chatbot to ensure
 * all VAT calculations use the correct formulas for both VAT-inclusive and
 * VAT-exclusive scenarios.
 */

const Decimal = require("decimal.js");

// Set high precision for calculations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// Nigerian VAT rate
const VAT_RATE = 7.5; // 7.5%

/**
 * Creates a structured VAT calculation explanation
 * @param {Object} params Calculation parameters
 * @returns {String} Markdown-formatted explanation
 */
function generateVATExplanation({
  amount,
  isInclusive = false,
  isExempt = false,
  showSteps = true,
  formatAsMD = true,
}) {
  // Convert to Decimal for precision
  const decimalAmount = new Decimal(amount);
  const vatRatePercentage = new Decimal(VAT_RATE);
  const vatRateDecimal = vatRatePercentage.div(100);
  const divisor = new Decimal(1).plus(vatRateDecimal);

  // Format currency
  const formatCurrency = (num) => {
    return `₦${new Decimal(num).toDecimalPlaces(2).toNumber().toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  let explanation = "";
  let baseAmount, vatAmount, totalAmount;

  // Handle exempt case
  if (isExempt) {
    baseAmount = decimalAmount;
    vatAmount = new Decimal(0);
    totalAmount = decimalAmount;

    explanation = formatAsMD
      ? `## VAT Calculation (Exempt Item)\n\n`
      : `VAT Calculation (Exempt Item)\n\n`;
    explanation += `The item is VAT exempt, so no VAT is applied.\n\n`;
    explanation += `- Base Amount: ${formatCurrency(baseAmount)}\n`;
    explanation += `- VAT Amount: ${formatCurrency(vatAmount)} (Exempt)\n`;
    explanation += `- Total Amount: ${formatCurrency(totalAmount)}\n`;

    return {
      baseAmount: baseAmount.toDecimalPlaces(2).toNumber(),
      vatAmount: vatAmount.toDecimalPlaces(2).toNumber(),
      totalAmount: totalAmount.toDecimalPlaces(2).toNumber(),
      explanation,
    };
  }

  // Calculate based on whether amount is inclusive or exclusive
  if (isInclusive) {
    // VAT-INCLUSIVE CALCULATION
    // Price Before VAT = Total Price / (1 + VAT Rate/100)
    baseAmount = decimalAmount.div(divisor);
    vatAmount = decimalAmount.minus(baseAmount);
    totalAmount = decimalAmount;

    explanation = formatAsMD
      ? `## VAT Calculation (VAT-Inclusive)\n\n`
      : `VAT Calculation (VAT-Inclusive)\n\n`;
    explanation += `For a VAT-inclusive amount of ${formatCurrency(amount)}:\n\n`;

    if (showSteps) {
      explanation += `### Calculation Steps\n\n`;
      explanation += `1. Find the Price Before VAT (PBV):\n`;
      explanation += `   - Formula: PBV = Total Price / (1 + VAT Rate/100)\n`;
      explanation += `   - PBV = ${formatCurrency(amount)} / (1 + ${vatRatePercentage}%/100)\n`;
      explanation += `   - PBV = ${formatCurrency(amount)} / ${divisor.toString()}\n`;
      explanation += `   - PBV = ${formatCurrency(baseAmount)}\n\n`;

      explanation += `2. Calculate the VAT Amount:\n`;
      explanation += `   - Formula: VAT Amount = Total Price - Price Before VAT\n`;
      explanation += `   - VAT Amount = ${formatCurrency(amount)} - ${formatCurrency(baseAmount)}\n`;
      explanation += `   - VAT Amount = ${formatCurrency(vatAmount)}\n\n`;
    }

    explanation += `### Results\n\n`;
    explanation += `- Price Before VAT: ${formatCurrency(baseAmount)}\n`;
    explanation += `- VAT Amount (${vatRatePercentage}%): ${formatCurrency(vatAmount)}\n`;
    explanation += `- Total Price (VAT-inclusive): ${formatCurrency(totalAmount)}\n`;
  } else {
    // VAT-EXCLUSIVE CALCULATION
    // VAT Amount = Price Before VAT * (VAT Rate/100)
    baseAmount = decimalAmount;
    vatAmount = baseAmount.times(vatRateDecimal);
    totalAmount = baseAmount.plus(vatAmount);

    explanation = formatAsMD
      ? `## VAT Calculation (VAT-Exclusive)\n\n`
      : `VAT Calculation (VAT-Exclusive)\n\n`;
    explanation += `For a VAT-exclusive amount of ${formatCurrency(amount)}:\n\n`;

    if (showSteps) {
      explanation += `### Calculation Steps\n\n`;
      explanation += `1. Calculate the VAT Amount:\n`;
      explanation += `   - Formula: VAT Amount = Price Before VAT * (VAT Rate/100)\n`;
      explanation += `   - VAT Amount = ${formatCurrency(amount)} * (${vatRatePercentage}%/100)\n`;
      explanation += `   - VAT Amount = ${formatCurrency(amount)} * ${vatRateDecimal.toString()}\n`;
      explanation += `   - VAT Amount = ${formatCurrency(vatAmount)}\n\n`;

      explanation += `2. Calculate the Total Price:\n`;
      explanation += `   - Formula: Total Price = Price Before VAT + VAT Amount\n`;
      explanation += `   - Total Price = ${formatCurrency(amount)} + ${formatCurrency(vatAmount)}\n`;
      explanation += `   - Total Price = ${formatCurrency(totalAmount)}\n\n`;
    }

    explanation += `### Results\n\n`;
    explanation += `- Price Before VAT: ${formatCurrency(baseAmount)}\n`;
    explanation += `- VAT Amount (${vatRatePercentage}%): ${formatCurrency(vatAmount)}\n`;
    explanation += `- Total Price (VAT-inclusive): ${formatCurrency(totalAmount)}\n`;
  }

  // Add verification section
  if (showSteps) {
    explanation += `\n### Verification\n\n`;

    if (isInclusive) {
      explanation += `To verify the calculation:\n`;
      explanation += `- Price Before VAT * (1 + VAT Rate/100) should equal the original Total Price\n`;
      explanation += `- ${formatCurrency(baseAmount)} * ${divisor.toString()} = ${formatCurrency(baseAmount.times(divisor))}\n`;
    } else {
      explanation += `To verify the calculation:\n`;
      explanation += `- Price Before VAT + VAT Amount should equal the Total Price\n`;
      explanation += `- ${formatCurrency(baseAmount)} + ${formatCurrency(vatAmount)} = ${formatCurrency(baseAmount.plus(vatAmount))}\n`;
    }
  }

  return {
    baseAmount: baseAmount.toDecimalPlaces(2).toNumber(),
    vatAmount: vatAmount.toDecimalPlaces(2).toNumber(),
    totalAmount: totalAmount.toDecimalPlaces(2).toNumber(),
    explanation,
  };
}

/**
 * Calculates VAT for a bulk set of items with the same explanation quality
 * @param {Array} items Array of items with amounts, quantities, etc.
 * @returns {Object} Results with explanation
 */
function calculateBulkVAT(items) {
  let totalBaseAmount = new Decimal(0);
  let totalVatAmount = new Decimal(0);
  let totalAmount = new Decimal(0);

  const calculatedItems = items.map((item) => {
    const quantity = new Decimal(item.quantity || 1);
    const result = generateVATExplanation({
      amount: item.amount,
      isInclusive: item.isInclusive || false,
      isExempt: item.isExempt || false,
      showSteps: false,
      formatAsMD: false,
    });

    const lineBaseAmount = new Decimal(result.baseAmount).times(quantity);
    const lineVatAmount = new Decimal(result.vatAmount).times(quantity);
    const lineTotal = new Decimal(result.totalAmount).times(quantity);

    totalBaseAmount = totalBaseAmount.plus(lineBaseAmount);
    totalVatAmount = totalVatAmount.plus(lineVatAmount);
    totalAmount = totalAmount.plus(lineTotal);

    return {
      ...item,
      baseAmount: result.baseAmount,
      vatAmount: result.vatAmount,
      totalAmount: result.totalAmount,
      lineBaseAmount: lineBaseAmount.toDecimalPlaces(2).toNumber(),
      lineVatAmount: lineVatAmount.toDecimalPlaces(2).toNumber(),
      lineTotal: lineTotal.toDecimalPlaces(2).toNumber(),
    };
  });

  // Format for display
  const formatCurrency = (num) => {
    return `₦${new Decimal(num).toDecimalPlaces(2).toNumber().toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Generate table rows
  const tableRows = calculatedItems
    .map((item, index) => {
      const description = item.description || `Item ${index + 1}`;
      const quantity = item.quantity || 1;

      return `| ${description} | ${quantity} | ${formatCurrency(item.baseAmount)} | ${formatCurrency(item.vatAmount)} | ${formatCurrency(item.totalAmount)} | ${formatCurrency(item.lineTotal)} |`;
    })
    .join("\n");

  let explanation = `## Bulk VAT Calculation\n\n`;
  explanation += `### Item Details\n\n`;
  explanation += `| Item | Qty | Unit Price (ex. VAT) | Unit VAT | Unit Total | Line Total |\n`;
  explanation += `|------|-----|---------------------|----------|------------|------------|\n`;
  explanation += tableRows + "\n\n";

  explanation += `### Summary\n\n`;
  explanation += `- Total Price Before VAT: ${formatCurrency(totalBaseAmount)}\n`;
  explanation += `- Total VAT Amount: ${formatCurrency(totalVatAmount)}\n`;
  explanation += `- Grand Total: ${formatCurrency(totalAmount)}\n`;

  return {
    items: calculatedItems,
    totalBaseAmount: totalBaseAmount.toDecimalPlaces(2).toNumber(),
    totalVatAmount: totalVatAmount.toDecimalPlaces(2).toNumber(),
    totalAmount: totalAmount.toDecimalPlaces(2).toNumber(),
    explanation,
  };
}

module.exports = {
  generateVATExplanation,
  calculateBulkVAT,
  VAT_RATE,
};
