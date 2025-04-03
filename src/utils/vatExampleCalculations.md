# VAT Example Calculations (Nigeria)

This document provides examples of Value Added Tax (VAT) calculations based on the Nigerian VAT rate of 7.5%.

## Basic VAT Calculations

### Example 1: Price Before VAT (PBV) from VAT-inclusive Amount

For a VAT-inclusive price of ₦10,000:

```
PBV = TP / (1 + VAT Rate)
PBV = 10,000 / 1.075 = 9,302.33 (rounded to 2 decimal places)
```

- Price Before VAT: ₦9,302.33
- VAT Amount: ₦697.67 (10,000 - 9,302.33)
- Total Price (VAT-inclusive): ₦10,000.00

### Example 2: VAT Amount from VAT-exclusive Amount

For a VAT-exclusive price of ₦10,000:

```
VAT Amount = PBV * VAT Rate
VAT Amount = 10,000 * 0.075 = 750.00
```

- Price Before VAT: ₦10,000.00
- VAT Amount: ₦750.00
- Total Price (VAT-inclusive): ₦10,750.00

### Example 3: Total Price from VAT-exclusive Amount

For a VAT-exclusive price of ₦5,000:

```
TP = PBV * (1 + VAT Rate)
TP = 5,000 * 1.075 = 5,375.00
```

- Price Before VAT: ₦5,000.00
- VAT Amount: ₦375.00
- Total Price (VAT-inclusive): ₦5,375.00

## Withholding VAT Examples

In Nigeria, government agencies often withhold a portion (typically 50%) of the VAT when paying vendors.

### Example 4: Withholding VAT Calculation

For an invoice amount of ₦100,000 (VAT-exclusive):

```
VAT Amount = 100,000 * 0.075 = 7,500.00
Withholding VAT (50%) = 7,500 / 2 = 3,750.00
```

- Invoice Amount (VAT-exclusive): ₦100,000.00
- VAT Amount: ₦7,500.00
- Total Invoice Value: ₦107,500.00
- Withholding VAT: ₦3,750.00
- Amount Paid to Vendor: ₦103,750.00 (107,500 - 3,750)

## VAT Payable Examples

Businesses registered for VAT must calculate their VAT payable as the difference between output VAT (collected on sales) and input VAT (paid on purchases).

### Example 5: VAT Payable Calculation

A business with:

- Output VAT (collected from customers): ₦50,000
- Input VAT (paid to suppliers): ₦30,000

```
VAT Payable = Output VAT - Input VAT
VAT Payable = 50,000 - 30,000 = 20,000.00
```

- Output VAT: ₦50,000.00
- Input VAT: ₦30,000.00
- VAT Payable to FIRS: ₦20,000.00

### Example 6: VAT Refund Calculation

A business with:

- Output VAT (collected from customers): ₦20,000
- Input VAT (paid to suppliers): ₦35,000

```
VAT Refund = Input VAT - Output VAT
VAT Refund = 35,000 - 20,000 = 15,000.00
```

- Output VAT: ₦20,000.00
- Input VAT: ₦35,000.00
- VAT Refund claimable from FIRS: ₦15,000.00

## Precision and Rounding

For all VAT calculations, we maintain high precision during intermediate steps and only apply rounding to 2 decimal places in the final results. This ensures the most accurate calculations for Nigerian VAT reporting requirements.

### Precision Test: VAT-inclusive Amount of ₦10,000

A detailed precision test has confirmed that for a VAT-inclusive amount of ₦10,000, our system correctly calculates:

- Price Before VAT: exactly ₦9,302.33 (after rounding to 2 decimal places)
- VAT Amount: exactly ₦697.67 (after rounding to 2 decimal places)

The full precision calculation is:

```
PBV = 10,000 / 1.075 = 9,302.325581395349... ≈ 9,302.33
VAT = 10,000 - 9,302.33 = 697.67
```

Nigerian businesses should use these precise calculations to ensure compliance with FIRS reporting requirements.
