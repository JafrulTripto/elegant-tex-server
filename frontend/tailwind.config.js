/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#007AFF', // Matches theme.js
        'primary-dark': '#005ec4',
        'secondary': '#0f172a', // Matches theme.js
        'accent': '#06b6d4',
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        // Slate Scale for Text/BG
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false // Keep false to prevent clashing with Ant Design
  }
}
