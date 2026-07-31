/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./src/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDF7',
          100: '#FFF9E6',
          200: '#FFF3CC',
        },
        sage: {
          50: '#F2F7F2',
          100: '#E0EDE0',
          200: '#C2DBC2',
          300: '#A3C9A3',
          400: '#7FB37F',
          500: '#5C9E5C',
          600: '#4A8B4A',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
