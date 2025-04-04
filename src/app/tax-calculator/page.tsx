import React from "react";
import dynamic from "next/dynamic";

const TaxCalculationExamples = dynamic(() => import("../../components/TaxCalculationExamples"), {
  ssr: true,
  loading: () => <p>Loading tax calculation examples...</p>,
});

export const metadata = {
  title: "Nigerian Tax Calculator Examples | TaxTalkie",
  description:
    "Examples of Nigerian tax calculations displayed in a standardized, plain-text format.",
};

export default function TaxCalculatorPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <TaxCalculationExamples />
    </main>
  );
}
