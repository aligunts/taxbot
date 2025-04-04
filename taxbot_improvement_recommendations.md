# Taxbot Improvement Recommendations Based on FIRS Documentation

## 1. Expanded Tax Types Coverage

- Current Taxbot focuses mainly on VAT and Company Income Tax
- Expand to handle:
  - **Tertiary Education Tax (TET)** - 3% of assessable profit
  - **Withholding Tax (WHT)** - varied rates based on payment type (2%-10%)
  - **Capital Gains Tax (CGT)** - 10% flat rate
  - **National Information Technology Development Levy (NITDL)** - 1% of profit before tax for qualifying companies

## 2. VAT Exemptions Update

- Update VAT exemption categories with latest exemptions:
  - Add diplomatic goods and services explicitly
  - Include humanitarian project purchases in the zero-rated category
  - Ensure comprehensive coverage of all basic food items, medical products, and educational materials

## 3. Zero-Rated VAT Items

- Create distinct category for zero-rated items (0% VAT) versus exempt items (no VAT):
  - Non-oil exports
  - Goods/services purchased by diplomats
  - Humanitarian projects

## 4. Tax Allocation Information

- Add informational responses about how tax revenue is allocated:
  - 85% of VAT goes to state and local governments
  - 15% of VAT is retained by federal government
  - Similar allocation information for other tax types

## 5. Recent Tax Updates

- Implement feature to inform users about recent tax changes:
  - TET rate increase from 2.5% to 3% (effective September 1, 2023)
  - Withholding Tax regulation changes (effective January 1, 2025)
  - Any future updates to maintain currency with Nigerian tax laws

## 6. Tax Compliance Information

- Add compliance assistance features:
  - VAT filing deadlines (21st day of the month following transaction)
  - Required information for VAT invoices (names, addresses, TINs, VAT number, etc.)
  - Penalties for non-compliance with tax regulations
  - Documentation requirements for different tax types

## 7. Company Size Classification

- Ensure latest thresholds for company classifications:
  - Small companies: turnover < NGN25 million (0% CIT)
  - Medium companies: turnover between NGN25-100 million (20% CIT)
  - Large companies: turnover > NGN100 million (30% CIT)
- Add minimum tax provisions (0.5% of turnover less franked investment income)

## 8. Tax Credits and Deductions

- Add functionality to explain available tax credits:
  - Withholding Tax Credits
  - Foreign Tax Credits
  - Sector-specific credits
- Include information on allowable deductions for different tax types

## 9. Multi-tax Calculation

- Create comprehensive business tax calculator:
  - Calculate multiple taxes simultaneously (CIT, TET, VAT, WHT)
  - Show how these taxes interact with each other
  - Provide consolidated tax liability estimates

## 10. Tax Identification Number (TIN) Information

- Add guidance on obtaining a TIN from FIRS
- Explain when a TIN is required for tax compliance
- Outline the process for registering for different tax types

## 11. Interactive Tax Timeline

- Implement a tax calendar feature showing:
  - Monthly VAT filing deadlines
  - Annual tax return deadlines
  - Recent and upcoming tax law changes

## 12. Industry-Specific Tax Guidance

- Develop specialized tax calculation modules for sectors:
  - Oil and gas (Petroleum Profit Tax)
  - Banking and financial services
  - Technology companies (with NITDL calculations)
  - Agricultural businesses (with exemptions)

## 13. Documentation Enhancement

- Update tax calculation explanations with:
  - Proper citations to Nigerian tax laws
  - References to specific sections of relevant Acts
  - Clearer step-by-step breakdowns of complex calculations

## Implementation Strategy

1. Update existing VAT and CIT calculation modules with latest rates and rules
2. Create new modules for additional tax types (TET, WHT, CGT, NITDL)
3. Expand product exemption database with latest information
4. Enhance natural language understanding to detect queries about new tax types
5. Update system prompts to include knowledge about recent tax changes
6. Create comprehensive tax guides for different business sizes and sectors

These enhancements would transform Taxbot from a specialized VAT and CIT calculator into a comprehensive Nigerian tax assistant, providing significant value to businesses and individuals navigating Nigeria's tax system.
