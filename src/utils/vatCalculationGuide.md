# Nigerian VAT Calculation Guide

This document provides the correct formulas and examples for Value Added Tax (VAT) calculations in Nigeria, where the standard VAT rate is 7.5%.

## Key Formulas

### 1. VAT-Exclusive Calculations (When starting with price before VAT)

When you have the price before VAT (PBV) and need to calculate the VAT amount and total price:

```
VAT Amount = Price Before VAT * (VAT Rate/100)
Total Price = Price Before VAT + VAT Amount
```

### 2. VAT-Inclusive Calculations (When starting with a price that includes VAT)

When you have the total price (TP) that already includes VAT and need to extract the price before VAT and the VAT amount:

```
Price Before VAT = Total Price / (1 + VAT Rate/100)
VAT Amount = Total Price - Price Before VAT
```

## Examples

### Example 1: VAT-Exclusive Calculation

For a good with a price before VAT of ₦10,000:

```
VAT Amount = ₦10,000 * (7.5/100) = ₦750
Total Price = ₦10,000 + ₦750 = ₦10,750
```

### Example 2: VAT-Inclusive Calculation

For a good with a total price (VAT-inclusive) of ₦10,000:

```
Price Before VAT = ₦10,000 / (1 + 7.5/100) = ₦10,000 / 1.075 = ₦9,302.33
VAT Amount = ₦10,000 - ₦9,302.33 = ₦697.67
```

### Example 3: VAT-Inclusive Calculation (Higher value)

For a good with a total price (VAT-inclusive) of ₦30,000:

```
Price Before VAT = ₦30,000 / (1 + 7.5/100) = ₦30,000 / 1.075 = ₦27,906.98
VAT Amount = ₦30,000 - ₦27,906.98 = ₦2,093.02
```

## Common Mistakes to Avoid

### Mistake 1: Incorrect VAT extraction from inclusive prices

❌ **WRONG METHOD**:

```
VAT Amount = Total Price * (VAT Rate/100)
Price Before VAT = Total Price - VAT Amount
```

For a ₦10,000 VAT-inclusive price, this would incorrectly give:

- VAT Amount = ₦10,000 \* (7.5/100) = ₦750 (incorrect)
- Price Before VAT = ₦10,000 - ₦750 = ₦9,250 (incorrect)

This is mathematically inconsistent because:
₦9,250 \* 1.075 = ₦9,943.75, which doesn't equal the original ₦10,000.

✅ **CORRECT METHOD**:

```
Price Before VAT = Total Price / (1 + VAT Rate/100)
VAT Amount = Total Price - Price Before VAT
```

For a ₦10,000 VAT-inclusive price:

- Price Before VAT = ₦10,000 / (1 + 7.5/100) = ₦10,000 / 1.075 = ₦9,302.33
- VAT Amount = ₦10,000 - ₦9,302.33 = ₦697.67

This is consistent because:
₦9,302.33 \* 1.075 = ₦10,000, which equals the original amount.

### Mistake 2: Confusion about inclusive vs. exclusive starting points

Always clarify whether the given amount is VAT-inclusive or VAT-exclusive before applying formulas.

## Mathematical Verification

You can verify if your calculation is correct by:

1. For VAT-exclusive calculations:

   - PBV \* (1 + VAT Rate/100) should equal the Total Price

2. For VAT-inclusive calculations:
   - (PBV \* (1 + VAT Rate/100)) should equal the original Total Price
   - (Total Price / (1 + VAT Rate/100)) \* (1 + VAT Rate/100) should equal the original Total Price

## Precision and Rounding

For accurate VAT calculations:

1. Maintain high precision during intermediate calculations
2. Round only the final results to 2 decimal places
3. Validate calculations by ensuring mathematical consistency
