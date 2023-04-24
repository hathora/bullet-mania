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
          750: "#576E73",
          800: "#3b5656",
          900: "#2b4141",
        },
        hathoraBrand: {
          200: "rgba(97,231,91,0.3)",
          300: "rgba(97,231,91,0.4)",
          400: "#66B9A0",
          500: "#02FE57",
        },
        hathoraSecondary: {
          200: "#e5ddf8",
          300: "#DACAFC",
          400: "#B399EA",
          500: "#AF64EE",
          550: "#9347d2",
          600: "#7132A6",
        },
        neutralgray: {
          200: "#E6E6F2",
          225: "#d4d4e3",
          250: "#cacadc",
          300: "#B8B8CF",
          350: "#afafcb",
          400: "#8585A6",
          500: "#5E5E7D",
          525: "#484860",
          550: "#29293a",
          650: "#191927",
          600: "#151521",
          700: "#0E0E1B",
        },
      },
      fontFamily: {
        sans: ["Oxanium", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Courier New", "monospace"],
        hathora: ["Space Grotesk", "Oxanium", "sans-serif"],
        hathoraBody: ["Lato", "Oxanium", "sans-serif"],
      },
      fontSize: {
        xxs: "0.7rem",
      },
    },
  },
  plugins: [],
};
