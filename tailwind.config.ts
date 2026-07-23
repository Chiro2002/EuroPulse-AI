import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light enterprise theme
        page: "#F7F9FB",
        card: "#FFFFFF",
        "sidebar-bg": "#EEF2FB",

        // DB Blue
        primary: "#0018A8",
        "primary-dark": "#0012A8",
        accent: "#1E5FD9",
        "accent-light": "#E8EEFC",

        // Text
        "text-primary": "#1F2937",
        "text-secondary": "#6B7280",
        "text-muted": "#9CA3AF",

        // Borders
        border: "#E5E7EB",
        "border-light": "#F3F4F6",

        // Status
        success: "#2FAE60",
        warning: "#F5A623",
        danger: "#E5484D",

        // Surfaces
        surface: "#FFFFFF",
        "surface-hover": "#F9FAFB",
        "surface-muted": "#F3F4F6",

        // Legacy aliases (for backward compatibility in page code)
        db: {
          navy: "#FFFFFF",
          "navy-light": "#EEF2FB",
          "navy-lighter": "#E2E8F0",
          accent: "#0018A8",
          "accent-dark": "#0012A8",
          success: "#2FAE60",
          warning: "#F5A623",
          danger: "#E5484D",
          surface: "#FFFFFF",
          "surface-light": "#F9FAFB",
          border: "#E5E7EB",
          "text-primary": "#1F2937",
          "text-secondary": "#6B7280",
          "text-muted": "#9CA3AF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)",
        "card-hover": "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)",
        "card-elevated": "0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.03)",
        "ai-glow": "0 0 20px rgba(0, 24, 168, 0.08)",
        dropdown: "0 8px 32px rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        card: "12px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(0, 24, 168, 0.06)" },
          "50%": { boxShadow: "0 0 20px rgba(0, 24, 168, 0.12)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
