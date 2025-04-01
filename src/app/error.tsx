"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="error-container">
      <div className="error-content">
        <h2 className="error-title">Something went wrong!</h2>
        <p className="error-message">We encountered an error while processing your request.</p>
        <button onClick={reset} className="error-button">
          Try again
        </button>
      </div>
    </div>
  );
}
