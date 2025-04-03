/**
 * Nigerian Tax Calculation Utilities
 * Implements progressive taxation with graduated tax brackets for various types of taxes.
 */

import Decimal from "decimal.js";

// Set precision for Decimal
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// Personal Income Tax brackets (annual income in NGN)
const personalIncomeTaxBrackets = [
  { min: 0, max: 300000, rate: 0.07 },
  { min: 300000, max: 600000, rate: 0.11 },
  { min: 600000, max: 1100000, rate: 0.15 },
  { min: 1100000, max: 1600000, rate: 0.19 },
  { min: 1600000, max: 3200000, rate: 0.21 },
  { min: 3200000, max: Infinity, rate: 0.24 },
];

// PAYE (Pay As You Earn) uses the same brackets as personal income tax
const payeBrackets = personalIncomeTaxBrackets;

// Company Income Tax rates
// Main rate is 30% but there are different rates based on company size
const companyIncomeTaxRates = {
  small: 0.2, // annual turnover less than ₦25 million
  medium: 0.3, // annual turnover between ₦25 million and ₦100 million
  large: 0.3, // annual turnover over ₦100 million
};

// Capital Gains Tax (flat rate in Nigeria)
const capitalGainsTaxRate = 0.1; // 10%

// Nigerian VAT Rate
const vatRate = 7.5; // 7.5%

// VAT Exempt items categories - common exempt categories in Nigeria
const vatExemptCategories = [
  "basic-food",
  "medical",
  "educational",
  "books",
  "baby-products",
  "agricultural",
  "exports",
];

/**
 * Define taxation methods
 */
export enum TaxationMethod {
  Progressive = "progressive",
  FlatRate = "flat",
  Regressive = "regressive",
  Proportional = "proportional",
}

/**
 * Converts a number to Decimal for precision calculations
 * @param value The number to convert
 * @returns Decimal instance
 */
const toDecimal = (value: number): Decimal => {
  return new Decimal(value);
};

/**
 * Rounds a number to 2 decimal places to avoid floating point issues
 * @param value The Decimal to round
 * @returns number rounded to 2 decimal places
 */
const roundToTwoDecimals = (value: Decimal): number => {
  return value.toDecimalPlaces(2).toNumber();
};

/**
 * Calculate Personal Income Tax using progressive tax brackets
 * @param annualIncome Total annual income in NGN
 * @param allowableDeductions Total allowable deductions
 * @param taxMethod Taxation method to use (default: progressive)
 * @returns Object containing tax details
 */
