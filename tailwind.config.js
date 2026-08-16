/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        fb: {
          blue: '#1877F2',
          light: '#E7F3FF',
          dark: '#0866FF',
        },
        dark: {
          bg: '#0B0F19',
          card: '#111827',
          surface: '#1E293B',
          border: '#334155',
        }
      },
      fontFamily: {
        sans: ['"Anek Bangla"', 'Inter', 'Outfit', 'system-ui', 'sans-serif'],
        bangla: ['"Anek Bangla"', 'sans-serif'],
      },
      boxShadow: {
        'glow-brand': '0 0 20px -5px rgba(99, 102, 241, 0.4)',
        'glow-success': '0 0 20px -5px rgba(34, 197, 94, 0.4)',
        'glow-fb': '0 0 20px -5px rgba(24, 119, 242, 0.35)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
