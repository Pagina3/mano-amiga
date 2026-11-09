/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        // Escala extendida con mínimos accesibles para adultos mayores
        'senior-base': ['1.5rem', { lineHeight: '2.25rem' }],     // 24px
        'senior-lg': ['1.75rem', { lineHeight: '2.5rem' }],       // 28px
        'senior-xl': ['2.125rem', { lineHeight: '2.75rem' }],     // 34px
        'senior-2xl': ['2.625rem', { lineHeight: '3.25rem' }],    // 42px
        'senior-3xl': ['3.25rem', { lineHeight: '3.75rem' }],     // 52px
      },
      colors: {
        senior: {
          dark: '#0f172a',
          yellow: '#facc15',
          amber: '#fbbf24',
          surface: '#fefce8'
        }
      }
    },
  },
  plugins: [],
}
