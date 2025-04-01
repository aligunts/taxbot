/**
 * Nigerian Tax Calculation Utilities
 * Implements progressive taxation with graduated tax brackets for various types of taxes.
 */

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

/**
 * Define taxation methods
 */
export enum TaxationMethod {
  Progressive = "progressive",
  FlatRate = "flat",
  Regressive = "regressive",
  Proportional = "proportional"
}

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
  // Calculate taxable income after deductions
  const taxableIncome = Math.max(0, annualIncome - allowableDeductions);
  
  let totalTax = 0;
  let taxByBracket: Array<{ bracket: string; tax: number; rate: number }> | undefined;
  
  // Apply the selected taxation method
  switch (taxMethod) {
    case TaxationMethod.Progressive:
      return calculateProgressiveTax(taxableIncome);
      
    case TaxationMethod.FlatRate:
      // Use a flat 20% rate for flat rate tax
      totalTax = taxableIncome * 0.2;
      return {
        taxableIncome,
        taxPayable: totalTax,
        effectiveRate: totalTax / taxableIncome,
        taxMethod: "Flat Rate (20%)",
      };
      
    case TaxationMethod.Proportional:
      // Use a fixed proportion (15%) across all income levels
      totalTax = taxableIncome * 0.15;
      return {
        taxableIncome,
        taxPayable: totalTax,
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
  function calculateProgressiveTax(taxableAmount: number) {
    let remainingIncome = taxableAmount;
    let taxTotal = 0;
    const taxBreakdown: Array<{ bracket: string; tax: number; rate: number }> = [];

    // Apply each bracket sequentially
    for (let i = 0; i < personalIncomeTaxBrackets.length; i++) {
      const bracket = personalIncomeTaxBrackets[i];
      const bracketMin = bracket.min;
      const bracketMax = bracket.max;
      const rate = bracket.rate;
      
      // Calculate amount taxable in this bracket
      const bracketWidth = bracketMax - bracketMin;
      const taxableInThisBracket = Math.min(remainingIncome, bracketWidth);
      
      if (taxableInThisBracket <= 0) break;
      
      // Calculate tax for this bracket
      const taxForBracket = taxableInThisBracket * rate;
      taxTotal += taxForBracket;
      
      // Add to breakdown
      taxBreakdown.push({
        bracket: `₦${bracketMin.toLocaleString()} - ₦${bracketMax === Infinity ? "∞" : bracketMax.toLocaleString()}`,
        tax: taxForBracket,
        rate: rate * 100
      });
      
      // Reduce remaining taxable income
      remainingIncome -= taxableInThisBracket;
      if (remainingIncome <= 0) break;
    }
    
    // Calculate effective tax rate
    const effectiveRate = taxableAmount > 0 ? taxTotal / taxableAmount : 0;
    
    return {
      taxableIncome: taxableAmount,
      taxPayable: taxTotal,
      effectiveRate,
      taxByBracket: taxBreakdown,
      taxMethod: "Progressive"
    };
  }
  
  // Inner function to calculate regressive taxation
  function calculateRegressiveTax(taxableAmount: number) {
    // Define regressive brackets (opposite of progressive - rates decrease as income increases)
    const regressiveBrackets = [
      { min: 0, max: 500000, rate: 0.30 },
      { min: 500000, max: 1000000, rate: 0.25 },
      { min: 1000000, max: 2000000, rate: 0.20 },
      { min: 2000000, max: 5000000, rate: 0.15 },
      { min: 5000000, max: Infinity, rate: 0.10 },
    ];
    
    let remainingIncome = taxableAmount;
    let taxTotal = 0;
    const taxBreakdown: Array<{ bracket: string; tax: number; rate: number }> = [];

    // Apply each bracket sequentially
    for (let i = 0; i < regressiveBrackets.length; i++) {
      const bracket = regressiveBrackets[i];
      const bracketMin = bracket.min;
      const bracketMax = bracket.max;
      const rate = bracket.rate;
      
      // Calculate amount taxable in this bracket
      const bracketWidth = bracketMax - bracketMin;
      const taxableInThisBracket = Math.min(remainingIncome, bracketWidth);
      
      if (taxableInThisBracket <= 0) break;
      
      // Calculate tax for this bracket
      const taxForBracket = taxableInThisBracket * rate;
      taxTotal += taxForBracket;
      
      // Add to breakdown
      taxBreakdown.push({
        bracket: `₦${bracketMin.toLocaleString()} - ₦${bracketMax === Infinity ? "∞" : bracketMax.toLocaleString()}`,
        tax: taxForBracket,
        rate: rate * 100
      });
      
      // Reduce remaining taxable income
      remainingIncome -= taxableInThisBracket;
      if (remainingIncome <= 0) break;
    }
    
    // Calculate effective tax rate
    const effectiveRate = taxableAmount > 0 ? taxTotal / taxableAmount : 0;
    
    return {
      taxableIncome: taxableAmount,
      taxPayable: taxTotal,
      effectiveRate,
      taxByBracket: taxBreakdown,
      taxMethod: "Regressive"
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
  // Convert monthly values to annual
  const annualIncome = monthlyIncome * 12;
  const annualDeductions = allowableDeductions * 12;
  
  // Add pension deduction if applicable (8% of basic salary)
  const totalDeductions = includePension 
    ? annualDeductions + (annualIncome * 0.08) 
    : annualDeductions;
  
  // Calculate using the personal income tax method
  const annualTaxResult = calculatePersonalIncomeTax(annualIncome, totalDeductions, taxMethod);
  
  // Convert annual tax back to monthly
  const monthlyTaxPayable = annualTaxResult.taxPayable / 12;
  
  return {
    monthlyTaxableIncome: annualTaxResult.taxableIncome / 12,
    monthlyTaxPayable,
    annualTaxPayable: annualTaxResult.taxPayable,
    effectiveRate: annualTaxResult.effectiveRate,
    taxByBracket: annualTaxResult.taxByBracket,
    taxMethod: annualTaxResult.taxMethod
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
  // Calculate taxable profit
  const taxableProfit = Math.max(0, annualProfit - allowableDeductions);
  
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
  const taxPayable = taxableProfit * taxRate;
  
  return {
    taxableProfit,
    taxPayable,
    taxRate,
    companySize: normalizedSize,
    taxMethod: `Flat Rate (${(taxRate * 100).toFixed(1)}%)`
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
  gain: number;       // Original gain amount
  taxableGain: number;
  taxPayable: number;
  taxRate: number;
  taxMethod: string;
} => {
  // Calculate taxable gain after exemptions
  const taxableGain = Math.max(0, gain - exemptions);
  
  let taxPayable = 0;
  let effectiveRate = 0;
  let methodName = "";
  
  // Apply tax based on selected method
  switch (taxMethod) {
    case TaxationMethod.FlatRate:
      // Standard flat rate capital gains tax (10% in Nigeria)
      taxPayable = taxableGain * capitalGainsTaxRate;
      effectiveRate = capitalGainsTaxRate;
      methodName = `Flat Rate (${capitalGainsTaxRate * 100}%)`;
      break;
      
    case TaxationMethod.Progressive:
      // Progressive capital gains tax (hypothetical)
      if (taxableGain <= 500000) {
        taxPayable = taxableGain * 0.05;
        effectiveRate = 0.05;
      } else if (taxableGain <= 2000000) {
        taxPayable = 500000 * 0.05 + (taxableGain - 500000) * 0.08;
        effectiveRate = taxPayable / taxableGain;
      } else if (taxableGain <= 10000000) {
        taxPayable = 500000 * 0.05 + 1500000 * 0.08 + (taxableGain - 2000000) * 0.12;
        effectiveRate = taxPayable / taxableGain;
      } else {
        taxPayable = 500000 * 0.05 + 1500000 * 0.08 + 8000000 * 0.12 + (taxableGain - 10000000) * 0.15;
        effectiveRate = taxPayable / taxableGain;
      }
      methodName = "Progressive";
      break;
      
    case TaxationMethod.Proportional:
      // Fixed rate of 10% (same as standard CGT)
      taxPayable = taxableGain * 0.1;
      effectiveRate = 0.1;
      methodName = "Proportional (10%)";
      break;
      
    case TaxationMethod.Regressive:
      // Higher rates for smaller gains (hypothetical)
      if (taxableGain <= 1000000) {
        taxPayable = taxableGain * 0.15;
        effectiveRate = 0.15;
      } else if (taxableGain <= 5000000) {
        taxPayable = 1000000 * 0.15 + (taxableGain - 1000000) * 0.12;
        effectiveRate = taxPayable / taxableGain;
      } else if (taxableGain <= 20000000) {
        taxPayable = 1000000 * 0.15 + 4000000 * 0.12 + (taxableGain - 5000000) * 0.10;
        effectiveRate = taxPayable / taxableGain;
      } else {
        taxPayable = 1000000 * 0.15 + 4000000 * 0.12 + 15000000 * 0.10 + (taxableGain - 20000000) * 0.08;
        effectiveRate = taxPayable / taxableGain;
      }
      methodName = "Regressive";
      break;
      
    default:
      // Default to standard flat rate
      taxPayable = taxableGain * capitalGainsTaxRate;
      effectiveRate = capitalGainsTaxRate;
      methodName = `Flat Rate (${capitalGainsTaxRate * 100}%)`;
  }
  
  return {
    gain,            // Include original gain amount
    taxableGain,
    taxPayable,
    taxRate: effectiveRate,
    taxMethod: methodName
  };
};

/**
 * Format tax calculation results for display
 * @param result The tax calculation result object
 * @param taxType The type of tax (e.g., "Personal Income Tax", "PAYE")
 * @returns Formatted string with tax calculation details
 */
export const formatTaxResults = (
  result: any,
  taxType: string
): string => {
  let output = `## ${taxType} Calculation Results\n\n`;
  
  // Format numbers with commas
  const formatCurrency = (amount: number): string => {
    return `₦${amount.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  // Add tax summary section
  output += "### Summary\n\n";
  
  // Different formatting based on tax type
  if (taxType === "PAYE (Pay As You Earn)") {
    output += `- Monthly Taxable Income: ${formatCurrency(result.monthlyTaxableIncome)}\n`;
    output += `- Monthly Tax Payable: ${formatCurrency(result.monthlyTaxPayable)}\n`;
    output += `- Annual Tax Payable: ${formatCurrency(result.annualTaxPayable)}\n`;
  } else if (taxType === "Personal Income Tax") {
    output += `- Annual Taxable Income: ${formatCurrency(result.taxableIncome)}\n`;
    output += `- Annual Tax Payable: ${formatCurrency(result.taxPayable)}\n`;
  } else if (taxType === "Company Income Tax") {
    output += `- Taxable Profit: ${formatCurrency(result.taxableProfit)}\n`;
    output += `- Tax Payable: ${formatCurrency(result.taxPayable)}\n`;
    if (result.companySize) {
      output += `- Company Size: ${result.companySize.charAt(0).toUpperCase() + result.companySize.slice(1)}\n`;
    }
  } else if (taxType === "Capital Gains Tax") {
    // Ensure we display the correct gain amount (taxableGain is always available)
    output += `- Capital Gain: ${formatCurrency(result.taxableGain)}\n`;
    
    // If there were exemptions, show them
    if (result.taxableGain !== result.gain && result.gain) {
      output += `- Original Gain: ${formatCurrency(result.gain)}\n`;
      output += `- Applied Exemptions: ${formatCurrency(result.gain - result.taxableGain)}\n`;
    }
    
    output += `- Tax Payable: ${formatCurrency(result.taxPayable)}\n`;
    output += `- Tax Rate: ${(result.taxRate * 100).toFixed(1)}%\n`;
  } else {
    // Generic formatting for other tax types
    for (const [key, value] of Object.entries(result)) {
      if (typeof value === 'number' && key !== 'effectiveRate') {
        output += `- ${key.replace(/([A-Z])/g, ' $1').trim()}: ${formatCurrency(value as number)}\n`;
      }
    }
  }
  
  // Add effective tax rate
  if (result.effectiveRate !== undefined) {
    const effectiveRatePercent = (result.effectiveRate * 100).toFixed(2);
    output += `- Effective Tax Rate: ${effectiveRatePercent}%\n`;
  }
  
  // Add taxation method if available
  if (result.taxMethod) {
    output += `- Taxation Method: ${result.taxMethod}\n`;
  }
  
  // Add tax bracket breakdown if available
  if (result.taxByBracket && result.taxByBracket.length > 0) {
    output += "\n### Tax Bracket Breakdown\n\n";
    output += "| Income Bracket | Rate | Tax Amount |\n";
    output += "|:--------------|:----:|:----------:|\n";
    
    for (const bracket of result.taxByBracket) {
      output += `| ${bracket.bracket} | ${bracket.rate.toFixed(1)}% | ${formatCurrency(bracket.tax)} |\n`;
    }
  }
  
  // Add disclaimer
  output += "\n---\n\n*Note: This calculation is based on current Nigerian tax regulations. For official tax advice, please consult with a certified tax professional or the Federal Inland Revenue Service (FIRS).*";
  
  return output;
}; 