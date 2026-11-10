import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        psl: {
          dark: "#0b1215",
          darker: "#060a0c",
          card: "#121d24",
          border: "#1f323e",
          green: "#10b981",
          gold: "#f59e0b",
          goldLight: "#fbbf24",
          accent: "#06d6a0",
          crimson: "#ef4444",
          blue: "#3b82f6",
          purple: "#8b5cf6"
        }
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "hammer": "hammer 0.6s ease-in-out",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 10px rgba(16, 185, 129, 0.2)" },
          "100%": { boxShadow: "0 0 25px rgba(16, 185, 129, 0.6)" },
        },
        hammer: {
          "0%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(-35deg)" },
          "100%": { transform: "rotate(0deg)" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
