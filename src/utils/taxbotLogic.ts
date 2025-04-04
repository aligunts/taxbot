export function calculateCRA(grossIncome: number): number {
  // Calculate CRA as 21% of gross income
  const cra = grossIncome * 0.21;

  // Log calculation for debugging
  console.log(`CRA Calculation for ${grossIncome}:`, {
    cra,
    formula: "grossIncome * 0.21",
  });

  return cra;
}

export function calculatePension(grossIncome: number, rate = 0.08): number {
  // Calculate pension contribution (8% of gross income, capped at ₦500,000)
  const pensionContribution = Math.min(rate * grossIncome, 500_000);

  // Log calculation for debugging
  console.log(`Pension Calculation for ${grossIncome}:`, {
    pensionRate: rate,
    uncappedPension: rate * grossIncome,
    cappedPension: pensionContribution,
    formula: "min(rate * grossIncome, 500000)",
  });

  return pensionContribution;
}

export function calculateTaxableIncome(
  grossIncome: number,
  pensionContribution: number = 0
): number {
  // Calculate CRA using the dynamic method
  const CRA = calculateCRA(grossIncome);

  // Log values for debugging
  console.log(`Calculating Taxable Income:`, {
    grossIncome,
    CRA,
    pensionContribution,
  });

  // Recompute taxable income using the formula: grossIncome - CRA - pension
  const taxableIncome = grossIncome - CRA - pensionContribution;
  console.log(`Taxable Income: ${taxableIncome}`);
  return taxableIncome;
}

export function calculateTax(grossIncome: number): number {
  // Assuming pension contribution is 8% of gross income
  const pensionContribution = grossIncome * 0.08;

  // Calculate taxable income
  const taxableIncome = calculateTaxableIncome(grossIncome, pensionContribution);

  // Tax brackets (amounts are in naira and percentage rates)
  const brackets = [
    { limit: 300000, rate: 0.07 },
    { limit: 600000, rate: 0.11 },
    { limit: 1100000, rate: 0.15 },
    { limit: 1600000, rate: 0.19 },
    { limit: 3200000, rate: 0.21 },
    { limit: Number.MAX_SAFE_INTEGER, rate: 0.24 },
  ];

  let remainingIncome = taxableIncome;
  let totalTax = 0;

  // Apply tax brackets
  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    const taxableAmount = Math.min(remainingIncome, bracket.limit);
    totalTax += taxableAmount * bracket.rate;
    remainingIncome -= taxableAmount;

    if (remainingIncome <= 0) break;
  }

  return totalTax;
}

export function calculatePersonalIncomeTax({
  grossIncome,
  pensionRate = 0.08,
  minTaxableIncome = 30_000, // Minimum taxable income threshold
}: {
  grossIncome: number;
  pensionRate?: number;
  minTaxableIncome?: number;
}) {
  // Validate inputs
  if (grossIncome < 0 || typeof grossIncome !== "number") {
    throw new Error("Invalid gross income");
  }
  if (pensionRate < 0 || pensionRate > 1 || typeof pensionRate !== "number") {
    throw new Error("Invalid pension rate");
  }

  // Round to nearest naira for precise calculations
  const roundToNaira = (amount: number) => Math.round(amount);

  // Calculate pension (with cap at ₦500,000)
  const pension = roundToNaira(calculatePension(grossIncome, pensionRate));

  // Calculate CRA (Consolidated Relief Allowance)
  const craTotal = roundToNaira(calculateCRA(grossIncome));

  // Log values for debugging
  console.log(`Calculating Personal Income Tax:`, {
    grossIncome,
    pension,
    craTotal,
  });

  // Calculate total reliefs
  const totalReliefs = pension + craTotal;

  // Calculate taxable income
  let taxableIncome = roundToNaira(grossIncome - totalReliefs);
  console.log(`Taxable Income after Reliefs: ${taxableIncome}`);

  // Apply minimum taxable income threshold
  taxableIncome = Math.max(0, taxableIncome);

  // If taxable income is below threshold, no tax is due
  if (taxableIncome < minTaxableIncome) {
    return {
      grossIncome,
      pension,
      cra: craTotal,
      taxableIncome,
      totalTax: 0,
      monthlyTax: 0,
      totalReliefs,
      effectiveTaxRate: 0,
      pensionCapped: pension < pensionRate * grossIncome,
      taxBreakdown: [],
    };
  }

  // Calculate total tax using the bracket-based approach
  const totalTax = calculateTax(taxableIncome);

  // Calculate effective tax rate (as percentage)
  const effectiveTaxRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;

  // Return detailed tax breakdown
  return {
    grossIncome,
    pension,
    cra: craTotal,
    taxableIncome,
    totalTax,
    monthlyTax: roundToNaira(totalTax / 12),
    totalReliefs,
    effectiveTaxRate: parseFloat(effectiveTaxRate.toFixed(2)),
    pensionCapped: pension < pensionRate * grossIncome,
  };
}