export const calculatePersonalIncomeTax = (
  annualIncome: number,
  allowableDeductions: number = 0,
  taxMethod: TaxationMethod = TaxationMethod.Progressive
): {
  taxableIncome: number;
  taxPayable: number;
  effectiveRate: number;
  taxByBracket?: Array<{ bracket: string; tax: number; rate: number }>;
  taxMethod: string;
} => {
  // Convert to Decimal for precision
  const decimalIncome = toDecimal(annualIncome);
  const decimalDeductions = toDecimal(allowableDeductions);

  // Calculate taxable income after deductions
  const taxableIncome = Decimal.max(0, decimalIncome.minus(decimalDeductions));

  // Apply the selected taxation method
  switch (taxMethod) {
    case TaxationMethod.Progressive:
      return calculateProgressiveTax(taxableIncome);

    case TaxationMethod.FlatRate:
      // Use a flat 20% rate for flat rate tax
      const totalTax = taxableIncome.times(0.2);
      return {
        taxableIncome: roundToTwoDecimals(taxableIncome),
        taxPayable: roundToTwoDecimals(totalTax),
        effectiveRate: taxableIncome.isZero() ? 0 : roundToTwoDecimals(totalTax.div(taxableIncome)),
        taxMethod: "Flat Rate (20%)",
      };

    case TaxationMethod.Proportional:
      // Use a fixed proportion (15%) across all income levels
      const proportionalTax = taxableIncome.times(0.15);
      return {
        taxableIncome: roundToTwoDecimals(taxableIncome),
        taxPayable: roundToTwoDecimals(proportionalTax),
        effectiveRate: 0.15,
        taxMethod: "Proportional (15%)",
      };

    case TaxationMethod.Regressive:
      // Implement regressive taxation where rate decreases as income increases
      return calculateRegressiveTax(taxableIncome);

    default:
      return calculateProgressiveTax(taxableIncome);
  }

  // Inner function to calculate progressive taxation (standard Nigerian method)
  function calculateProgressiveTax(taxableAmount: Decimal) {
    let remainingIncome = taxableAmount;
    let taxTotal = new Decimal(0);
    const taxBreakdown: Array<{ bracket: string; tax: number; rate: number }> = [];

    // Apply each bracket sequentially
    for (let i = 0; i < personalIncomeTaxBrackets.length; i++) {
      const bracket = personalIncomeTaxBrackets[i];
      const bracketMin = toDecimal(bracket.min);
      const bracketMax =
        bracket.max === Infinity ? new Decimal(Number.MAX_SAFE_INTEGER) : toDecimal(bracket.max);
      const rate = toDecimal(bracket.rate);

      // Calculate amount taxable in this bracket
      const bracketWidth = bracketMax.minus(bracketMin);
      const taxableInThisBracket = Decimal.min(remainingIncome, bracketWidth);

      if (taxableInThisBracket.lte(0)) break;

      // Calculate tax for this bracket
      const taxForBracket = taxableInThisBracket.times(rate);
      taxTotal = taxTotal.plus(taxForBracket);

      // Add to breakdown
      taxBreakdown.push({
        bracket: `₦${bracket.min.toLocaleString()} - ₦${bracket.max === Infinity ? "∞" : bracket.max.toLocaleString()}`,
        tax: roundToTwoDecimals(taxForBracket),
        rate: rate.times(100).toNumber(),
      });

      // Reduce remaining taxable income
      remainingIncome = remainingIncome.minus(taxableInThisBracket);
      if (remainingIncome.lte(0)) break;
    }

    // Calculate effective tax rate
    const effectiveRate = taxableAmount.isZero() ? new Decimal(0) : taxTotal.div(taxableAmount);

    return {
      taxableIncome: roundToTwoDecimals(taxableAmount),
      taxPayable: roundToTwoDecimals(taxTotal),
      effectiveRate: roundToTwoDecimals(effectiveRate),
      taxByBracket: taxBreakdown,
      taxMethod: "Progressive",
    };
  }

  // Inner function to calculate regressive taxation
  function calculateRegressiveTax(taxableAmount: Decimal) {
    // Define regressive brackets (opposite of progressive - rates decrease as income increases)
    const regressiveBrackets = [
      { min: 0, max: 500000, rate: 0.3 },
      { min: 500000, max: 1000000, rate: 0.25 },
      { min: 1000000, max: 2000000, rate: 0.2 },
      { min: 2000000, max: 5000000, rate: 0.15 },
      { min: 5000000, max: Infinity, rate: 0.1 },
    ];

    let remainingIncome = taxableAmount;
    let taxTotal = new Decimal(0);
    const taxBreakdown: Array<{ bracket: string; tax: number; rate: number }> = [];

    // Apply each bracket sequentially
    for (let i = 0; i < regressiveBrackets.length; i++) {
      const bracket = regressiveBrackets[i];
      const bracketMin = toDecimal(bracket.min);
      const bracketMax =
        bracket.max === Infinity ? new Decimal(Number.MAX_SAFE_INTEGER) : toDecimal(bracket.max);
      const rate = toDecimal(bracket.rate);

      // Calculate amount taxable in this bracket
      const bracketWidth = bracketMax.minus(bracketMin);
      const taxableInThisBracket = Decimal.min(remainingIncome, bracketWidth);

      if (taxableInThisBracket.lte(0)) break;

      // Calculate tax for this bracket
      const taxForBracket = taxableInThisBracket.times(rate);
      taxTotal = taxTotal.plus(taxForBracket);

      // Add to breakdown
      taxBreakdown.push({
        bracket: `₦${bracket.min.toLocaleString()} - ₦${bracket.max === Infinity ? "∞" : bracket.max.toLocaleString()}`,
        tax: roundToTwoDecimals(taxForBracket),
        rate: rate.times(100).toNumber(),
      });

      // Reduce remaining taxable income
      remainingIncome = remainingIncome.minus(taxableInThisBracket);
      if (remainingIncome.lte(0)) break;
    }

    // Calculate effective tax rate
    const effectiveRate = taxableAmount.isZero() ? new Decimal(0) : taxTotal.div(taxableAmount);

    return {
      taxableIncome: roundToTwoDecimals(taxableAmount),
      taxPayable: roundToTwoDecimals(taxTotal),
      effectiveRate: roundToTwoDecimals(effectiveRate),
      taxByBracket: taxBreakdown,
      taxMethod: "Regressive",
    };
  }
};

