// tailwind.config.js (Completo)
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de Cores Premium para Nail Designer
        brand: {
          'pink-light': '#FFF0F5', // LavenderBlush (Fundo)
          'pink': '#FFB6C1',       // LightPink (Destaques suaves)
          'pink-dark': '#DB7093',  // PaleVioletRed (Ações principais)
          'gold': '#D4AF37',       // Metallic Gold (Ícones/Bordas)
          'dark': '#2C3E50',       // Midnight Blue (Texto principal)
        }
      },
    },
  },
  plugins: [],
}