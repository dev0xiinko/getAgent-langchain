import type { Config } from "tailwindcss";

/**
 * Bitget BuilderHub theme. All colors are driven by CSS variables defined in
 * globals.css (light + dark via the `.dark` class on <html>), so components use
 * semantic names (bg, surface, border, brand…) and never hardcode hex.
 */
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        surface2: "rgb(var(--surface-2) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          fg: "rgb(var(--brand-fg) / <alpha-value>)",
          soft: "rgb(var(--brand-soft) / <alpha-value>)",
          mint: "#34F0CB",
          teal: "#19C7A8",
          deep: "#0B9D86",
          node: "#BDFFF0",
        },
        danger: "rgb(var(--danger) / <alpha-value>)",
      },
      backgroundImage: {
        // Brand Sheet primary gradient.
        "brand-gradient": "linear-gradient(150deg, #34F0CB 0%, #19C7A8 52%, #0B9D86 100%)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        blink: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.2" } },
        "pulse-dot": { "0%, 100%": { opacity: "0.35" }, "50%": { opacity: "1" } },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "fade-up": "fade-up 0.28s ease-out",
        blink: "blink 1s steps(2) infinite",
        "pulse-dot": "pulse-dot 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