/**
 * Calculate PAYE (Pay As You Earn) tax - similar to personal income tax but typically withheld by employer
 * @param monthlyIncome Monthly income in NGN
 * @param allowableDeductions Monthly allowable deductions
 * @param includePension Whether to include 8% pension contribution as deduction
 * @param taxMethod Taxation method to use (default: progressive)
 * @returns Object containing tax details
 */
export const calculatePAYE = (
  monthlyIncome: number,
  allowableDeductions: number = 0,
  includePension: boolean = true,
  taxMethod: TaxationMethod = TaxationMethod.Progressive
): {
  monthlyTaxableIncome: number;
  monthlyTaxPayable: number;
  annualTaxPayable: number;
  effectiveRate: number;
  taxByBracket?: Array<{ bracket: string; tax: number; rate: number }>;
  taxMethod: string;
} => {
  // Convert to Decimal
  const decimalMonthlyIncome = toDecimal(monthlyIncome);
  const decimalMonthlyDeductions = toDecimal(allowableDeductions);

  // Convert monthly values to annual
  const annualIncome = decimalMonthlyIncome.times(12).toNumber();
  const annualDeductions = decimalMonthlyDeductions.times(12).toNumber();

  // Add pension deduction if applicable (8% of basic salary)
  const totalDeductions = includePension
    ? annualDeductions + annualIncome * 0.08
    : annualDeductions;

  // Calculate using the personal income tax method
  const annualTaxResult = calculatePersonalIncomeTax(annualIncome, totalDeductions, taxMethod);

  // Convert annual tax back to monthly
  const monthlyTaxPayable = toDecimal(annualTaxResult.taxPayable)
    .div(12)
    .toDecimalPlaces(2)
    .toNumber();
  const monthlyTaxableIncome = toDecimal(annualTaxResult.taxableIncome)
    .div(12)
    .toDecimalPlaces(2)
    .toNumber();

  return {
    monthlyTaxableIncome,
    monthlyTaxPayable,
    annualTaxPayable: annualTaxResult.taxPayable,
    effectiveRate: annualTaxResult.effectiveRate,
    taxByBracket: annualTaxResult.taxByBracket,
    taxMethod: annualTaxResult.taxMethod,
  };
};

/**
 * Calculate Company Income Tax
 * @param annualProfit Annual taxable profit in NGN
 * @param companySize Size of the company ("small", "medium", or "large")
 * @param allowableDeductions Allowable deductions
 * @param taxMethod Taxation method to use (default: fixed rate based on company size)
 * @returns Object containing tax details
 */
export const calculateCompanyIncomeTax = (
  annualProfit: number,
  companySize: string = "medium",
  allowableDeductions: number = 0,
  taxMethod: TaxationMethod = TaxationMethod.FlatRate
): {
  taxableProfit: number;
  taxPayable: number;
  taxRate: number;
  companySize: string;
  taxMethod: string;
} => {
  // Convert to Decimal
  const decimalProfit = toDecimal(annualProfit);
  const decimalDeductions = toDecimal(allowableDeductions);

  // Calculate taxable profit
  const taxableProfit = Decimal.max(0, decimalProfit.minus(decimalDeductions));

  // Determine tax rate based on company size
  let taxRate = companyIncomeTaxRates.medium; // Default to medium

  // Normalize the company size string
  const normalizedSize = companySize.toLowerCase().trim();

  if (normalizedSize === "small") {
    taxRate = companyIncomeTaxRates.small;
  } else if (normalizedSize === "large") {
    taxRate = companyIncomeTaxRates.large;
  }

  // Calculate tax
  const taxPayable = taxableProfit.times(taxRate);

  return {
    taxableProfit: roundToTwoDecimals(taxableProfit),
    taxPayable: roundToTwoDecimals(taxPayable),
    taxRate,
    companySize: normalizedSize,
    taxMethod: `Flat Rate (${(taxRate * 100).toFixed(1)}%)`,
  };
};

/**
 * Nigerian VAT Calculation Formulas
 *
 * These formulas implement the standard Nigerian VAT calculations following
 * Federal Inland Revenue Service (FIRS) guidelines.
 */
