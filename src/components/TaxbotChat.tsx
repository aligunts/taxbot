"use client";

import React, { useState } from "react";
import { calculatePersonalIncomeTax } from "@/utils/taxbotLogic";

const TaxbotChat: React.FC = () => {
  const [salary, setSalary] = useState<number | string>(""); // State to capture salary input
  const [taxResponse, setTaxResponse] = useState<{
    grossIncome: number;
    pension: number;
    cra: number;
    taxableIncome: number;
    totalTax: number;
    monthlyTax: number;
    totalReliefs: number;
    effectiveTaxRate: number;
  } | null>(null); // State to store tax response

  const handleSalaryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalary(e.target.value);
  };

  const handleCalculateTax = () => {
    const salaryNumber = Number(salary);

    if (!isNaN(salaryNumber) && salaryNumber > 0) {
      // Calculate CRA
      const cra = Math.max(200_000, 0.2 * salaryNumber);

      // Calculate pension (capped at 500,000)
      const pension = Math.min(0.08 * salaryNumber, 500_000);

      // Calculate total reliefs
      const totalReliefs = cra + pension;

      // Calculate taxable income
      const taxableIncome = salaryNumber - totalReliefs;

      console.log(
        "%c TAX CALCULATION DEBUG",
        "background: #2196f3; color: white; font-size: 16px; padding: 5px;"
      );
      console.log(
        "Step 1: Calculate CRA = max(₦200,000, (1% of gross income) + (20% of gross income))"
      );
      console.log(`   max(200000, ${0.2 * salaryNumber}) = ${cra}`);
      console.log("Step 2: Calculate Pension = min(8% of gross income, 500000)");
      console.log(`   min(${0.08 * salaryNumber}, 500000) = ${pension}`);
      console.log("Step 3: Calculate Total Relief = CRA + Pension");
      console.log(`   ${cra} + ${pension} = ${totalReliefs}`);
      console.log("Step 4: Calculate Taxable Income = Gross Income - Total Relief");
      console.log(`   ${salaryNumber} - ${totalReliefs} = ${taxableIncome}`);

      const result = calculatePersonalIncomeTax({ grossIncome: salaryNumber });
      setTaxResponse(result);
    } else {
      alert("Please enter a valid salary.");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-window">
        {/* Chatbot conversation */}
        <div className="chat-message bot-message">
          <p>🇳🇬 Welcome to Taxbot! Please enter your gross annual salary to calculate your tax:</p>
        </div>

        <div className="chat-message user-message">
          <input
            type="number"
            value={salary}
            onChange={handleSalaryInput}
            placeholder="Enter salary (e.g., ₦5,000,000)"
            className="salary-input"
          />
          <button onClick={handleCalculateTax} className="calculate-btn">
            Calculate Tax
          </button>
        </div>

        {taxResponse && (
          <div className="chat-message bot-message space-y-2">
            <p>
              🧮{" "}
              <strong>
                Tax Calculation for ₦{taxResponse.grossIncome.toLocaleString()} Annual Income
              </strong>
            </p>

            {/* Debug Section - To verify the calculation */}
            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 mb-3">
              <p className="text-sm font-medium text-yellow-800">Calculation Check:</p>
              <p className="text-xs text-yellow-700">
                CRA = max(200,000, 20% of income) = max(200,000,{" "}
                {(taxResponse.grossIncome * 0.2).toLocaleString()}) ={" "}
                {Math.max(200_000, taxResponse.grossIncome * 0.2).toLocaleString()}
              </p>
              <p className="text-xs text-yellow-700">
                Pension Contribution (8%, capped at ₦500,000) = min(
                {(taxResponse.grossIncome * 0.08).toLocaleString()}, 500,000) ={" "}
                {Math.min(taxResponse.grossIncome * 0.08, 500_000).toLocaleString()}
              </p>
              <p className="text-xs text-yellow-700">
                Total Relief = CRA + Pension ={" "}
                {Math.max(200_000, taxResponse.grossIncome * 0.2).toLocaleString()} +{" "}
                {Math.min(taxResponse.grossIncome * 0.08, 500_000).toLocaleString()} ={" "}
                {(
                  Math.max(200_000, taxResponse.grossIncome * 0.2) +
                  Math.min(taxResponse.grossIncome * 0.08, 500_000)
                ).toLocaleString()}
              </p>
              <p className="text-xs text-yellow-700">
                Taxable Income = Gross Income - Total Relief ={" "}
                {taxResponse.grossIncome.toLocaleString()} -{" "}
                {(
                  Math.max(200_000, taxResponse.grossIncome * 0.2) +
                  Math.min(taxResponse.grossIncome * 0.08, 500_000)
                ).toLocaleString()}{" "}
                ={" "}
                {(
                  taxResponse.grossIncome -
                  Math.max(200_000, taxResponse.grossIncome * 0.2) -
                  Math.min(taxResponse.grossIncome * 0.08, 500_000)
                ).toLocaleString()}
              </p>
            </div>

            {/* CRA Breakdown */}
            <p className="font-semibold mt-2">📊 CRA Breakdown</p>
            <p>🔹 20% of Gross Income: ₦{(taxResponse.grossIncome * 0.2).toLocaleString()}</p>
            <p>
              🔹 CRA (higher of ₦200,000 or 20% of income): ₦
              {Math.max(200_000, taxResponse.grossIncome * 0.2).toLocaleString()}
            </p>

            {/* Pension Information */}
            <p className="font-semibold mt-2">💼 Pension Contribution</p>
            <p>🔹 8% of Gross Income: ₦{(taxResponse.grossIncome * 0.08).toLocaleString()}</p>
            {taxResponse.grossIncome * 0.08 > 500_000 && (
              <p>
                🔹{" "}
                <span className="text-orange-600 font-medium">
                  Note: Pension contribution capped at ₦500,000
                </span>
              </p>
            )}
            <p>🔹 Actual Pension Contribution: ₦{taxResponse.pension.toLocaleString()}</p>

            {/* Total Relief */}
            <p className="font-semibold mt-2">📋 Total Tax Relief</p>
            <p>
              ✅ CRA + Pension = ₦{taxResponse.cra.toLocaleString()} + ₦
              {taxResponse.pension.toLocaleString()} = ₦{taxResponse.totalReliefs.toLocaleString()}
            </p>

            {/* Taxable Income and Tax */}
            <p className="font-semibold mt-2">💰 Tax Calculation</p>
            <p>🔹 Gross Income: ₦{taxResponse.grossIncome.toLocaleString()}</p>
            <p>🔹 Total Relief: ₦{taxResponse.totalReliefs.toLocaleString()}</p>
            <p>🔹 Taxable Income: ₦{taxResponse.taxableIncome.toLocaleString()}</p>

            {/* Tax Brackets Breakdown */}
            {taxResponse.taxableIncome > 0 && (
              <div className="mt-2">
                <p className="font-semibold">📊 Tax Brackets Breakdown</p>
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-xs mt-1 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="py-1 px-2 text-left">Bracket</th>
                        <th className="py-1 px-2 text-left">Income Range</th>
                        <th className="py-1 px-2 text-right">Rate</th>
                        <th className="py-1 px-2 text-right">Tax</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* First Bracket: 7% on first ₦300,000 */}
                      <tr className="border-b border-gray-200">
                        <td className="py-1 px-2">1</td>
                        <td className="py-1 px-2">₦0 - ₦300,000</td>
                        <td className="py-1 px-2 text-right">7%</td>
                        <td className="py-1 px-2 text-right">
                          ₦
                          {Math.min(300_000, taxResponse.taxableIncome) * 0.07 > 0
                            ? Math.round(
                                Math.min(300_000, taxResponse.taxableIncome) * 0.07
                              ).toLocaleString()
                            : 0}
                        </td>
                      </tr>

                      {/* Second Bracket: 11% on next ₦300,000 */}
                      {taxResponse.taxableIncome > 300_000 && (
                        <tr className="border-b border-gray-200">
                          <td className="py-1 px-2">2</td>
                          <td className="py-1 px-2">₦300,001 - ₦600,000</td>
                          <td className="py-1 px-2 text-right">11%</td>
                          <td className="py-1 px-2 text-right">
                            ₦
                            {Math.round(
                              Math.min(300_000, Math.max(0, taxResponse.taxableIncome - 300_000)) *
                                0.11
                            ).toLocaleString()}
                          </td>
                        </tr>
                      )}

                      {/* Third Bracket: 15% on next ₦500,000 */}
                      {taxResponse.taxableIncome > 600_000 && (
                        <tr className="border-b border-gray-200">
                          <td className="py-1 px-2">3</td>
                          <td className="py-1 px-2">₦600,001 - ₦1,100,000</td>
                          <td className="py-1 px-2 text-right">15%</td>
                          <td className="py-1 px-2 text-right">
                            ₦
                            {Math.round(
                              Math.min(500_000, Math.max(0, taxResponse.taxableIncome - 600_000)) *
                                0.15
                            ).toLocaleString()}
                          </td>
                        </tr>
                      )}

                      {/* Fourth Bracket: 19% on next ₦500,000 */}
                      {taxResponse.taxableIncome > 1_100_000 && (
                        <tr className="border-b border-gray-200">
                          <td className="py-1 px-2">4</td>
                          <td className="py-1 px-2">₦1,100,001 - ₦1,600,000</td>
                          <td className="py-1 px-2 text-right">19%</td>
                          <td className="py-1 px-2 text-right">
                            ₦
                            {Math.round(
                              Math.min(
                                500_000,
                                Math.max(0, taxResponse.taxableIncome - 1_100_000)
                              ) * 0.19
                            ).toLocaleString()}
                          </td>
                        </tr>
                      )}

                      {/* Fifth Bracket: 21% on next ₦1,600,000 */}
                      {taxResponse.taxableIncome > 1_600_000 && (
                        <tr className="border-b border-gray-200">
                          <td className="py-1 px-2">5</td>
                          <td className="py-1 px-2">₦1,600,001 - ₦3,200,000</td>
                          <td className="py-1 px-2 text-right">21%</td>
                          <td className="py-1 px-2 text-right">
                            ₦
                            {Math.round(
                              Math.min(
                                1_600_000,
                                Math.max(0, taxResponse.taxableIncome - 1_600_000)
                              ) * 0.21
                            ).toLocaleString()}
                          </td>
                        </tr>
                      )}

                      {/* Sixth Bracket: 24% on remainder */}
                      {taxResponse.taxableIncome > 3_200_000 && (
                        <tr className="border-b border-gray-200">
                          <td className="py-1 px-2">6</td>
                          <td className="py-1 px-2">Above ₦3,200,000</td>
                          <td className="py-1 px-2 text-right">24%</td>
                          <td className="py-1 px-2 text-right">
                            ₦
                            {Math.round(
                              Math.max(0, taxResponse.taxableIncome - 3_200_000) * 0.24
                            ).toLocaleString()}
                          </td>
                        </tr>
                      )}

                      {/* Total Row */}
                      <tr className="bg-gray-100 font-semibold">
                        <td className="py-1 px-2" colSpan={3}>
                          Total Tax
                        </td>
                        <td className="py-1 px-2 text-right">
                          ₦{taxResponse.totalTax.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <p>📈 Total Annual Tax: ₦{taxResponse.totalTax.toLocaleString()}</p>
            <p>
              📅 Monthly Tax Deduction: ₦
              {taxResponse.monthlyTax.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            {taxResponse.effectiveTaxRate > 0 && (
              <p>📊 Effective Tax Rate: {taxResponse.effectiveTaxRate}%</p>
            )}

            <p className="mt-2">
              💬 Let me know if you have any other deductions or income to consider.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxbotChat;
