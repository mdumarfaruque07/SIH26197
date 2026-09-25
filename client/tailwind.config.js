/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        heritage: {
          50: '#fffaf3',
          100: '#fef3e2',
          200: '#fde3c0',
          300: '#f9cc93',
          400: '#f4aa5e',
          500: '#ee842f', // warm saffron
          600: '#d7641d', // terracotta
          700: '#b44818',
          800: '#91371b',
          900: '#762e19',
        },
        gold: {
          500: '#eab308',
          600: '#ca8a04',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Merriweather', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
