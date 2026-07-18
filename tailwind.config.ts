import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Calm clinical palette
        ink: "#0f172a",
        mist: "#f8fafc",
        kairo: {
          50: "#eef6ff",
          100: "#d9ecff",
          400: "#4c9df7",
          500: "#2a7de1",
          600: "#1c62c4",
          700: "#164e9c",
        },
        clear: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        flag: {
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        sweep: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        "fade-up": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "pulse-soft": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245,158,11,0.35)" },
          "50%": { boxShadow: "0 0 0 6px rgba(245,158,11,0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(24px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        sweep: "sweep 1.6s ease-in-out",
        "fade-up": "fade-up 0.4s ease-out both",
        "pulse-ring": "pulse-ring 1.4s ease-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "slide-in": "slide-in 0.35s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
