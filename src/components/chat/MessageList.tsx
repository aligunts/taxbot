"use client";

import React, { useState, useEffect } from "react";
import { Message } from "@/types";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

// Define keyframe animation style
const bounceAnimationStyle = {
  animation: "bounce 1.4s infinite ease-in-out both",
};

// Keyframes will be added via global CSS

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  setInputValue?: (value: string) => void;
}

export default function MessageList({
  messages,
  isLoading,
  hasError = false,
  onRetry,
  setInputValue,
}: MessageListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("Message copied to clipboard");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      toast.error("Failed to copy message");
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  // Handle error state
  if (hasError && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <div className="bg-red-100 p-2.5 rounded-full mb-3 shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-800 mb-1.5">Connection issues detected</h3>
        <p className="text-sm text-gray-600 max-w-sm leading-relaxed">
          We&apos;re having trouble connecting to the tax information server.
        </p>
        <button
          onClick={handleRetry}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Handle empty state with welcome message
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-8 text-center">
        <div className="bg-blue-100 p-3 rounded-full mb-4 shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to Taxbot</h3>
        <p className="text-sm text-gray-600 max-w-sm leading-relaxed mb-6">
          Ask me anything about taxes, VAT exemptions, or tax calculations — I&apos;m here to help
        </p>
        <div className="w-full max-w-xs space-y-3">
          <div className="text-xs font-medium text-gray-500 mb-2">Try these sample questions:</div>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() =>
                setInputValue?.(
                  "How do I calculate my company&apos;s income tax if my turnover is ₦80 million?"
                )
              }
              className="text-sm text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 shadow-sm font-medium group flex items-center"
            >
              <span className="flex-1">
                How do I calculate my company&apos;s income tax if my turnover is ₦80 million?
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            <button
              onClick={() => setInputValue?.("What reliefs can I claim on my personal income tax?")}
              className="text-sm text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 shadow-sm font-medium group flex items-center"
            >
              <span className="flex-1">What reliefs can I claim on my personal income tax?</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            <button
              onClick={() => setInputValue?.("How is CGT calculated on property sales?")}
              className="text-sm text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 shadow-sm font-medium group flex items-center"
            >
              <span className="flex-1">How is CGT calculated on property sales?</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <div className="text-xs text-gray-400 mt-4">
            Click any question to start or type your own
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div className="flex items-start max-w-[85%]">
            {message.role === "assistant" && (
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white mr-2 shadow-sm">
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            )}
            <div className="relative group">
              <div
                className={`py-2 px-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none shadow-md"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-md"
                }`}
              >
                <div className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
                  {message.content}
                </div>
                <button
                  onClick={() => handleCopy(message.content, index)}
                  className={`absolute top-1.5 right-1.5 p-1 rounded-full transition-colors ${
                    message.role === "user"
                      ? "text-white/70 hover:text-white hover:bg-white/10"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  }`}
                  aria-label="Copy message"
                >
                  {copiedIndex === index ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
            {message.role === "user" && (
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 ml-2 shadow-sm">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="flex items-start max-w-[85%]">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white mr-2 shadow-sm">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="py-2 px-3 rounded-lg bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-md">
              <div className="flex space-x-1.5">
                <div className="h-2 w-2 bg-blue-400 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both]" />
                <div
                  className="h-2 w-2 bg-blue-500 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both]"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="h-2 w-2 bg-blue-600 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both]"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