export interface VATCalculationResult {
  baseAmount: number; // Price before VAT (VAT-exclusive)
  vatAmount: number; // VAT amount
  total: number; // Total price (VAT-inclusive)
  isExempt: boolean; // Whether the item is VAT exempt
  vatRate: number; // Applied VAT rate (0 for exempt items)
  effectiveRate: number; // Effective VAT rate (vatAmount/baseAmount)
}

export interface VATInputOptions {
  amount: number; // Input amount
  isInclusive?: boolean; // Whether the amount includes VAT
  isExempt?: boolean; // Whether the item is exempt from VAT
  category?: string; // Category for automatic exemption check
}

/**
 * Calculate VAT for a given amount
 * Handles both VAT-inclusive and VAT-exclusive scenarios
 *
 * @param amount Input amount
 * @param isInclusive Whether the amount includes VAT
 * @param isExempt Whether the item is exempt from VAT
 * @param category Product/service category (for automatic exemption checking)
 * @returns VAT calculation result
 */
export const calculateVAT = (
  amount: number,
  isInclusive: boolean = false,
  isExempt: boolean = false,
  category?: string
): VATCalculationResult => {
  // Set high precision for all calculations
  Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

  // Convert input to Decimal for high precision
  const decimalAmount = new Decimal(amount);

  // Check if the category is VAT exempt
  if (category && isVATExemptCategory(category)) {
    isExempt = true;
  }

  // Convert VAT rate to decimal for calculations
  const vatRateDecimal = new Decimal(vatRate).div(100);

  // Initialize result variables
  let baseAmount: Decimal;
  let vatAmount: Decimal;

  if (isExempt) {
    // If exempt, no VAT applies
    baseAmount = decimalAmount;
    vatAmount = new Decimal(0);
  } else if (isInclusive) {
    // If amount includes VAT, extract the base amount using formula:
    // PBV = TP / (1 + VAT Rate/100)
    // Use full precision division without rounding
    const divisor = vatRateDecimal.plus(1);
    baseAmount = decimalAmount.div(divisor);

    // VAT Amount = TP - PBV
    // Maintain precision throughout calculations
    vatAmount = decimalAmount.minus(baseAmount);
  } else {
    // If amount excludes VAT, calculate using formula:
    // Base amount is already the PBV
    baseAmount = decimalAmount;

    // VAT Amount = PBV * (VAT Rate/100)
    // Maintain precision in multiplication
    vatAmount = baseAmount.times(vatRateDecimal);
  }

  // Total price = PBV + VAT Amount
  // Maintain precision in addition
  const total = baseAmount.plus(vatAmount);

  // Calculate the exact effective rate for verification
  // This should be exactly vatRate for standard items
  const effectiveRate = baseAmount.isZero() ? new Decimal(0) : vatAmount.div(baseAmount).times(100);

  // Only round at the very end when returning results
  return {
    // Round to 2 decimal places only in the final output
    baseAmount: baseAmount.toDecimalPlaces(2).toNumber(),
    vatAmount: vatAmount.toDecimalPlaces(2).toNumber(),
    total: total.toDecimalPlaces(2).toNumber(),
    isExempt,
    vatRate: isExempt ? 0 : vatRate,
    // For standard items, use exact vatRate to avoid tiny rounding discrepancies
    effectiveRate: isExempt ? 0 : vatRate,
  };
};

/**
 * Calculate VAT based on different input scenarios
 * This function adapts to various input types and applies the appropriate formula
 *
 * @param options Input options for VAT calculation
 * @returns VAT calculation result
 */
export const calculateVATWithOptions = (options: VATInputOptions): VATCalculationResult => {
  return calculateVAT(
    options.amount,
    options.isInclusive || false,
    options.isExempt || false,
    options.category
  );
};

/**
 * Extract VAT from a VAT-inclusive amount
 * Uses the reverse VAT calculation formula: VA = (TP × V) ÷ (100 + V)
 *
 * @param totalPrice The VAT-inclusive amount
 * @param isExempt Whether the item is VAT exempt
 * @returns VAT calculation result
 */
export const extractVATFromInclusive = (
  totalPrice: number,
  isExempt: boolean = false
): VATCalculationResult => {
  return calculateVAT(totalPrice, true, isExempt);
};

/**
 * Calculate Withholding VAT (WHT VAT) for government contracts
 * In Nigeria, government agencies withhold 50% of VAT on invoices
 *
 * Uses high precision calculations to ensure accuracy
 *
 * @param amount Invoice amount
 * @param isInclusive Whether the amount includes VAT
 * @returns Object with VAT details and withholding amount
 */
