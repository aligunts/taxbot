import React from "react";
import TaxInformation from "../../components/TaxInformation";

export const metadata = {
  title: "Nigerian Tax Information | TaxTalkie",
  description:
    "Comprehensive overview of Nigerian tax system including tax brackets, exemptions, and additional tax types.",
};

export default function TaxInformationPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <TaxInformation />
    </main>
  );
}
