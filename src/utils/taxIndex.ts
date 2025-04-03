/**
 * Tax Calculation Utilities Index
 *
 * This file exports all tax-related functions and utilities for easy access
 */

// Export all tax calculation utilities
export * from "./taxCalculations";

// Export VAT exemptions guide
export * from "./vatExemptionsGuide";

// Re-export TaxChain for Mistral AI integration
export { createTaxChain, extractNumericValues } from "./taxChain";

// Export interfaces and types to make them available to consumers
export interface TaxResult {
  taxPayable: number;
  effectiveRate: number;
  taxMethod: string;
}

export interface VATResult {
  baseAmount: number;
  vatAmount: number;
  total: number;
  isExempt: boolean;
  vatRate: number;
  effectiveRate: number;
}

/**
 * Tax Utilities Version Information
 */
export const taxUtilsInfo = {
  version: "1.0.0",
  currency: "NGN",
  country: "Nigeria",
  vatRate: 0.075, // 7.5%
  standardVATRateFormatted: "7.5%",
  lastUpdated: "2023",
};

/**
 * Available Tax Types
 */
export enum TaxType {
  PersonalIncomeTax = "personal-income-tax",
  PAYE = "paye",
  CompanyIncomeTax = "company-income-tax",
  VAT = "vat",
  CapitalGainsTax = "capital-gains-tax",
  WithholdingTax = "withholding-tax",
}

// Additional helpful utility functions

/**
 * Check if an item falls within a specific tax type
 * @param item Item description
 * @param taxType Tax type to check
 * @returns boolean indicating if the item matches the tax type
 */
export const isTaxTypeApplicable = (item: string, taxType: TaxType): boolean => {
  const itemLower = item.toLowerCase();

  switch (taxType) {
    case TaxType.VAT:
      // Most items are subject to VAT unless specifically exempt
      return !["medical", "education", "book", "export", "basic food"].some((term) =>
        itemLower.includes(term)
      );

    case TaxType.WithholdingTax:
      // Professional services, rent, contracts are subject to withholding tax
      return ["service", "consult", "rent", "contract", "professional"].some((term) =>
        itemLower.includes(term)
      );

    case TaxType.CapitalGainsTax:
      // Assets like property, shares, etc. are subject to capital gains tax
      return ["property", "share", "stock", "bond", "asset", "land", "building"].some((term) =>
        itemLower.includes(term)
      );

    default:
      return false;
  }
};
