/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F7CAC',
        primaryLight: '#DCEAF7',
        paper: '#FFFDF7',
        beige: '#F6F1E8',
        highlight: '#F7E27C',
        coral: '#F28C8C',
        green: '#8BC6A2',
        lavender: '#B7A7E6',
        ink: '#2B2B2B',
        secondary: '#5F6368',
        line: '#D9D4CC',
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        hand: ['"Patrick Hand"', 'cursive'],
      },
    },
  },
  plugins: [],
};
