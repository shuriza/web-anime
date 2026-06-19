/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6C5CE7',
        secondary: '#A29BFE',
        dark: {
          100: '#1a1a2e',
          200: '#16213e',
          300: '#0f3460',
          400: '#0a0a1a',
          500: '#060612',
        },
        accent: '#E94560',
        neon: {
          purple: '#6C5CE7',
          pink: '#E94560',
          blue: '#0984E3',
          cyan: '#00CEC9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};