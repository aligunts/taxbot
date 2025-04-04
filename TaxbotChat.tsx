import React, { useState } from "react";
import { calculatePersonalIncomeTax } from "./taxbotLogic";

const TaxbotChat: React.FC = () => {
  const [salary, setSalary] = useState<number | string>(""); // State to capture salary input
  const [taxResponse, setTaxResponse] = useState<{
    grossIncome: number;
    pension: number;
    cra: number;
    taxableIncome: number;
    totalTax: number;
    monthlyTax: number;
  } | null>(null); // State to store tax response

  const handleSalaryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalary(e.target.value);
  };

  const handleCalculateTax = () => {
    const salaryNumber = Number(salary);

    if (!isNaN(salaryNumber) && salaryNumber > 0) {
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
          <div className="chat-message bot-message">
            <p>
              🧮{" "}
              <strong>
                Tax Calculation Results for ₦{taxResponse.grossIncome.toLocaleString()} Annual
                Income
              </strong>
            </p>
            <p>
              1. <strong>Pension Contribution (8%)</strong>: ₦{taxResponse.pension.toLocaleString()}
            </p>
            <p>
              2. <strong>Consolidated Relief Allowance (CRA)</strong>: ₦
              {taxResponse.cra.toLocaleString()}
            </p>
            <p>
              3. <strong>Taxable Income</strong>: ₦{taxResponse.taxableIncome.toLocaleString()}
            </p>
            <p>
              4. <strong>Total Tax</strong>: ₦{taxResponse.totalTax.toLocaleString()}
            </p>
            <p>
              5. <strong>Monthly Tax Deduction</strong>: ₦{taxResponse.monthlyTax.toLocaleString()}
            </p>
            <p>💬 Please confirm if you have any other income or deductions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxbotChat;
