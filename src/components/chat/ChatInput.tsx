"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  disabled?: boolean;
}

/**
 * ChatInput component for handling user input in the chat interface
 */
export default function ChatInput({
  onSubmit,
  value,
  onChange,
  isLoading,
  disabled = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && !disabled && !isLoading) {
          const form = e.currentTarget.form;
          if (form) form.requestSubmit();
        }
      }
    },
    [value, disabled, isLoading]
  );

  return (
    <form onSubmit={onSubmit} className="relative">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask a tax question..."
          disabled={disabled || isLoading}
          className="w-full pr-10 py-2 sm:py-3 px-3 text-sm sm:text-base resize-none min-h-[45px] sm:min-h-[50px] max-h-[120px] sm:max-h-[200px] rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          rows={1}
        />
        <button
          type="submit"
          disabled={!value.trim() || disabled || isLoading}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </div>
    </form>
  );
}
