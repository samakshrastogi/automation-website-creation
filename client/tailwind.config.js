/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gemini: {
          blue: '#1a73e8',
          purple: '#8e44ad',
          spark: '#9b72cf',
          cyan: '#00f2fe',
          dark: '#0a0d14',
          darker: '#06080c',
          card: 'rgba(18, 24, 38, 0.65)',
          border: 'rgba(255, 255, 255, 0.08)',
          glow: 'rgba(110, 142, 251, 0.15)',
        },
        chatgpt: {
          green: '#10a37f',
          dark: '#202123',
          sidebar: '#171717',
        }
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '24px',
        '3xl': '40px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow': '0 0 40px -10px rgba(110, 142, 251, 0.25), 0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'spark-glow': '0 0 25px rgba(155, 114, 207, 0.4)',
        'neon-blue': '0 0 20px rgba(0, 242, 254, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