export const calculateWithholdingVAT = (
  amount: number,
  isInclusive: boolean = false
): {
  vat: VATCalculationResult;
  withholdingVAT: number;
  vendorReceives: number;
  governmentWithholds: number;
} => {
  // Set high precision for all calculations
  Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

  // Calculate VAT with high precision
  const vatResult = calculateVAT(amount, isInclusive, false);

  // Convert to Decimal for precise calculations
  const vatAmountDecimal = new Decimal(vatResult.vatAmount);
  const totalDecimal = new Decimal(vatResult.total);

  // Calculate withholding (50% of VAT) with precision
  const withholdingVATDecimal = vatAmountDecimal.div(2);

  // Calculate vendor receives amount (total - withholding)
  const vendorReceivesDecimal = totalDecimal.minus(withholdingVATDecimal);

  // Round only at the final step
  return {
    vat: vatResult,
    withholdingVAT: withholdingVATDecimal.toDecimalPlaces(2).toNumber(),
    vendorReceives: vendorReceivesDecimal.toDecimalPlaces(2).toNumber(),
    governmentWithholds: withholdingVATDecimal.toDecimalPlaces(2).toNumber(),
  };
};

/**
 * Calculate VAT payable to FIRS (for business filing)
 * VAT Payable = Output VAT (collected) - Input VAT (paid)
 *
 * Uses high precision calculations to ensure accuracy
 *
 * @param outputVAT VAT collected on sales
 * @param inputVAT VAT paid on purchases
 * @returns VAT payable calculation
 */
export const calculateVATPayable = (
  outputVAT: number,
  inputVAT: number
): {
  outputVAT: number;
  inputVAT: number;
  vatPayable: number;
  isRefundable: boolean;
} => {
  // Set high precision for all calculations
  Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

  // Convert to Decimal for precise calculations
  const decimalOutputVAT = new Decimal(outputVAT);
  const decimalInputVAT = new Decimal(inputVAT);

  // Calculate VAT payable (Output VAT - Input VAT)
  const vatPayableDecimal = decimalOutputVAT.minus(decimalInputVAT);

  // Determine if this is a refundable situation (Input VAT > Output VAT)
  const isRefundable = vatPayableDecimal.isNegative();

  // Round only at the final step
  return {
    outputVAT,
    inputVAT,
    // Use absolute value and round to 2 decimal places
    vatPayable: vatPayableDecimal.abs().toDecimalPlaces(2).toNumber(),
    isRefundable,
  };
};

/**
 * Bulk calculate VAT for multiple items
 * Maintains high precision throughout calculations to ensure accuracy
 *
 * @param items Array of items with amount and optional properties
 * @returns Object with calculation results and summary
 */
export const calculateBulkVAT = (
  items: Array<{
    amount: number;
    isInclusive?: boolean;
    isExempt?: boolean;
    category?: string;
    quantity?: number;
    description?: string;
  }>
): {
  items: Array<{
    description?: string;
    baseAmount: number;
    vatAmount: number;
    total: number;
    isExempt: boolean;
    quantity: number;
    lineTotal: number;
  }>;
  summary: {
    totalBaseAmount: number;
    totalVATAmount: number;
    grandTotal: number;
    exemptAmount: number;
    taxableAmount: number;
    effectiveVATRate: number;
  };
} => {
  // Set high precision for all calculations
  Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

  let totalBaseAmount = new Decimal(0);
  let totalVATAmount = new Decimal(0);
  let totalExemptAmount = new Decimal(0);
  let totalTaxableAmount = new Decimal(0);

  const calculatedItems = items.map((item) => {
    const quantity = item.quantity || 1;
    const quantityDecimal = new Decimal(quantity);

    // Calculate VAT with high precision
    const vat = calculateVAT(item.amount, item.isInclusive, item.isExempt, item.category);

    // Convert results to Decimal for further calculations
    const baseAmountDecimal = new Decimal(vat.baseAmount);
    const vatAmountDecimal = new Decimal(vat.vatAmount);
    const totalDecimal = baseAmountDecimal.plus(vatAmountDecimal);

    // Calculate line totals with precision
    const lineBaseAmount = baseAmountDecimal.times(quantityDecimal);
    const lineVATAmount = vatAmountDecimal.times(quantityDecimal);
    const lineTotal = totalDecimal.times(quantityDecimal);

    // Update running totals
    totalBaseAmount = totalBaseAmount.plus(lineBaseAmount);
    totalVATAmount = totalVATAmount.plus(lineVATAmount);

    if (vat.isExempt) {
      totalExemptAmount = totalExemptAmount.plus(lineBaseAmount);
    } else {
      totalTaxableAmount = totalTaxableAmount.plus(lineBaseAmount);
    }

    return {
      description: item.description || "",
      baseAmount: vat.baseAmount,
      vatAmount: vat.vatAmount,
      total: vat.total,
      isExempt: vat.isExempt,
      quantity,
      lineTotal: lineTotal.toDecimalPlaces(2).toNumber(),
    };
  });

  // Calculate effective VAT rate with precision
  const effectiveVATRate = totalTaxableAmount.isZero()
    ? new Decimal(0)
    : totalVATAmount.div(totalTaxableAmount);

  // Round only at the final step when returning results
  return {
    items: calculatedItems,
    summary: {
      totalBaseAmount: totalBaseAmount.toDecimalPlaces(2).toNumber(),
      totalVATAmount: totalVATAmount.toDecimalPlaces(2).toNumber(),
      grandTotal: totalBaseAmount.plus(totalVATAmount).toDecimalPlaces(2).toNumber(),
      exemptAmount: totalExemptAmount.toDecimalPlaces(2).toNumber(),
      taxableAmount: totalTaxableAmount.toDecimalPlaces(2).toNumber(),
      effectiveVATRate: effectiveVATRate.toDecimalPlaces(4).toNumber(),
    },
  };
};

