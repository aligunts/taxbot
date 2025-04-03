# Nigerian VAT Calculation Formulas

This document explains the Value Added Tax (VAT) calculation formulas used in our Nigerian tax calculation system. The standard VAT rate in Nigeria is 7.5%.

## Core VAT Formulas

### 1. Price Before VAT (PBV) - VAT-Exclusive Price

When you have a VAT-inclusive price and need to extract the original price:

```
PBV = Total Price / (1 + VAT Rate)
```

**Important Note**: For the formula, VAT Rate must be expressed as a decimal (0.075 for 7.5%).

Example:

```
For a total price of ₦10,000 with 7.5% VAT:
PBV = 10,000 / 1.075 = ₦9,302.33
```

### 2. VAT Amount (VA) - How Much VAT Was Charged

There are two scenarios:

#### a) If you have the VAT-exclusive price:

```
VA = PBV × VAT Rate
```

Example:

```
For an item priced at ₦9,302.33:
VA = 9,302.33 × 0.075 = ₦697.67
```

#### b) If you only have the VAT-inclusive price:

```
VA = Total Price - PBV
```

Example:

```
For a total price of ₦10,000:
PBV = 10,000 / 1.075 = ₦9,302.33
VA = 10,000 - 9,302.33 = ₦697.67
```

### 3. Total Price (TP) - VAT-Inclusive Price

When you know the price before VAT and need to calculate the final price:

```
TP = PBV × (1 + VAT Rate)
```

Example:

```
For an item priced at ₦9,302.33:
TP = 9,302.33 × 1.075 = ₦10,000.00
```

### 4. Reverse VAT Calculation (Alternative Formula)

For extracting VAT from an inclusive price:

```
VA = (TP × VAT Rate) / (1 + VAT Rate)
```

Example:

```
For a total price of ₦10,000 with 7.5% VAT:
VA = (10,000 × 0.075) / 1.075 = ₦697.67
```

## Advanced VAT Calculations

### 5. VAT Payable to FIRS

For businesses registered for VAT:

```
VAT Payable = Output VAT - Input VAT
```

Where:

- **Output VAT** = VAT collected on sales
- **Input VAT** = VAT paid on business purchases

Example:

```
If a business collected ₦50,000 in VAT from sales and paid ₦30,000 in VAT on purchases:
VAT Payable = 50,000 - 30,000 = ₦20,000
```

### 6. Withholding VAT (WHT VAT) for Government Contracts

For government contracts, 50% of VAT is withheld:

```
WHT VAT = VA / 2
```

Example:

```
For an invoice of ₦10,000 + VAT of ₦750:
WHT VAT = 750 / 2 = ₦375
```

## Implementation in Our System

Our system implements these formulas in the following functions:

1. `calculateVAT`: Core VAT calculation using price before/after VAT
2. `extractVATFromInclusive`: Reverse calculation to extract VAT from inclusive amount
3. `calculateWithholdingVAT`: Calculates withholding VAT for government contracts
4. `calculateVATPayable`: Determines VAT payable to FIRS for businesses
5. `calculateBulkVAT`: Processes multiple items with different VAT treatments

## Common Calculation Examples

### Example 1: Price before VAT (VAT-exclusive) from a VAT-inclusive amount

```javascript
// For a VAT-inclusive price of ₦10,000
const result = calculateVAT(10000, true);
// result.baseAmount = ₦9,302.33
// result.vatAmount = ₦697.67
// result.total = ₦10,000.00
```

### Example 2: VAT calculation on a VAT-exclusive amount

```javascript
// For a VAT-exclusive price of ₦10,000
const result = calculateVAT(10000, false);
// result.baseAmount = ₦10,000.00
// result.vatAmount = ₦750.00
// result.total = ₦10,750.00
```

## Precision Handling

All calculations use the Decimal.js library to ensure precision and avoid floating-point errors. This is especially important when calculating the price before VAT, as division operations can lead to rounding errors in JavaScript.

---

This document serves as a reference for understanding the VAT calculation methods implemented in our Nigerian tax calculation system.
