import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark stadium palette
        pitch: {
          950: "#020617", // base
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
          500: "#64748B",
          400: "#94A3B8",
          300: "#CBD5E1",
          200: "#E2E8F0",
          100: "#F1F5F9",
        },
        // Status colors (kept identical)
        success: "#10B981",
        warning: "#F59E0B",
        danger:  "#EF4444",
        // Country accent — driven by ThemeProvider via CSS variables.
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          glow: "rgb(var(--accent-glow) / <alpha-value>)",
          brand: "rgb(var(--brand) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.02em",
        widest2: "0.06em",
        widest3: "0.18em",
      },
      boxShadow: {
        // Country-tinted button glow
        cta:        "0 0 0 1px rgb(var(--accent) / 0.25), 0 8px 24px rgb(var(--accent) / 0.35)",
        "cta-hover": "0 0 0 1px rgb(var(--accent) / 0.4), 0 12px 32px rgb(var(--accent) / 0.5)",
        // Card depth
        card:       "0 16px 40px rgba(0, 0, 0, 0.35)",
        "card-hover": "0 24px 60px rgba(0, 0, 0, 0.5)",
      },
      borderRadius: {
        pill: "50px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "fade-up": "fadeUp 0.5s ease-out backwards",
        "shimmer": "shimmer 3s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "0% 0%" },
          to: { backgroundPosition: "200% 0%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
