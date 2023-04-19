/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          400: "#bb3b3e",
          500: "#9A282A",
          600: "#77191b",
        },
        secondary: {
          200: "#ecf5f5",
          300: "#d8ecec",
          400: "#A9CFCF",
          500: "#9fc7c7",
          600: "#94bebe",
          700: "#648888",
          800: "#3b5656",
          900: "#2b4141",
        },
      },
      fontFamily: {
        sans: ["Oxanium", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Courier New", "monospace"],
      },
      fontSize: {
        xxs: "0.7rem",
      },
    },
  },
  plugins: [],
};
