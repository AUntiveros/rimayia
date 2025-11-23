/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E60000',
        secondary: '#2D2D2D',
        accent: '#6B46C1',
        background: '#F8F9FA',
        surface: '#FFFFFF',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
