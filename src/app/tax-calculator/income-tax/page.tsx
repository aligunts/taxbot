"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "react-error-boundary";

// Import with dynamic loading and disable SSR to avoid hydration errors
const TaxbotChat = dynamic(() => import("@/components/TaxbotChat"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
    </div>
  ),
});

// Fallback component for errors
function ErrorFallback() {
  return (
    <div className="text-center p-6 bg-red-50 rounded-lg">
      <h2 className="text-lg font-semibold text-red-700 mb-2">Something went wrong</h2>
      <p className="text-red-600 mb-4">
        There was an error loading the tax calculator. Please refresh the page and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Reload Page
      </button>
    </div>
  );
}

export default function IncomeTaxCalculatorPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-6">
          Nigerian Personal Income Tax Calculator
        </h1>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
                </div>
              }
            >
              <TaxbotChat />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </main>
  );
}
