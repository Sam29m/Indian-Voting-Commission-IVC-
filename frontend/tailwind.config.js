/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF9933', // Saffron
        secondary: '#138808', // Green
        navy: '#000080', // Ashoka Chakra Blue
        ivc: {
          dark: '#1e293b',
          light: '#f8fafc'
        }
      }
    },
  },
  plugins: [],
}
