export function calculatePersonalIncomeTax({
  grossIncome,
  pensionRate = 0.08,
  taxBrackets = [
    { threshold: 300_000, rate: 0.07 },
    { threshold: 300_000, rate: 0.11 },
    { threshold: 500_000, rate: 0.15 },
    { threshold: 500_000, rate: 0.19 },
    { threshold: 1_600_000, rate: 0.21 },
    { threshold: Infinity, rate: 0.24 },
  ],
  minTaxableIncome = 30_000, // Minimum taxable income threshold
}: {
  grossIncome: number;
  pensionRate?: number;
  taxBrackets?: { threshold: number; rate: number }[];
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

  // Calculate pension
  const pension = roundToNaira(grossIncome * pensionRate);

  // Calculate CRA (Consolidated Relief Allowance)
  // Formula: Fixed amount of ₦200,000 plus 20% of gross income
  const craTotal = roundToNaira(0.2 * grossIncome + 200_000);

  // Calculate total reliefs
  const totalReliefs = pension + craTotal;

  // Calculate taxable income
  let taxableIncome = roundToNaira(grossIncome - totalReliefs);

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
    };
  }

  // Calculate total tax based on brackets
  let remainingIncome = taxableIncome;
  let totalTax = 0;

  for (const { threshold, rate } of taxBrackets) {
    if (remainingIncome <= 0) break;
    const taxableAtThisRate = Math.min(remainingIncome, threshold);
    totalTax += roundToNaira(taxableAtThisRate * rate);
    remainingIncome -= taxableAtThisRate;
  }

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
  };
}
