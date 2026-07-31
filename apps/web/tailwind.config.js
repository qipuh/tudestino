/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Clay: terracota andina, acento principal (reemplaza el azul anterior)
        primary: {
          DEFAULT: '#C1502E',
          dark: '#9C3D22',
          light: '#E2A98F',
        },
        // Teal: acento secundario, evoca el Pacífico
        secondary: {
          DEFAULT: '#0F6E6A',
          dark: '#0B4F4C',
        },
        ink: '#1C1A17',
        mute: '#78716C',
        sand: '#F7F4F1',
        line: '#E8E3DC',
        gold: '#E8A33D',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28,26,23,0.06), 0 8px 24px -12px rgba(28,26,23,0.12)',
        cardHover: '0 4px 12px rgba(28,26,23,0.08), 0 16px 32px -12px rgba(28,26,23,0.18)',
      },
    },
  },
  plugins: [],
}
