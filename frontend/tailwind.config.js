/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold:   { DEFAULT: '#C9A227', light: '#E8C547', dark: '#8C7212' },
        ink:    { 900: '#0A0A0B', 800: '#111113', 700: '#1A1A1D', 600: '#26262B' },
      },
      fontFamily: { sans: ['Cairo','Tajawal','system-ui','sans-serif'] },
      boxShadow: { gold: '0 8px 30px rgba(201,162,39,0.18)' },
    },
  },
  plugins: [],
};
