/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '.dark-mode'],
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          dark: '#1e40af',
        },
      },
    },
  },
  plugins: [],
}
