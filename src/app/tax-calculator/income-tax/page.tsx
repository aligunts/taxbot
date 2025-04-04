"use client";

import React from "react";
import dynamic from "next/dynamic";

const TaxbotChat = dynamic(() => import("@/components/TaxbotChat"), {
  ssr: false,
  loading: () => <p>Loading tax calculator...</p>,
});

export default function IncomeTaxCalculatorPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-6">
          Nigerian Personal Income Tax Calculator
        </h1>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <TaxbotChat />
        </div>
      </div>
    </main>
  );
}
