import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/storefront-customizer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shopify: {
          green: "#008060",
          darkGreen: "#004c3f",
          light: "#f1f2f4",
          surface: "#ffffff",
          subdued: "#6d7175",
          border: "#e1e3e5",
        },
      },
    },
  },
  plugins: [],
};
export default config;
