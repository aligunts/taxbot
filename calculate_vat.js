/**
 * VAT Price Calculation Script
 *
 * This script calculates the price before VAT for a given VAT-inclusive amount
 * using the formula: PBV = TP / (1 + VAT Rate)
 */

const { calculate_price_before_vat } = require("./src/utils/vatUtils");

// Get the input amount from command line arguments, or default to 30000
const amount = process.argv[2] ? Number(process.argv[2]) : 30000;

// Calculate and print the result
console.log(calculate_price_before_vat(amount));
