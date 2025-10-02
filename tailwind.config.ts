import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#16BFBF",
          accent: "#FF5A3D",
          dark: "#0F172A",
          light: "#F1F5F9",
          pastel: "#D1FAF9",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms"), require("daisyui")],
  daisyui: {
    themes: [
      {
        elancestvous: {
          primary: "#16BFBF",
          secondary: "#0F172A",
          accent: "#FF5A3D",
          neutral: "#1F2937",
          "base-100": "#FFFFFF",
          info: "#38BDF8",
          success: "#22C55E",
          warning: "#F59E0B",
          error: "#EF4444",
        },
      },
      "light",
    ],
  },
};
export default config;
