/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0071dc',
        accent: '#ffc220',
        border: '#e5e7eb',
        background: '#ffffff',
        foreground: '#111111',
        'gray-50': '#f7f7f7',
        'gray-600': '#6c6c6c',
        'gray-900': '#111111',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
        'listening': 'listening 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': {
            transform: 'scale(0.33)',
            opacity: '1',
          },
          '80%, 100%': {
            transform: 'scale(2.33)',
            opacity: '0',
          },
        },
        'listening': {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '0.7',
          },
          '50%': {
            transform: 'scale(1.1)',
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [],
}