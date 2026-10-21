import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}"],
  theme: { extend: { colors: { ink: "#172033", saffron: "#e87932", cream: "#fffaf2" } } },
  plugins: [],
} satisfies Config;