/**
 * Checks if an item is VAT exempt based on its category
 * @param category Category to check for exemption
 * @returns Boolean indicating if the category is exempt
 */
export const isVATExemptCategory = (category: string): boolean => {
  return vatExemptCategories.includes(category.toLowerCase());
};

/**
 * Gets a list of all VAT exempt categories
 * @returns Array of VAT exempt category names
 */
export const getVATExemptCategories = (): string[] => {
  return [...vatExemptCategories];
};

/**
 * Validates VAT calculation inputs
 * @param amount Base amount for VAT calculation
 * @param isInclusive Whether the amount is inclusive of VAT
 * @param category Optional category for validation
 * @returns Object containing validation results and messages
 */
export const validateVATInputs = (
  amount: number,
  isInclusive: boolean = false,
  category?: string
): { isValid: boolean; messages: string[] } => {
  const messages: string[] = [];

  if (!isValidAmount(amount)) {
    messages.push("Amount must be a positive number");
  }

  if (amount > 100000000) {
    messages.push("Very large amount detected. Please verify accuracy.");
  }

  if (
    category &&
    !vatExemptCategories.includes(category.toLowerCase()) &&
    !["standard", "general", "default"].includes(category.toLowerCase())
  ) {
    messages.push(
      `Unrecognized category '${category}'. This will be treated as a standard-rated item.`
    );
  }

  return {
    isValid: !messages.some((msg) => msg.includes("must be")), // Only validation errors make it invalid
    messages,
  };
};

/**
 * Calculate Capital Gains Tax
 * @param gain Capital gain amount in NGN
 * @param exemptions Applicable exemptions
 * @param taxMethod Taxation method to use (default: flat rate)
 * @returns Object containing tax details
 */
