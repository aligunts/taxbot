/**
 * VAT Utility Functions
 *
 * Simple utility functions for VAT calculations in Nigeria.
 */

const Decimal = require("decimal.js");

// Set high precision for calculations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// Nigerian VAT rate
const VAT_RATE = 7.5; // 7.5%

/**
 * Calculates the price before VAT from a VAT-inclusive amount
 * Using the formula: PBV = TP / (1 + VAT Rate/100)
 *
 * @param {number} vatInclusiveAmount - Total price including VAT
 * @returns {number} Price before VAT, rounded to 2 decimal places
 */
function calculate_price_before_vat(vatInclusiveAmount) {
  // Convert to Decimal for precision
  const amount = new Decimal(vatInclusiveAmount);
  const vatRatePercentage = new Decimal(VAT_RATE);
  const vatRateDecimal = vatRatePercentage.div(100);

  // Calculate divisor (1 + VAT Rate/100)
  const divisor = new Decimal(1).plus(vatRateDecimal);

  // Calculate price before VAT with high precision
  const priceBeforeVAT = amount.div(divisor);

  // Return rounded to 2 decimal places
  return priceBeforeVAT.toDecimalPlaces(2).toNumber();
}

/**
 * Calculates the VAT amount from a VAT-inclusive price
 *
 * @param {number} vatInclusiveAmount - Total price including VAT
 * @returns {number} VAT amount, rounded to 2 decimal places
 */
function calculate_vat_amount(vatInclusiveAmount) {
  const priceBeforeVAT = calculate_price_before_vat(vatInclusiveAmount);
  return new Decimal(vatInclusiveAmount).minus(priceBeforeVAT).toDecimalPlaces(2).toNumber();
}

/**
 * Adds VAT to a VAT-exclusive amount
 *
 * @param {number} vatExclusiveAmount - Price before VAT
 * @returns {number} Total price including VAT, rounded to 2 decimal places
 */
function add_vat(vatExclusiveAmount) {
  const amount = new Decimal(vatExclusiveAmount);
  const vatRatePercentage = new Decimal(VAT_RATE);
  const vatRateDecimal = vatRatePercentage.div(100);

  // Calculate VAT amount
  const vatAmount = amount.times(vatRateDecimal);

  // Calculate total
  const total = amount.plus(vatAmount);

  // Return rounded to 2 decimal places
  return total.toDecimalPlaces(2).toNumber();
}

// Example usage
if (require.main === module) {
  const testAmount = 30000;
  console.log(`Price before VAT for ₦${testAmount}: ₦${calculate_price_before_vat(testAmount)}`);
  console.log(`VAT amount for ₦${testAmount}: ₦${calculate_vat_amount(testAmount)}`);
}

module.exports = {
  calculate_price_before_vat,
  calculate_vat_amount,
  add_vat,
  VAT_RATE,
};
