/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"BIZ UDPGothic"',
          '"Hiragino Kaku Gothic ProN"',
          '"Hiragino Sans"',
          '"Helvetica Neue"',
          "Arial",
          "Meiryo",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        mono: ["Cica", "Roboto Mono", "Consolas", "monaco", "monospace"],
      },
    },
  },
  plugins: [require("daisyui")],
};
