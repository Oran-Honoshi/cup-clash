import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // World Cup 2026 palette
        wc: {
          blue:  "#2A398D",
          red:   "#E61D25",
          green: "#3CAC3B",
          dark:  "#0A0A0A",
        },
        // Dark stadium surface
        pitch: {
          950: "#0A0A0A",
          900: "#111111",
          800: "#1A1A2E",
          700: "#252540",
          600: "#3A3A5C",
          500: "#5A5A7A",
          400: "#8888AA",
          300: "#AAAACC",
          200: "#CCCCEE",
          100: "#EEEEFF",
        },
        // Neon accent palette — use anywhere
        neon: {
          green:  "#00FF88",
          teal:   "#00D4FF",
          purple: "#8B5CF6",
          amber:  "#fbbf24",
        },
        // Status
        success: "#00FF88",
        warning: "#fbbf24",
        danger:  "#f87171",
        // Dynamic country accent via CSS variables
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          glow:    "rgb(var(--accent-glow) / <alpha-value>)",
          brand:   "rgb(var(--brand) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-barlow, var(--font-display))", "Barlow Condensed", "Urbanist", "sans-serif"],
        mono:    ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.02em",
        widest2:  "0.06em",
        widest3:  "0.18em",
      },
      boxShadow: {
        // CTAs
        cta:          "0 0 0 1px rgb(var(--accent) / 0.25), 0 8px 24px rgb(var(--accent) / 0.35)",
        "cta-hover":  "0 0 0 1px rgb(var(--accent) / 0.4), 0 12px 32px rgb(var(--accent) / 0.5)",
        // Cards
        card:         "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        "card-hover": "0 16px 48px rgba(0, 0, 0, 0.55)",
        // Neon glows
        "glow-green":  "0 0 20px rgba(0, 255, 136, 0.35)",
        "glow-green-lg": "0 0 32px rgba(0, 255, 136, 0.5)",
        "glow-cyan":   "0 0 20px rgba(0, 212, 255, 0.3)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.3)",
        "glow-amber":  "0 0 20px rgba(251, 191, 36, 0.3)",
        // Glass
        glass: "0 12px 40px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.1)",
      },
      backdropBlur: {
        glass: "24px",
      },
      backgroundImage: {
        "glow-green":  "linear-gradient(135deg, #00FF88, #00D4FF)",
        "glow-purple": "linear-gradient(135deg, #6d28d9, #7c3aed)",
        "glow-amber":  "linear-gradient(135deg, #f59e0b, #fbbf24)",
      },
      borderRadius: {
        pill: "50px",
      },
      animation: {
        "fade-in":    "fadeIn 0.4s ease-out",
        "fade-up":    "fadeUp 0.5s ease-out backwards",
        "shimmer":    "shimmer 3s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "0% 0%" },
          to:   { backgroundPosition: "200% 0%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;