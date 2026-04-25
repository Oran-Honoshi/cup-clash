import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SaaS-style neutral palette per the brief
        ink: {
          900: "#111827",
          700: "#374151",
          500: "#6B7280",
          400: "#9CA3AF",
          300: "#D1D5DB",
          200: "#E5E7EB",
          100: "#F3F4F6",
          50:  "#F9FAFB",
        },
        // Status colors
        success: "#10B981",
        warning: "#F59E0B",
        danger:  "#EF4444",
        // Country accent — driven by ThemeProvider via CSS variables.
        // Used sparingly: gradient CTAs, hero countdown, country picker.
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          glow: "rgb(var(--accent-glow) / <alpha-value>)",
          // Brand fallback when no country picked yet
          brand: "rgb(var(--brand) / <alpha-value>)",
        },
      },
      fontFamily: {
        // Inter for everything per the SaaS brief.
        // The brief said max 3 weights — we use 400/600/800/900.
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.02em",
        widest2: "0.06em",
      },
      boxShadow: {
        // Per the brief: soft and small
        card:       "0 2px 12px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 8px 28px rgba(0, 0, 0, 0.08)",
        modal:      "0 24px 80px rgba(0, 0, 0, 0.20)",
        // Country-tinted button glow — uses CSS var
        cta:        "0 4px 14px rgb(var(--accent) / 0.35)",
        "cta-hover": "0 8px 24px rgb(var(--accent) / 0.45)",
      },
      borderRadius: {
        pill: "50px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "fade-up": "fadeUp 0.5s ease-out backwards",
        "shimmer": "shimmer 3s linear infinite",
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
