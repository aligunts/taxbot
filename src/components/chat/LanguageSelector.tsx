"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { SupportedLanguage } from "@/utils";

interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
}

const languageOptions: { value: SupportedLanguage; label: string; flag: string }[] = [
  { value: "english", label: "English", flag: "🇬🇧" },
  { value: "yoruba", label: "Yorùbá", flag: "🇳🇬" },
  { value: "hausa", label: "Hausa", flag: "🇳🇬" },
  { value: "igbo", label: "Igbo", flag: "🇳🇬" },
  { value: "pidgin", label: "Pidgin", flag: "🇳🇬" },
];

/**
 * LanguageSelector component for switching between supported languages
 */
const LanguageSelector = ({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Find the currently selected language option
  const currentLanguage =
    languageOptions.find((option) => option.value === selectedLanguage) || languageOptions[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-xs px-2 py-1 rounded-full transition-colors hover:bg-white/20 focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="h-3 w-3" />
        <span className="text-sm">{currentLanguage.flag}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <ul
            className="py-1 overflow-auto max-h-48"
            role="listbox"
            aria-labelledby="language-selector"
          >
            {languageOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onLanguageChange(option.value);
                  setIsOpen(false);
                }}
                className={`cursor-pointer px-2 py-1.5 flex items-center space-x-1.5 text-xs ${
                  selectedLanguage === option.value
                    ? "bg-accent-50 text-accent-800"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                role="option"
                aria-selected={selectedLanguage === option.value}
              >
                <span className="text-sm">{option.flag}</span>
                <span>{option.label}</span>
                {selectedLanguage === option.value && (
                  <svg
                    className="h-3 w-3 ml-auto text-accent-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
