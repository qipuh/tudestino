/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16BED8',
          dark: '#344B89',
        },
        secondary: '#16BED8',
      },
    },
  },
  plugins: [],
}
