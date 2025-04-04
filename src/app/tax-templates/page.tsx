import React from "react";
import TaxCalculationTemplate from "../../components/TaxCalculationTemplate";

export const metadata = {
  title: "Nigerian Tax Calculation Templates | TaxTalkie",
  description:
    "Standardized templates for Nigerian tax calculations, including VAT and Company Income Tax calculations.",
};

export default function TaxTemplatesPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <TaxCalculationTemplate />
    </main>
  );
}
