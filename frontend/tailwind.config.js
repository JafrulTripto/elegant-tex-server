/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary':'#14213d',
        'secondary':'#fca311'
      }
    },
  },
  plugins: [],
  corePlugins:{
    preflight: false
  }
}
