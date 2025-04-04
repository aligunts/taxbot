import React from "react";
import { motion } from "framer-motion";

const TaxCalculationTemplate: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-primary-700 mb-8">
        Nigerian Tax Calculation Templates
      </h1>

      <p className="text-primary-600 mb-6">
        When responding to any Nigerian tax calculation request, format the response as a clear,
        structured plain-text breakdown. Do not use markdown formatting or LaTeX. Use labeled
        sections, aligned steps, and line dividers to ensure clarity.
      </p>

      {/* VAT-Inclusive Template */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-accent-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <h2 className="text-2xl font-display font-semibold text-primary-700">
            For VAT-Inclusive Calculations
          </h2>
        </div>

        <div className="font-mono text-sm bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap">
          {`----------------------------------------
VAT CALCULATION – NIGERIA 🇳🇬

Given:
VAT-inclusive price: ₦[amount]

Calculation Steps:
1. Let P be the price before VAT.
2. VAT-inclusive price = P + [VAT rate] × P
3. Therefore: [1 + rate] × P = ₦[amount]
4. Solve for P:
   P = ₦[amount] ÷ [1 + rate] = ₦[price before VAT]

Breakdown:
- VAT-inclusive Amount: ₦[amount]
- Price before VAT:     ₦[price before VAT]
- VAT Amount:           ₦[VAT amount]

Verification:
₦[price before VAT] + ₦[VAT amount] = ₦[amount]
----------------------------------------`}
        </div>
      </motion.div>

      {/* VAT-Exclusive Template */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-accent-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <h2 className="text-2xl font-display font-semibold text-primary-700">
            For VAT-Exclusive Calculations
          </h2>
        </div>

        <div className="font-mono text-sm bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap">
          {`----------------------------------------
VAT CALCULATION – NIGERIA 🇳🇬

Given:
Price before VAT: ₦[amount]

Calculation Steps:
1. VAT = ₦[amount] × [rate] = ₦[VAT amount]
2. Total = Price + VAT = ₦[amount] + ₦[VAT amount] = ₦[total]

Breakdown:
- Price before VAT:     ₦[amount]
- VAT Amount:           ₦[VAT amount]
- VAT-inclusive Total:  ₦[total]
----------------------------------------`}
        </div>
      </motion.div>

      {/* Company Income Tax Template */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-accent-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <h2 className="text-2xl font-display font-semibold text-primary-700">
            For Company Income Tax
          </h2>
        </div>

        <div className="font-mono text-sm bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap">
          {`----------------------------------------
COMPANY INCOME TAX – NIGERIA 🇳🇬

Given:
Annual Turnover: ₦[amount]

Calculation Steps:
1. Tax Rate: [20% or 30%]
2. Tax = ₦[amount] × [rate] = ₦[tax amount]

Breakdown:
- Turnover:     ₦[amount]
- Tax Rate:     [rate in %]
- Tax Payable:  ₦[tax amount]
----------------------------------------`}
        </div>
      </motion.div>

      {/* Formatting Rules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-accent-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          <h2 className="text-2xl font-display font-semibold text-primary-700">Formatting Rules</h2>
        </div>

        <ul className="space-y-2 text-primary-500">
          {[
            "Use ₦ symbol for all amounts",
            "Include thousands separators (₦2,500,000.00)",
            "Round values to 2 decimal places",
            "Use fixed-width alignment where possible",
            "Keep language formal and concise",
            "No emojis or unnecessary text outside this structure",
          ].map((rule, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-100 flex items-center justify-center mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 text-accent-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 12h14"
                  />
                </svg>
              </span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Example Implementation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-accent-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-display font-semibold text-primary-700">
            Example Implementation
          </h2>
        </div>

        <div className="font-mono text-sm bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap">
          {`----------------------------------------
VAT CALCULATION – NIGERIA 🇳🇬

Given:
VAT-inclusive price: ₦2,000,000.00

Calculation Steps:
1. Let P be the price before VAT.
2. VAT-inclusive price = P + 7.5% × P
3. Therefore: 1.075 × P = ₦2,000,000.00
4. Solve for P:
   P = ₦2,000,000.00 ÷ 1.075 = ₦1,860,465.12

Breakdown:
- VAT-inclusive Amount: ₦2,000,000.00
- Price before VAT:     ₦1,860,465.12
- VAT Amount:           ₦139,534.88

Verification:
₦1,860,465.12 + ₦139,534.88 = ₦2,000,000.00
----------------------------------------`}
        </div>
      </motion.div>
    </div>
  );
};

export default TaxCalculationTemplate;
