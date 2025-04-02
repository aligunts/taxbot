"use client";

import React, { useState, useEffect } from "react";
import { Calculator, Landmark, User, DollarSign, Percent } from "lucide-react";
import {
  calculatePersonalIncomeTax,
  calculateCompanyIncomeTax,
  TaxationMethod,
} from "../utils/taxCalculations";

interface TaxResultProps {
  taxableIncome: number;
  taxPayable: number;
  effectiveRate: number;
  taxMethod: string;
  taxByBracket?: Array<{ bracket: string; tax: number; rate: number }>;
  companySize?: string;
  taxRate?: number;
}

const TaxCalculator = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [taxType, setTaxType] = useState<"personal" | "company">("personal");
  const [income, setIncome] = useState("");
  const [turnover, setTurnover] = useState("");
  const [taxMethod, setTaxMethod] = useState<TaxationMethod>(TaxationMethod.Progressive);
  const [calculatedTax, setCalculatedTax] = useState<TaxResultProps | null>(null);

  // Add useEffect to check if the calculator should be visible
  useEffect(() => {
    const calculatorContainer = document.getElementById("calculator");

    // If the parent container has a 'hidden' class, this component should be hidden
    if (calculatorContainer && calculatorContainer.classList.contains("hidden")) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, []);

  // Update the return statement to conditionally render based on visibility
  if (!isVisible) {
    return null;
  }

  // Enhanced income input handler with better NLP
  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Allow both numeric input and Naira-formatted input
    if (input === "") {
      setIncome("");
      return;
    }

    // Remove currency symbols and non-numeric characters except decimal point and commas
    let cleanedInput = input
      .replace(/[₦N]/g, "") // Remove Naira symbols
      .replace(/[^0-9.,]/g, ""); // Keep only digits, dots and commas

    // Handle case where user types comma as decimal separator
    if (cleanedInput.indexOf(",") !== -1 && cleanedInput.indexOf(".") === -1) {
      cleanedInput = cleanedInput.replace(",", ".");
    }

    // Ensure proper comma formatting for thousands
    const numericValue = cleanedInput.replace(/,/g, "");

    if (!isNaN(parseFloat(numericValue))) {
      // Format with commas for thousands
      const parts = numericValue.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      const formattedValue = parts.join(".");
      setIncome(formattedValue);
    } else {
      // If it's not a valid number after cleaning, just use the cleaned input
      setIncome(cleanedInput);
    }
  };

  // Handle turnover input for company tax
  const handleTurnoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    if (input === "") {
      setTurnover("");
      return;
    }

    // Process similarly to income
    let cleanedInput = input.replace(/[₦N]/g, "").replace(/[^0-9.,]/g, "");

    if (cleanedInput.indexOf(",") !== -1 && cleanedInput.indexOf(".") === -1) {
      cleanedInput = cleanedInput.replace(",", ".");
    }

    const numericValue = cleanedInput.replace(/,/g, "");

    if (!isNaN(parseFloat(numericValue))) {
      const parts = numericValue.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      const formattedValue = parts.join(".");
      setTurnover(formattedValue);
    } else {
      setTurnover(cleanedInput);
    }
  };

  const calculateTax = (e: React.FormEvent) => {
    e.preventDefault();

    // Process income input
    const incomeStr = income.replace(/[₦N,]/g, "");
    const incomeNum = parseFloat(incomeStr);

    // Validate input
    if (isNaN(incomeNum)) {
      alert("Please enter a valid number for your income");
      return;
    }

    if (incomeNum < 0) {
      alert("Income cannot be negative");
      return;
    }

    if (incomeNum > 1000000000) {
      alert("Please enter an amount less than 1 billion naira");
      return;
    }

    // For company tax, also validate turnover
    if (taxType === "company") {
      const turnoverStr = turnover.replace(/[₦N,]/g, "");
      const turnoverNum = parseFloat(turnoverStr);

      if (isNaN(turnoverNum)) {
        alert("Please enter a valid number for company turnover");
        return;
      }

      if (turnoverNum < 0) {
        alert("Turnover cannot be negative");
        return;
      }

      // Determine company size based on turnover
      const companySize =
        turnoverNum < 25000000 ? "small" : turnoverNum < 100000000 ? "medium" : "large";

      // Calculate company income tax using the utility
      const taxResult = calculateCompanyIncomeTax(incomeNum, companySize, 0, taxMethod);

      setCalculatedTax({
        taxableIncome: taxResult.taxableProfit,
        taxPayable: taxResult.taxPayable,
        effectiveRate: taxResult.taxRate,
        taxMethod: taxResult.taxMethod,
        companySize: taxResult.companySize,
        taxRate: taxResult.taxRate,
      });
    } else {
      // Calculate personal income tax using the utility
      const taxResult = calculatePersonalIncomeTax(incomeNum, 0, taxMethod);

      setCalculatedTax(taxResult);
    }
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-3 text-white">
          <div className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <h2 className="text-sm font-bold">Tax Calculator</h2>
          </div>
          <p className="mt-1 text-xs text-white/90 max-w-md">
            Calculate different types of taxes based on income, profit, and other factors.
          </p>
        </div>

        <div className="p-3">
          <form onSubmit={calculateTax} className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-3">
                <div className="bg-primary-50 p-2 rounded-md">
                  <label className="flex items-center space-x-1 text-xs font-medium text-gray-700 mb-1">
                    <span>Tax Type</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTaxType("personal")}
                      className={`flex items-center justify-center space-x-1 p-1.5 rounded-md border ${
                        taxType === "personal"
                          ? "bg-gray-200 border-gray-300 text-gray-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <User className="h-3 w-3" />
                      <span className="text-xs">Personal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaxType("company")}
                      className={`flex items-center justify-center space-x-1 p-1.5 rounded-md border ${
                        taxType === "company"
                          ? "bg-gray-200 border-gray-300 text-gray-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Landmark className="h-3 w-3" />
                      <span className="text-xs">Company</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {taxType === "personal" ? "Annual Income (₦)" : "Annual Profit (₦)"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <DollarSign className="h-3 w-3 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={income}
                      onChange={handleIncomeChange}
                      placeholder={
                        taxType === "personal" ? "Enter your annual income" : "Enter annual profit"
                      }
                      className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-firs-gray text-xs"
                    />
                  </div>
                </div>

                {taxType === "company" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Annual Turnover (₦)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={turnover}
                        onChange={handleTurnoverChange}
                        placeholder="Enter company's annual turnover"
                        className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-firs-gray text-xs"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <div className="flex items-center space-x-1">
                      <Percent className="h-3 w-3 text-gray-500" />
                      <span>Taxation Method</span>
                    </div>
                  </label>
                  <select
                    value={taxMethod}
                    onChange={(e) => setTaxMethod(e.target.value as TaxationMethod)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-firs-gray focus:border-accent-500 text-xs"
                  >
                    <option value={TaxationMethod.Progressive}>Progressive</option>
                    <option value={TaxationMethod.FlatRate}>Flat Rate</option>
                    <option value={TaxationMethod.Proportional}>Proportional</option>
                    {taxType === "personal" && (
                      <option value={TaxationMethod.Regressive}>Regressive</option>
                    )}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-500 text-white py-1.5 px-3 rounded-md hover:bg-accent-500 transition-colors flex items-center justify-center space-x-1 text-xs"
                >
                  <Calculator className="h-3 w-3" />
                  <span>Calculate Tax</span>
                </button>
              </div>

              {calculatedTax !== null && (
                <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
                  <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                    <DollarSign className="h-3 w-3 text-firs-gray mr-1" />
                    Tax Calculation Result
                  </h3>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-1.5 rounded border border-gray-100">
                        <div className="text-[10px] text-gray-500 uppercase">
                          {taxType === "personal" ? "Annual Income" : "Annual Profit"}
                        </div>
                        <div className="text-xs font-semibold text-gray-900">
                          ₦{formatCurrency(calculatedTax.taxableIncome)}
                        </div>
                      </div>

                      <div className="bg-white p-1.5 rounded border border-gray-100">
                        <div className="text-[10px] text-gray-500 uppercase">Tax Payable</div>
                        <div className="text-xs font-semibold text-firs-gray">
                          ₦{formatCurrency(calculatedTax.taxPayable)}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-1.5 rounded border border-gray-100">
                      <div className="text-[10px] text-gray-500 uppercase">Effective Tax Rate</div>
                      <div className="flex items-center">
                        <div className="text-xs font-semibold text-gray-900">
                          {(calculatedTax.effectiveRate * 100).toFixed(2)}%
                        </div>
                        <div className="ml-1 flex-1">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-firs-gray rounded-full"
                              style={{
                                width: `${Math.min(calculatedTax.effectiveRate * 100 * 2, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-1.5 rounded border border-gray-100">
                        <div className="text-[10px] text-gray-500 uppercase">Tax Type</div>
                        <div className="text-xs font-medium text-gray-900">
                          {taxType === "personal" ? "Personal Income Tax" : "Company Income Tax"}
                        </div>
                      </div>

                      <div className="bg-white p-1.5 rounded border border-gray-100">
                        <div className="text-[10px] text-gray-500 uppercase">Tax Method</div>
                        <div className="text-xs font-medium text-gray-900">
                          {calculatedTax.taxMethod}
                        </div>
                      </div>
                    </div>

                    {taxType === "company" && calculatedTax.companySize && (
                      <div className="bg-white p-1.5 rounded border border-gray-100">
                        <div className="text-[10px] text-gray-500 uppercase">Company Size</div>
                        <div className="text-xs font-medium text-gray-900">
                          {calculatedTax.companySize.charAt(0).toUpperCase() +
                            calculatedTax.companySize.slice(1)}
                        </div>
                      </div>
                    )}
                  </div>

                  {calculatedTax.taxByBracket && calculatedTax.taxByBracket.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-[10px] font-medium text-gray-900 mb-1">
                        Tax Bracket Breakdown
                      </h4>
                      <div className="bg-white rounded border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-2 py-1 text-left text-[9px] font-medium text-gray-500 uppercase tracking-wider">
                                Bracket
                              </th>
                              <th className="px-2 py-1 text-left text-[9px] font-medium text-gray-500 uppercase tracking-wider">
                                Rate
                              </th>
                              <th className="px-2 py-1 text-right text-[9px] font-medium text-gray-500 uppercase tracking-wider">
                                Tax
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {calculatedTax.taxByBracket.map((item, index) => (
                              <tr key={index}>
                                <td className="px-2 py-1 whitespace-nowrap text-[9px] text-gray-600">
                                  {item.bracket}
                                </td>
                                <td className="px-2 py-1 whitespace-nowrap text-[9px] text-gray-600">
                                  {item.rate}%
                                </td>
                                <td className="px-2 py-1 whitespace-nowrap text-[9px] text-gray-600 text-right">
                                  ₦{formatCurrency(item.tax)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;
