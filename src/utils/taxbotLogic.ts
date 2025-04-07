export function calculateCRA(grossIncome: number): number {
  // CRA is the greater of ₦200,000 or 21% of gross income (1% + 20%)
  const cra = Math.max(200_000, grossIncome * 0.21);

  // Log calculation for debugging
  console.log(`CRA Calculation for ${grossIncome.toLocaleString()}:`, {
    formula: "max(₦200,000, 21% of gross income)",
    calculation: `max(200000, ${grossIncome} * 0.21)`,
    result: cra.toLocaleString(),
  });

  return cra;
}

export function calculatePension(grossIncome: number, rate = 0.08): number {
  // Calculate pension contribution (8% of gross income, capped at ₦500,000)
  const uncappedPension = rate * grossIncome;
  const pensionContribution = Math.min(uncappedPension, 500_000);
  const isCapped = uncappedPension > 500_000;

  // Log calculation for debugging
  console.log(`Pension Calculation for ₦${grossIncome.toLocaleString()}:`, {
    pensionRate: `${(rate * 100).toFixed(1)}%`,
    uncappedPension: `₦${uncappedPension.toLocaleString()}`,
    cappedPension: `₦${pensionContribution.toLocaleString()}`,
    isCapped: isCapped,
    formula: "min(rate * grossIncome, 500000)",
  });

  return pensionContribution;
}

export function calculateTaxableIncome(
  grossIncome: number,
  pensionContribution: number = 0
): number {
  console.log("Step 2: Calculate Taxable Income = Gross Income - CRA - Pension");

  // Calculate CRA using the dynamic method
  const CRA = calculateCRA(grossIncome);

  // Log values for debugging
  console.log(`Calculating Taxable Income for ₦${grossIncome.toLocaleString()}:`, {
    grossIncome: `₦${grossIncome.toLocaleString()}`,
    CRA: `₦${CRA.toLocaleString()}`,
    pensionContribution: `₦${pensionContribution.toLocaleString()}`,
  });

  // Recompute taxable income using the formula: grossIncome - CRA - pension
  const taxableIncome = grossIncome - CRA - pensionContribution;
  console.log(`Taxable Income: ₦${taxableIncome.toLocaleString()}`);
  return taxableIncome;
}

export function calculateTax(grossIncome: number): number {
  // Calculate pension contribution (8% of gross income, capped at ₦500,000)
  const pensionContribution = calculatePension(grossIncome);

  // Calculate taxable income using our standardized function
  const taxableIncome = calculateTaxableIncome(grossIncome, pensionContribution);

  console.log("Step 3: Calculate tax using progressive brackets");

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
  let taxBreakdown = [];

  // Apply tax brackets
  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    const taxableAmount = Math.min(remainingIncome, bracket.limit);
    const bracketTax = taxableAmount * bracket.rate;

    if (taxableAmount > 0) {
      taxBreakdown.push({
        bracket: i + 1,
        rate: bracket.rate * 100,
        amount: taxableAmount,
        tax: bracketTax,
      });
    }

    totalTax += bracketTax;
    remainingIncome -= taxableAmount;

    if (remainingIncome <= 0) break;
  }

  console.log("Tax breakdown by bracket:", taxBreakdown);
  console.log(`Total calculated tax: ₦${totalTax.toLocaleString()}`);

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
  console.log("===== STARTING TAX CALCULATION =====");
  console.log(`Gross Income: ₦${grossIncome.toLocaleString()}`);

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

  // Calculate total reliefs
  const totalReliefs = pension + craTotal;
  console.log(`Total Reliefs (CRA + Pension): ₦${totalReliefs.toLocaleString()}`);

  // Calculate taxable income
  let taxableIncome = roundToNaira(grossIncome - totalReliefs);
  console.log(`Final Taxable Income: ₦${taxableIncome.toLocaleString()}`);

  // Apply minimum taxable income threshold
  taxableIncome = Math.max(0, taxableIncome);

  // If taxable income is below threshold, no tax is due
  if (taxableIncome < minTaxableIncome) {
    console.log(
      `Income below minimum taxable threshold of ₦${minTaxableIncome.toLocaleString()}, no tax due.`
    );
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
  const totalTax = roundToNaira(calculateTax(taxableIncome));
  const monthlyTax = roundToNaira(totalTax / 12);

  // Calculate effective tax rate (as percentage)
  const effectiveTaxRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;

  console.log(`Annual Tax: ₦${totalTax.toLocaleString()}`);
  console.log(`Monthly Tax: ₦${monthlyTax.toLocaleString()}`);
  console.log(`Effective Tax Rate: ${effectiveTaxRate.toFixed(2)}%`);
  console.log("===== TAX CALCULATION COMPLETE =====");

  // Return detailed tax breakdown
  return {
    grossIncome,
    pension,
    cra: craTotal,
    taxableIncome,
    totalTax,
    monthlyTax,
    totalReliefs,
    effectiveTaxRate: parseFloat(effectiveTaxRate.toFixed(2)),
    pensionCapped: pension < pensionRate * grossIncome,
  };
}
