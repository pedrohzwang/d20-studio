import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      light: {
        colors: {
          primary: {
            DEFAULT: "#9333EA",
            foreground: "#ffffff",
          },
          secondary: {
            DEFAULT: "#DB2777",
            foreground: "#ffffff",
          },
          success: {
            DEFAULT: "#06B6D4",
            foreground: "#ffffff",
          },
        },
      },
      dark: {
        colors: {
          primary: {
            DEFAULT: "#9333EA",
            foreground: "#ffffff",
          },
          secondary: {
            DEFAULT: "#DB2777",
            foreground: "#ffffff",
          },
          success: {
            DEFAULT: "#06B6D4",
            foreground: "#ffffff",
          },
        },
      },
    },
  })],
};
export default config;
