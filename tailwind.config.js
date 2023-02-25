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
    },
  },
  plugins: [],
}
