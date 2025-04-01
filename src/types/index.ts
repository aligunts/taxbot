/**
 * Common type definitions used across the application
 */

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  message: string;
  error?: string;
  details?: string;
}

// Types for tax calculations
export enum TaxationMethod {
  Progressive = "progressive",
  FlatRate = "flat",
  Regressive = "regressive",
  Proportional = "proportional"
}

export interface TaxResult {
  taxableIncome: number;
  taxPayable: number;
  effectiveRate: number;
  taxByBracket?: Array<{ bracket: string; tax: number; rate: number }>;
  taxMethod: string;
}

// Types for VAT exemption
export interface ExemptionCheck {
  isExempt: boolean;
  category?: string;
  confidence?: number;
} 