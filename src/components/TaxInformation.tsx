import React from "react";
import { motion } from "framer-motion";

type TaxBracket = {
  company: string;
  turnover: string;
  rate: string;
  description?: string;
};

// New component for VAT calculation example
const VATCalculationExample: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
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
          VAT Calculation Example
        </h2>
      </div>

      <div className="border-l-4 border-accent-100 pl-4 py-1">
        <p className="font-semibold text-primary-600 flex items-center">
          <span className="inline-block w-6 h-6 bg-accent-500 text-white rounded-full flex items-center justify-center mr-2 text-xs">
            🇳🇬
          </span>
          VAT Calculation for Item
        </p>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-primary-600">VAT Rate:</h3>
          <ul className="space-y-2 text-primary-500 mt-2">
            <li className="flex items-start gap-2">
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
              <span>Current VAT rate: 7.5%</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-primary-600">Calculation Steps:</h3>
          <ol className="space-y-3 mt-2">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center mt-0.5 text-accent-500 text-xs font-semibold">
                1
              </span>
              <span className="flex-1 text-primary-500">Let the price before VAT be P.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center mt-0.5 text-accent-500 text-xs font-semibold">
                2
              </span>
              <span className="flex-1 text-primary-500">
                The price after VAT is given as ₦2,000,000.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center mt-0.5 text-accent-500 text-xs font-semibold">
                3
              </span>
              <span className="flex-1 text-primary-500">
                The relationship between the price before VAT and the price after VAT is:
              </span>
            </li>
          </ol>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-center my-4">
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm">
              <span className="text-xl font-mono">P + (0.075 × P) = ₦2,000,000</span>
            </div>
          </div>
        </div>

        <div>
          <ol className="space-y-3 mt-2" start={4}>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center mt-0.5 text-accent-500 text-xs font-semibold">
                4
              </span>
              <span className="flex-1 text-primary-500">Simplify the equation:</span>
            </li>
          </ol>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-center my-4">
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm">
              <span className="text-xl font-mono">1.075P = ₦2,000,000</span>
            </div>
          </div>
        </div>

        <div>
          <ol className="space-y-3 mt-2" start={5}>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center mt-0.5 text-accent-500 text-xs font-semibold">
                5
              </span>
              <span className="flex-1 text-primary-500">Solve for P:</span>
            </li>
          </ol>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2 flex flex-col items-center">
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm">
              <span className="text-xl font-mono">P = ₦2,000,000 / 1.075</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm mt-2">
              <span className="text-xl font-mono font-bold">P = ₦1,860,465.12</span>
            </div>
          </div>
        </div>

        <div className="bg-accent-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-primary-600 mb-2">Price before VAT:</h3>
          <p className="text-primary-600 font-mono ml-4 font-bold text-center text-lg">
            ₦1,860,465.12
          </p>
        </div>

        <div className="bg-accent-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-primary-600 mb-2">VAT Amount:</h3>
          <div className="space-y-2">
            <p className="text-primary-600 font-mono ml-4">
              VAT = Price with VAT - Price before VAT
            </p>
            <p className="text-primary-600 font-mono ml-4">VAT = ₦2,000,000 - ₦1,860,465.12</p>
            <p className="text-primary-600 font-mono ml-4 font-bold">VAT = ₦139,534.88</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TaxInformation: React.FC = () => {
  const taxBrackets: TaxBracket[] = [
    {
      company: "Small",
      turnover: "< NGN25 million",
      rate: "0%",
      description: "Complete exemption from Company Income Tax",
    },
    {
      company: "Medium",
      turnover: "NGN25-100 million",
      rate: "20%",
      description: "Reduced rate applies to all qualifying companies",
    },
    {
      company: "Large",
      turnover: "> NGN100 million",
      rate: "30%",
      description: "Standard rate for large corporations",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-primary-700 mb-8">
        Nigerian Tax Information
      </h1>

      {/* Reliefs & Exemptions Card */}
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-display font-semibold text-primary-700">
            Reliefs & Exemptions
          </h2>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-primary-600">VAT Exemptions:</h3>
          <ul className="space-y-2 text-primary-500">
            {[
              "Diplomatic goods and services",
              "Basic food items",
              "Medical and pharmaceutical products",
              "Educational materials",
              "Humanitarian project purchases",
            ].map((item, index) => (
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
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold text-primary-600 mt-4">
            Zero-Rated VAT Items (0%):
          </h3>
          <ul className="space-y-2 text-primary-500">
            {[
              "Non-oil exports",
              "Goods and services purchased by diplomats",
              "Humanitarian projects",
            ].map((item, index) => (
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
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Tax Brackets Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8 overflow-x-auto"
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
            Company Income Tax Brackets
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Company Size
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Annual Turnover
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tax Rate
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {taxBrackets.map((bracket, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-700">
                    {bracket.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-500">
                    {bracket.turnover}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-500 font-semibold">
                    {bracket.rate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-500">
                    {bracket.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Additional Tax Types */}
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
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
            />
          </svg>
          <h2 className="text-2xl font-display font-semibold text-primary-700">
            Additional Tax Types
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-primary-600">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-accent-100 text-accent-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              Tertiary Education Tax (TET)
            </h3>
            <p className="text-primary-500 ml-8">3% of assessable profit</p>
          </div>

          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-primary-600">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-accent-100 text-accent-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              Withholding Tax (WHT)
            </h3>
            <p className="text-primary-500 ml-8">2%-10% based on payment type</p>
          </div>

          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-primary-600">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-accent-100 text-accent-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              Capital Gains Tax (CGT)
            </h3>
            <p className="text-primary-500 ml-8">10% flat rate</p>
          </div>

          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-primary-600">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-accent-100 text-accent-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              NITD Levy
            </h3>
            <p className="text-primary-500 ml-8">
              1% of profit before tax for qualifying companies
            </p>
          </div>
        </div>
      </motion.div>

      {/* VAT Calculation Example */}
      <VATCalculationExample />

      {/* Call to Action Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="bg-accent-50 border border-accent-100 rounded-xl p-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="bg-white rounded-full p-3 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-accent-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-display font-semibold text-primary-700 mb-2">
              Need help with your tax calculations?
            </h2>
            <p className="text-primary-500 mb-4">
              Our tax professionals can assist you with detailed tax planning, compliance, and
              optimization strategies tailored to your business needs.
            </p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-500 hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition duration-150">
              Chat with a Tax Advisor
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2 -mr-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TaxInformation;