export const calculateCapitalGainsTax = (
  gain: number,
  exemptions: number = 0,
  taxMethod: TaxationMethod = TaxationMethod.FlatRate
): {
  gain: number; // Original gain amount
  taxableGain: number;
  taxPayable: number;
  taxRate: number;
  taxMethod: string;
} => {
  // Convert to Decimal
  const decimalGain = toDecimal(gain);
  const decimalExemptions = toDecimal(exemptions);

  // Calculate taxable gain after exemptions
  const taxableGain = Decimal.max(0, decimalGain.minus(decimalExemptions));

  let taxPayable = new Decimal(0);
  let effectiveRate = 0;
  let methodName = "";

  // Apply tax based on selected method
  switch (taxMethod) {
    case TaxationMethod.FlatRate:
      // Standard flat rate capital gains tax (10% in Nigeria)
      taxPayable = taxableGain.times(capitalGainsTaxRate);
      effectiveRate = capitalGainsTaxRate;
      methodName = `Flat Rate (${capitalGainsTaxRate * 100}%)`;
      break;

    case TaxationMethod.Progressive:
      // Progressive capital gains tax (hypothetical)
      if (taxableGain.lte(500000)) {
        taxPayable = taxableGain.times(0.05);
        effectiveRate = 0.05;
      } else if (taxableGain.lte(2000000)) {
        taxPayable = toDecimal(500000).times(0.05).plus(taxableGain.minus(500000).times(0.08));
        effectiveRate = taxableGain.isZero() ? 0 : roundToTwoDecimals(taxPayable.div(taxableGain));
      } else if (taxableGain.lte(10000000)) {
        taxPayable = toDecimal(500000)
          .times(0.05)
          .plus(toDecimal(1500000).times(0.08))
          .plus(taxableGain.minus(2000000).times(0.12));
        effectiveRate = taxableGain.isZero() ? 0 : roundToTwoDecimals(taxPayable.div(taxableGain));
      } else {
        taxPayable = toDecimal(500000)
          .times(0.05)
          .plus(toDecimal(1500000).times(0.08))
          .plus(toDecimal(8000000).times(0.12))
          .plus(taxableGain.minus(10000000).times(0.15));
        effectiveRate = taxableGain.isZero() ? 0 : roundToTwoDecimals(taxPayable.div(taxableGain));
      }
      methodName = "Progressive";
      break;

    case TaxationMethod.Proportional:
      // Fixed rate of 10% (same as standard CGT)
      taxPayable = taxableGain.times(0.1);
      effectiveRate = 0.1;
      methodName = "Proportional (10%)";
      break;

    case TaxationMethod.Regressive:
      // Higher rates for smaller gains (hypothetical)
      if (taxableGain.lte(1000000)) {
        taxPayable = taxableGain.times(0.15);
        effectiveRate = 0.15;
      } else if (taxableGain.lte(5000000)) {
        taxPayable = toDecimal(1000000).times(0.15).plus(taxableGain.minus(1000000).times(0.12));
        effectiveRate = taxableGain.isZero() ? 0 : roundToTwoDecimals(taxPayable.div(taxableGain));
      } else if (taxableGain.lte(20000000)) {
        taxPayable = toDecimal(1000000)
          .times(0.15)
          .plus(toDecimal(4000000).times(0.12))
          .plus(taxableGain.minus(5000000).times(0.1));
        effectiveRate = taxableGain.isZero() ? 0 : roundToTwoDecimals(taxPayable.div(taxableGain));
      } else {
        taxPayable = toDecimal(1000000)
          .times(0.15)
          .plus(toDecimal(4000000).times(0.12))
          .plus(toDecimal(15000000).times(0.1))
          .plus(taxableGain.minus(20000000).times(0.08));
        effectiveRate = taxableGain.isZero() ? 0 : roundToTwoDecimals(taxPayable.div(taxableGain));
      }
      methodName = "Regressive";
      break;

    default:
      // Default to standard flat rate
      taxPayable = taxableGain.times(capitalGainsTaxRate);
      effectiveRate = capitalGainsTaxRate;
      methodName = `Flat Rate (${capitalGainsTaxRate * 100}%)`;
  }

  return {
    gain, // Include original gain amount
    taxableGain: roundToTwoDecimals(taxableGain),
    taxPayable: roundToTwoDecimals(taxPayable),
    taxRate: effectiveRate,
    taxMethod: methodName,
  };
};

/**
 * Tax calculation utilities and validation functions
 */

/**
 * Validates a monetary amount
 * @param amount The amount to validate
 * @returns boolean indicating if the amount is valid
 */
export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && amount >= 0;
};

/**
 * Formats a monetary amount with Naira symbol and proper formatting
 * @param amount The amount to format
 * @returns Formatted string
 */
