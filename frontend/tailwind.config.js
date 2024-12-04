/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme'); // Importa as cores padrão do Tailwind

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        textColor: '#1e1b4b',
      },
    },
  },
  plugins: [],
}
