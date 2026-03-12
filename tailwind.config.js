/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./main.js",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#050510',
          100: '#0A0A1A',
          200: '#111128',
          300: '#1A1A35',
        },
        neon: {
          green: '#00FF9C',
          'green-dim': '#00CC7D',
        },
        accent: {
          purple: '#7C3AED',
          'purple-light': '#A78BFA',
        },
        muted: '#6B7280',
        surface: '#F8F9FC',
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 156, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 156, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
