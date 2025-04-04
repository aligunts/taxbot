import React from "react";
import { motion } from "framer-motion";
import TaxCalculationDisplay from "./TaxCalculationDisplay";

const TaxCalculationExamples: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-primary-700 mb-8">
        Nigerian Tax Calculation Examples
      </h1>

      <p className="text-primary-600 mb-6">
        The following examples demonstrate how tax calculations are formatted using standardized
        plain-text templates. No markdown or LaTeX formatting is used to ensure consistent display
        across all platforms.
      </p>

      {/* VAT-Inclusive Example */}
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
            VAT-Inclusive Example
          </h2>
        </div>

        <TaxCalculationDisplay
          calculationType="vat-inclusive"
          vatInclusiveAmount="2,000,000"
          priceBeforeVAT="1,860,465.12"
          vatAmount="139,534.88"
          vatRate="7.5%"
        />
      </motion.div>

      {/* VAT-Exclusive Example */}
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
            VAT-Exclusive Example
          </h2>
        </div>

        <TaxCalculationDisplay
          calculationType="vat-exclusive"
          priceBeforeVAT="1,000,000"
          vatAmount="75,000"
          vatTotal="1,075,000"
          vatRate="7.5%"
        />
      </motion.div>

      {/* Company Income Tax Example */}
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
            Company Income Tax Example
          </h2>
        </div>

        <TaxCalculationDisplay
          calculationType="company-income-tax"
          annualTurnover="150,000,000"
          taxRate="30%"
          taxAmount="45,000,000"
        />
      </motion.div>

      {/* Plain Text Format Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
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
          <h2 className="text-2xl font-display font-semibold text-primary-700">Important</h2>
        </div>

        <div className="text-primary-600">
          <p className="mb-4">
            The calculations above are displayed in a <strong>monospaced font</strong> with proper
            alignment and spacing. This ensures:
          </p>

          <ul className="space-y-2 list-disc pl-5 mb-4">
            <li>No rendering issues with markdown or LaTeX notation</li>
            <li>Consistent display across all platforms and environments</li>
            <li>Clear, readable formatting with proper alignment</li>
            <li>Proper display of Nigerian Naira (₦) and mathematical symbols</li>
          </ul>

          <p>
            The tax calculation display component automatically handles formatting for numbers,
            ensuring proper comma separators and decimal places while maintaining alignment.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TaxCalculationExamples;
