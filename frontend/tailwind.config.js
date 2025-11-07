/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2196F3',
        secondary: '#FF9800',
        success: '#4CAF50',
        warning: '#FFC107',
        error: '#F44336',
      },
    },
  },
  plugins: [],
}
