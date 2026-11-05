/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./src/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        monezy: {
          950: "#071A17",
          900: "#0D2923",
          700: "#176B53",
          500: "#21A179",
          100: "#DDF7EC"
        }
      }
    }
  },
  plugins: []
};
