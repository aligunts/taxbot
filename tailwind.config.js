/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // FIRS colors
        "firs-gray": "#4A4A4A",
        "firs-light": "#F5F5F5",
        "firs-red": "#E63A11",
        // Expanded color palette with semantic naming
        primary: {
          50: "#f5f5f5",
          100: "#e0e0e0",
          200: "#c2c2c2",
          300: "#a3a3a3",
          400: "#858585",
          500: "#4A4A4A", // FIRS gray
          600: "#3d3d3d",
          700: "#2f2f2f",
          800: "#212121",
          900: "#141414",
        },
        accent: {
          50: "#fef2f0",
          100: "#fde6e2",
          200: "#fbc9b8",
          300: "#f8ab8f",
          400: "#f5754b",
          500: "#E63A11", // FIRS red
          600: "#cf3310",
          700: "#ad2b0d",
          800: "#8a220b",
          900: "#711c08",
        },
        secondary: {
          50: "#f9f9f9",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#5a5a5a",
          700: "#4A4A4A", // FIRS gray
          800: "#404040",
          900: "#262626",
        },
        success: {
          DEFAULT: "#10b981",
          light: "#5eead4",
          dark: "#047857",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fcd34d",
          dark: "#b45309",
        },
        error: {
          DEFAULT: "#ef4444",
          light: "#fca5a5",
          dark: "#b91c1c",
        },
      },
      fontFamily: {
        sans: ["Open Sans", "Segoe UI", "system-ui", "-apple-system", "sans-serif"],
        display: ["Montserrat", "Segoe UI", "system-ui", "-apple-system", "sans-serif"],
        mono: ["Consolas", "Monaco", "Courier New", "monospace"],
      },
      fontSize: {
        "2xs": "0.625rem", // 10px
        xs: "0.75rem", // 12px
        sm: "0.875rem", // 14px
        base: "1rem", // 16px
        md: "1.125rem", // 18px
        lg: "1.25rem", // 20px
        xl: "1.5rem", // 24px
        "2xl": "1.75rem", // 28px
        "3xl": "2rem", // 32px
        "4xl": "2.25rem", // 36px
        "5xl": "2.5rem", // 40px
      },
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      spacing: {
        0.5: "0.125rem",
        1.5: "0.375rem",
        2.5: "0.625rem",
        3.5: "0.875rem",
        4.5: "1.125rem",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
        outline: "0 0 0 3px rgba(66, 153, 225, 0.5)",
        focus: "0 0 0 3px rgba(0, 102, 255, 0.5)",
        none: "none",
      },
      borderRadius: {
        none: "0",
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        pulse: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        bounce: "bounce 1s infinite",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: 0.4, transform: "scale(0.8)" },
          "50%": { opacity: 1, transform: "scale(1.2)" },
        },
      },
      animationDelay: {
        100: "100ms",
        200: "200ms",
        300: "300ms",
        400: "400ms",
        500: "500ms",
        600: "600ms",
        700: "700ms",
        800: "800ms",
        900: "900ms",
        1000: "1000ms",
      },
      transitionDuration: {
        DEFAULT: "150ms",
        fast: "100ms",
        normal: "200ms",
        slow: "300ms",
        slower: "500ms",
        slowest: "700ms",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
    function ({ addUtilities, theme, e }) {
      const animationDelayUtilities = Object.entries(theme("animationDelay")).map(
        ([key, value]) => {
          return {
            [`.${e(`animate-delay-${key}`)}`]: { animationDelay: value },
          };
        }
      );
      addUtilities(animationDelayUtilities);
    },
  ],
};
