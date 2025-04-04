export function calculateCRA(grossIncome: number): number {
  // Calculate 1% and 20% of gross income
  const onePercent = 0.01 * grossIncome;
  const twentyPercent = 0.2 * grossIncome;

  // Return the maximum of ₦200,000 or the total CRA
  return Math.max(200_000, onePercent + twentyPercent);
}
