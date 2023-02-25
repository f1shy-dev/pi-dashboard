/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // breakpoitns
      screens: {
        xs: "500px",
        "buttonsok": "344px",
      },
      animation: {
        "marquee": "marquee 10s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0%)" },
        }
      },
    },
  },
  plugins: [],
}
