/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        role: {
          owner: {
            DEFAULT: '#F59E0B',
            light: '#FDE68A',
            dark: '#B45309',
            glow: 'rgba(245, 158, 11, 0.35)',
          },
          kasir: {
            DEFAULT: '#06B6D4',
            light: '#A5F3FC',
            dark: '#0E7490',
            glow: 'rgba(6, 182, 212, 0.35)',
          },
          produksi: {
            DEFAULT: '#F97316',
            light: '#FED7AA',
            dark: '#C2410C',
            glow: 'rgba(249, 115, 22, 0.35)',
          },
          kurir: {
            DEFAULT: '#8B5CF6',
            light: '#DDD6FE',
            dark: '#6D28D9',
            glow: 'rgba(139, 92, 246, 0.35)',
          },
          pelanggan: {
            DEFAULT: '#10B981',
            light: '#A7F3D0',
            dark: '#047857',
            glow: 'rgba(16, 185, 129, 0.35)',
          },
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
