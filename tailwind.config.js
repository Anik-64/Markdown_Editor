module.exports = {
  content: [
    "./views/**/*.{ejs,html}",
    "./public/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#3b82f6', 
        'brand-dark': '#1e293b', 
        'brand-light': '#f8fafc', 
      }
    },
  },
  darkMode: 'class', 
  plugins: [],
}
