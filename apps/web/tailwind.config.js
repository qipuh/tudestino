/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Azul TuDestino - alineado con apps/mobile (core/theme/app_theme.dart)
        primary: {
          DEFAULT: '#034EA2',
          dark: '#023A7A',
          light: '#4D82C4',
        },
        // Celeste - acento secundario
        secondary: {
          DEFAULT: '#00ADEF',
          dark: '#0089BF',
        },
        ink: '#1C1A17',
        mute: '#78716C',
        // Neutros fríos (azulados), no cálidos - igual que mobile
        sand: '#F4F6F8',
        line: '#E7EBEF',
        gold: '#FFCA01',
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
