/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
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
