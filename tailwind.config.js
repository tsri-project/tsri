/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tsri: {
          50: '#f0f6fe',
          100: '#ddecfc',
          200: '#c2dffa',
          300: '#98caf6',
          400: '#67aaf0',
          500: '#4389e8',
          600: '#2d6ddc',
          700: '#1d55c7',
          800: '#1f47a1',
          900: '#1e3e7f',
          950: '#13264f',
        },
        gold: {
          500: '#e5a93c',
          600: '#cb8b28',
        }
      },
      fontFamily: {
        sans: ['Sarabun', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
