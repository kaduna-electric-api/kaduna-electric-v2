/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f2fbf6',
          100: '#daf6e8',
          200: '#b8efd0',
          300: '#7fe4ad',
          400: '#4fd085',
          500: '#2fb86a',
          600: '#258f51',
          700: '#1b6b3e',
          800: '#114a2b',
          900: '#07321c',
        },
        electric: {
          50: '#ffffff',
          100: '#f7fff8',
          400: '#d1f7e0',
          500: '#aef0c9',
          600: '#7fe4a6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}