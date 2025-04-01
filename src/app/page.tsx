"use client";

import dynamic from "next/dynamic";
import Chat from "@/components/Chat";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm py-2 sm:py-3">
        <div className="container mx-auto px-3 sm:px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900">Taxbot</h1>
              <p className="text-[10px] sm:text-xs text-gray-600">
                Your Expert Guide on Tax Regulations
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 sm:mb-6">
            <div className="p-2 sm:p-3">
              <ErrorBoundary>
                <Chat />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-3 sm:py-4">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <p className="text-gray-300 text-[10px] sm:text-xs text-center">
                © {new Date().getFullYear()} Taxbot by ADD. All rights reserved.
              </p>
              <p className="text-gray-400 text-[10px] sm:text-xs mt-2 sm:mt-3 text-center">
                Taxbot can make mistakes. Always verify your answers with a tax professional.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
