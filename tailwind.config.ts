import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf2f6",
          100: "#fce7ef",
          200: "#fbcfe0",
          300: "#f9a8c8",
          400: "#f472a6",
          500: "#e84a87",
          600: "#d62d6c",
          700: "#b41d56",
          800: "#951c49",
          900: "#7d1c40",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