export const formatCurrency = (amount: number): string => {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Validates income tax inputs
 * @param income Monthly income
 * @param allowances Total allowances
 * @param reliefs Total reliefs
 * @returns Object containing validation results and messages
 */
export const validateIncomeTaxInputs = (
  income: number,
  allowances: number,
  reliefs: number
): { isValid: boolean; messages: string[] } => {
  const messages: string[] = [];

  if (!isValidAmount(income)) {
    messages.push("Income must be a positive number");
  }
  if (!isValidAmount(allowances)) {
    messages.push("Allowances must be a positive number");
  }
  if (!isValidAmount(reliefs)) {
    messages.push("Reliefs must be a positive number");
  }
  if (allowances > income) {
    messages.push("Allowances cannot exceed income");
  }
  if (reliefs > income) {
    messages.push("Reliefs cannot exceed income");
  }

  return {
    isValid: messages.length === 0,
    messages,
  };
};

/**
 * Validates company tax inputs
 * @param turnover Annual turnover
 * @param companySize Company size category
 * @returns Object containing validation results and messages
 */
export const validateCompanyTaxInputs = (
  turnover: number,
  companySize: string
): { isValid: boolean; messages: string[] } => {
  const messages: string[] = [];

  if (!isValidAmount(turnover)) {
    messages.push("Turnover must be a positive number");
  }
  if (!["small", "medium", "large"].includes(companySize.toLowerCase())) {
    messages.push("Company size must be small, medium, or large");
  }

  return {
    isValid: messages.length === 0,
    messages,
  };
};

/**
 * Validates capital gains tax inputs
 * @param acquisitionCost Cost of acquiring the asset
 * @param disposalProceeds Proceeds from disposal
 * @param holdingPeriod Period asset was held (in years)
 * @returns Object containing validation results and messages
 */
export const validateCapitalGainsInputs = (
  acquisitionCost: number,
  disposalProceeds: number,
  holdingPeriod: number
): { isValid: boolean; messages: string[] } => {
  const messages: string[] = [];

  if (!isValidAmount(acquisitionCost)) {
    messages.push("Acquisition cost must be a positive number");
  }
  if (!isValidAmount(disposalProceeds)) {
    messages.push("Disposal proceeds must be a positive number");
  }
  if (holdingPeriod < 0) {
    messages.push("Holding period cannot be negative");
  }

  return {
    isValid: messages.length === 0,
    messages,
  };
};

/**
 * Formats tax calculation results for display
 * @param result The tax calculation result object
 * @param taxType The type of tax
 * @returns Formatted string with tax calculation details
 */
export const formatTaxResults = (result: any, taxType: string): string => {
  let output = `## ${taxType} Calculation Results\n\n`;

  // Add tax summary section
  output += "### Summary\n\n";

  // Different formatting based on tax type
  if (taxType === "Personal Income Tax") {
    output += `- Monthly Taxable Income: ${formatCurrency(result.monthlyTaxableIncome)}\n`;
    output += `- Monthly Tax Payable: ${formatCurrency(result.monthlyTaxPayable)}\n`;
    output += `- Annual Tax Payable: ${formatCurrency(result.annualTaxPayable)}\n`;
    output += `- Effective Tax Rate: ${(result.effectiveRate * 100).toFixed(2)}%\n`;

    if (result.taxByBracket) {
      output += "\n### Tax Bracket Breakdown\n\n";
      result.taxByBracket.forEach((bracket: { bracket: string; tax: number; rate: number }) => {
        output += `- ${bracket.bracket} (${bracket.rate}%): ${formatCurrency(bracket.tax)}\n`;
      });
    }
  } else if (taxType === "Company Income Tax") {
    output += `- Annual Turnover: ${result.annualTurnover ? formatCurrency(result.annualTurnover) : "Not provided"}\n`;
    output += `- Taxable Income: ${formatCurrency(result.taxableProfit)}\n`;
    output += `- Tax Payable: ${formatCurrency(result.taxPayable)}\n`;
    output += `- Tax Rate: ${(result.taxRate * 100).toFixed(1)}%\n`;
    output += `- Company Size: ${result.companySize.charAt(0).toUpperCase() + result.companySize.slice(1)}\n`;
  } else if (taxType === "VAT") {
    output += `- Base Amount: ${formatCurrency(result.baseAmount)}\n`;
    output += `- VAT Amount (7.5%): ${formatCurrency(result.vatAmount)}\n`;
    output += `- Total (including VAT): ${formatCurrency(result.total)}\n`;
  } else if (taxType === "Capital Gains Tax") {
    output += `- Capital Gain: ${formatCurrency(result.gain)}\n`;
    output += `- Taxable Gain: ${formatCurrency(result.taxableGain)}\n`;
    output += `- Tax Payable: ${formatCurrency(result.taxPayable)}\n`;
    output += `- Tax Rate: ${(result.taxRate * 100).toFixed(2)}%\n`;
    output += `- Tax Method: ${result.taxMethod}\n`;
  }

  // Add notes section if available
  if (result.notes && result.notes.length > 0) {
    output += "\n### Notes\n\n";
    result.notes.forEach((note: string) => {
      output += `- ${note}\n`;
    });
  }

  return output;
};
